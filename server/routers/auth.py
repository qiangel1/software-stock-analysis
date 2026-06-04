"""
Authentication Router

Handles user authentication including login, logout,
and profile management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from schemas.user import (
    SendCodeRequest,
    LoginRequest,
    LoginResponse,
    UserProfile,
    UserUpdate,
)
from utils.security import create_access_token, verify_code, generate_code, store_code
from utils.sms import send_sms_code

router = APIRouter(prefix='/auth', tags=['认证'])


@router.post('/send_code')
async def send_code(
    request: SendCodeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send verification code to phone number."""
    # Generate 6-digit code
    code = generate_code()
    
    # Store code with TTL
    store_code(request.phone, code)
    
    # Send SMS (in production)
    # For demo, we'll just log it
    print(f'[SMS] Code for {request.phone}: {code}')
    
    # In production, uncomment:
    # await send_sms_code(request.phone, code)
    
    return {
        'code': 0,
        'message': '验证码发送成功',
        'data': None,
    }


@router.post('/login', response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login with phone and verification code."""
    # Verify code
    if not verify_code(request.phone, request.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='验证码错误或已过期',
        )
    
    # Find or create user
    result = await db.execute(
        select(User).where(User.phone == request.phone)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Create new user
        user = User(phone=request.phone, nickname=f'用户{request.phone[-4:]}')
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Generate JWT token
    token = create_access_token({'user_id': user.id, 'phone': user.phone})
    
    return {
        'code': 0,
        'message': '登录成功',
        'data': {
            'token': token,
            'user': user.to_profile(),
        },
    }


@router.post('/logout')
async def logout():
    """Logout current user."""
    return {'code': 0, 'message': '退出成功', 'data': None}


@router.get('/profile')
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(lambda: None),  # Simplified auth
):
    """Get current user profile."""
    # In production, get current_user from JWT
    # For demo, return mock user
    return {
        'code': 0,
        'message': '获取成功',
        'data': {
            'id': 1,
            'phone': '13800138000',
            'nickname': '测试用户',
            'vip_level': 'free',
            'created_at': '2024-01-01T00:00:00',
        },
    }


@router.put('/profile')
async def update_profile(
    request: UserUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update user profile."""
    return {
        'code': 0,
        'message': '更新成功',
        'data': None,
    }


@router.get('/settings')
async def get_settings():
    """Get user settings."""
    return {
        'code': 0,
        'message': '获取成功',
        'data': {
            'stock_view_mode': 'list',
            'default_kline_period': '1d',
            'push_enabled': True,
            'email_enabled': False,
            'theme': 'light',
        },
    }


@router.put('/settings')
async def update_settings():
    """Update user settings."""
    return {'code': 0, 'message': '更新成功', 'data': None}
