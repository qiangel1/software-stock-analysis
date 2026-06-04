"""
Alert Model

SQLAlchemy model for user price alerts (预警).
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, DateTime, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

if TYPE_CHECKING:
    from .user import User


class Alert(Base):
    """Alert model for user's price/condition alerts."""
    
    __tablename__ = 'alerts'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False,
        index=True
    )
    stock_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    stock_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    alert_type: Mapped[str] = mapped_column(String(30), nullable=False)  # price_up, price_down, change_pct, news, kdj_cross
    threshold: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)  # Alert threshold value
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_triggered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user: Mapped['User'] = relationship('User', back_populates='alerts')
    
    def __repr__(self) -> str:
        return f'<Alert(id={self.id}, user_id={self.user_id}, stock={self.stock_code}, type={self.alert_type})>'
    
    @property
    def alert_type_display(self) -> str:
        """Get human-readable alert type."""
        type_map = {
            'price_up': '价格上穿',
            'price_down': '价格下穿',
            'change_pct': '涨跌幅提醒',
            'news': '新闻提醒',
            'kdj_cross': 'KDJ金叉/死叉',
        }
        return type_map.get(self.alert_type, self.alert_type)
    
    def to_dict(self) -> dict:
        """Convert alert to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stock_code': self.stock_code,
            'stock_name': self.stock_name,
            'alert_type': self.alert_type,
            'threshold': float(self.threshold),
            'is_active': self.is_active,
            'last_triggered_at': self.last_triggered_at.isoformat() if self.last_triggered_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
    
    def check_triggered(self, current_price: int, prev_price: int) -> bool:
        """
        Check if alert should be triggered.
        
        Args:
            current_price: Current market price in cents
            prev_price: Previous closing price in cents
            
        Returns:
            True if alert is triggered
        """
        if not self.is_active:
            return False
        
        threshold_value = float(self.threshold)
        
        if self.alert_type == 'price_up':
            return current_price >= threshold_value
        elif self.alert_type == 'price_down':
            return current_price <= threshold_value
        elif self.alert_type == 'change_pct':
            change_pct = ((current_price - prev_price) / prev_price * 100) if prev_price > 0 else 0
            return abs(change_pct) >= threshold_value
        
        return False
