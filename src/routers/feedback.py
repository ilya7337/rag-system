import uuid
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from dao.dependencies import get_feedback_dao
from database import get_db
from schemas import FeedbackCreate, FeedbackOut
from fastapi import HTTPException

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.get("", response_model=List[FeedbackOut])
async def list_feedback(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    feedback_dao = Depends(get_feedback_dao),
):
    return await feedback_dao.get_all(db, skip=skip, limit=limit)


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(
    feedback_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    feedback_dao = Depends(get_feedback_dao),
):
    success = await feedback_dao.delete(db, feedback_id)
    if not success:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return None


@router.post("", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
async def create_feedback(data: FeedbackCreate, db: AsyncSession = Depends(get_db), feedback_dao = Depends(get_feedback_dao)):
    feedback_data = data.dict()
    feedback = await feedback_dao.create(db, feedback_data)
    return feedback
