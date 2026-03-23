export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  fundingRate?: number;
  openInterest?: number;
  markPrice?: number;
  indexPrice?: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  amount: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
  spread: number;
  midPrice: number;
}

export interface Liquidation {
  price: number;
  size: number;
  side: 'long' | 'short';
  timestamp: number;
  usdValue: number;
}

export interface WhalePosition {
  address: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  unrealizedPnl: number;
  leverage: number;
  timestamp: number;
}

export interface AlphaSignal {
  id: string;
  type: 'orderbook_imbalance' | 'funding_divergence' | 'liquidation_cluster' | 'volatility_expansion' | 'volume_spike';
  symbol: string;
  strength: number; // 0-1
  direction: 'long' | 'short' | 'neutral';
  confidence: number; // 0-1
  timestamp: number;
  metadata: any;
  description: string;
}

export interface RiskMetrics {
  liquidationDistance: number; // percentage
  volatilityAdjustedStop: number;
  maxSafeLeverage: number;
  positionSize: number;
  riskScore: number; // 0-1
  liquidationPrice: number;
  markPrice: number;
}

export interface MarginEfficiency {
  capitalEfficiency: number; // 0-1
  marginUtilization: number; // 0-1
  riskAdjustedReturn: number;
  optimizationScore: number; // 0-1
  recommendations: string[];
}

export interface TradingDecision {
  id: string;
  action: 'enter_long' | 'enter_short' | 'exit_long' | 'exit_short' | 'adjust_position' | 'wait';
  symbol: string;
  size: number;
  confidence: number; // 0-1
  alphaScore: number;
  riskScore: number;
  efficiencyScore: number;
  timestamp: number;
  reasoning: string;
  stopLoss?: number;
  takeProfit?: number;
  leverage?: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  leverage: number;
  marginUsed: number;
  liquidationPrice: number;
  timestamp: number;
}

export interface PacificaConfig {
  websocketUrl: string;
  apiUrl: string;
  testnet: boolean;
  apiKey?: string;
  maxPositionSize: number;
  riskTolerance: 'low' | 'medium' | 'high';
  autoExecution: boolean;
}

export interface DashboardState {
  marketData: Record<string, MarketData>;
  orderBook: Record<string, OrderBook>;
  liquidations: Liquidation[];
  whalePositions: WhalePosition[];
  alphaSignals: AlphaSignal[];
  riskMetrics: Record<string, RiskMetrics>;
  marginEfficiency: MarginEfficiency;
  positions: Position[];
  tradingDecisions: TradingDecision[];
  lastUpdate: number;
}

export interface WebSocketMessage {
  type: 'market_data' | 'orderbook' | 'liquidations' | 'whale_positions' | 'trades';
  data: any;
  timestamp: number;
}

export interface ExecutionResult {
  success: boolean;
  orderId?: string;
  error?: string;
  executedPrice?: number;
  executedSize?: number;
  fees?: number;
  timestamp: number;
}
