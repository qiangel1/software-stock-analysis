"""
Portfolio Model

SQLAlchemy model for user portfolios (持仓).
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

if TYPE_CHECKING:
    from .user import User


class Portfolio(Base):
    """Portfolio model for user's stock holdings."""
    
    __tablename__ = 'portfolios'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False,
        index=True
    )
    stock_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    stock_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    shares: Mapped[int] = mapped_column(Integer, nullable=False)
    avg_cost: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)  # In cents
    account_name: Mapped[str] = mapped_column(String(50), default='主账户')
    account_type: Mapped[str] = mapped_column(String(20), default='main')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # Relationships
    user: Mapped['User'] = relationship('User', back_populates='portfolios')
    
    def __repr__(self) -> str:
        return f'<Portfolio(id={self.id}, user_id={self.user_id}, stock={self.stock_code})>'
    
    @property
    def total_cost(self) -> int:
        """Calculate total cost."""
        return self.shares * self.avg_cost
    
    def to_dict(self) -> dict:
        """Convert portfolio item to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stock_code': self.stock_code,
            'stock_name': self.stock_name,
            'shares': self.shares,
            'avg_cost': float(self.avg_cost),
            'account_name': self.account_name,
            'account_type': self.account_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def calculate_profit_loss(self, current_price: int) -> dict:
        """
        Calculate profit/loss based on current price.
        
        Args:
            current_price: Current market price in cents
            
        Returns:
            Dictionary with profit/loss info
        """
        market_value = self.shares * current_price
        total_cost = self.shares * self.avg_cost
        profit_loss = market_value - total_cost
        profit_loss_pct = (profit_loss / total_cost * 100) if total_cost > 0 else 0
        
        return {
            'current_price': current_price,
            'market_value': market_value,
            'profit_loss': profit_loss,
            'profit_loss_pct': float(profit_loss_pct),
        }
