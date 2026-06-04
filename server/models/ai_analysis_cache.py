"""
AI Analysis Cache Model

SQLAlchemy model for cached AI analysis results.
"""

from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class AIAnalysisCache(Base):
    """AI Analysis Cache model for storing generated analysis reports."""
    
    __tablename__ = 'ai_analysis_cache'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    stock_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    rating: Mapped[str | None] = mapped_column(String(20), nullable=True)
    rating_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    fundamental: Mapped[str | None] = mapped_column(Text, nullable=True)
    technical: Mapped[str | None] = mapped_column(Text, nullable=True)
    sentiment: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    stop_loss: Mapped[int | None] = mapped_column(Numeric(10, 2), nullable=True)
    target_price: Mapped[int | None] = mapped_column(Numeric(10, 2), nullable=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    def __repr__(self) -> str:
        return f'<AIAnalysisCache(code={self.stock_code}, rating={self.rating})>'
    
    @property
    def is_expired(self) -> bool:
        """Check if cache is expired."""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at
    
    def to_dict(self) -> dict:
        """Convert cache entry to dictionary."""
        import json
        
        return {
            'code': self.stock_code,
            'rating': self.rating,
            'rating_text': self.rating_text,
            'fundamental': json.loads(self.fundamental) if self.fundamental else None,
            'technical': json.loads(self.technical) if self.technical else None,
            'sentiment': json.loads(self.sentiment) if self.sentiment else None,
            'recommendation': json.loads(self.recommendation) if self.recommendation else None,
            'stop_loss': float(self.stop_loss) if self.stop_loss else None,
            'target_price': float(self.target_price) if self.target_price else None,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None,
        }
