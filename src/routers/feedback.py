import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Feedback
from schemas import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
async def create_feedback(data: FeedbackCreate, db: AsyncSession = Depends(get_db)):
    feedback = Feedback(id=uuid.uuid4(), text=data.text)
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    return feedback
