from datetime import date
from sqlalchemy import select, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from models import ChatSession, ChatMessage, AdminLog, User
from .base import BaseDAO


class ChatSessionDAO(BaseDAO):
    def __init__(self):
        super().__init__(ChatSession)
 
    async def get_today_session(self, db: AsyncSession, user_id: UUID) -> ChatSession | None:
        """Get user's session for today."""
        today = date.today()
        stmt = select(ChatSession).where(
            ChatSession.user_id == user_id,
            cast(ChatSession.created_at, Date) == today
        ).order_by(ChatSession.created_at.desc())
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_user_sessions(self, db: AsyncSession, user_id: UUID, skip=0, limit=100) -> list[ChatSession]:
        """Get all sessions for user."""
        return await self.get_all(db, skip=skip, limit=limit, user_id=user_id)


class ChatMessageDAO(BaseDAO):
    def __init__(self):
        super().__init__(ChatMessage)
    
    async def get_by_session(self, db: AsyncSession, session_id: UUID, skip=0, limit=100) -> list[ChatMessage]:
        """Get messages by session."""
        return await self.get_all(db, skip=skip, limit=limit, session_id=session_id)
    
    async def get_user_message(self, db: AsyncSession, session_id: UUID, user_id: UUID) -> ChatMessage | None:
        """Verify message belongs to user's session."""
        stmt = select(ChatMessage).join(ChatSession).where(
            ChatMessage.session_id == session_id,
            ChatSession.user_id == user_id
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


class AdminLogDAO(BaseDAO):
    def __init__(self):
        super().__init__(AdminLog)
    
    async def get_recent(self, db: AsyncSession, limit: int = 100, anonymous_only: bool = False) -> list[AdminLog]:
        """Get recent admin logs."""
        filters = {}
        if anonymous_only:
            filters["is_anonymous"] = True
        return await self.get_all(db, limit=limit, **filters)

