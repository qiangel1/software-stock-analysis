"""
Watchlist Router

Handles user watchlist management.
"""

from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter(prefix='/watchlist', tags=['自选股'])


# In-memory storage for demo
WATCHLIST_DATA = [
    {'id': 1, 'user_id': 1, 'stock_code': '600519', 'stock_name': '贵州茅台', 'group_name': '白酒', 'sort_order': 0, 'created_at': '2024-01-01T00:00:00'},
    {'id': 2, 'user_id': 1, 'stock_code': '000858', 'stock_name': '五粮液', 'group_name': '白酒', 'sort_order': 1, 'created_at': '2024-01-01T00:00:00'},
    {'id': 3, 'user_id': 1, 'stock_code': '600036', 'stock_name': '招商银行', 'group_name': '银行', 'sort_order': 0, 'created_at': '2024-01-01T00:00:00'},
    {'id': 4, 'user_id': 1, 'stock_code': '000001', 'stock_name': '平安银行', 'group_name': '银行', 'sort_order': 1, 'created_at': '2024-01-01T00:00:00'},
]

_watchlist_id = 5


@router.get('/')
async def get_watchlist():
    """Get user's watchlist."""
    return {
        'code': 0,
        'message': '获取成功',
        'data': WATCHLIST_DATA,
    }


@router.post('/')
async def add_to_watchlist(
    request: dict,
):
    """Add stock to watchlist."""
    global _watchlist_id
    
    stock_code = request.get('stock_code')
    if not stock_code:
        raise HTTPException(status_code=400, detail='股票代码不能为空')
    
    # Check if already exists
    for item in WATCHLIST_DATA:
        if item['stock_code'] == stock_code and item['user_id'] == 1:
            raise HTTPException(status_code=400, detail='该股票已在自选中')
    
    # Add new item
    new_item = {
        'id': _watchlist_id,
        'user_id': 1,
        'stock_code': stock_code,
        'stock_name': f'股票{stock_code}',
        'group_name': request.get('group_name', '默认'),
        'sort_order': 0,
        'created_at': '2024-01-01T00:00:00',
    }
    
    WATCHLIST_DATA.append(new_item)
    _watchlist_id += 1
    
    return {'code': 0, 'message': '添加成功', 'data': None}


@router.delete('/{item_id}')
async def remove_from_watchlist(item_id: int):
    """Remove stock from watchlist."""
    global WATCHLIST_DATA
    
    for i, item in enumerate(WATCHLIST_DATA):
        if item['id'] == item_id:
            WATCHLIST_DATA.pop(i)
            return {'code': 0, 'message': '删除成功', 'data': None}
    
    raise HTTPException(status_code=404, detail='记录不存在')


@router.put('/{item_id}')
async def update_watchlist(
    item_id: int,
    request: dict,
):
    """Update watchlist item."""
    for item in WATCHLIST_DATA:
        if item['id'] == item_id:
            if 'group_name' in request:
                item['group_name'] = request['group_name']
            if 'sort_order' in request:
                item['sort_order'] = request['sort_order']
            return {'code': 0, 'message': '更新成功', 'data': None}
    
    raise HTTPException(status_code=404, detail='记录不存在')


@router.put('/move')
async def move_to_group(request: dict):
    """Move multiple items to a group."""
    ids = request.get('ids', [])
    group_name = request.get('group_name', '默认')
    
    for item in WATCHLIST_DATA:
        if item['id'] in ids:
            item['group_name'] = group_name
    
    return {'code': 0, 'message': '移动成功', 'data': None}
