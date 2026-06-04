/**
 * Constants
 * 
 * Application-wide constants.
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: '/api/v1/auth',
  QUOTES: '/api/v1/quotes',
  NEWS: '/api/v1/news',
  AI: '/api/v1/ai',
  WATCHLIST: '/api/v1/watchlist',
  PORTFOLIO: '/api/v1/portfolio',
  ALERTS: '/api/v1/alerts',
} as const;

/**
 * WebSocket endpoints
 */
export const WS_ENDPOINTS = {
  QUOTES: '/ws/quotes',
} as const;

/**
 * Market types
 */
export const MARKET_TYPES = {
  SH: { label: '上海', prefix: 'SH' },
  SZ: { label: '深圳', prefix: 'SZ' },
  HK: { label: '港股', prefix: 'HK' },
  US: { label: '美股', prefix: 'US' },
} as const;

/**
 * K-line periods
 */
export const KLINE_PERIODS = [
  { value: '1m', label: '1分钟', days: 1 },
  { value: '5m', label: '5分钟', days: 5 },
  { value: '15m', label: '15分钟', days: 15 },
  { value: '30m', label: '30分钟', days: 30 },
  { value: '1h', label: '1小时', days: 60 },
  { value: '1d', label: '日K', days: 365 },
  { value: '1w', label: '周K', days: 365 * 5 },
  { value: '1M', label: '月K', days: 365 * 10 },
] as const;

/**
 * VIP levels
 */
export const VIP_LEVELS = {
  free: { label: '免费', color: 'default' },
  basic: { label: '基础版', color: 'info' },
  pro: { label: '专业版', color: 'primary' },
  enterprise: { label: '企业版', color: 'warning' },
} as const;

/**
 * Alert types
 */
export const ALERT_TYPES = {
  price_up: { label: '价格上穿', icon: '↑' },
  price_down: { label: '价格下穿', icon: '↓' },
  change_pct: { label: '涨跌幅提醒', icon: '%' },
  news: { label: '新闻提醒', icon: '📰' },
  kdj_cross: { label: 'KDJ金叉/死叉', icon: 'K' },
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Cache TTL (seconds)
 */
export const CACHE_TTL = {
  QUOTE: 3,
  NEWS: 300,
  USER: 300,
  ANALYSIS: 3600,
} as const;

/**
 * App info
 */
export const APP_INFO = {
  NAME: 'StockQuant',
  VERSION: '1.0.0',
  DESCRIPTION: '智能股票量化分析系统',
} as const;
