import uuid as uuid_lib
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from models import Document, DocumentChunk, Topic
from .base import BaseDAO


class DocumentDAO(BaseDAO):
    def __init__(self):
        super().__init__(Document)

    async def get_by_topic(self, db: AsyncSession, topic_id: UUID, skip: int = 0, limit: int = 100) -> list[Document]:
        return await self.get_all(db, skip=skip, limit=limit, topic_id=topic_id)


class DocumentChunkDAO(BaseDAO):
    def __init__(self):
        super().__init__(DocumentChunk)

    async def bulk_create(self, db: AsyncSession, chunks_data: list[dict]) -> list[DocumentChunk]:
        chunks = [DocumentChunk(id=uuid_lib.uuid4(), **data) for data in chunks_data]
        db.add_all(chunks)
        await db.flush()
        return chunks

    async def get_by_document(self, db: AsyncSession, document_id: UUID) -> list[DocumentChunk]:
        stmt = select(DocumentChunk).where(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index)
        result = await db.execute(stmt)
        return result.scalars().all()

