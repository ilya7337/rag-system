import asyncio
import sys

from database import AsyncSessionLocal
from models import User
from auth import get_password_hash


async def create_admin(login: str, password: str):
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.login == login))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"Пользователь {login} уже существует")
            return

        user = User(
            login=login,
            hashed_password=get_password_hash(password),
            is_admin=True,
        )
        db.add(user)
        await db.commit()
        print(f"Администратор {login} создан")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_admin.py <login> <password>")
        sys.exit(1)
    asyncio.run(create_admin(sys.argv[1], sys.argv[2]))

