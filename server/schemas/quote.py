"""
Quote Schemas

Pydantic models for quote-related request/response validation.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class KLineData(BaseModel):
    """Schema for K-line data point."""
    
    timestamp: int = Field(..., description='时间戳(毫秒)')
    open: float = Field(..., description='开盘价(元)')
    high: float = Field(..., description='最高价(元)')
    low: float = Field(..., description='最低价(元)')
    close: float = Field(..., description='收盘价(元)')
    volume: int = Field(..., description='成交量')
    turnover: float = Field(..., description='成交额(元)')


class KLineRequest(BaseModel):
    """Schema for K-line data request."""
    
    code: str = Field(..., description='股票代码')
    period: str = Field(default='1d', description='K线周期')
    count: int = Field(default=100, le=500, description='数据数量')
    adjust: str = Field(default='none', description='复权类型')


class MAData(BaseModel):
    """Moving Average data."""
    
    ma5: Optional[float] = None
    ma10: Optional[float] = None
    ma20: Optional[float] = None
    ma30: Optional[float] = None
    ma60: Optional[float] = None


class MACDData(BaseModel):
    """MACD data."""
    
    diff: float
    dea: float
    bar: float


class RSIData(BaseModel):
    """RSI data."""
    
    rsi6: Optional[float] = None
    rsi12: Optional[float] = None
    rsi24: Optional[float] = None


class KDJData(BaseModel):
    """KDJ data."""
    
    k: float
    d: float
    j: float


class BOLLData(BaseModel):
    """Bollinger Bands data."""
    
    upper: float
    middle: float
    lower: float


class VolumeData(BaseModel):
    """Volume MA data."""
    
    ma5: Optional[float] = None
    ma10: Optional[float] = None


class TechnicalIndicators(BaseModel):
    """Schema for technical indicators."""
    
    ma: MAData
    macd: MACDData
    rsi: RSIData
    kdj: KDJData
    boll: BOLLData
    volume: VolumeData


class IndicatorRequest(BaseModel):
    """Schema for indicator request."""
    
    code: str = Field(..., description='股票代码')
    indicators: str = Field(default='MA,MACD,KDJ,RSI,BOLL', description='指标列表')


class RealtimeQuoteRequest(BaseModel):
    """Schema for realtime quote request."""
    
    codes: str = Field(..., description='股票代码列表,逗号分隔')


class QuoteUpdate(BaseModel):
    """Schema for WebSocket quote update."""
    
    code: str
    name: str
    price: float
    change: float
    change_pct: float
    volume: int
    turnover: float
    bid1: float
    ask1: float
    high: float
    low: float
    open: float
    prev_close: float
    timestamp: int
