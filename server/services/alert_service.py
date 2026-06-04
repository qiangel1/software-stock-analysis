"""
Alert Service

Handles price alert checking and notification.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime

from database import redis_client


class AlertService:
    """
    Service for managing and triggering price alerts.
    
    Monitors stock prices and triggers alerts when
    conditions are met.
    """
    
    def __init__(self):
        self._last_prices: Dict[str, float] = {}
    
    async def check_alerts(
        self,
        stock_code: str,
        current_price: float,
        prev_close: float,
    ) -> List[Dict[str, Any]]:
        """
        Check if any alerts should be triggered.
        
        Args:
            stock_code: Stock code
            current_price: Current market price
            prev_close: Previous closing price
            
        Returns:
            List of triggered alerts
        """
        triggered = []
        
        # Get alerts from cache or DB
        alerts = await self._get_alerts(stock_code)
        
        for alert in alerts:
            if not alert.get('is_active'):
                continue
            
            threshold = alert.get('threshold', 0)
            alert_type = alert.get('alert_type')
            
            should_trigger = False
            
            if alert_type == 'price_up' and current_price >= threshold:
                should_trigger = True
                condition = f'价格上穿{threshold}'
            elif alert_type == 'price_down' and current_price <= threshold:
                should_trigger = True
                condition = f'价格下穿{threshold}'
            elif alert_type == 'change_pct':
                change_pct = ((current_price - prev_close) / prev_close * 100) if prev_close > 0 else 0
                if abs(change_pct) >= threshold:
                    should_trigger = True
                    condition = f'涨跌幅达到{change_pct:.2f}%'
            
            if should_trigger:
                triggered.append({
                    'alert_id': alert.get('id'),
                    'stock_code': stock_code,
                    'stock_name': alert.get('stock_name'),
                    'alert_type': alert_type,
                    'threshold': threshold,
                    'current_price': current_price,
                    'message': f'{alert.get("stock_name")}({stock_code}) {condition}',
                    'triggered_at': datetime.now().isoformat(),
                })
                
                # Update last triggered time
                await self._update_last_triggered(alert.get('id'))
        
        # Store current price
        self._last_prices[stock_code] = current_price
        
        return triggered
    
    async def _get_alerts(self, stock_code: str) -> List[Dict[str, Any]]:
        """
        Get alerts for stock from cache or DB.
        
        In production, this would query the database.
        """
        # Mock alerts for demo
        return [
            {
                'id': 1,
                'stock_code': stock_code,
                'stock_name': f'股票{stock_code}',
                'alert_type': 'price_up',
                'threshold': 2000.0,
                'is_active': True,
            },
        ]
    
    async def _update_last_triggered(self, alert_id: int):
        """Update last triggered timestamp for alert."""
        # In production, update database
        pass
    
    async def send_notification(
        self,
        alert: Dict[str, Any],
        channels: List[str] = ['app'],
    ):
        """
        Send alert notification through specified channels.
        
        Args:
            alert: Alert data
            channels: Notification channels (app, sms, email, wechat)
        """
        message = alert.get('message', '')
        
        for channel in channels:
            if channel == 'app':
                # Send in-app notification
                await self._send_app_notification(alert)
            elif channel == 'sms':
                # Send SMS notification
                await self._send_sms_notification(alert)
            elif channel == 'email':
                # Send email notification
                await self._send_email_notification(alert)
        
        print(f'[Alert] Notification sent: {message}')
    
    async def _send_app_notification(self, alert: Dict[str, Any]):
        """Send in-app notification."""
        # In production, use WebSocket or push notification service
        pass
    
    async def _send_sms_notification(self, alert: Dict[str, Any]):
        """Send SMS notification."""
        # In production, integrate with SMS service
        pass
    
    async def _send_email_notification(self, alert: Dict[str, Any]):
        """Send email notification."""
        # In production, integrate with email service
        pass


# Global instance
alert_service = AlertService()
