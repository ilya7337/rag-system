import os
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


class LLMService:
    async def search_documents(self, db: AsyncSession, query: str, limit: int = 5) -> List[Document]:
        # Generate embedding for query
        emb_response = await client.embeddings.create(
            model="baai/bge-m3",
            input=[query],
        )
        query_embedding = emb_response.data[0].embedding

        # Search with cosine distance using pgvector
        result = await db.execute(
            text(
                """
                SELECT id, topic_id, title, description, pdf_text, created_at,
                       embedding <=> :embedding AS distance
                FROM documents
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> :embedding
                LIMIT :limit
                """
            ),
            {"embedding": str(query_embedding), "limit": limit},
        )
        rows = result.mappings().all()

        docs = []
        for row in rows:
            doc = Document(
                id=row["id"],
                topic_id=row["topic_id"],
                title=row["title"],
                description=row["description"],
                pdf_text=row["pdf_text"],
                created_at=row["created_at"],
            )
            docs.append(doc)
        return docs

    async def generate_answer(self, query: str, docs: List[Document]) -> str:
        if not docs:
            return "К сожалению, по вашему запросу ничего не найдено в загруженных документах. Попробуйте переформулировать вопрос."

        context_parts = []
        for i, doc in enumerate(docs, 1):
            text = (doc.pdf_text or "")[:3000]
            context_parts.append(f"[Документ {i}: {doc.title}]\n{text}")
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

    async def generate_embedding(self, text: str) -> List[float]:
        response = await client.embeddings.create(
            model="baai/bge-m3",
            input=[text],
        )
        return response.data[0].embedding
