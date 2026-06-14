from pydantic import PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_URL: PostgresDsn
    CORS_ORIGIN: str = "http://localhost:3000"
    LOW_STOCK_THRESHOLD: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# Instantiate the settings
settings = Settings()  # type: ignore
