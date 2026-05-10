import uuid
from typing import Any, Dict, List, Optional, TypeVar, Type
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

ModelType = TypeVar("ModelType", bound=DeclarativeBase)


class BaseDAO:
    """Base DAO class with common CRUD operations."""
    
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    async def create(self, db: AsyncSession, obj_data: Dict[str, Any]) -> ModelType:
        """Create new instance."""
        instance = self.model(id=uuid.uuid4(), **obj_data)
        db.add(instance)
        await db.commit()
        await db.refresh(instance)
        return instance
    
    async def get(self, db: AsyncSession, model_id: uuid.UUID) -> Optional[ModelType]:
        """Get by primary key."""
        result = await db.execute(select(self.model).where(self.model.id == model_id))
        return result.scalar_one_or_none()
    
    async def get_by(self, db: AsyncSession, **filters: Any) -> Optional[ModelType]:
        """Get single by filters."""
        stmt = select(self.model)
        for key, value in filters.items():
            stmt = stmt.where(getattr(self.model, key) == value)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_all(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100, 
        **filters: Any
    ) -> List[ModelType]:
        """Get all with pagination and optional filters."""
        stmt = select(self.model).offset(skip).limit(limit)
        for key, value in filters.items():
            stmt = stmt.where(getattr(self.model, key) == value)
        stmt = stmt.order_by(self.model.created_at.desc())
        result = await db.execute(stmt)
        return result.scalars().all()
    
    async def update(self, db: AsyncSession, model_id: uuid.UUID, update_data: Dict[str, Any]) -> Optional[ModelType]:
        """Update by primary key."""
        instance = await self.get(db, model_id)
        if not instance:
            return None
        for key, value in update_data.items():
            setattr(instance, key, value)
        await db.commit()
        await db.refresh(instance)
        return instance
    
    async def delete(self, db: AsyncSession, model_id: uuid.UUID) -> bool:
        """Delete by primary key."""
        instance = await self.get(db, model_id)
        if not instance:
            return False
        await db.delete(instance)
        await db.commit()
        return True
    
    async def count(self, db: AsyncSession, **filters: Any) -> int:
        """Count with optional filters."""
        stmt = select(func.count()).select_from(self.model)
        for key, value in filters.items():
            stmt = stmt.where(getattr(self.model, key) == value)
        result = await db.execute(stmt)
        return result.scalar() or 0

