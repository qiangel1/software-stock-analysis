"""
Watchlist Model

SQLAlchemy model for user watchlists (自选股).
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

if TYPE_CHECKING:
    from .user import User


class Watchlist(Base):
    """Watchlist model for user's favorite stocks."""
    
    __tablename__ = 'watchlists'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False,
        index=True
    )
    stock_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    stock_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    group_name: Mapped[str] = mapped_column(String(50), default='默认')
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user: Mapped['User'] = relationship('User', back_populates='watchlists')
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'stock_code', name='uq_user_stock'),
    )
    
    def __repr__(self) -> str:
        return f'<Watchlist(id={self.id}, user_id={self.user_id}, stock={self.stock_code})>'
    
    def to_dict(self) -> dict:
        """Convert watchlist item to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stock_code': self.stock_code,
            'stock_name': self.stock_name,
            'group_name': self.group_name,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
