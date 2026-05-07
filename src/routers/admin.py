from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_admin
from dao.dependencies import get_admin_log_dao
from models import AdminLog, User
from schemas import AdminLogList
from database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/logs", response_model=AdminLogList)
async def get_logs(
    db: AsyncSession = Depends(get_db),
    admin_log_dao = Depends(get_admin_log_dao),
    admin: User = Depends(require_admin),
):
    logs = await admin_log_dao.get_all(db)
    return {"items": logs}
