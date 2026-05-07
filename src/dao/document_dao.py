from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from models import Document, Topic
from .base import BaseDAO


class DocumentDAO(BaseDAO):
    def __init__(self):
        super().__init__(Document)
    
    async def get_by_topic(self, db: AsyncSession, topic_id: UUID, skip: int = 0, limit: int = 100) -> list[Document]:
        """Get documents by topic with pagination."""
        return await self.get_all(db, skip=skip, limit=limit, topic_id=topic_id)
    
    async def search_by_embedding(self, db: AsyncSession, query_embedding, limit: int = 5) -> list[Document]:
        """Vector similarity search (for LLM service)."""
        # This will be extended later for pgvector
        stmt = select(Document).order_by(Document.embedding.cosine_distance(query_embedding)).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

