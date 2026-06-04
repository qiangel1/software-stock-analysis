"""
WebSocket Connection Manager

Handles WebSocket connections and message broadcasting.
"""

import json
import asyncio
from typing import Dict, Set
from fastapi import WebSocket
import random
from datetime import datetime


class WebSocketManager:
    """
    Manages WebSocket connections and message broadcasting.
    
    Handles:
    - Connection tracking
    - Subscription management
    - Message broadcasting
    - Heartbeat
    """
    
    def __init__(self):
        # Map of websocket to subscribed stock codes
        self._connections: Dict[WebSocket, Set[str]] = {}
        # Map of stock codes to subscribed websockets
        self._subscriptions: Dict[str, Set[WebSocket]] = {}
        # Heartbeat tasks
        self._heartbeat_tasks: Dict[WebSocket, asyncio.Task] = {}
        # Broadcast interval
        self._broadcast_interval = 3  # seconds
    
    async def connect(self, websocket: WebSocket):
        """
        Accept and register new WebSocket connection.
        
        Args:
            websocket: FastAPI WebSocket instance
        """
        await websocket.accept()
        self._connections[websocket] = set()
        print(f'[WS] Client connected. Total: {len(self._connections)}')
        
        # Start heartbeat
        self._start_heartbeat(websocket)
    
    async def disconnect(self, websocket: WebSocket):
        """
        Remove WebSocket connection.
        
        Args:
            websocket: FastAPI WebSocket instance
        """
        # Stop heartbeat
        if websocket in self._heartbeat_tasks:
            self._heartbeat_tasks[websocket].cancel()
            del self._heartbeat_tasks[websocket]
        
        # Remove from all subscriptions
        codes = self._connections.pop(websocket, set())
        for code in codes:
            if code in self._subscriptions:
                self._subscriptions[code].discard(websocket)
                if not self._subscriptions[code]:
                    del self._subscriptions[code]
        
        print(f'[WS] Client disconnected. Total: {len(self._connections)}')
    
    async def handle_message(self, websocket: WebSocket, message: str):
        """
        Handle incoming WebSocket message.
        
        Args:
            websocket: FastAPI WebSocket instance
            message: JSON message string
        """
        try:
            data = json.loads(message)
            msg_type = data.get('type')
            msg_data = data.get('data', {})
            
            if msg_type == 'subscribe':
                codes = msg_data.get('codes', [])
                await self._subscribe(websocket, codes)
                
            elif msg_type == 'unsubscribe':
                codes = msg_data.get('codes', [])
                await self._unsubscribe(websocket, codes)
                
            elif msg_type == 'heartbeat':
                # Respond to heartbeat
                await websocket.send_json({
                    'type': 'heartbeat',
                    'data': {'timestamp': int(datetime.now().timestamp() * 1000)},
                })
                
        except json.JSONDecodeError:
            print(f'[WS] Invalid JSON: {message}')
        except Exception as e:
            print(f'[WS] Error handling message: {e}')
    
    async def _subscribe(self, websocket: WebSocket, codes: list):
        """
        Subscribe to stock quotes.
        
        Args:
            websocket: FastAPI WebSocket instance
            codes: List of stock codes
        """
        for code in codes:
            # Add to connection's subscriptions
            if websocket in self._connections:
                self._connections[websocket].add(code)
            
            # Add to code's subscribers
            if code not in self._subscriptions:
                self._subscriptions[code] = set()
            self._subscriptions[code].add(websocket)
        
        print(f'[WS] Subscribed to: {codes}')
        
        # Send initial quotes
        for code in codes:
            quote = await self._get_quote(code)
            await websocket.send_json({
                'type': 'quote',
                'data': quote,
            })
    
    async def _unsubscribe(self, websocket: WebSocket, codes: list):
        """
        Unsubscribe from stock quotes.
        
        Args:
            websocket: FastAPI WebSocket instance
            codes: List of stock codes
        """
        for code in codes:
            # Remove from connection's subscriptions
            if websocket in self._connections:
                self._connections[websocket].discard(code)
            
            # Remove from code's subscribers
            if code in self._subscriptions:
                self._subscriptions[code].discard(websocket)
                if not self._subscriptions[code]:
                    del self._subscriptions[code]
        
        print(f'[WS] Unsubscribed from: {codes}')
    
    async def _get_quote(self, code: str) -> dict:
        """
        Get mock quote for stock.
        
        Args:
            code: Stock code
            
        Returns:
            Quote dictionary
        """
        import random
        
        base_price = random.uniform(10, 500)
        change = random.uniform(-10, 10)
        
        return {
            'code': code,
            'name': f'股票{code}',
            'price': round(base_price, 2),
            'change': round(change, 2),
            'change_pct': round(change / (base_price - change) * 100, 2),
            'volume': random.randint(1000000, 100000000),
            'turnover': random.randint(100000000, 10000000000),
            'bid1': round(base_price - 0.01, 2),
            'ask1': round(base_price + 0.01, 2),
            'high': round(base_price + abs(change) * 0.5, 2),
            'low': round(base_price - abs(change) * 0.5, 2),
            'open': round(base_price - change * 0.5, 2),
            'prev_close': round(base_price - change, 2),
            'timestamp': int(datetime.now().timestamp() * 1000),
        }
    
    async def broadcast_quotes(self):
        """
        Broadcast updated quotes to all subscribers.
        
        Called periodically by background task.
        """
        for code, subscribers in self._subscriptions.items():
            if not subscribers:
                continue
            
            quote = await self._get_quote(code)
            message = {
                'type': 'quote',
                'data': quote,
            }
            
            # Send to all subscribers
            for websocket in subscribers:
                try:
                    await websocket.send_json(message)
                except Exception:
                    # Connection may be closed
                    pass
    
    def _start_heartbeat(self, websocket: WebSocket):
        """
        Start heartbeat for connection.
        
        Args:
            websocket: FastAPI WebSocket instance
        """
        async def heartbeat():
            while True:
                try:
                    await asyncio.sleep(30)  # 30 second heartbeat
                    await websocket.send_json({
                        'type': 'heartbeat',
                        'data': {'timestamp': int(datetime.now().timestamp() * 1000)},
                    })
                except Exception:
                    break
        
        task = asyncio.create_task(heartbeat())
        self._heartbeat_tasks[websocket] = task
    
    async def broadcast_alert(self, alert: dict):
        """
        Broadcast alert to specific user.
        
        Args:
            alert: Alert data
        """
        # In production, identify user from alert and send to their connections
        pass


# Global instance
ws_manager = WebSocketManager()


async def start_broadcast_task():
    """Start background task for broadcasting quotes."""
    while True:
        try:
            await asyncio.sleep(3)  # Broadcast every 3 seconds
            await ws_manager.broadcast_quotes()
        except Exception as e:
            print(f'[WS] Broadcast error: {e}')
