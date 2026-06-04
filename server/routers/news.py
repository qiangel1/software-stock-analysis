"""
News Router

Handles news and announcement data.
"""

from typing import Optional
from fastapi import APIRouter, Query
from datetime import datetime, timedelta
import random

router = APIRouter(prefix='/news', tags=['资讯'])


def get_mock_news(count: int = 10, stock_code: Optional[str] = None) -> list:
    """Generate mock news data."""
    news_templates = [
        ('{name}发布年度业绩预告，预计净利润同比增长', '利好'),
        ('{name}董事会审议通过分红预案', '分红'),
        ('{name}获得重大合同订单', '利好'),
        ('分析师上调{name}目标价至', '看好'),
        ('{name}CTO接受媒体采访，畅谈公司发展战略', '中性'),
        ('机构调研{name}，关注公司核心竞争力', '中性'),
        ('{name}举办投资者交流会', '中性'),
        ('{name}入选沪深300指数成分股', '利好'),
    ]
    
    news = []
    now = datetime.now()
    
    for i in range(count):
        template, sentiment = random.choice(news_templates)
        name = f'股票{stock_code}' if stock_code else random.choice(['贵州茅台', '五粮液', '招商银行', '宁德时代'])
        
        news.append({
            'id': f'news_{i}_{random.randint(1000, 9999)}',
            'title': template.format(name=name),
            'summary': f'{name}今日发布重要公告，{'市场反应积极' if sentiment == "利好" else "市场保持关注"}。分析师普遍认为这对公司长期发展具有积极意义。',
            'source': random.choice(['东方财富', '同花顺', '雪球', '证券时报', '第一财经']),
            'pub_time': (now - timedelta(hours=random.randint(1, 48))).strftime('%Y-%m-%d %H:%M:%S'),
            'related_stocks': [stock_code] if stock_code else ['600519', '000858', '600036'],
            'type': random.choice(['news', 'announcement', 'research', 'notice']),
            'images': [],
            'url': f'https://example.com/news/{i}',
            'view_count': random.randint(100, 10000),
            'comment_count': random.randint(10, 500),
        })
    
    return news


@router.get('/market')
async def get_market_news(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, le=50),
):
    """Get market news."""
    news = get_mock_news(page_size)
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': news,
    }


@router.get('/hot')
async def get_hot_news(
    limit: int = Query(10, le=30),
):
    """Get hot/trending news."""
    news = get_mock_news(limit)
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': news,
    }


@router.get('/detail/{news_id}')
async def get_news_detail(news_id: str):
    """Get news detail."""
    news = get_mock_news(1)[0]
    news['content'] = f'''
{news['summary']}

第一段详细内容...

第二段详细内容...

第三段详细内容...

{news['source']}
'''
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': news,
    }


@router.get('/search')
async def search_news(
    keyword: str = Query(..., description='搜索关键词'),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, le=50),
):
    """Search news by keyword."""
    news = get_mock_news(page_size)
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': news,
    }


@router.get('/categories')
async def get_news_categories():
    """Get news categories."""
    return {
        'code': 0,
        'message': '获取成功',
        'data': [
            {'id': 'market', 'name': '市场', 'icon': '📊'},
            {'id': 'stock', 'name': '个股', 'icon': '📈'},
            {'id': 'industry', 'name': '行业', 'icon': '🏭'},
            {'id': 'macro', 'name': '宏观', 'icon': '🌐'},
            {'id': 'research', 'name': '研报', 'icon': '📑'},
        ],
    }


@router.get('/announcements/{code}')
async def get_announcements(
    code: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, le=50),
):
    """Get announcements for specific stock."""
    news = get_mock_news(page_size, code)
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': news,
    }
