"""
SMS Service

Handles SMS notification sending.
"""

import asyncio
from typing import Optional

from config import settings


async def send_sms_code(phone: str, code: str) -> bool:
    """
    Send verification code via SMS.
    
    In production, integrate with Tencent Cloud SMS or other provider.
    
    Args:
        phone: Recipient phone number
        code: Verification code
        
    Returns:
        True if sent successfully, False otherwise
    """
    if not settings.is_sms_configured:
        print(f'[SMS] Mock send to {phone}: {code}')
        return True
    
    try:
        # Example: Tencent Cloud SMS
        # from tencentcloud.sms.v1 import sms_client
        # from tencentcloud.sms.v1 import sms_models
        
        # client = sms_client.SmsClient(...)
        # req = sms_models.SendSmsRequest()
        # req.PhoneNumberSet = [f'+86{phone}']
        # req.TemplateParamSet = [code]
        # req.TemplateId = settings.sms_template_id
        
        # resp = client.SendSms(req)
        # return resp.TotalCount > 0
        
        print(f'[SMS] Would send to {phone}: {code}')
        return True
        
    except Exception as e:
        print(f'[SMS] Send failed: {e}')
        return False


async def send_alert_sms(phone: str, message: str) -> bool:
    """
    Send alert notification via SMS.
    
    Args:
        phone: Recipient phone number
        message: Alert message
        
    Returns:
        True if sent successfully, False otherwise
    """
    if not settings.is_sms_configured:
        print(f'[SMS] Mock alert to {phone}: {message}')
        return True
    
    try:
        # Similar implementation as send_sms_code
        print(f'[SMS] Would send alert to {phone}: {message}')
        return True
        
    except Exception as e:
        print(f'[SMS] Alert send failed: {e}')
        return False


class SMSService:
    """
    SMS service wrapper for managing SMS operations.
    """
    
    def __init__(self):
        self.configured = settings.is_sms_configured
    
    async def send_verification(self, phone: str, code: str) -> bool:
        """Send verification code."""
        return await send_sms_code(phone, code)
    
    async def send_alert(self, phone: str, alert_type: str, stock: str, detail: str) -> bool:
        """Send alert notification."""
        message = f'【StockQuant预警】{stock} {alert_type}: {detail}'
        return await send_alert_sms(phone, message)
