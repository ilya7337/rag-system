from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from models import Topic
from .base import BaseDAO


class TopicDAO(BaseDAO):
    def __init__(self):
        super().__init__(Topic)

