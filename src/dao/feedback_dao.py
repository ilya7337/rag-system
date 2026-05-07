from sqlalchemy.ext.asyncio import AsyncSession
from models import Feedback
from .base import BaseDAO


class FeedbackDAO(BaseDAO):
    def __init__(self):
        super().__init__(Feedback)

