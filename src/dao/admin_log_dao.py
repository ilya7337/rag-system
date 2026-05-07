from sqlalchemy.ext.asyncio import AsyncSession
from models import AdminLog
from .base import BaseDAO


class AdminLogDAO(BaseDAO):
    def __init__(self):
        super().__init__(AdminLog)

