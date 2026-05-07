import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_admin
from dao.dependencies import get_topic_dao
from database import get_db
from schemas import TopicCreate, TopicList, TopicOut, TopicUpdate
from models import User

router = APIRouter(prefix="/topics", tags=["topics"])


@router.put("/{topic_id}", response_model=TopicOut)
async def update_topic(
    topic_id: uuid.UUID,
    data: TopicUpdate,
    db: AsyncSession = Depends(get_db),
    topic_dao = Depends(get_topic_dao),
    admin: User = Depends(require_admin),
):
    topic = await topic_dao.update(db, topic_id, data.dict(exclude_unset=True))
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    return topic


@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    topic_dao = Depends(get_topic_dao),
    admin: User = Depends(require_admin),
):
    success = await topic_dao.delete(db, topic_id)
    if not success:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    return None


@router.get("", response_model=TopicList)
async def list_topics(db: AsyncSession = Depends(get_db), topic_dao = Depends(get_topic_dao)):
    topics = await topic_dao.get_all(db)
    return {"items": topics}


@router.post("", response_model=TopicOut, status_code=status.HTTP_201_CREATED)
async def create_topic(
    data: TopicCreate,
    db: AsyncSession = Depends(get_db),
    topic_dao = Depends(get_topic_dao),
    admin: User = Depends(require_admin),
):
    topic_data = data.dict()
    topic = await topic_dao.create(db, topic_data)
    return topic


@router.get("/{topic_id}", response_model=TopicOut)
async def get_topic(topic_id: uuid.UUID, db: AsyncSession = Depends(get_db), topic_dao = Depends(get_topic_dao)):
    topic = await topic_dao.get(db, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    return topic
