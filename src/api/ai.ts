/**
 * AI Analysis API Module
 * 
 * Handles AI-powered stock analysis and screening.
 */

import { get, post } from './client';
import type { ApiResponse } from '@types/api';
import type { StockFilterConditions, Stock } from '@types/stock';

/**
 * AI Analysis result interface
 */
export interface AIAnalysis {
  code: string;
  name: string;
  /** Overall rating: '强烈推荐', '推荐', '中性', '谨慎' */
  rating: 'strongly_buy' | 'buy' | 'neutral' | 'cautious';
  rating_text: string;
  /** Fundamental analysis */
  fundamental: {
    score: number;
    summary: string;
    pros: string[];
    cons: string[];
  };
  /** Technical analysis */
  technical: {
    score: number;
    summary: string;
    indicators: string[];
  };
  /** Sentiment analysis */
  sentiment: {
    score: number;
    summary: string;
    news_count: number;
    positive_ratio: number;
  };
  /** Investment recommendation */
  recommendation: {
    action: 'buy' | 'hold' | 'sell';
    target_price: number;
    stop_loss: number;
    risk_level: 'low' | 'medium' | 'high';
    holding_period: string;
  };
  /** Generated timestamp */
  generated_at: string;
}

/**
 * Stock filter result
 */
export interface FilterResult {
  stocks: Stock[];
  total: number;
  filter_applied: string[];
}

/**
 * Get AI analysis for stock
 * 
 * @param code - Stock code
 * @param forceRefresh - Force refresh cached analysis
 * @returns API response with analysis result
 */
export async function getAIAnalysis(
  code: string,
  forceRefresh: boolean = false
): Promise<ApiResponse<AIAnalysis>> {
  return get<AIAnalysis>(`/ai/analysis/${code}`, {
    refresh: forceRefresh,
  });
}

/**
 * AI-powered stock screening
 * 
 * @param conditions - Filter conditions
 * @returns API response with filtered stocks
 */
export async function filterStocks(
  conditions: StockFilterConditions
): Promise<ApiResponse<FilterResult>> {
  return post<FilterResult>('/ai/filter', conditions);
}

/**
 * Get news summary for stock
 * 
 * @param code - Stock code
 * @returns API response with news summary
 */
export async function getNewsSummary(code: string): Promise<ApiResponse<string>> {
  return get<string>(`/ai/news_summary/${code}`);
}

/**
 * Get trading signals for stock
 * 
 * @param code - Stock code
 * @returns API response with trading signals
 */
export async function getTradingSignals(
  code: string
): Promise<ApiResponse<{
  signals: {
    name: string;
    type: 'buy' | 'sell' | 'neutral';
    strength: number;
    description: string;
  }[];
  overall: 'buy' | 'sell' | 'neutral';
  confidence: number;
}>> {
  return get(`/ai/signals/${code}`);
}

/**
 * Compare multiple stocks
 * 
 * @param codes - Stock codes to compare
 * @returns API response with comparison result
 */
export async function compareStocks(
  codes: string[]
): Promise<ApiResponse<{
  comparison: {
    metrics: string[];
    stocks: {
      code: string;
      name: string;
      values: (number | null)[];
    }[];
  };
  recommendation: string;
}>> {
  return post('/ai/compare', { codes });
}

/**
 * Get market outlook
 * 
 * @returns API response with market outlook
 */
export async function getMarketOutlook(): Promise<ApiResponse<{
  outlook: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  summary: string;
  key_factors: string[];
}>> {
  return get('/ai/market_outlook');
}

/**
 * Get stock recommendation
 * 
 * @param count - Number of recommendations
 * @returns API response with stock recommendations
 */
export async function getRecommendations(
  count: number = 10
): Promise<ApiResponse<{
  stocks: {
    code: string;
    name: string;
    rating: string;
    reason: string;
  }[];
}>> {
  return get('/ai/recommendations', { count });
}
