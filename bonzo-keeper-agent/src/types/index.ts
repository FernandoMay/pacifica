export interface MarketData {
  symbol: string;
  price: number;
  volume24h: number;
  change24h: number;
  timestamp: number;
}

export interface VolatilityData {
  symbol: string;
  volatility: number;
  timeframe: string;
  timestamp: number;
}

export interface SentimentData {
  symbol: string;
  sentiment: number; // -1 to 1
  confidence: number; // 0 to 1
  sources: string[];
  timestamp: number;
}

export interface VaultInfo {
  address: string;
  token0: string;
  token1: string;
  totalValueLocked: number;
  apr: number;
  liquidityRange: {
    lower: number;
    upper: number;
  };
  lastHarvest: number;
}

export interface AgentDecision {
  action: 'HARVEST' | 'REBALANCE' | 'WAIT' | 'WITHDRAW';
  vault: string;
  reason: string;
  confidence: number;
  parameters?: any;
}

export interface RiskMetrics {
  volatilityScore: number;
  sentimentScore: number;
  liquidityRisk: number;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AgentConfig {
  name: string;
  checkInterval: number;
  maxVolatilityThreshold: number;
  minSentimentScore: number;
  harvestThresholdUSD: number;
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}
