/**
 * User Types and Interfaces
 * 
 * Defines all TypeScript types related to user data,
 * authentication, watchlists, portfolios, and alerts.
 */

/**
 * User VIP levels
 */
export type VipLevel = 'free' | 'basic' | 'pro' | 'enterprise';

/**
 * User entity
 */
export interface User {
  id: number;
  /** Phone number */
  phone: string;
  /** User nickname */
  nickname: string;
  /** Avatar URL */
  avatar?: string;
  /** VIP level */
  vip_level: VipLevel;
  /** VIP expiration timestamp */
  vip_expire_at?: string;
  /** Whether user is active */
  is_active: boolean;
  /** Account creation time */
  created_at: string;
  /** Last update time */
  updated_at: string;
}

/**
 * User profile (public info)
 */
export interface UserProfile {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
  vip_level: VipLevel;
  vip_expire_at?: string;
  created_at: string;
}

/**
 * Login request
 */
export interface LoginRequest {
  phone: string;
  code: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  token: string;
  user: UserProfile;
}

/**
 * Send verification code request
 */
export interface SendCodeRequest {
  phone: string;
}

/**
 * User settings/preferences
 */
export interface UserSettings {
  /** Default stock list view mode */
  stock_view_mode: 'list' | 'card';
  /** Default K-line period */
  default_kline_period: string;
  /** Enable push notifications */
  push_enabled: boolean;
  /** Enable email notifications */
  email_enabled: boolean;
  /** Theme mode */
  theme: 'light' | 'dark' | 'auto';
}

/**
 * Watchlist group
 */
export interface WatchlistGroup {
  name: string;
  count: number;
}

/**
 * Watchlist item
 */
export interface WatchlistItem {
  id: number;
  user_id: number;
  stock_code: string;
  stock_name: string;
  group_name: string;
  sort_order: number;
  /** Current price */
  price?: number;
  /** Price change */
  change?: number;
  /** Price change percentage */
  change_pct?: number;
  created_at: string;
}

/**
 * Create watchlist request
 */
export interface CreateWatchlistRequest {
  stock_code: string;
  group_name?: string;
}

/**
 * Update watchlist request
 */
export interface UpdateWatchlistRequest {
  group_name?: string;
  sort_order?: number;
}

/**
 * Portfolio account type
 */
export type AccountType = 'main' | 'secondary' | 'margin';

/**
 * Portfolio holding
 */
export interface PortfolioItem {
  id: number;
  user_id: number;
  stock_code: string;
  stock_name: string;
  /** Number of shares held */
  shares: number;
  /** Average cost price in cents */
  avg_cost: number;
  /** Current market price in cents */
  current_price?: number;
  /** Total market value in cents */
  market_value?: number;
  /** Unrealized profit/loss in cents */
  profit_loss?: number;
  /** Profit/loss percentage */
  profit_loss_pct?: number;
  /** Account name */
  account_name: string;
  /** Account type */
  account_type: AccountType;
  created_at: string;
  updated_at: string;
}

/**
 * Create portfolio request
 */
export interface CreatePortfolioRequest {
  stock_code: string;
  shares: number;
  avg_cost: number;
  account_name?: string;
  account_type?: AccountType;
}

/**
 * Update portfolio request
 */
export interface UpdatePortfolioRequest {
  shares?: number;
  avg_cost?: number;
  account_name?: string;
}

/**
 * Portfolio summary
 */
export interface PortfolioSummary {
  /** Total market value */
  total_market_value: number;
  /** Total cost */
  total_cost: number;
  /** Total profit/loss */
  total_profit_loss: number;
  /** Profit/loss percentage */
  profit_loss_pct: number;
  /** Today's profit/loss */
  today_profit_loss: number;
  /** Today's profit/loss percentage */
  today_profit_loss_pct: number;
  /** Holdings count */
  holdings_count: number;
  /** Best performing stock */
  best_performer?: {
    code: string;
    name: string;
    profit_loss_pct: number;
  };
  /** Worst performing stock */
  worst_performer?: {
    code: string;
    name: string;
    profit_loss_pct: number;
  };
}

/**
 * Alert types
 */
export type AlertType = 'price_up' | 'price_down' | 'change_pct' | 'news' | 'kdj_cross';

/**
 * Alert item
 */
export interface AlertItem {
  id: number;
  user_id: number;
  stock_code: string;
  stock_name: string;
  alert_type: AlertType;
  /** Alert threshold value */
  threshold: number;
  /** Whether alert is active */
  is_active: boolean;
  /** Last triggered timestamp */
  last_triggered_at?: string;
  created_at: string;
}

/**
 * Create alert request
 */
export interface CreateAlertRequest {
  stock_code: string;
  alert_type: AlertType;
  threshold: number;
}

/**
 * Update alert request
 */
export interface UpdateAlertRequest {
  is_active?: boolean;
  threshold?: number;
}

/**
 * Notification channel
 */
export type NotificationChannel = 'app' | 'sms' | 'email' | 'wechat';

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  channels: NotificationChannel[];
  /** Quiet hours start */
  quiet_hours_start?: string;
  /** Quiet hours end */
  quiet_hours_end?: string;
  /** Enable price alerts */
  price_alerts: boolean;
  /** Enable news alerts */
  news_alerts: boolean;
}
