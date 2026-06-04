"""
StockQuant FastAPI Application Entry Point

Main application file that configures:
- FastAPI instance with middleware
- Database and Redis connections
- API routers
- WebSocket endpoints
- Exception handlers
- Health checks
"""

import asyncio
import time
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import (
    init_db,
    close_db,
    init_redis,
    close_redis,
    redis_client,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events for:
    - Database initialization
    - Redis connection
    - Background tasks
    """
    # Startup
    print(f'Starting {settings.app_name} v{settings.app_version}...')
    print(f'Environment: {settings.app_env}')
    
    # Initialize database
    await init_db()
    print('Database initialized')
    
    # Initialize Redis
    await init_redis()
    print('Redis connected')
    
    # Start background tasks
    # task = asyncio.create_task(price_monitor_task())
    
    print('Application started successfully')
    
    yield
    
    # Shutdown
    print('Shutting down application...')
    
    # Cancel background tasks
    # task.cancel()
    # try:
    #     await task
    # except asyncio.CancelledError:
    #     pass
    
    # Close connections
    await close_redis()
    await close_db()
    
    print('Application shutdown complete')


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description='智能股票量化分析系统 - 提供实时行情、AI分析、风险预警等功能',
    version=settings.app_version,
    docs_url='/docs' if settings.is_development else None,
    redoc_url='/redoc' if settings.is_development else None,
    openapi_url='/openapi.json' if settings.is_development else None,
    lifespan=lifespan,
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# Request timing middleware
@app.middleware('http')
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to responses."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers['X-Process-Time'] = str(round(process_time * 1000, 2))
    return response


# Request logging middleware
@app.middleware('http')
async def log_requests(request: Request, call_next):
    """Log all incoming requests in development mode."""
    if settings.debug:
        print(f'{request.method} {request.url.path}')
    response = await call_next(request)
    return response


# Global exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            'code': 5000,
            'message': '服务器内部错误',
            'data': None,
        },
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    """Handle validation errors."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            'code': 2000,
            'message': str(exc),
            'data': None,
        },
    )


# Health check endpoint
@app.get('/health', tags=['System'])
async def health_check() -> dict[str, Any]:
    """
    Health check endpoint.
    
    Returns application status and component health.
    """
    return {
        'status': 'healthy',
        'version': settings.app_version,
        'environment': settings.app_env,
        'timestamp': time.time(),
    }


# Readiness check endpoint
@app.get('/ready', tags=['System'])
async def readiness_check() -> dict[str, Any]:
    """
    Readiness check endpoint.
    
    Verifies all dependencies are available.
    """
    checks = {
        'database': False,
        'redis': False,
    }
    
    # Check database
    try:
        from database import health_check
        checks['database'] = await health_check()
    except Exception:
        checks['database'] = False
    
    # Check Redis
    try:
        checks['redis'] = redis_client._client is not None
    except Exception:
        checks['redis'] = False
    
    all_healthy = all(checks.values())
    
    return {
        'status': 'ready' if all_healthy else 'not_ready',
        'checks': checks,
    }


# Import and include routers
from routers import (
    auth_router,
    quotes_router,
    news_router,
    ai_router,
    watchlist_router,
    portfolio_router,
    alerts_router,
)

# Include all API routers with versioned prefix
app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(quotes_router, prefix=settings.api_v1_prefix)
app.include_router(news_router, prefix=settings.api_v1_prefix)
app.include_router(ai_router, prefix=settings.api_v1_prefix)
app.include_router(watchlist_router, prefix=settings.api_v1_prefix)
app.include_router(portfolio_router, prefix=settings.api_v1_prefix)
app.include_router(alerts_router, prefix=settings.api_v1_prefix)


# WebSocket endpoint for real-time quotes
from websocket.manager import ws_manager

@app.websocket('/ws/quotes')
async def websocket_quotes(websocket):
    """WebSocket endpoint for real-time quote streaming."""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Receive and process messages
            data = await websocket.receive_text()
            await ws_manager.handle_message(websocket, data)
    except Exception:
        pass
    finally:
        await ws_manager.disconnect(websocket)


# Root endpoint
@app.get('/', tags=['System'])
async def root() -> dict[str, Any]:
    """
    Root endpoint.
    
    Returns API information and links.
    """
    return {
        'name': settings.app_name,
        'version': settings.app_version,
        'docs': '/docs' if settings.is_development else 'disabled',
        'message': '智能股票量化分析系统 API',
    }


if __name__ == '__main__':
    import uvicorn
    
    uvicorn.run(
        'main:app',
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
