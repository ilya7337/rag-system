from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import text

from database import engine, Base
from routers import auth, chat, documents, feedback, topics, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
        # Create HNSW index for fast approximate nearest neighbor search
        # using cosine distance. 
        await conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_documents_embedding_hnsw
                ON documents USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64)
                """
            )
        )
    yield
    await engine.dispose()


app = FastAPI(
    title="Knowledge Base API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    # allow credentials with cookies; wildcard origins are not valid when allow_credentials=True
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# API routers
app.include_router(auth.router, prefix="/api")
app.include_router(topics.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# Static files
app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    return FileResponse(Path("static/index.html"))


@app.get("/health")
async def health():
    return {"status": "ok"}
