"""
User Schemas

Pydantic models for user-related request/response validation.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class SendCodeRequest(BaseModel):
    """Request schema for sending verification code."""
    
    phone: str = Field(..., min_length=11, max_length=11, description='手机号')
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('手机号必须是数字')
        if not v.startswith('1'):
            raise ValueError('手机号必须以1开头')
        return v


class LoginRequest(BaseModel):
    """Request schema for login."""
    
    phone: str = Field(..., min_length=11, max_length=11, description='手机号')
    code: str = Field(..., min_length=4, max_length=6, description='验证码')
    
    @field_validator('code')
    @classmethod
    def validate_code(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('验证码必须是数字')
        return v


class UserBase(BaseModel):
    """Base user schema."""
    
    phone: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating user."""
    pass


class UserUpdate(BaseModel):
    """Schema for updating user."""
    
    nickname: Optional[str] = None
    avatar: Optional[str] = None


class UserProfile(BaseModel):
    """Schema for user profile response."""
    
    id: int
    phone: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    vip_level: str = 'free'
    vip_expire_at: Optional[datetime] = None
    created_at: datetime
    
    model_config = {'from_attributes': True}


class LoginResponse(BaseModel):
    """Schema for login response."""
    
    token: str
    user: UserProfile


class UserSettings(BaseModel):
    """Schema for user settings."""
    
    stock_view_mode: str = 'list'
    default_kline_period: str = '1d'
    push_enabled: bool = True
    email_enabled: bool = False
    theme: str = 'light'


class WatchlistBase(BaseModel):
    """Base watchlist schema."""
    
    stock_code: str
    group_name: str = '默认'


class WatchlistCreate(WatchlistBase):
    """Schema for creating watchlist item."""
    
    stock_name: Optional[str] = None


class WatchlistUpdate(BaseModel):
    """Schema for updating watchlist item."""
    
    group_name: Optional[str] = None
    sort_order: Optional[int] = None


class WatchlistItem(WatchlistBase):
    """Schema for watchlist item response."""
    
    id: int
    user_id: int
    stock_name: Optional[str] = None
    sort_order: int
    price: Optional[float] = None
    change: Optional[float] = None
    change_pct: Optional[float] = None
    created_at: datetime
    
    model_config = {'from_attributes': True}


class PortfolioBase(BaseModel):
    """Base portfolio schema."""
    
    stock_code: str
    shares: int = Field(..., gt=0, description='持股数量')
    avg_cost: float = Field(..., gt=0, description='平均成本价(元)')


class PortfolioCreate(PortfolioBase):
    """Schema for creating portfolio item."""
    
    stock_name: Optional[str] = None
    account_name: str = '主账户'
    account_type: str = 'main'


class PortfolioUpdate(BaseModel):
    """Schema for updating portfolio item."""
    
    shares: Optional[int] = Field(None, gt=0)
    avg_cost: Optional[float] = Field(None, gt=0)
    account_name: Optional[str] = None


class PortfolioItem(PortfolioBase):
    """Schema for portfolio item response."""
    
    id: int
    user_id: int
    stock_name: Optional[str] = None
    current_price: Optional[float] = None
    market_value: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_pct: Optional[float] = None
    account_name: str
    account_type: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {'from_attributes': True}


class PortfolioSummary(BaseModel):
    """Schema for portfolio summary response."""
    
    total_market_value: float
    total_cost: float
    total_profit_loss: float
    profit_loss_pct: float
    today_profit_loss: float
    today_profit_loss_pct: float
    holdings_count: int
    best_performer: Optional[dict] = None
    worst_performer: Optional[dict] = None
