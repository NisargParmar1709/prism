from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    admin_database_url: str = ""
    admin_secret_key: str = ""
    allowed_origins: list[str] = ["http://localhost:3001", "https://prism-admin.vercel.app", "http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
