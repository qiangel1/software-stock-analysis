/**
 * WebSocket Client Module
 * 
 * Handles real-time quote streaming via WebSocket
 * with automatic reconnection and message handling.
 */

import { storage } from '@utils/storage';
import type { WebSocketMessage, WebSocketQuoteMessage } from '@types/api';

/**
 * WebSocket connection states
 */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * WebSocket client options
 */
interface WebSocketClientOptions {
  /** WebSocket server URL */
  url?: string;
  /** Reconnection delay in milliseconds */
  reconnectDelay?: number;
  /** Maximum reconnection attempts */
  maxReconnectAttempts?: number;
  /** Heartbeat interval in milliseconds */
  heartbeatInterval?: number;
  /** Message handlers */
  onMessage?: (message: WebSocketMessage) => void;
  /** Connection state change handlers */
  onStateChange?: (state: ConnectionState) => void;
  /** Error handlers */
  onError?: (error: Event) => void;
}

/**
 * Default WebSocket client options
 */
const DEFAULT_OPTIONS: Required<WebSocketClientOptions> = {
  url: (import.meta.env.VITE_WS_URL || 'ws://localhost:8000') + '/ws/quotes',
  reconnectDelay: 3000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  onMessage: () => {},
  onStateChange: () => {},
  onError: () => {},
};

/**
 * WebSocket client class
 * 
 * Manages WebSocket connection with automatic reconnection,
 * message queuing, and heartbeat.
 */
class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketClientOptions>;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private messageQueue: string[] = [];
  private subscriptions: Set<string> = new Set();
  private _state: ConnectionState = 'disconnected';
  
  /**
   * Current connection state
   */
  get state(): ConnectionState {
    return this._state;
  }
  
  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this._state === 'connected';
  }
  
  constructor(options: WebSocketClientOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  
  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    
    this.setState('connecting');
    
    try {
      this.ws = new WebSocket(this.options.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.setState('error');
      this.scheduleReconnect();
    }
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.setState('disconnected');
    this.reconnectAttempts = 0;
  }
  
  /**
   * Send message to server
   */
  send(data: unknown): void {
    const message = JSON.stringify(data);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }
  
  /**
   * Subscribe to stock quotes
   */
  subscribe(codes: string[]): void {
    // Add new subscriptions
    codes.forEach(code => this.subscriptions.add(code));
    
    this.send({
      type: 'subscribe',
      data: {
        action: 'subscribe',
        codes,
      },
    });
  }
  
  /**
   * Unsubscribe from stock quotes
   */
  unsubscribe(codes: string[]): void {
    // Remove from subscriptions
    codes.forEach(code => this.subscriptions.delete(code));
    
    this.send({
      type: 'unsubscribe',
      data: {
        action: 'unsubscribe',
        codes,
      },
    });
  }
  
  /**
   * Subscribe to alerts
   */
  subscribeAlerts(): void {
    this.send({
      type: 'subscribe',
      data: {
        action: 'subscribe_alerts',
      },
    });
  }
  
  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.setState('connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      this.resubscribeAll();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.options.onError(error);
      this.setState('error');
    };
    
    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.setState('disconnected');
      this.clearTimers();
      
      // Auto reconnect if not intentional close
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };
  }
  
  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'heartbeat':
        // Server heartbeat response
        break;
        
      case 'quote':
        this.options.onMessage(message);
        break;
        
      case 'alert':
        this.options.onMessage(message);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }
  
  /**
   * Set connection state and notify listeners
   */
  private setState(state: ConnectionState): void {
    if (this._state !== state) {
      this._state = state;
      this.options.onStateChange(state);
    }
  }
  
  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    const delay = this.options.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  /**
   * Start heartbeat interval
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'heartbeat',
          data: {
            timestamp: Date.now(),
          },
        });
      }
    }, this.options.heartbeatInterval);
  }
  
  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(message);
      }
    }
  }
  
  /**
   * Resubscribe to all previous subscriptions
   */
  private resubscribeAll(): void {
    if (this.subscriptions.size > 0) {
      this.subscribe(Array.from(this.subscriptions));
    }
  }
}

// Create singleton instance
export const wsClient = new WebSocketClient();

// Export class for custom instances
export { WebSocketClient };
export type { WebSocketClientOptions };
