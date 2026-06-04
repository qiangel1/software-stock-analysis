/**
 * useStockQuote Hook
 * 
 * Custom hook for fetching and subscribing to stock quotes.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { useQuoteStore } from '@stores/quoteStore';
import type { Stock, WebSocketMessage } from '@types/api';

interface UseStockQuoteOptions {
  /** Auto fetch on mount */
  autoFetch?: boolean;
  /** Subscribe to WebSocket updates */
  subscribe?: boolean;
}

interface UseStockQuoteReturn {
  /** Stock data */
  stock: Stock | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Refresh stock data */
  refresh: () => Promise<void>;
  /** Subscribe to real-time updates */
  subscribe: () => void;
  /** Unsubscribe from updates */
  unsubscribe: () => void;
}

/**
 * Stock quote hook
 */
export function useStockQuote(
  code: string,
  options: UseStockQuoteOptions = {}
): UseStockQuoteReturn {
  const { autoFetch = true, subscribe: shouldSubscribe = false } = options;
  
  const { quotes, fetchQuote, subscribe: storeSubscribe, unsubscribe: storeUnsubscribe } = useQuoteStore();
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  
  const subscribedRef = useRef(false);
  
  // Get stock from store
  const stock = quotes[code] || null;
  
  // Fetch stock data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchQuote(code);
      if (!result) {
        setError('获取行情数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取行情数据失败');
    } finally {
      setIsLoading(false);
    }
  }, [code, fetchQuote]);
  
  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch]);
  
  // Handle WebSocket messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'quote') {
      const quoteData = message.data as Stock;
      if (quoteData.code === code) {
        // Quote updated via WebSocket
      }
    }
  }, [code]);
  
  // Subscribe to updates
  const { subscribe, unsubscribe, isConnected } = useWebSocket({
    autoConnect: false,
    onMessage: handleMessage,
  });
  
  useEffect(() => {
    if (shouldSubscribe && !subscribedRef.current) {
      subscribe([code]);
      subscribedRef.current = true;
    }
    
    return () => {
      if (subscribedRef.current) {
        unsubscribe([code]);
        subscribedRef.current = false;
      }
    };
  }, [shouldSubscribe, code, subscribe, unsubscribe]);
  
  return {
    stock,
    isLoading,
    error,
    refresh,
    subscribe,
    unsubscribe,
  };
}
