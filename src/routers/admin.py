from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_admin
from database import get_db
from models import AdminLog, User
from schemas import AdminLogList

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/logs", response_model=AdminLogList)
async def get_logs(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(
        select(AdminLog).order_by(AdminLog.created_at.desc())
    )
    logs = result.scalars().all()
    return {"items": logs}
