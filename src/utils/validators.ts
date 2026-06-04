/**
 * Validators Utility
 * 
 * Form validation functions.
 */

/**
 * Validate phone number
 */
export function validatePhone(phone: string): { valid: boolean; message?: string } {
  if (!phone) {
    return { valid: false, message: '请输入手机号' };
  }
  
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { valid: false, message: '请输入正确的手机号' };
  }
  
  return { valid: true };
}

/**
 * Validate verification code
 */
export function validateCode(code: string): { valid: boolean; message?: string } {
  if (!code) {
    return { valid: false, message: '请输入验证码' };
  }
  
  if (!/^\d{4,6}$/.test(code)) {
    return { valid: false, message: '验证码格式不正确' };
  }
  
  return { valid: true };
}

/**
 * Validate stock code
 */
export function validateStockCode(code: string): { valid: boolean; message?: string } {
  if (!code) {
    return { valid: false, message: '请输入股票代码' };
  }
  
  // A-share: 6 digits
  if (/^\d{6}$/.test(code)) {
    return { valid: true };
  }
  
  // With market prefix: SH600519, SZ000858
  if (/^(SH|SZ|HK|US)\d{4,6}$/.test(code.toUpperCase())) {
    return { valid: true };
  }
  
  return { valid: false, message: '股票代码格式不正确' };
}

/**
 * Validate price
 */
export function validatePrice(price: number): { valid: boolean; message?: string } {
  if (price <= 0) {
    return { valid: false, message: '价格必须大于0' };
  }
  
  if (price > 1000000) {
    return { valid: false, message: '价格超出合理范围' };
  }
  
  return { valid: true };
}

/**
 * Validate shares
 */
export function validateShares(shares: number): { valid: boolean; message?: string } {
  if (shares <= 0) {
    return { valid: false, message: '数量必须大于0' };
  }
  
  if (!Number.isInteger(shares)) {
    return { valid: false, message: '数量必须为整数' };
  }
  
  return { valid: true };
}

/**
 * Validate percentage range
 */
export function validatePercentRange(
  min: number,
  max: number
): { valid: boolean; message?: string } {
  if (min > max) {
    return { valid: false, message: '最小值不能大于最大值' };
  }
  
  if (min < -100 || max > 100) {
    return { valid: false, message: '百分比超出范围' };
  }
  
  return { valid: true };
}

/**
 * Validate nickname
 */
export function validateNickname(nickname: string): { valid: boolean; message?: string } {
  if (!nickname) {
    return { valid: true }; // Nickname is optional
  }
  
  if (nickname.length > 50) {
    return { valid: false, message: '昵称不能超过50个字符' };
  }
  
  return { valid: true };
}
