import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_admin
from database import get_db
from models import Topic, User
from schemas import TopicCreate, TopicList, TopicOut

router = APIRouter(prefix="/topics", tags=["topics"])


@router.get("", response_model=TopicList)
async def list_topics(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Topic).order_by(Topic.created_at.desc()))
    topics = result.scalars().all()
    return {"items": topics}


@router.post("", response_model=TopicOut, status_code=status.HTTP_201_CREATED)
async def create_topic(
    data: TopicCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    topic = Topic(title=data.title, description=data.description)
    db.add(topic)
    await db.commit()
    await db.refresh(topic)
    return topic


@router.get("/{topic_id}", response_model=TopicOut)
async def get_topic(topic_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    return topic
