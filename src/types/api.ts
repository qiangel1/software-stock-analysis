/**
 * API Types and Interfaces
 * 
 * Defines all TypeScript types for API requests,
 * responses, and error handling.
 */

/**
 * Unified API response format
 */
export interface ApiResponse<T = unknown> {
  /** Response code: 0 = success, non-zero = error */
  code: number;
  /** Response message */
  message: string;
  /** Response data */
  data: T | null;
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T = unknown> {
  /** Response code: 0 = success, non-zero = error */
  code: number;
  /** Response message */
  message: string;
  /** Response data */
  data: T[] | null;
  /** Pagination info */
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

/**
 * API error codes
 */
export enum ErrorCode {
  // Success
  SUCCESS = 0,
  
  // Authentication errors (1xxx)
  AUTH_TOKEN_EXPIRED = 1001,
  AUTH_TOKEN_INVALID = 1002,
  AUTH_TOKEN_MISSING = 1003,
  AUTH_PHONE_INVALID = 1004,
  AUTH_CODE_INVALID = 1005,
  AUTH_CODE_EXPIRED = 1006,
  AUTH_SMS_SEND_FAILED = 1007,
  
  // Business logic errors (2xxx)
  USER_NOT_FOUND = 2001,
  USER_ALREADY_EXISTS = 2002,
  STOCK_NOT_FOUND = 2003,
  WATCHLIST_FULL = 2004,
  WATCHLIST_STOCK_EXISTS = 2005,
  PORTFOLIO_NOT_FOUND = 2006,
  ALERT_NOT_FOUND = 2007,
  ALERT_DUPLICATE = 2008,
  PERMISSION_DENIED = 2009,
  
  // Validation errors (3xxx)
  VALIDATION_ERROR = 3001,
  PARAM_INVALID = 3002,
  
  // Rate limit errors (4xxx)
  RATE_LIMIT_EXCEEDED = 4001,
  
  // System errors (5xxx)
  INTERNAL_ERROR = 5000,
  DATABASE_ERROR = 5001,
  CACHE_ERROR = 5002,
  EXTERNAL_SERVICE_ERROR = 5003,
}

/**
 * API error messages mapping
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.SUCCESS]: '操作成功',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.AUTH_TOKEN_INVALID]: '登录凭证无效',
  [ErrorCode.AUTH_TOKEN_MISSING]: '请先登录',
  [ErrorCode.AUTH_PHONE_INVALID]: '手机号格式不正确',
  [ErrorCode.AUTH_CODE_INVALID]: '验证码错误',
  [ErrorCode.AUTH_CODE_EXPIRED]: '验证码已过期',
  [ErrorCode.AUTH_SMS_SEND_FAILED]: '验证码发送失败，请稍后重试',
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_ALREADY_EXISTS]: '用户已存在',
  [ErrorCode.STOCK_NOT_FOUND]: '股票不存在',
  [ErrorCode.WATCHLIST_FULL]: '自选股数量已达上限',
  [ErrorCode.WATCHLIST_STOCK_EXISTS]: '该股票已在自选中',
  [ErrorCode.PORTFOLIO_NOT_FOUND]: '持仓记录不存在',
  [ErrorCode.ALERT_NOT_FOUND]: '预警记录不存在',
  [ErrorCode.ALERT_DUPLICATE]: '相同的预警已存在',
  [ErrorCode.PERMISSION_DENIED]: '权限不足',
  [ErrorCode.VALIDATION_ERROR]: '数据验证失败',
  [ErrorCode.PARAM_INVALID]: '参数错误',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: '请求过于频繁，请稍后重试',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCode.DATABASE_ERROR]: '数据库错误',
  [ErrorCode.CACHE_ERROR]: '缓存服务错误',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: '外部服务调用失败',
};

/**
 * Request options for API calls
 */
export interface RequestOptions {
  /** Show loading indicator */
  showLoading?: boolean;
  /** Show error toast on failure */
  showError?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page: number;
  page_size: number;
}

/**
 * Default pagination params
 */
export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  page_size: 20,
};

/**
 * WebSocket message types
 */
export type WebSocketMessageType =
  | 'subscribe'
  | 'unsubscribe'
  | 'quote'
  | 'alert'
  | 'heartbeat';

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  data: T;
  timestamp: number;
}

/**
 * WebSocket subscription request
 */
export interface WebSocketSubscribeRequest {
  action: 'subscribe' | 'unsubscribe';
  codes: string[];
}

/**
 * WebSocket quote update message
 */
export interface WebSocketQuoteMessage {
  code: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  timestamp: number;
}
