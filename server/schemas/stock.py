"""
Stock Schemas

Pydantic models for stock-related request/response validation.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class StockBase(BaseModel):
    """Base stock schema."""
    
    code: str
    name: str


class StockInfo(StockBase):
    """Schema for stock basic info."""
    
    market: str
    industry: Optional[str] = None
    sector: Optional[str] = None
    listing_date: Optional[datetime] = None
    total_shares: Optional[int] = None
    float_shares: Optional[int] = None
    market_cap: Optional[int] = None
    
    model_config = {'from_attributes': True}


class StockQuote(StockBase):
    """Schema for stock quote."""
    
    market: str
    price: float = Field(..., description='当前价格(元)')
    prev_close: float = Field(..., description='昨收价(元)')
    open: float = Field(..., description='开盘价(元)')
    high: float = Field(..., description='最高价(元)')
    low: float = Field(..., description='最低价(元)')
    volume: int = Field(..., description='成交量')
    turnover: float = Field(..., description='成交额(元)')
    change: float = Field(..., description='涨跌额(元)')
    change_pct: float = Field(..., description='涨跌幅(%)')
    bid1: float = Field(..., description='买一价(元)')
    ask1: float = Field(..., description='卖一价(元)')
    bid_vol1: int = Field(..., description='买一量')
    ask_vol1: int = Field(..., description='卖一量')
    updated_at: str


class StockSearchResult(StockBase):
    """Schema for stock search result."""
    
    market: str
    full_code: str
    type: str


class MarketIndex(BaseModel):
    """Schema for market index."""
    
    code: str
    name: str
    current: float
    change: float
    change_pct: float
    volume: int
    turnover: float
    timestamp: str


class SectorData(BaseModel):
    """Schema for sector data."""
    
    code: str
    name: str
    change_pct: float
    stock_count: int
    leading_stock: Optional[StockBase] = None


class StockRankingRequest(BaseModel):
    """Schema for stock ranking request."""
    
    type: str = Field(default='change_pct', description='排名类型')
    order: str = Field(default='desc', description='排序方式')
    limit: int = Field(default=50, le=100, description='返回数量')
