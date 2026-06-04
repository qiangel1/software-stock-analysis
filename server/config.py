"""
StockQuant Configuration Module

Handles application configuration from environment variables
with type-safe validation using Pydantic Settings.
"""

import os
from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore',
    )

    # Application Settings
    app_name: str = 'StockQuant'
    app_version: str = '1.0.0'
    app_env: str = Field(default='development', alias='APP_ENV')
    debug: bool = True

    # API Settings
    api_v1_prefix: str = '/api/v1'
    api_host: str = '0.0.0.0'
    api_port: int = 8000

    # CORS Settings
    cors_origins: list[str] = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
    ]

    # Database Settings
    postgres_host: str = Field(default='localhost', alias='POSTGRES_HOST')
    postgres_port: int = Field(default=5432, alias='POSTGRES_PORT')
    postgres_db: str = Field(default='stockquant', alias='POSTGRES_DB')
    postgres_user: str = Field(default='postgres', alias='POSTGRES_USER')
    postgres_password: str = Field(default='', alias='POSTGRES_PASSWORD')

    @property
    def database_url(self) -> str:
        """Generate PostgreSQL connection URL."""
        return (
            f'postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}'
            f'@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}'
        )

    @property
    def database_url_sync(self) -> str:
        """Generate synchronous PostgreSQL connection URL."""
        return (
            f'postgresql://{self.postgres_user}:{self.postgres_password}'
            f'@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}'
        )

    # Redis Settings
    redis_host: str = Field(default='localhost', alias='REDIS_HOST')
    redis_port: int = Field(default=6379, alias='REDIS_PORT')
    redis_db: int = Field(default=0, alias='REDIS_DB')
    redis_password: Optional[str] = Field(default=None, alias='REDIS_PASSWORD')

    @property
    def redis_url(self) -> str:
        """Generate Redis connection URL."""
        if self.redis_password:
            return f'redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/{self.redis_db}'
        return f'redis://{self.redis_host}:{self.redis_port}/{self.redis_db}'

    # JWT Settings
    jwt_secret: str = Field(default='change-me-in-production', alias='JWT_SECRET')
    jwt_algorithm: str = Field(default='HS256', alias='JWT_ALGORITHM')
    jwt_expire_minutes: int = Field(default=1440, alias='JWT_EXPIRE_MINUTES')

    # OpenAI Settings
    openai_api_key: Optional[str] = Field(default=None, alias='OPENAI_API_KEY')
    openai_model: str = Field(default='gpt-4', alias='OPENAI_MODEL')

    @property
    def is_openai_configured(self) -> bool:
        """Check if OpenAI is properly configured."""
        return bool(self.openai_api_key)

    # Futu OpenD Settings
    futu_host: str = Field(default='127.0.0.1', alias='FUTU_HOST')
    futu_port: int = Field(default=11111, alias='FUTU_PORT')

    # SMS Settings (Tencent Cloud)
    sms_provider: str = Field(default='tencent', alias='SMS_PROVIDER')
    sms_secret_id: Optional[str] = Field(default=None, alias='SMS_SECRET_ID')
    sms_secret_key: Optional[str] = Field(default=None, alias='SMS_SECRET_KEY')
    sms_app_id: Optional[str] = Field(default=None, alias='SMS_APP_ID')

    @property
    def is_sms_configured(self) -> bool:
        """Check if SMS service is properly configured."""
        return bool(self.sms_secret_id and self.sms_secret_key and self.sms_app_id)

    # Cache TTL Settings (in seconds)
    cache_ttl_quote: int = 3  # Real-time quotes: 3 seconds
    cache_ttl_news: int = 300  # News: 5 minutes
    cache_ttl_user: int = 300  # User data: 5 minutes
    cache_ttl_analysis: int = 3600  # AI analysis: 1 hour

    # Rate Limiting
    rate_limit_per_minute: int = 60

    # Log Settings
    log_level: str = Field(default='INFO', alias='LOG_LEVEL')

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.app_env.lower() == 'production'

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.app_env.lower() == 'development'


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached application settings.
    
    Uses lru_cache to ensure settings are only loaded once
    and reused across the application.
    """
    return Settings()


# Global settings instance
settings = get_settings()
