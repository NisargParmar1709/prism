from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env.local", env_file_encoding="utf-8", extra="ignore"
    )

    DATABASE_URL: str
    ADMIN_DATABASE_URL: str
    INSFORGE_URL: str
    INSFORGE_SERVICE_KEY: str
    INSFORGE_JWT_SECRET: str
    REDIS_URL: str
    AI_BASE_URL: str
    AI_API_KEY: str
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None
    SECRET_KEY: str
    ADMIN_SECRET_KEY: str
    ENABLE_CACHING: bool = False
    
    # Custom origins (e.g. frontend URL)
    # Allows comma-separated string from .env
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
