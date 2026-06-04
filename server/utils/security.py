"""
Security Utilities

Handles JWT token generation, verification, and SMS code management.
"""

import random
import string
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from jose import jwt, JWTError

from config import settings


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token.
    
    Args:
        data: Token payload data
        expires_delta: Token expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    
    to_encode.update({'exp': expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )
    
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify and decode JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        return None


def generate_code(length: int = 6) -> str:
    """
    Generate random numeric code.
    
    Args:
        length: Code length (default 6)
        
    Returns:
        Random numeric code string
    """
    return ''.join(random.choices(string.digits, k=length))


def store_code(phone: str, code: str, ttl: int = 300) -> None:
    """
    Store verification code with TTL.
    
    In production, use Redis for storage.
    
    Args:
        phone: Phone number
        code: Verification code
        ttl: Time to live in seconds (default 5 minutes)
    """
    # In production, store in Redis:
    # await redis_client.set(f'verify_code:{phone}', code, ex=ttl)
    
    # For demo, use in-memory storage
    if not hasattr(store_code, '_codes'):
        store_code._codes = {}
    
    store_code._codes[phone] = {
        'code': code,
        'expires_at': datetime.now() + timedelta(seconds=ttl),
    }


def verify_code(phone: str, code: str) -> bool:
    """
    Verify phone number and code.
    
    Args:
        phone: Phone number
        code: Verification code to verify
        
    Returns:
        True if valid, False otherwise
    """
    # In production, get from Redis:
    # stored = await redis_client.get(f'verify_code:{phone}')
    
    # For demo, use in-memory storage
    if not hasattr(store_code, '_codes'):
        store_code._codes = {}
    
    stored = store_code._codes.get(phone)
    
    if not stored:
        return False
    
    if stored['code'] != code:
        return False
    
    if datetime.now() > stored['expires_at']:
        return False
    
    # Clear used code
    del store_code._codes[phone]
    
    return True


def hash_password(password: str) -> str:
    """
    Hash password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against hash.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password
        
    Returns:
        True if match, False otherwise
    """
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    return pwd_context.verify(plain_password, hashed_password)
