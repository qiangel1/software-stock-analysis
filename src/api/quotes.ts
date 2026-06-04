/**
 * Quotes API Module
 * 
 * Handles stock quote data fetching including:
 * - Real-time quotes
 * - K-line data
 * - Technical indicators
 */

import { get } from './client';
import type { ApiResponse } from '@types/api';
import type { Stock, StockQuote, KLine, TechnicalIndicators, KLinePeriod, StockSearchResult, MarketIndex } from '@types/stock';

/**
 * Get real-time quotes for multiple stocks
 * 
 * @param codes - Stock codes (e.g., '600519,000858')
 * @returns API response with stock quotes
 */
export async function getRealtimeQuotes(codes: string[]): Promise<ApiResponse<Stock[]>> {
  return get<Stock[]>('/quotes/realtime', { codes: codes.join(',') });
}

/**
 * Get real-time quote for single stock
 * 
 * @param code - Stock code
 * @returns API response with stock quote
 */
export async function getRealtimeQuote(code: string): Promise<ApiResponse<Stock>> {
  return get<Stock>('/quotes/realtime', { codes: code });
}

/**
 * Get K-line data for stock
 * 
 * @param code - Stock code
 * @param period - K-line period ('1d', '1w', '1M', etc.)
 * @param count - Number of data points
 * @param adjust - Price adjustment type ('none', 'forward', 'backward')
 * @returns API response with K-line data
 */
export async function getKLineData(
  code: string,
  period: KLinePeriod = '1d',
  count: number = 100,
  adjust: 'none' | 'forward' | 'backward' = 'none'
): Promise<ApiResponse<KLine[]>> {
  return get<KLine[]>('/quotes/kline', {
    code,
    period,
    count,
    adjust,
  });
}

/**
 * Get technical indicators for stock
 * 
 * @param code - Stock code
 * @param indicators - Comma-separated list of indicators (e.g., 'MA,MACD,KDJ')
 * @returns API response with technical indicators
 */
export async function getIndicators(
  code: string,
  indicators: string = 'MA,MACD,KDJ,RSI,BOLL'
): Promise<ApiResponse<TechnicalIndicators>> {
  return get<TechnicalIndicators>('/quotes/indicators', {
    code,
    indicators,
  });
}

/**
 * Search stocks by code or name
 * 
 * @param keyword - Search keyword
 * @param limit - Maximum results
 * @returns API response with search results
 */
export async function searchStocks(
  keyword: string,
  limit: number = 20
): Promise<ApiResponse<StockSearchResult[]>> {
  return get<StockSearchResult[]>('/quotes/search', {
    keyword,
    limit,
  });
}

/**
 * Get market indices
 * 
 * @param codes - Index codes (e.g., 'sh000001,sz399001')
 * @returns API response with market indices
 */
export async function getMarketIndices(codes?: string[]): Promise<ApiResponse<MarketIndex[]>> {
  return get<MarketIndex[]>('/quotes/indices', {
    codes: codes?.join(','),
  });
}

/**
 * Get stock ranking
 * 
 * @param type - Ranking type ('change_pct', 'volume', 'pe', etc.)
 * @param order - Sort order ('asc' or 'desc')
 * @param limit - Maximum results
 * @returns API response with ranking list
 */
export async function getStockRanking(
  type: string = 'change_pct',
  order: 'asc' | 'desc' = 'desc',
  limit: number = 50
): Promise<ApiResponse<StockQuote[]>> {
  return get<StockQuote[]>('/quotes/ranking', {
    type,
    order,
    limit,
  });
}

/**
 * Get stock basic info
 * 
 * @param code - Stock code
 * @returns API response with stock basic info
 */
export async function getStockBasicInfo(code: string): Promise<ApiResponse<{
  code: string;
  name: string;
  industry: string;
  sector: string;
  listing_date: string;
  total_shares: number;
  float_shares: number;
  market_cap: number;
}>> {
  return get('/quotes/basic', { code });
}

/**
 * Get sector data
 * 
 * @returns API response with sector data
 */
export async function getSectors(): Promise<ApiResponse<{
  code: string;
  name: string;
  change_pct: number;
  stock_count: number;
}[]>> {
  return get('/quotes/sectors');
}
