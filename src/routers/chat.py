import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_active_user
from dao.dependencies import get_chat_session_dao, get_chat_message_dao, get_admin_log_dao
from models import AdminLog, ChatMessage, ChatSession, User
from schemas import ChatMessageCreate, ChatMessageOut, ChatSessionOut, RateMessage
from services.llm_service import LLMService
from database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/send")
async def send_message(
    data: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    session_dao = Depends(get_chat_session_dao),
    message_dao = Depends(get_chat_message_dao),
    admin_log_dao = Depends(get_admin_log_dao),
):
    # Determine or create session
    session_id = None
    if current_user:
        session = await session_dao.get_today_session(db, current_user.id)
        if session:
            session_id = session.id

    if not session_id:
        session_data = {
            "user_id": current_user.id if current_user else None,
        }
        session = await session_dao.create(db, session_data)
        session_id = session.id

    # Save user message
    user_msg_data = {
        "session_id": session_id,
        "role": "user",
        "content": data.text,
    }
    await message_dao.create(db, user_msg_data)

    # Search documents and generate answer
    llm_service = LLMService()
    results = await llm_service.search_documents(db, data.text)
    answer = await llm_service.generate_answer(data.text, results)

    # Deduplicate sources by document_id, preserving order
    seen = set()
    sources = []
    for r in results:
        if r.document_id not in seen:
            seen.add(r.document_id)
            sources.append({"document_id": r.document_id, "topic_id": r.topic_id, "title": r.title})

    # Save assistant message
    assistant_msg_data = {
        "session_id": session_id,
        "role": "assistant",
        "content": answer,
    }
    assistant_msg = await message_dao.create(db, assistant_msg_data)

    # Log for admin
    log_data = {
        "session_id": session_id,
        "query": data.text,
        "response": answer,
        "is_anonymous": current_user is None,
    }
    await admin_log_dao.create(db, log_data)

    return {"answer": answer, "message_id": assistant_msg.id, "documents_found": len(results), "sources": sources}


@router.get("/history", response_model=list[ChatSessionOut])
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    session_dao = Depends(get_chat_session_dao),
    message_dao = Depends(get_chat_message_dao),
):
    if not current_user:
        return []

    sessions = await session_dao.get_user_sessions(db, current_user.id)

    # Populate first_message for each session
    output = []
    for session in sessions:
        first_msg_result = await message_dao.get_all(
            db, 
            session_id=session.id, 
            role="user",
            skip=0, 
            limit=1
        )
        first_msg = first_msg_result[0].content[:60] if first_msg_result else None

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
    session_dao = Depends(get_chat_session_dao),
    message_dao = Depends(get_chat_message_dao),
):
    # Verify session belongs to user
    session = await session_dao.get_by(db, id=session_id, user_id=current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await message_dao.get_by_session(db, session_id)
    return messages


@router.post("/{message_id}/rate")
async def rate_message(
    message_id: uuid.UUID,
    data: RateMessage,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    message_dao = Depends(get_chat_message_dao),
    session_dao = Depends(get_chat_session_dao),
):
    msg = await message_dao.get_user_message(db, message_id, current_user.id if current_user else None)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    await message_dao.update(db, message_id, {"liked": data.liked})
    return {"status": "ok"}


@router.post("/new")
async def new_chat(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    session_dao = Depends(get_chat_session_dao),
):
    if not current_user:
        return {"session_id": None}

    session_data = {
        "user_id": current_user.id,
    }
    session = await session_dao.create(db, session_data)
    return {"session_id": session.id}
