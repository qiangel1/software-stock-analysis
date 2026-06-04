"""
Analysis Schemas

Pydantic models for AI analysis and filtering.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class StockFilterConditions(BaseModel):
    """Schema for stock filter conditions."""
    
    # Price range (in yuan)
    price_range: Optional[tuple[float, float]] = None
    
    # Volume range
    volume_range: Optional[tuple[int, int]] = None
    
    # Market cap range (in 100 million yuan)
    market_cap_range: Optional[tuple[float, float]] = None
    
    # PE ratio range
    pe_range: Optional[tuple[float, float]] = None
    
    # PB ratio range
    pb_range: Optional[tuple[float, float]] = None
    
    # Change percentage range (%)
    change_pct_range: Optional[tuple[float, float]] = None
    
    # MACD golden cross
    macd_golden_cross: Optional[bool] = None
    
    # KDJ status
    kdj_status: Optional[str] = None
    
    # RSI status
    rsi_status: Optional[str] = None


class FundamentalAnalysis(BaseModel):
    """Schema for fundamental analysis."""
    
    score: int = Field(..., ge=0, le=100)
    summary: str
    pros: List[str]
    cons: List[str]


class TechnicalAnalysis(BaseModel):
    """Schema for technical analysis."""
    
    score: int = Field(..., ge=0, le=100)
    summary: str
    indicators: List[str]


class SentimentAnalysis(BaseModel):
    """Schema for sentiment analysis."""
    
    score: int = Field(..., ge=0, le=100)
    summary: str
    news_count: int
    positive_ratio: float


class Recommendation(BaseModel):
    """Schema for investment recommendation."""
    
    action: str  # buy, hold, sell
    target_price: float
    stop_loss: float
    risk_level: str  # low, medium, high
    holding_period: str


class AIAnalysisResponse(BaseModel):
    """Schema for AI analysis response."""
    
    code: str
    name: str
    rating: str  # strongly_buy, buy, neutral, cautious
    rating_text: str
    fundamental: FundamentalAnalysis
    technical: TechnicalAnalysis
    sentiment: SentimentAnalysis
    recommendation: Recommendation
    generated_at: datetime


class FilterStocksRequest(BaseModel):
    """Schema for filter stocks request."""
    
    conditions: StockFilterConditions
    sort_by: Optional[str] = 'score'
    sort_order: str = 'desc'
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, le=100)


class FilterStocksResponse(BaseModel):
    """Schema for filter stocks response."""
    
    stocks: List[dict]
    total: int
    filter_applied: List[str]


class NewsSummaryRequest(BaseModel):
    """Schema for news summary request."""
    
    code: str


class NewsSummaryResponse(BaseModel):
    """Schema for news summary response."""
    
    summary: str
    key_points: List[str]
    sentiment: str
    source_count: int


class TradingSignal(BaseModel):
    """Schema for trading signal."""
    
    name: str
    type: str  # buy, sell, neutral
    strength: int = Field(..., ge=0, le=100)
    description: str


class TradingSignalsResponse(BaseModel):
    """Schema for trading signals response."""
    
    signals: List[TradingSignal]
    overall: str  # buy, sell, neutral
    confidence: int = Field(..., ge=0, le=100)


class CompareStocksRequest(BaseModel):
    """Schema for compare stocks request."""
    
    codes: List[str] = Field(..., min_length=2, max_length=5)


class MarketOutlookResponse(BaseModel):
    """Schema for market outlook response."""
    
    outlook: str  # bullish, bearish, neutral
    confidence: int = Field(..., ge=0, le=100)
    summary: str
    key_factors: List[str]


class StockRecommendation(BaseModel):
    """Schema for stock recommendation."""
    
    code: str
    name: str
    rating: str
    reason: str


class RecommendationsResponse(BaseModel):
    """Schema for recommendations response."""
    
    stocks: List[StockRecommendation]
