"""
Portfolio Router

Handles user portfolio management.
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
import random

router = APIRouter(prefix='/portfolio', tags=['持仓'])


# In-memory storage for demo
PORTFOLIO_DATA = [
    {
        'id': 1, 'user_id': 1, 'stock_code': '600519', 'stock_name': '贵州茅台',
        'shares': 100, 'avg_cost': 1800.00, 'current_price': 1850.00,
        'market_value': 185000.00, 'profit_loss': 5000.00, 'profit_loss_pct': 2.78,
        'account_name': '主账户', 'account_type': 'main',
        'created_at': '2024-01-01T00:00:00', 'updated_at': '2024-01-01T00:00:00',
    },
    {
        'id': 2, 'user_id': 1, 'stock_code': '000858', 'stock_name': '五粮液',
        'shares': 200, 'avg_cost': 160.00, 'current_price': 155.00,
        'market_value': 31000.00, 'profit_loss': -1000.00, 'profit_loss_pct': -3.13,
        'account_name': '主账户', 'account_type': 'main',
        'created_at': '2024-01-01T00:00:00', 'updated_at': '2024-01-01T00:00:00',
    },
]

_portfolio_id = 3


@router.get('/')
async def get_portfolio():
    """Get all portfolio holdings."""
    return {
        'code': 0,
        'message': '获取成功',
        'data': PORTFOLIO_DATA,
    }


@router.get('/summary')
async def get_portfolio_summary():
    """Get portfolio summary."""
    total_market_value = sum(item['market_value'] for item in PORTFOLIO_DATA)
    total_cost = sum(item['shares'] * item['avg_cost'] for item in PORTFOLIO_DATA)
    total_profit_loss = sum(item['profit_loss'] for item in PORTFOLIO_DATA)
    profit_loss_pct = (total_profit_loss / total_cost * 100) if total_cost > 0 else 0
    
    # Calculate today's profit (mock)
    today_profit_loss = random.uniform(-5000, 5000)
    
    return {
        'code': 0,
        'message': '获取成功',
        'data': {
            'total_market_value': total_market_value,
            'total_cost': total_cost,
            'total_profit_loss': total_profit_loss,
            'profit_loss_pct': round(profit_loss_pct, 2),
            'today_profit_loss': round(today_profit_loss, 2),
            'today_profit_loss_pct': round(today_profit_loss / total_market_value * 100, 2),
            'holdings_count': len(PORTFOLIO_DATA),
            'best_performer': {
                'code': '600519',
                'name': '贵州茅台',
                'profit_loss_pct': 2.78,
            },
            'worst_performer': {
                'code': '000858',
                'name': '五粮液',
                'profit_loss_pct': -3.13,
            },
        },
    }


@router.post('/')
async def add_holding(request: dict):
    """Add new holding."""
    global _portfolio_id
    
    stock_code = request.get('stock_code')
    shares = request.get('shares')
    avg_cost = request.get('avg_cost')
    
    if not stock_code or not shares or not avg_cost:
        raise HTTPException(status_code=400, detail='参数不完整')
    
    current_price = avg_cost * random.uniform(0.98, 1.05)
    market_value = shares * current_price
    profit_loss = (current_price - avg_cost) * shares
    
    new_item = {
        'id': _portfolio_id,
        'user_id': 1,
        'stock_code': stock_code,
        'stock_name': f'股票{stock_code}',
        'shares': shares,
        'avg_cost': avg_cost,
        'current_price': round(current_price, 2),
        'market_value': round(market_value, 2),
        'profit_loss': round(profit_loss, 2),
        'profit_loss_pct': round((current_price - avg_cost) / avg_cost * 100, 2),
        'account_name': request.get('account_name', '主账户'),
        'account_type': request.get('account_type', 'main'),
        'created_at': '2024-01-01T00:00:00',
        'updated_at': '2024-01-01T00:00:00',
    }
    
    PORTFOLIO_DATA.append(new_item)
    _portfolio_id += 1
    
    return {'code': 0, 'message': '添加成功', 'data': None}


@router.put('/{holding_id}')
async def update_holding(holding_id: int, request: dict):
    """Update holding."""
    for item in PORTFOLIO_DATA:
        if item['id'] == holding_id:
            if 'shares' in request:
                item['shares'] = request['shares']
            if 'avg_cost' in request:
                item['avg_cost'] = request['avg_cost']
            if 'account_name' in request:
                item['account_name'] = request['account_name']
            
            # Recalculate
            current_price = item['current_price']
            item['market_value'] = round(item['shares'] * current_price, 2)
            item['profit_loss'] = round((current_price - item['avg_cost']) * item['shares'], 2)
            item['profit_loss_pct'] = round((current_price - item['avg_cost']) / item['avg_cost'] * 100, 2)
            item['updated_at'] = '2024-01-01T00:00:00'
            
            return {'code': 0, 'message': '更新成功', 'data': None}
    
    raise HTTPException(status_code=404, detail='记录不存在')


@router.delete('/{holding_id}')
async def delete_holding(holding_id: int):
    """Delete holding."""
    global PORTFOLIO_DATA
    
    for i, item in enumerate(PORTFOLIO_DATA):
        if item['id'] == holding_id:
            PORTFOLIO_DATA.pop(i)
            return {'code': 0, 'message': '删除成功', 'data': None}
    
    raise HTTPException(status_code=404, detail='记录不存在')
