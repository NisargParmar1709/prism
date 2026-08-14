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
    
    # CORS Configuration
    ALLOWED_ORIGINS: str = ""

    @property
    def allowed_origins(self) -> list[str]:
        if not self.ALLOWED_ORIGINS:
            return []
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
