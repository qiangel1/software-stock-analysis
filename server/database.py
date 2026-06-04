"""
StockQuant Database Module

Handles database connections, session management,
and SQLAlchemy engine configuration.
"""

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from config import settings


# Naming convention for database constraints
convention = {
    'ix': 'ix_%(column_0_label)s',
    'uq': 'uq_%(table_name)s_%(column_0_name)s',
    'ck': 'ck_%(table_name)s_%(constraint_name)s',
    'fk': 'fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s',
    'pk': 'pk_%(table_name)s',
}

# Global metadata with naming convention
metadata = MetaData(naming_convention=convention)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    metadata = metadata


# Create async engine
engine: AsyncEngine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Create session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def init_db() -> None:
    """
    Initialize database by creating all tables.
    
    Should be called once at application startup.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """
    Close database connections.
    
    Should be called at application shutdown.
    """
    await engine.dispose()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database session.
    
    Yields an async session and ensures proper cleanup
    after the request is completed.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for database session.
    
    Useful for non-FastAPI contexts like background tasks.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def health_check() -> bool:
    """
    Check database connectivity.
    
    Returns True if connection is successful, False otherwise.
    """
    try:
        async with async_session_factory() as session:
            await session.execute('SELECT 1')
            return True
    except Exception:
        return False


# Redis client for caching
class RedisClient:
    """Async Redis client wrapper."""

    _instance: 'RedisClient | None' = None
    _client = None

    def __new__(cls) -> 'RedisClient':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def connect(self) -> None:
        """Connect to Redis server."""
        import redis.asyncio as redis
        self._client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            db=settings.redis_db,
            password=settings.redis_password,
            decode_responses=True,
        )

    async def disconnect(self) -> None:
        """Disconnect from Redis server."""
        if self._client:
            await self._client.close()

    @property
    def client(self):
        """Get Redis client instance."""
        return self._client

    async def get(self, key: str) -> str | None:
        """Get value from cache."""
        if self._client:
            return await self._client.get(key)
        return None

    async def set(
        self,
        key: str,
        value: str,
        ex: int | None = None,
    ) -> bool:
        """Set value in cache with optional expiration."""
        if self._client:
            return await self._client.set(key, value, ex=ex)
        return False

    async def delete(self, key: str) -> int:
        """Delete key from cache."""
        if self._client:
            return await self._client.delete(key)
        return 0

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        if self._client:
            return await self._client.exists(key) > 0
        return False

    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration time for key."""
        if self._client:
            return await self._client.expire(key, seconds)
        return False

    async def ttl(self, key: str) -> int:
        """Get time-to-live for key."""
        if self._client:
            return await self._client.ttl(key)
        return -1

    async def flush_db(self) -> bool:
        """Flush current database."""
        if self._client:
            await self._client.flushdb()
            return True
        return False


# Global Redis instance
redis_client = RedisClient()


async def init_redis() -> None:
    """Initialize Redis connection."""
    await redis_client.connect()


async def close_redis() -> None:
    """Close Redis connection."""
    await redis_client.disconnect()
