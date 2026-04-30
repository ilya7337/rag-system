import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import cast, Date, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_active_user
from database import get_db
from models import AdminLog, ChatMessage, ChatSession, User
from schemas import ChatMessageCreate, ChatMessageOut, ChatSessionOut, RateMessage
from services.llm_service import LLMService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/send")
async def send_message(
    data: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Determine or create session
    session_id = None
    if current_user:
        today = date.today()
        result = await db.execute(
            select(ChatSession)
            .where(
                ChatSession.user_id == current_user.id,
                cast(ChatSession.created_at, Date) == today,
            )
            .order_by(ChatSession.created_at.desc())
        )
        session = result.scalar_one_or_none()
        if session:
            session_id = session.id

    if not session_id:
        session = ChatSession(
            id=uuid.uuid4(),
            user_id=current_user.id if current_user else None,
        )
        db.add(session)
        await db.flush()
        session_id = session.id

    # Save user message
    user_msg = ChatMessage(
        id=uuid.uuid4(),
        session_id=session_id,
        role="user",
        content=data.text,
    )
    db.add(user_msg)

    # Search documents and generate answer
    llm_service = LLMService()
    docs = await llm_service.search_documents(db, data.text)
    answer = await llm_service.generate_answer(data.text, docs)

    # Save assistant message
    assistant_msg = ChatMessage(
        id=uuid.uuid4(),
        session_id=session_id,
        role="assistant",
        content=answer,
    )
    db.add(assistant_msg)

    # Log for admin
    log = AdminLog(
        id=uuid.uuid4(),
        session_id=session_id,
        query=data.text,
        response=answer,
        is_anonymous=current_user is None,
    )
    db.add(log)

    await db.commit()
    await db.refresh(assistant_msg)
    return {"answer": answer, "message_id": assistant_msg.id, "documents_found": len(docs)}


@router.get("/history", response_model=list[ChatSessionOut])
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not current_user:
        return []

    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
    )
    sessions = result.scalars().all()

    # Populate first_message for each session
    output = []
    for session in sessions:
        first_msg = None
        msg_result = await db.execute(
            select(ChatMessage)
            .where(
                ChatMessage.session_id == session.id,
                ChatMessage.role == "user",
            )
            .order_by(ChatMessage.created_at.asc())
            .limit(1)
        )
        first = msg_result.scalar_one_or_none()
        if first:
            first_msg = first.content[:60]

        output.append(ChatSessionOut(
            id=session.id,
            created_at=session.created_at,
            first_message=first_msg,
        ))
    return output


@router.get("/history/{session_id}", response_model=list[ChatMessageOut])
async def get_session_messages(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Verify session belongs to user
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
    )
    return result.scalars().all()


@router.post("/{message_id}/rate")
async def rate_message(
    message_id: uuid.UUID,
    data: RateMessage,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(ChatMessage)
        .join(ChatSession)
        .where(
            ChatMessage.id == message_id,
            ChatSession.user_id == (current_user.id if current_user else None),
        )
    )
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.liked = data.liked
    await db.commit()
    return {"status": "ok"}


@router.post("/new")
async def new_chat(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not current_user:
        return {"session_id": None}

    session = ChatSession(
        id=uuid.uuid4(),
        user_id=current_user.id,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"session_id": session.id}
