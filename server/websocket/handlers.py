"""
WebSocket Message Handlers

Handlers for different WebSocket message types.
"""

import json
from typing import List
from fastapi import WebSocket

from websocket.manager import ws_manager


async def handle_subscribe(websocket: WebSocket, codes: List[str]):
    """
    Handle subscribe message.
    
    Args:
        websocket: FastAPI WebSocket instance
        codes: List of stock codes to subscribe
    """
    await ws_manager._subscribe(websocket, codes)


async def handle_unsubscribe(websocket: WebSocket, codes: List[str]):
    """
    Handle unsubscribe message.
    
    Args:
        websocket: FastAPI WebSocket instance
        codes: List of stock codes to unsubscribe
    """
    await ws_manager._unsubscribe(websocket, codes)


async def handle_quote_message(websocket: WebSocket, data: dict):
    """
    Handle quote update message.
    
    Args:
        websocket: FastAPI WebSocket instance
        data: Quote data
    """
    # Quote updates are handled by broadcast task
    pass


async def handle_alert_message(websocket: WebSocket, data: dict):
    """
    Handle alert message.
    
    Args:
        websocket: FastAPI WebSocket instance
        data: Alert data
    """
    # Process and broadcast alert
    pass
