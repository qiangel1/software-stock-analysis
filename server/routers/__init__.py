"""
Routers package initialization
"""

from routers.auth import router as auth_router
from routers.quotes import router as quotes_router
from routers.news import router as news_router
from routers.ai import router as ai_router
from routers.watchlist import router as watchlist_router
from routers.portfolio import router as portfolio_router
from routers.alerts import router as alerts_router

__all__ = [
    'auth_router',
    'quotes_router',
    'news_router',
    'ai_router',
    'watchlist_router',
    'portfolio_router',
    'alerts_router',
]
