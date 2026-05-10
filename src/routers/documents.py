import uuid
from typing import Optional, List

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_admin
from dao.dependencies import get_document_dao, get_topic_dao
from database import get_db
from models import Document, Topic, User
from schemas import DocumentCreate, DocumentDetail, DocumentFromUrl, DocumentOut, DocumentUpdate
from services.llm_service import LLMService
from services.pdf_service import PDFService
from services.web_scraper_service import WebScraperService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/topic/{topic_id}", response_model=List[DocumentOut])
async def list_documents_by_topic(
    topic_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    document_dao = Depends(get_document_dao),
):
    return await document_dao.get_by_topic(db, topic_id)


@router.get("/{doc_id}", response_model=DocumentDetail)
async def get_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    document_dao = Depends(get_document_dao),
):
    doc = await document_dao.get(db, doc_id)
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
    topic_dao = Depends(get_topic_dao),
    document_dao = Depends(get_document_dao),
    admin: User = Depends(require_admin),
):
    # Verify topic exists
    topic = await topic_dao.get(db, topic_id)
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
    doc_data = {
        "topic_id": topic_id,
        "title": title,
        "description": description,
        "pdf_text": pdf_text,
        "embedding": embedding,
    }
    doc = await document_dao.create(db, doc_data)
    return doc


@router.post("", response_model=DocumentDetail, status_code=status.HTTP_201_CREATED)
async def create_document(
    data: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    document_dao = Depends(get_document_dao),
    topic_dao = Depends(get_topic_dao),
    admin: User = Depends(require_admin),
):
    """Create document with raw text (for scraper compatibility)."""
    topic = await topic_dao.get(db, data.topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")

    embedding = None
    if data.pdf_text:
        llm_service = LLMService()
        embedding = await llm_service.generate_embedding(data.pdf_text)

    doc_data = {
        "topic_id": data.topic_id,
        "title": data.title,
        "description": data.description,
        "pdf_text": data.pdf_text,
        "embedding": embedding,
    }
    doc = await document_dao.create(db, doc_data)
    return doc


@router.post("/from-url/{topic_id}", response_model=DocumentDetail, status_code=status.HTTP_201_CREATED)
async def create_document_from_url(
    topic_id: uuid.UUID,
    data: DocumentFromUrl,
    db: AsyncSession = Depends(get_db),
    topic_dao = Depends(get_topic_dao),
    document_dao = Depends(get_document_dao),
    admin: User = Depends(require_admin),
):
    topic = await topic_dao.get(db, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")

    scraper = WebScraperService()
    try:
        page_title, page_text = await scraper.fetch_and_extract(data.url)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=400, detail=f"Не удалось загрузить страницу: HTTP {e.response.status_code}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при обращении к URL: {e}")

    if not page_text:
        raise HTTPException(status_code=422, detail="Не удалось извлечь полезный текст из страницы")

    title = data.title or page_title
    description = data.description or data.url

    llm_service = LLMService()
    embedding = await llm_service.generate_embedding(page_text)

    doc_data = {
        "topic_id": topic_id,
        "title": title,
        "description": description,
        "pdf_text": page_text,
        "embedding": embedding,
    }
    doc = await document_dao.create(db, doc_data)
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    document_dao = Depends(get_document_dao),
    admin: User = Depends(require_admin),
):
    success = await document_dao.delete(db, doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Документ не найден")
    return None


@router.patch("/{doc_id}", response_model=DocumentDetail)
async def update_document(
    doc_id: uuid.UUID,
    data: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    document_dao = Depends(get_document_dao),
    admin: User = Depends(require_admin),
):
    doc = await document_dao.update(db, doc_id, data.dict(exclude_unset=True))
    if not doc:
        raise HTTPException(status_code=404, detail="Документ не найден")
    return doc


@router.get("", response_model=List[DocumentOut])
async def list_documents(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    document_dao = Depends(get_document_dao),
):
    return await document_dao.get_all(db, skip=skip, limit=limit)
