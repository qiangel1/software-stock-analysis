/**
 * Quote Store
 * 
 * Zustand store for managing real-time stock quotes
 * and WebSocket connection state.
 */

import { create } from 'zustand';
import type { Stock, KLine, TechnicalIndicators, KLinePeriod, StockQuote } from '@types/stock';
import type { WebSocketMessage } from '@types/api';
import * as quotesApi from '@api/quotes';
import { wsClient } from '@api/websocket';

interface QuoteState {
  // Stock data cache
  quotes: Record<string, Stock>;
  klineData: Record<string, Record<KLinePeriod, KLine[]>>;
  indicators: Record<string, TechnicalIndicators | null>;
  
  // Subscription state
  subscribedCodes: Set<string>;
  isConnected: boolean;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchQuote: (code: string) => Promise<Stock | null>;
  fetchQuotes: (codes: string[]) => Promise<Stock[]>;
  fetchKLine: (code: string, period: KLinePeriod, count?: number) => Promise<KLine[]>;
  fetchIndicators: (code: string) => Promise<TechnicalIndicators | null>;
  subscribe: (codes: string[]) => void;
  unsubscribe: (codes: string[]) => void;
  handleQuoteUpdate: (message: WebSocketMessage) => void;
  clearQuotes: () => void;
}

export const useQuoteStore = create<QuoteState>()((set, get) => ({
  // Initial state
  quotes: {},
  klineData: {},
  indicators: {},
  subscribedCodes: new Set(),
  isConnected: false,
  isLoading: false,
  error: null,
  
  /**
   * Fetch quote for single stock
   */
  fetchQuote: async (code: string) => {
    try {
      const response = await quotesApi.getRealtimeQuote(code);
      
      if (response.code === 0 && response.data) {
        set((state) => ({
          quotes: { ...state.quotes, [code]: response.data! },
        }));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      return null;
    }
  },
  
  /**
   * Fetch quotes for multiple stocks
   */
  fetchQuotes: async (codes: string[]) => {
    if (codes.length === 0) return [];
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await quotesApi.getRealtimeQuotes(codes);
      
      if (response.code === 0 && response.data) {
        const quotesMap: Record<string, Stock> = {};
        response.data.forEach((stock) => {
          quotesMap[stock.code] = stock;
        });
        
        set((state) => ({
          quotes: { ...state.quotes, ...quotesMap },
          isLoading: false,
        }));
        
        return response.data;
      }
      
      set({ isLoading: false });
      return [];
    } catch (error) {
      set({ isLoading: false, error: '获取行情数据失败' });
      return [];
    }
  },
  
  /**
   * Fetch K-line data
   */
  fetchKLine: async (code: string, period: KLinePeriod, count: number = 100) => {
    try {
      const response = await quotesApi.getKLineData(code, period, count);
      
      if (response.code === 0 && response.data) {
        set((state) => ({
          klineData: {
            ...state.klineData,
            [code]: {
              ...(state.klineData[code] || {}),
              [period]: response.data!,
            },
          },
        }));
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch K-line:', error);
      return [];
    }
  },
  
  /**
   * Fetch technical indicators
   */
  fetchIndicators: async (code: string) => {
    try {
      const response = await quotesApi.getIndicators(code);
      
      if (response.code === 0 && response.data) {
        set((state) => ({
          indicators: { ...state.indicators, [code]: response.data! },
        }));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch indicators:', error);
      return null;
    }
  },
  
  /**
   * Subscribe to stock quotes
   */
  subscribe: (codes: string[]) => {
    const { subscribedCodes } = get();
    
    // Filter out already subscribed codes
    const newCodes = codes.filter((code) => !subscribedCodes.has(code));
    
    if (newCodes.length > 0) {
      wsClient.subscribe(newCodes);
      
      set((state) => ({
        subscribedCodes: new Set([...state.subscribedCodes, ...newCodes]),
      }));
    }
  },
  
  /**
   * Unsubscribe from stock quotes
   */
  unsubscribe: (codes: string[]) => {
    const { subscribedCodes } = get();
    
    wsClient.unsubscribe(codes);
    
    const updatedCodes = new Set(subscribedCodes);
    codes.forEach((code) => updatedCodes.delete(code));
    
    set({ subscribedCodes: updatedCodes });
  },
  
  /**
   * Handle quote update from WebSocket
   */
  handleQuoteUpdate: (message: WebSocketMessage) => {
    if (message.type !== 'quote') return;
    
    const data = message.data as Stock;
    
    set((state) => ({
      quotes: { ...state.quotes, [data.code]: data },
    }));
  },
  
  /**
   * Clear all quotes
   */
  clearQuotes: () => {
    set({ quotes: {}, klineData: {}, indicators: {} });
  },
}));
