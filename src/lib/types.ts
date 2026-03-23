// Pacifica Intelligence Terminal - Type Definitions

export interface MarketState {
  symbol: string
  price: number
  openInterest: number
  oiChange5m: number
  fundingRate: number
  fundingChange1h: number
  bidVolume: number
  askVolume: number
  liquidationVolume5m: number
  volatility5m: number
  timestamp: Date | string
}

export interface OrderbookLevel {
  price: number
  volume: number
}

export interface Orderbook {
  symbol: string
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  imbalance: number
  pressure: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
}

export interface WhaleActivity {
  id: string
  symbol: string
  activityType: 'LONG' | 'SHORT' | 'LIQUIDATION'
  size: number
  leverage: number
  confidence: number
  price: number
  timestamp: Date | string
}

export interface AlphaSignal {
  symbol: string
  signal: 'STRONG_LONG' | 'LONG' | 'NEUTRAL' | 'SHORT' | 'STRONG_SHORT'
  alphaScore: number
  confidence: number
  imbalanceScore: number
  oiScore: number
  fundingScore: number
  liquidationScore: number
  volatilityScore: number
  timeHorizon: 'SHORT' | 'MEDIUM' | 'LONG'
  timestamp: Date | string
}

export interface RiskAssessment {
  symbol: string
  liquidationDistance: number
  riskScore: number
  volatilityAdjustedStop: number
  maxSafeLeverage: number
  optimalPositionSize: number
  riskToReward: number
  timestamp: Date | string
}

export interface MarginEfficiency {
  symbol: string
  efficiencyScore: number
  expectedReturn: number
  marginRequired: number
  capitalUsage: number
  liquidationRiskIncrease: number
  timestamp: Date | string
}

export interface SystemState {
  smartMode: boolean
  autoExecute: boolean
  minAlphaScore: number
  maxRiskScore: number
  minEfficiency: number
  accountBalance: number
}

export interface Trade {
  symbol: string
  side: 'LONG' | 'SHORT'
  size: number
  price: number
  alphaScore: number
  riskScore: number
  efficiencyScore: number
  timestamp: Date | string
  status: string
}

export interface DashboardState {
  marketStates: Map<string, MarketState>
  alphaSignals: Map<string, AlphaSignal>
  riskAssessments: Map<string, RiskAssessment>
  marginEfficiencies: Map<string, MarginEfficiency>
  orderbooks: Map<string, Orderbook>
  whaleActivities: WhaleActivity[]
  systemState: SystemState
  selectedSymbol: string
  isConnected: boolean
  recentTrades: Trade[]
}
