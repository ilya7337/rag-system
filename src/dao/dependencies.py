from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .user_dao import UserDAO
from .topic_dao import TopicDAO
from .document_dao import DocumentDAO, DocumentChunkDAO
from .feedback_dao import FeedbackDAO
from .chat_dao import ChatSessionDAO, ChatMessageDAO
from .admin_log_dao import AdminLogDAO
from database import get_db


def get_user_dao():
    return UserDAO()


def get_topic_dao():
    return TopicDAO()


def get_document_dao():
    return DocumentDAO()


def get_document_chunk_dao():
    return DocumentChunkDAO()


def get_feedback_dao():
    return FeedbackDAO()


def get_chat_session_dao():
    return ChatSessionDAO()


def get_chat_message_dao():
    return ChatMessageDAO()


def get_admin_log_dao():
    return AdminLogDAO()

