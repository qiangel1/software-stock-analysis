"""
User Model

SQLAlchemy model for users table.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Boolean, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

if TYPE_CHECKING:
    from .watchlist import Watchlist
    from .portfolio import Portfolio
    from .alert import Alert


class User(Base):
    """User model representing registered users."""
    
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    nickname: Mapped[str] = mapped_column(String(50), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=True)  # For future password auth
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    vip_level: Mapped[str] = mapped_column(String(20), default='free')
    vip_expire_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # Relationships
    watchlists: Mapped[list['Watchlist']] = relationship(
        'Watchlist',
        back_populates='user',
        cascade='all, delete-orphan'
    )
    portfolios: Mapped[list['Portfolio']] = relationship(
        'Portfolio',
        back_populates='user',
        cascade='all, delete-orphan'
    )
    alerts: Mapped[list['Alert']] = relationship(
        'Alert',
        back_populates='user',
        cascade='all, delete-orphan'
    )
    
    def __repr__(self) -> str:
        return f'<User(id={self.id}, phone={self.phone})>'
    
    @property
    def is_vip(self) -> bool:
        """Check if user has active VIP."""
        if self.vip_level == 'free':
            return False
        if self.vip_expire_at is None:
            return True
        return self.vip_expire_at > datetime.utcnow()
    
    def to_dict(self) -> dict:
        """Convert user to dictionary."""
        return {
            'id': self.id,
            'phone': self.phone,
            'nickname': self.nickname,
            'avatar': self.avatar,
            'vip_level': self.vip_level,
            'vip_expire_at': self.vip_expire_at.isoformat() if self.vip_expire_at else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def to_profile(self) -> dict:
        """Convert user to profile dict (public info)."""
        return {
            'id': self.id,
            'phone': self.phone,
            'nickname': self.nickname,
            'avatar': self.avatar,
            'vip_level': self.vip_level,
            'vip_expire_at': self.vip_expire_at.isoformat() if self.vip_expire_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
