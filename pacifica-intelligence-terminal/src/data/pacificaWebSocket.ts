import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { MarketData, OrderBook, Liquidation, WhalePosition, WebSocketMessage } from '../types';

export class PacificaWebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000;
  private isConnecting: boolean = false;
  private subscriptions: Set<string> = new Set();

  constructor(url: string) {
    super();
    this.url = url;
  }

  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
          console.log('✅ Connected to Pacifica WebSocket');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Resubscribe to previous subscriptions
          this.resubscribe();
          
          this.emit('connected');
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message: WebSocketMessage = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        });

        this.ws.on('close', (code: number, reason: string) => {
          console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
          this.isConnecting = false;
          this.emit('disconnected');
          
          // Attempt reconnection
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnect();
            }, this.reconnectDelay);
          }
        });

        this.ws.on('error', (error: Error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'market_data':
        this.emit('marketData', message.data as MarketData);
        break;
      
      case 'orderbook':
        this.emit('orderBook', message.data as OrderBook);
        break;
      
      case 'liquidations':
        this.emit('liquidations', message.data as Liquidation[]);
        break;
      
      case 'whale_positions':
        this.emit('whalePositions', message.data as WhalePosition[]);
        break;
      
      case 'trades':
        this.emit('trades', message.data);
        break;
      
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  private async reconnect(): Promise<void> {
    if (this.isConnecting) return;

    this.reconnectAttempts++;
    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    try {
      await this.connect();
    } catch (error) {
      console.error('Reconnection failed:', error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('maxReconnectAttemptsReached');
      }
    }
  }

  private resubscribe(): void {
    for (const subscription of this.subscriptions) {
      this.subscribe(subscription);
    }
  }

  subscribe(channel: string): void {
    this.subscriptions.add(channel);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        action: 'subscribe',
        channel: channel
      };
      
      this.ws.send(JSON.stringify(message));
      console.log(`📡 Subscribed to: ${channel}`);
    }
  }

  unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        action: 'unsubscribe',
        channel: channel
      };
      
      this.ws.send(JSON.stringify(message));
      console.log(`📡 Unsubscribed from: ${channel}`);
    }
  }

  subscribeToMarketData(symbol: string): void {
    this.subscribe(`market_data.${symbol}`);
  }

  subscribeToOrderBook(symbol: string): void {
    this.subscribe(`orderbook.${symbol}`);
  }

  subscribeToLiquidations(symbol?: string): void {
    const channel = symbol ? `liquidations.${symbol}` : 'liquidations';
    this.subscribe(channel);
  }

  subscribeToWhalePositions(symbol?: string): void {
    const channel = symbol ? `whale_positions.${symbol}` : 'whale_positions';
    this.subscribe(channel);
  }

  subscribeToTrades(symbol: string): void {
    this.subscribe(`trades.${symbol}`);
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscriptions.clear();
    console.log('🔌 Disconnected from Pacifica WebSocket');
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  // Send custom message
  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message - WebSocket not connected');
    }
  }

  // Ping/Pong for connection health
  ping(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.ping();
    }
  }

  // Get connection stats
  getConnectionStats(): {
    connected: boolean;
    reconnectAttempts: number;
    subscriptions: string[];
    url: string;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: this.getSubscriptions(),
      url: this.url
    };
  }
}
