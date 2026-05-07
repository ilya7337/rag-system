from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# ============== Auth ==============
class UserRegister(BaseModel):
    login: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8)

    @field_validator("password")
    def password_must_contain_digit(cls, v: str) -> str:
        if not any(ch.isdigit() for ch in v):
            raise ValueError("Пароль должен содержать хотя бы одну цифру")
        return v


class UserLogin(BaseModel):
    login: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: UUID
    login: str
    is_admin: bool

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    login: Optional[str] = Field(None, min_length=3, max_length=255)
    is_admin: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)


# ============== Topic ==============
class TopicCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)


class TopicUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)


class TopicOut(BaseModel):
    id: UUID
    title: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


class TopicList(BaseModel):
    items: List[TopicOut]


# ============== Document ==============
class DocumentCreate(BaseModel):
    topic_id: UUID
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    pdf_text: Optional[str] = None


class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    pdf_text: Optional[str] = None


class DocumentOut(BaseModel):
    id: UUID
    topic_id: UUID
    title: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentDetail(DocumentOut):
    pdf_text: Optional[str] = None


# ============== Chat ==============
class ChatMessageCreate(BaseModel):
    text: str = Field(..., min_length=1)


class ChatMessageOut(BaseModel):
    id: UUID
    role: str
    content: str
    liked: Optional[bool]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryGroup(BaseModel):
    date: str
    sessions: List[dict]


class ChatSessionOut(BaseModel):
    id: UUID
    created_at: datetime
    first_message: Optional[str] = None

    class Config:
        from_attributes = True


class RateMessage(BaseModel):
    liked: bool


# ============== Feedback ==============
class FeedbackCreate(BaseModel):
    text: str = Field(..., min_length=1)


class FeedbackOut(BaseModel):
    id: UUID
    text: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Admin Log ==============
class AdminLogOut(BaseModel):
    id: UUID
    session_id: Optional[UUID]
    query: str
    response: str
    is_anonymous: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdminLogList(BaseModel):
    items: List[AdminLogOut]
