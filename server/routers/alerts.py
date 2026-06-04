"""
Alerts Router

Handles price alert management.
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime

router = APIRouter(prefix='/alerts', tags=['预警'])


# In-memory storage for demo
ALERTS_DATA = [
    {'id': 1, 'user_id': 1, 'stock_code': '600519', 'stock_name': '贵州茅台', 'alert_type': 'price_up', 'threshold': 2000.00, 'is_active': True, 'last_triggered_at': None, 'created_at': '2024-01-01T00:00:00'},
    {'id': 2, 'user_id': 1, 'stock_code': '600519', 'stock_name': '贵州茅台', 'alert_type': 'price_down', 'threshold': 1500.00, 'is_active': True, 'last_triggered_at': None, 'created_at': '2024-01-01T00:00:00'},
    {'id': 3, 'user_id': 1, 'stock_code': '000858', 'stock_name': '五粮液', 'alert_type': 'change_pct', 'threshold': 5.00, 'is_active': True, 'last_triggered_at': None, 'created_at': '2024-01-01T00:00:00'},
]

_alert_id = 4


@router.get('/')
async def get_alerts():
    """Get all alerts for current user."""
    return {
        'code': 0,
        'message': '获取成功',
        'data': ALERTS_DATA,
    }


@router.post('/')
async def create_alert(request: dict):
    """Create new alert."""
    global _alert_id
    
    stock_code = request.get('stock_code')
    alert_type = request.get('alert_type')
    threshold = request.get('threshold')
    
    if not stock_code or not alert_type or threshold is None:
        raise HTTPException(status_code=400, detail='参数不完整')
    
    # Check for duplicate
    for item in ALERTS_DATA:
        if (item['stock_code'] == stock_code and 
            item['alert_type'] == alert_type and 
            item['threshold'] == threshold and
            item['user_id'] == 1):
            raise HTTPException(status_code=400, detail='相同的预警已存在')
    
    new_item = {
        'id': _alert_id,
        'user_id': 1,
        'stock_code': stock_code,
        'stock_name': f'股票{stock_code}',
        'alert_type': alert_type,
        'threshold': threshold,
        'is_active': True,
        'last_triggered_at': None,
        'created_at': datetime.now().isoformat(),
    }
    
    ALERTS_DATA.append(new_item)
    _alert_id += 1
    
    return {'code': 0, 'message': '创建成功', 'data': None}


@router.put('/{alert_id}')
async def update_alert(alert_id: int, request: dict):
    """Update alert."""
    for item in ALERTS_DATA:
        if item['id'] == alert_id and item['user_id'] == 1:
            if 'is_active' in request:
                item['is_active'] = request['is_active']
            if 'threshold' in request:
                item['threshold'] = request['threshold']
            return {'code': 0, 'message': '更新成功', 'data': None}
    
    raise HTTPException(status_code=404, detail='预警不存在')


@router.delete('/{alert_id}')
async def delete_alert(alert_id: int):
    """Delete alert."""
    global ALERTS_DATA
    
    for i, item in enumerate(ALERTS_DATA):
        if item['id'] == alert_id and item['user_id'] == 1:
            ALERTS_DATA.pop(i)
            return {'code': 0, 'message': '删除成功', 'data': None}
    
    raise HTTPException(status_code=404, detail='预警不存在')
