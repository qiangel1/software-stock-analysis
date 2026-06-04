"""
Stock Model

SQLAlchemy model for cached stock data.
Note: Real-time data comes from Futu OpenD, this is for metadata.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, DateTime, BigInteger, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

if TYPE_CHECKING:
    from .watchlist import Watchlist
    from .portfolio import Portfolio
    from .alert import Alert


class Stock(Base):
    """Stock model for stock metadata and cached basic info."""
    
    __tablename__ = 'stocks'
    
    code: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    market: Mapped[str] = mapped_column(String(10), nullable=False)  # SH, SZ, HK, US
    industry: Mapped[str | None] = mapped_column(String(50), nullable=True)
    sector: Mapped[str | None] = mapped_column(String(50), nullable=True)
    listing_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    total_shares: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    float_shares: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    market_cap: Mapped[int | None] = mapped_column(BigInteger, nullable=True)  # In cents
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    def __repr__(self) -> str:
        return f'<Stock(code={self.code}, name={self.name})>'
    
    @property
    def full_code(self) -> str:
        """Get full code with market prefix."""
        return f'{self.market}{self.code}'
    
    def to_dict(self) -> dict:
        """Convert stock to dictionary."""
        return {
            'code': self.code,
            'name': self.name,
            'market': self.market,
            'industry': self.industry,
            'sector': self.sector,
            'listing_date': self.listing_date.isoformat() if self.listing_date else None,
            'total_shares': self.total_shares,
            'float_shares': self.float_shares,
            'market_cap': self.market_cap,
        }
