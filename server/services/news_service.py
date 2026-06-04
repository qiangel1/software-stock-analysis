"""
News Service

Aggregates news from multiple sources.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import httpx


class NewsService:
    """
    Service for fetching and aggregating news.
    
    Aggregates news from various sources including
    East Money, Sina Finance, etc.
    """
    
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._cache_ttl = 300  # 5 minutes
    
    async def get_stock_news(
        self,
        code: str,
        page: int = 1,
        page_size: int = 20,
    ) -> List[Dict[str, Any]]:
        """
        Get news for specific stock.
        
        Args:
            code: Stock code
            page: Page number
            page_size: Items per page
            
        Returns:
            List of news items
        """
        # In production, call East Money API:
        # url = f'https://np-anotice-stock.eastmoney.com/api/security/ann'
        # params = {'sr': '-1', 'page_size': page_size, 'page_index': page, 'stock_list': code}
        
        # Return mock data for demo
        return self._generate_mock_news(page_size, code)
    
    async def get_market_news(
        self,
        page: int = 1,
        page_size: int = 20,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get market news.
        
        Args:
            page: Page number
            page_size: Items per page
            category: News category filter
            
        Returns:
            List of news items
        """
        return self._generate_mock_news(page_size)
    
    async def search_news(
        self,
        keyword: str,
        page: int = 1,
        page_size: int = 20,
    ) -> List[Dict[str, Any]]:
        """
        Search news by keyword.
        
        Args:
            keyword: Search keyword
            page: Page number
            page_size: Items per page
            
        Returns:
            List of matching news items
        """
        return self._generate_mock_news(page_size)
    
    async def get_announcements(
        self,
        code: str,
        page: int = 1,
        page_size: int = 20,
    ) -> List[Dict[str, Any]]:
        """
        Get announcements for specific stock.
        
        Args:
            code: Stock code
            page: Page number
            page_size: Items per page
            
        Returns:
            List of announcements
        """
        return self._generate_mock_news(page_size, code, is_announcement=True)
    
    def _generate_mock_news(
        self,
        count: int,
        stock_code: Optional[str] = None,
        is_announcement: bool = False,
    ) -> List[Dict[str, Any]]:
        """Generate mock news data."""
        import random
        
        news_templates = [
            ('{name}发布年度业绩预告，预计净利润同比增长{value}%', '利好'),
            ('{name}董事会审议通过分红预案', '分红'),
            ('{name}获得重大合同订单', '利好'),
            ('分析师上调{name}目标价至{price}元', '看好'),
            ('{name}CTO接受媒体采访，畅谈公司发展战略', '中性'),
            ('机构调研{name}，关注公司核心竞争力', '中性'),
        ]
        
        news = []
        now = datetime.now()
        
        for i in range(count):
            template, sentiment = random.choice(news_templates)
            name = f'股票{stock_code}' if stock_code else random.choice([
                '贵州茅台', '五粮液', '招商银行', '宁德时代', '比亚迪'
            ])
            
            news.append({
                'id': f'{"ann" if is_announcement else "news"}_{i}_{random.randint(1000, 9999)}',
                'title': template.format(
                    name=name,
                    value=random.randint(5, 30),
                    price=round(random.uniform(100, 300), 2),
                ),
                'summary': f'{name}今日发布重要公告，{
                    "市场反应积极" if sentiment == "利好" else "市场保持关注"
                }。分析师普遍认为这对公司长期发展具有积极意义。',
                'source': random.choice(['东方财富', '同花顺', '雪球', '证券时报', '第一财经']),
                'pub_time': (now - timedelta(hours=random.randint(1, 72))).strftime('%Y-%m-%d %H:%M:%S'),
                'related_stocks': [stock_code] if stock_code else [],
                'type': 'announcement' if is_announcement else 'news',
            })
        
        return news


# Global instance
news_service = NewsService()
