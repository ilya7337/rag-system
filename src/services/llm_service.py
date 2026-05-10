import os
from dataclasses import dataclass
from typing import List, Optional

from openai import AsyncOpenAI
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models import Document

client = AsyncOpenAI(
    api_key=settings.openai_api_key,
    base_url=settings.openai_base_url,
)

CHUNK_SIZE = 4000   # ~1000 tokens, well within bge-m3's 8192 limit
CHUNK_OVERLAP = 400
RELEVANCE_DISTANCE_THRESHOLD = 0.7  # cosine distance; chunks farther than this are treated as irrelevant


@dataclass
class SearchResult:
    document_id: str
    topic_id: str
    title: str
    description: Optional[str]
    chunk_text: str


def split_into_chunks(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = end - overlap
    return chunks


class LLMService:
    async def generate_chunks_with_embeddings(self, text: str) -> List[dict]:
        """Split text into chunks and generate embeddings for all of them in one batch call."""
        chunks = split_into_chunks(text)
        if not chunks:
            return []

        response = await client.embeddings.create(
            model="baai/bge-m3",
            input=chunks,
        )
        return [
            {
                "chunk_index": i,
                "chunk_text": chunk,
                "embedding": response.data[i].embedding,
            }
            for i, chunk in enumerate(chunks)
        ]

    async def search_documents(self, db: AsyncSession, query: str, limit: int = 5) -> List[SearchResult]:
        emb_response = await client.embeddings.create(
            model="baai/bge-m3",
            input=[query],
        )
        query_embedding = emb_response.data[0].embedding

        result = await db.execute(
            text(
                """
                SELECT d.id AS document_id, d.topic_id, d.title, d.description,
                       c.chunk_text,
                       c.embedding <=> :embedding AS distance
                FROM document_chunks c
                JOIN documents d ON c.document_id = d.id
                WHERE c.embedding IS NOT NULL
                  AND c.embedding <=> :embedding < :threshold
                ORDER BY c.embedding <=> :embedding
                LIMIT :limit
                """
            ),
            {
                "embedding": str(query_embedding),
                "limit": limit,
                "threshold": RELEVANCE_DISTANCE_THRESHOLD,
            },
        )
        rows = result.mappings().all()

        return [
            SearchResult(
                document_id=str(row["document_id"]),
                topic_id=str(row["topic_id"]),
                title=row["title"],
                description=row["description"],
                chunk_text=row["chunk_text"],
            )
            for row in rows
        ]

    async def generate_answer(self, query: str, results: List[SearchResult]) -> str:
        if not results:
            return "К сожалению, по вашему запросу ничего не найдено в загруженных документах. Попробуйте переформулировать вопрос."

        context_parts = []
        for i, result in enumerate(results, 1):
            context_parts.append(f"[Документ {i}: {result.title}]\n{result.chunk_text}")
        context = "\n\n".join(context_parts)

        messages = [
            {
                "role": "system",
                "content": (
                    "Ты — полезный ассистент, который отвечает на вопросы пользователя "
                    "строго на основе предоставленных документов. Не используй внешние знания. "
                    "Отвечай кратко, по существу, на русском языке."
                ),
            },
            {
                "role": "user",
                "content": f"Контекст из документов:\n{context}\n\nВопрос пользователя: {query}",
            },
        ]

        response = await client.chat.completions.create(
            model="openai/gpt-oss-120b",
            max_tokens=800,
            temperature=0.3,
            top_p=0.95,
            messages=messages,
        )
        return (response.choices[0].message.content or "").strip()
