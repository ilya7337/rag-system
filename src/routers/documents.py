import uuid
from typing import Optional, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_admin
from database import get_db
from models import Document, Topic, User
from schemas import DocumentCreate, DocumentDetail, DocumentOut
from services.llm_service import LLMService
from services.pdf_service import PDFService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/topic/{topic_id}", response_model=List[DocumentOut])
async def list_documents_by_topic(
    topic_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.topic_id == topic_id).order_by(Document.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{doc_id}", response_model=DocumentDetail)
async def get_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Документ не найден")
    return doc


@router.post("/upload/{topic_id}", response_model=DocumentDetail, status_code=status.HTTP_201_CREATED)
async def upload_document(
    topic_id: uuid.UUID,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    pdf_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    # Verify topic exists
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")

    # Validate PDF and extract text
    if pdf_file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=400, detail="Файл должен быть PDF")

    pdf_bytes = await pdf_file.read()
    pdf_text = PDFService.extract_text(pdf_bytes)
    if not pdf_text:
        raise HTTPException(status_code=400, detail="Не удалось извлечь текст из PDF")

    # Generate embedding
    llm_service = LLMService()
    embedding = await llm_service.generate_embedding(pdf_text)

    # Create document
    doc = Document(
        id=uuid.uuid4(),
        topic_id=topic_id,
        title=title,
        description=description,
        pdf_text=pdf_text,
        embedding=embedding,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.post("", response_model=DocumentDetail, status_code=status.HTTP_201_CREATED)
async def create_document(
    data: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create document with raw text (for scraper compatibility)."""
    result = await db.execute(select(Topic).where(Topic.id == data.topic_id))
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")

    embedding = None
    if data.pdf_text:
        llm_service = LLMService()
        embedding = await llm_service.generate_embedding(data.pdf_text)

    doc = Document(
        id=uuid.uuid4(),
        topic_id=data.topic_id,
        title=data.title,
        description=data.description,
        pdf_text=data.pdf_text,
        embedding=embedding,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Документ не найден")
    await db.delete(doc)
    await db.commit()
    return None
