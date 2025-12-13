from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pathlib import Path
import os


# Tìm file .env từ thư mục Backend (parent của app/)
BACKEND_DIR = Path(__file__).parent.parent
ENV_FILE = BACKEND_DIR / ".env"

# Load .env file manually nếu cần
if ENV_FILE.exists():
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=ENV_FILE)


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - Parse từ string (comma-separated) thành List[str]
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string thành list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
    
    # Cấu hình Pydantic v2
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        env_ignore_empty=True
    )


settings = Settings()

