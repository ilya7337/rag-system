from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from models import User
from .base import BaseDAO


class UserDAO(BaseDAO):
    def __init__(self):
        super().__init__(User)
    
    async def get_by_login(self, db: AsyncSession, login: str) -> User | None:
        """Get user by login (used in auth)."""
        return await self.get_by(db, login=login)
    
    async def get_admin_users(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> list[User]:
        """Get admin users only."""
        return await self.get_all(db, skip=skip, limit=limit, is_admin=True)

