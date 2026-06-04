"""
Quotes Router

Handles stock quote data including realtime quotes,
K-line data, and technical indicators.
"""

from typing import Optional, List
from fastapi import APIRouter, Query
from datetime import datetime, timedelta

from schemas.stock import StockQuote, StockSearchResult, MarketIndex
from schemas.quote import KLineData, TechnicalIndicators, MAData, MACDData, RSIData, KDJData, BOLLData, VolumeData

router = APIRouter(prefix='/quotes', tags=['行情'])


def get_mock_stock(code: str) -> dict:
    """Generate mock stock data."""
    import random
    
    base_price = random.uniform(10, 500)
    change = random.uniform(-10, 10)
    
    return {
        'code': code,
        'name': f'股票{code}',
        'market': 'SH' if code.startswith('6') else 'SZ',
        'price': round(base_price, 2),
        'prev_close': round(base_price - change, 2),
        'open': round(base_price - change * 0.5, 2),
        'high': round(base_price + abs(change) * 0.5, 2),
        'low': round(base_price - abs(change) * 0.5, 2),
        'volume': random.randint(1000000, 100000000),
        'turnover': random.randint(100000000, 10000000000),
        'change': round(change, 2),
        'change_pct': round(change / (base_price - change) * 100, 2),
        'bid1': round(base_price - 0.01, 2),
        'ask1': round(base_price + 0.01, 2),
        'bid_vol1': random.randint(100, 10000),
        'ask_vol1': random.randint(100, 10000),
        'updated_at': datetime.now().isoformat(),
    }


@router.get('/realtime')
async def get_realtime_quotes(
    codes: str = Query(..., description='股票代码列表,逗号分隔'),
):
    """Get realtime quotes for multiple stocks."""
    code_list = [c.strip() for c in codes.split(',') if c.strip()]
    
    stocks = [get_mock_stock(code) for code in code_list]
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': stocks,
    }


@router.get('/kline')
async def get_kline(
    code: str = Query(..., description='股票代码'),
    period: str = Query('1d', description='K线周期'),
    count: int = Query(100, le=500, description='数据数量'),
    adjust: str = Query('none', description='复权类型'),
):
    """Get K-line data for stock."""
    import random
    
    klines = []
    base_price = random.uniform(50, 200)
    now = datetime.now()
    
    # Determine interval based on period
    intervals = {
        '1m': timedelta(minutes=1),
        '5m': timedelta(minutes=5),
        '15m': timedelta(minutes=15),
        '30m': timedelta(minutes=30),
        '1h': timedelta(hours=1),
        '1d': timedelta(days=1),
        '1w': timedelta(weeks=1),
        '1M': timedelta(days=30),
    }
    
    interval = intervals.get(period, timedelta(days=1))
    
    for i in range(count):
        timestamp = now - interval * (count - i - 1)
        open_price = base_price + random.uniform(-5, 5)
        close_price = open_price + random.uniform(-3, 3)
        high_price = max(open_price, close_price) + random.uniform(0, 2)
        low_price = min(open_price, close_price) - random.uniform(0, 2)
        
        klines.append({
            'timestamp': int(timestamp.timestamp() * 1000),
            'open': round(open_price, 2),
            'high': round(high_price, 2),
            'low': round(low_price, 2),
            'close': round(close_price, 2),
            'volume': random.randint(100000, 10000000),
            'turnover': random.randint(10000000, 1000000000),
        })
        
        base_price = close_price
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': klines,
    }


@router.get('/indicators')
async def get_indicators(
    code: str = Query(..., description='股票代码'),
):
    """Get technical indicators for stock."""
    import random
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': {
            'ma': {
                'ma5': round(random.uniform(50, 100), 2),
                'ma10': round(random.uniform(50, 100), 2),
                'ma20': round(random.uniform(50, 100), 2),
                'ma30': round(random.uniform(50, 100), 2),
                'ma60': round(random.uniform(50, 100), 2),
            },
            'macd': {
                'diff': round(random.uniform(-1, 1), 4),
                'dea': round(random.uniform(-1, 1), 4),
                'bar': round(random.uniform(-0.5, 0.5), 4),
            },
            'rsi': {
                'rsi6': round(random.uniform(30, 70), 2),
                'rsi12': round(random.uniform(30, 70), 2),
                'rsi24': round(random.uniform(30, 70), 2),
            },
            'kdj': {
                'k': round(random.uniform(20, 80), 2),
                'd': round(random.uniform(20, 80), 2),
                'j': round(random.uniform(0, 100), 2),
            },
            'boll': {
                'upper': round(random.uniform(100, 120), 2),
                'middle': round(random.uniform(90, 110), 2),
                'lower': round(random.uniform(80, 100), 2),
            },
            'volume': {
                'ma5': round(random.uniform(5000000, 10000000), 0),
                'ma10': round(random.uniform(5000000, 10000000), 0),
            },
        },
    }


@router.get('/search')
async def search_stocks(
    keyword: str = Query(..., description='搜索关键词'),
    limit: int = Query(20, le=50, description='返回数量'),
):
    """Search stocks by code or name."""
    # Mock search results
    results = [
        {
            'code': '600519',
            'name': '贵州茅台',
            'market': 'SH',
            'full_code': 'SH600519',
            'type': '股票',
        },
        {
            'code': '000858',
            'name': '五粮液',
            'market': 'SZ',
            'full_code': 'SZ000858',
            'type': '股票',
        },
        {
            'code': '600036',
            'name': '招商银行',
            'market': 'SH',
            'full_code': 'SH600036',
            'type': '股票',
        },
    ]
    
    # Filter by keyword
    filtered = [
        r for r in results
        if keyword in r['code'] or keyword in r['name']
    ] if keyword else results
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': filtered[:limit],
    }


@router.get('/indices')
async def get_market_indices(
    codes: Optional[str] = Query(None, description='指数代码列表'),
):
    """Get market indices."""
    import random
    
    indices = [
        {
            'code': '000001',
            'name': '上证指数',
            'current': round(3000 + random.uniform(-100, 100), 2),
            'change': round(random.uniform(-50, 50), 2),
            'change_pct': round(random.uniform(-2, 2), 2),
            'volume': random.randint(100000000, 500000000),
            'turnover': random.randint(2000000000, 5000000000),
            'timestamp': datetime.now().isoformat(),
        },
        {
            'code': '399001',
            'name': '深证成指',
            'current': round(10000 + random.uniform(-300, 300), 2),
            'change': round(random.uniform(-150, 150), 2),
            'change_pct': round(random.uniform(-2, 2), 2),
            'volume': random.randint(100000000, 500000000),
            'turnover': random.randint(2000000000, 5000000000),
            'timestamp': datetime.now().isoformat(),
        },
    ]
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': indices,
    }


@router.get('/basic')
async def get_stock_basic(
    code: str = Query(..., description='股票代码'),
):
    """Get stock basic info."""
    return {
        'code': 0,
        'message': '获取成功',
        'data': {
            'code': code,
            'name': f'股票{code}',
            'market': 'SH',
            'industry': '制造业',
            'sector': '白酒',
            'listing_date': '2020-01-01',
            'total_shares': 1000000000,
            'float_shares': 800000000,
            'market_cap': 100000000000,
        },
    }
