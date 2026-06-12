from pydantic import PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_URL: PostgresDsn

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# Instantiate the settings
settings = Settings()  # type: ignore
