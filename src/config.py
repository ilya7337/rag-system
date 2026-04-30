from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "change-me-in-production"
    database_url: str = "postgresql+asyncpg://user:pass@localhost/db"
    openai_api_key: str = ""
    openai_base_url: str = "https://routerai.ru/api/v1"
    embedding_model: str = "baai/bge-m3"
    llm_model: str = "openai/gpt-oss-120b"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

