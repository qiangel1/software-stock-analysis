"""
Alert Schemas

Pydantic models for alert-related request/response validation.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class AlertType:
    """Alert type constants."""
    
    PRICE_UP = 'price_up'
    PRICE_DOWN = 'price_down'
    CHANGE_PCT = 'change_pct'
    NEWS = 'news'
    KDJ_CROSS = 'kdj_cross'
    
    @classmethod
    def all(cls) -> list[str]:
        return [
            cls.PRICE_UP,
            cls.PRICE_DOWN,
            cls.CHANGE_PCT,
            cls.NEWS,
            cls.KDJ_CROSS,
        ]


class AlertCreate(BaseModel):
    """Schema for creating alert."""
    
    stock_code: str = Field(..., description='股票代码')
    alert_type: str = Field(..., description='预警类型')
    threshold: float = Field(..., description='阈值')
    
    @field_validator('alert_type')
    @classmethod
    def validate_alert_type(cls, v: str) -> str:
        if v not in AlertType.all():
            raise ValueError(f'Invalid alert type: {v}')
        return v


class AlertUpdate(BaseModel):
    """Schema for updating alert."""
    
    is_active: Optional[bool] = None
    threshold: Optional[float] = None


class AlertItem(BaseModel):
    """Schema for alert item response."""
    
    id: int
    user_id: int
    stock_code: str
    stock_name: Optional[str] = None
    alert_type: str
    threshold: float
    is_active: bool
    last_triggered_at: Optional[datetime] = None
    created_at: datetime
    
    model_config = {'from_attributes': True}


class AlertTriggered(BaseModel):
    """Schema for triggered alert notification."""
    
    alert_id: int
    stock_code: str
    stock_name: str
    alert_type: str
    threshold: float
    current_price: float
    message: str
    triggered_at: datetime


class NotificationPreferences(BaseModel):
    """Schema for notification preferences."""
    
    channels: list[str] = ['app']
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    price_alerts: bool = True
    news_alerts: bool = True
