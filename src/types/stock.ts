/**
 * Stock Types and Interfaces
 * 
 * Defines all TypeScript types related to stock data,
 * including quotes, K-line data, indicators, etc.
 */

/**
 * Market types for stock exchanges
 */
export type MarketType = 'SH' | 'SZ' | 'HK' | 'US';

/**
 * Stock basic information
 */
export interface Stock {
  /** Stock code (e.g., '600519') */
  code: string;
  /** Stock name (e.g., '贵州茅台') */
  name: string;
  /** Exchange market */
  market: MarketType;
  /** Current price in cents */
  price: number;
  /** Yesterday's closing price in cents */
  prev_close: number;
  /** Today's opening price in cents */
  open: number;
  /** Highest price of the day in cents */
  high: number;
  /** Lowest price of the day in cents */
  low: number;
  /** Volume (shares traded today) */
  volume: number;
  /** Turnover (total value traded today) in cents */
  turnover: number;
  /** Price change from previous close in cents */
  change: number;
  /** Price change percentage */
  change_pct: number;
  /** Buy price 1 (highest bid) */
  bid1: number;
  /** Sell price 1 (lowest ask) */
  ask1: number;
  /** Bid volume 1 */
  bid_vol1: number;
  /** Ask volume 1 */
  ask_vol1: number;
  /** Timestamp of last update */
  updated_at: string;
}

/**
 * Simplified stock quote for list display
 */
export interface StockQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  updated_at: string;
}

/**
 * Real-time quote data from WebSocket
 */
export interface RealtimeQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  turnover: number;
  bid1: number;
  ask1: number;
  high: number;
  low: number;
  open: number;
  prev_close: number;
  timestamp: number;
}

/**
 * K-line period types
 */
export type KLinePeriod = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1w' | '1M';

/**
 * K-line data point
 */
export interface KLine {
  /** Timestamp in milliseconds */
  timestamp: number;
  /** Opening price in cents */
  open: number;
  /** Highest price in cents */
  high: number;
  /** Lowest price in cents */
  low: number;
  /** Closing price in cents */
  close: number;
  /** Volume */
  volume: number;
  /** Turnover in cents */
  turnover: number;
}

/**
 * Technical indicators data
 */
export interface TechnicalIndicators {
  /** Moving Average */
  ma: {
    ma5: number | null;
    ma10: number | null;
    ma20: number | null;
    ma30: number | null;
    ma60: number | null;
  };
  /** MACD */
  macd: {
    diff: number;
    dea: number;
    bar: number;
  };
  /** RSI */
  rsi: {
    rsi6: number | null;
    rsi12: number | null;
    rsi24: number | null;
  };
  /** KDJ */
  kdj: {
    k: number;
    d: number;
    j: number;
  };
  /** Bollinger Bands */
  boll: {
    upper: number;
    middle: number;
    lower: number;
  };
  /** Volume */
  volume: {
    ma5: number | null;
    ma10: number | null;
  };
}

/**
 * Stock search result
 */
export interface StockSearchResult {
  code: string;
  name: string;
  market: MarketType;
  /** Full code including market prefix (e.g., 'SH600519') */
  full_code: string;
  /** Stock type: stock, index, fund, etc. */
  type: string;
}

/**
 * Stock filter conditions
 */
export interface StockFilterConditions {
  /** Price range */
  price_range?: [number, number];
  /** Volume range */
  volume_range?: [number, number];
  /** Market cap range (in 100 million) */
  market_cap_range?: [number, number];
  /** PE ratio range */
  pe_range?: [number, number];
  /** PB ratio range */
  pb_range?: [number, number];
  /** Change percentage range */
  change_pct_range?: [number, number];
  /** MACD golden cross */
  macd_golden_cross?: boolean;
  /** KDJ overbought/oversold */
  kdj_status?: 'overbought' | 'oversold' | 'neutral';
  /** RSI status */
  rsi_status?: 'overbought' | 'oversold' | 'neutral';
}

/**
 * Stock ranking criteria
 */
export type StockRankingType = 
  | 'change_pct'
  | 'volume'
  | 'turnover'
  | 'pe'
  | 'pb'
  | 'market_cap';

/**
 * Stock ranking result
 */
export interface StockRanking {
  rank: number;
  stock: Stock;
  metric: number;
}

/**
 * Market index data
 */
export interface MarketIndex {
  code: string;
  name: string;
  current: number;
  change: number;
  change_pct: number;
  volume: number;
  turnover: number;
  timestamp: string;
}

/**
 * Sector/Industry data
 */
export interface Sector {
  code: string;
  name: string;
  change_pct: number;
  stock_count: number;
  leading_stock?: Stock;
}

/**
 * Stock basic info without real-time data
 */
export interface StockBasicInfo {
  code: string;
  name: string;
  market: MarketType;
  industry: string;
  listing_date: string;
  total_shares: number;
  float_shares: number;
  market_cap: number;
}

/**
 * Company profile
 */
export interface CompanyProfile {
  code: string;
  name: string;
  industry: string;
  sector: string;
  description: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  employees?: number;
  chairman?: string;
  listing_date: string;
}
