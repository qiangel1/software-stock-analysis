/**
 * useWebSocket Hook
 * 
 * Custom hook for WebSocket connection management.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { wsClient } from '@api/websocket';
import type { ConnectionState } from '@api/websocket';
import type { WebSocketMessage } from '@types/api';

interface UseWebSocketOptions {
  /** Auto connect on mount */
  autoConnect?: boolean;
  /** Callback for messages */
  onMessage?: (message: WebSocketMessage) => void;
  /** Callback for state changes */
  onStateChange?: (state: ConnectionState) => void;
  /** Reconnection delay in ms */
  reconnectDelay?: number;
}

interface UseWebSocketReturn {
  /** Current connection state */
  state: ConnectionState;
  /** Whether connected */
  isConnected: boolean;
  /** Connect to server */
  connect: () => void;
  /** Disconnect from server */
  disconnect: () => void;
  /** Subscribe to stocks */
  subscribe: (codes: string[]) => void;
  /** Unsubscribe from stocks */
  unsubscribe: (codes: string[]) => void;
  /** Send message */
  send: (data: unknown) => void;
}

/**
 * WebSocket hook
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, onMessage, onStateChange } = options;
  
  const [state, setState] = useState<ConnectionState>('disconnected');
  const onMessageRef = useRef(onMessage);
  const onStateChangeRef = useRef(onStateChange);
  
  // Keep refs updated
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);
  
  // Set up handlers
  useEffect(() => {
    wsClient.options.onMessage = (message: WebSocketMessage) => {
      onMessageRef.current?.(message);
    };
    
    wsClient.options.onStateChange = (newState: ConnectionState) => {
      setState(newState);
      onStateChangeRef.current?.(newState);
    };
  }, []);
  
  // Auto connect
  useEffect(() => {
    if (autoConnect) {
      wsClient.connect();
    }
    
    return () => {
      // Don't disconnect on unmount to preserve connection
    };
  }, [autoConnect]);
  
  const connect = useCallback(() => {
    wsClient.connect();
  }, []);
  
  const disconnect = useCallback(() => {
    wsClient.disconnect();
  }, []);
  
  const subscribe = useCallback((codes: string[]) => {
    wsClient.subscribe(codes);
  }, []);
  
  const unsubscribe = useCallback((codes: string[]) => {
    wsClient.unsubscribe(codes);
  }, []);
  
  const send = useCallback((data: unknown) => {
    wsClient.send(data);
  }, []);
  
  return {
    state,
    isConnected: state === 'connected',
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
  };
}
