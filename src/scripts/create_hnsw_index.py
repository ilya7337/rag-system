"""
Standalone script to create the HNSW index on existing databases.
Run this if the index wasn't created automatically (e.g. for a DB
that already has data and the application lifespan has already passed).

Usage:
    cd /home/ilya/fas_summarizer-main/fas_summarizer-main
    python -m src.scripts.create_hnsw_index
"""

import asyncio
from sqlalchemy import text
from database import engine


async def main():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_documents_embedding_hnsw
                ON documents USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64)
                """
            )
        )
    print("HNSW index created (or already exists).")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())

