import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ==================== TYPES ====================
interface MarketState {
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
  timestamp: Date
}

interface OrderbookLevel {
  price: number
  volume: number
}

interface Orderbook {
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  imbalance: number
  pressure: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
}

interface WhaleActivity {
  id: string
  symbol: string
  activityType: 'LONG' | 'SHORT' | 'LIQUIDATION'
  size: number
  leverage: number
  confidence: number
  price: number
  timestamp: Date
}

interface AlphaSignal {
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
  timestamp: Date
}

interface RiskAssessment {
  symbol: string
  liquidationDistance: number
  riskScore: number
  volatilityAdjustedStop: number
  maxSafeLeverage: number
  optimalPositionSize: number
  riskToReward: number
  timestamp: Date
}

interface MarginEfficiency {
  symbol: string
  efficiencyScore: number
  expectedReturn: number
  marginRequired: number
  capitalUsage: number
  liquidationRiskIncrease: number
  timestamp: Date
}

interface SystemState {
  smartMode: boolean
  autoExecute: boolean
  minAlphaScore: number
  maxRiskScore: number
  minEfficiency: number
  accountBalance: number
}

// ==================== MARKET DATA ENGINE ====================
class MarketDataEngine {
  symbols = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP']
  private marketStates: Map<string, MarketState> = new Map()
  private priceHistory: Map<string, number[]> = new Map()
  private oiHistory: Map<string, number[]> = new Map()
  private fundingHistory: Map<string, number[]> = new Map()
  
  constructor() {
    // Initialize market states
    this.symbols.forEach(symbol => {
      this.marketStates.set(symbol, this.generateInitialState(symbol))
      this.priceHistory.set(symbol, [])
      this.oiHistory.set(symbol, [])
      this.fundingHistory.set(symbol, [])
    })
  }

  private generateInitialState(symbol: string): MarketState {
    const basePrice = symbol === 'BTC-PERP' ? 67500 : 
                      symbol === 'ETH-PERP' ? 3450 : 145
    
    return {
      symbol,
      price: basePrice,
      openInterest: symbol === 'BTC-PERP' ? 1250000000 : 
                    symbol === 'ETH-PERP' ? 850000000 : 125000000,
      oiChange5m: 0,
      fundingRate: 0.0001,
      fundingChange1h: 0,
      bidVolume: Math.random() * 500 + 200,
      askVolume: Math.random() * 500 + 200,
      liquidationVolume5m: Math.random() * 10,
      volatility5m: Math.random() * 2 + 0.5,
      timestamp: new Date()
    }
  }

  // Update market state with realistic simulation
  updateMarketState(symbol: string): MarketState {
    const state = this.marketStates.get(symbol)!
    const history = this.priceHistory.get(symbol)!
    
    // Generate price movement with momentum and mean reversion
    const momentum = history.length > 5 ? 
      (history.slice(-5).reduce((a, b) => a + b, 0) / 5 - state.price) / state.price * 0.1 : 0
    const randomWalk = (Math.random() - 0.5) * state.volatility5m * 0.01
    const priceChange = state.price * (randomWalk + momentum)
    
    state.price = Math.max(state.price + priceChange, 1)
    history.push(state.price)
    if (history.length > 100) history.shift()
    
    // Update OI with occasional spikes
    const oiBase = symbol === 'BTC-PERP' ? 1250000000 : 
                   symbol === 'ETH-PERP' ? 850000000 : 125000000
    const oiSpike = Math.random() > 0.95 ? (Math.random() - 0.5) * 0.1 : 0
    const previousOI = state.openInterest
    state.openInterest = oiBase * (1 + (Math.random() - 0.5) * 0.02 + oiSpike)
    state.oiChange5m = ((state.openInterest - previousOI) / previousOI) * 100
    
    // Update funding rate
    const fundingBase = 0.0001
    const fundingSpike = Math.random() > 0.98 ? (Math.random() - 0.5) * 0.001 : 0
    const previousFunding = state.fundingRate
    state.fundingRate = fundingBase + (Math.random() - 0.5) * 0.0001 + fundingSpike
    state.fundingChange1h = state.fundingRate - previousFunding
    
    // Update orderbook volumes with pressure shifts
    const pressureShift = Math.random() > 0.9 ? (Math.random() - 0.5) * 200 : 0
    if (Math.random() > 0.5) {
      state.bidVolume = Math.max(100, state.bidVolume + (Math.random() - 0.4) * 50 + pressureShift)
      state.askVolume = Math.max(100, state.askVolume + (Math.random() - 0.6) * 50)
    } else {
      state.bidVolume = Math.max(100, state.bidVolume + (Math.random() - 0.6) * 50)
      state.askVolume = Math.max(100, state.askVolume + (Math.random() - 0.4) * 50 - pressureShift)
    }
    
    // Update volatility
    state.volatility5m = Math.max(0.1, Math.min(5, 
      state.volatility5m + (Math.random() - 0.5) * 0.2))
    
    // Update liquidations (occasional spikes)
    if (Math.random() > 0.95) {
      state.liquidationVolume5m = Math.random() * 50 + 20
    } else {
      state.liquidationVolume5m = Math.max(0, state.liquidationVolume5m * 0.8 + Math.random() * 2)
    }
    
    state.timestamp = new Date()
    
    return state
  }

  getState(symbol: string): MarketState | undefined {
    return this.marketStates.get(symbol)
  }

  getAllStates(): MarketState[] {
    return Array.from(this.marketStates.values())
  }
}

// ==================== ALPHA ENGINE ====================
class AlphaEngine {
  // Orderbook Imbalance Score
  private calculateImbalanceScore(bidVolume: number, askVolume: number): number {
    const imbalance = (bidVolume - askVolume) / (bidVolume + askVolume)
    return Math.max(-100, Math.min(100, imbalance * 100))
  }

  // OI Spike Score
  private calculateOIScore(oiChange5m: number): number {
    const historicalStdDev = 1.5 // Normalized historical standard deviation
    return (oiChange5m / historicalStdDev) * 20
  }

  // Funding Divergence Score
  private calculateFundingScore(fundingRate: number, avgFunding: number): number {
    const divergence = fundingRate - avgFunding
    return divergence * 10000 // Scale to meaningful range
  }

  // Liquidation Cluster Score
  private calculateLiquidationScore(liquidationVolume: number): number {
    const avgLiquidation = 5 // Baseline average
    return (liquidationVolume / avgLiquidation) * 10
  }

  // Volatility Score
  private calculateVolatilityScore(volatility: number): number {
    return volatility * 10
  }

  // Main Alpha Score Calculation
  calculateAlpha(state: MarketState): AlphaSignal {
    const imbalanceScore = this.calculateImbalanceScore(state.bidVolume, state.askVolume)
    const oiScore = this.calculateOIScore(state.oiChange5m)
    const fundingScore = this.calculateFundingScore(state.fundingRate, 0.0001)
    const liquidationScore = this.calculateLiquidationScore(state.liquidationVolume5m)
    const volatilityScore = this.calculateVolatilityScore(state.volatility5m)

    // Weighted alpha score
    const alphaScore = 
      imbalanceScore * 0.30 +
      oiScore * 0.25 +
      fundingScore * 0.20 +
      liquidationScore * 0.15 +
      volatilityScore * 0.10

    // Determine signal
    let signal: AlphaSignal['signal']
    if (alphaScore > 70) signal = 'STRONG_LONG'
    else if (alphaScore > 30) signal = 'LONG'
    else if (alphaScore < -70) signal = 'STRONG_SHORT'
    else if (alphaScore < -30) signal = 'SHORT'
    else signal = 'NEUTRAL'

    // Determine time horizon based on volatility
    let timeHorizon: AlphaSignal['timeHorizon']
    if (state.volatility5m > 2) timeHorizon = 'SHORT'
    else if (state.volatility5m > 1) timeHorizon = 'MEDIUM'
    else timeHorizon = 'LONG'

    // Confidence based on signal strength and volatility
    const confidence = Math.min(100, Math.max(0, 
      50 + Math.abs(alphaScore) * 0.3 + (1 - state.volatility5m / 5) * 20))

    return {
      symbol: state.symbol,
      signal,
      alphaScore: Math.round(alphaScore * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      imbalanceScore: Math.round(imbalanceScore * 100) / 100,
      oiScore: Math.round(oiScore * 100) / 100,
      fundingScore: Math.round(fundingScore * 100) / 100,
      liquidationScore: Math.round(liquidationScore * 100) / 100,
      volatilityScore: Math.round(volatilityScore * 100) / 100,
      timeHorizon,
      timestamp: new Date()
    }
  }
}

// ==================== RISK ENGINE ====================
class RiskEngine {
  calculateRisk(state: MarketState, alphaSignal: AlphaSignal): RiskAssessment {
    // Liquidation distance (simulated for 10x leverage)
    const leverage = 10
    const liquidationDistance = 100 / leverage - state.volatility5m * 5

    // Risk score (0-100, lower is better)
    const riskScore = Math.min(100, Math.max(0,
      50 + 
      state.volatility5m * 10 - 
      liquidationDistance * 0.5 +
      Math.abs(alphaSignal.alphaScore) * 0.1
    ))

    // Volatility adjusted stop (ATR-based)
    const atr = state.price * state.volatility5m * 0.01
    const volatilityAdjustedStop = state.price - (atr * 1.5)

    // Max safe leverage
    const maxSafeLeverage = Math.max(1, Math.min(20,
      20 - state.volatility5m * 3 - riskScore * 0.1
    ))

    // Optimal position size (% of account)
    const optimalPositionSize = Math.min(5, Math.max(0.5,
      3 - riskScore * 0.02
    ))

    // Risk to reward ratio
    const expectedMove = Math.abs(alphaSignal.alphaScore) * state.volatility5m * 0.1
    const stopDistance = state.price - volatilityAdjustedStop
    const riskToReward = expectedMove > 0 && stopDistance > 0 ? 
      expectedMove / stopDistance : 1

    return {
      symbol: state.symbol,
      liquidationDistance: Math.round(liquidationDistance * 100) / 100,
      riskScore: Math.round(riskScore * 100) / 100,
      volatilityAdjustedStop: Math.round(volatilityAdjustedStop * 100) / 100,
      maxSafeLeverage: Math.round(maxSafeLeverage * 10) / 10,
      optimalPositionSize: Math.round(optimalPositionSize * 100) / 100,
      riskToReward: Math.round(riskToReward * 100) / 100,
      timestamp: new Date()
    }
  }
}

// ==================== MARGIN EFFICIENCY ENGINE ====================
class MarginEfficiencyEngine {
  calculate(state: MarketState, alphaSignal: AlphaSignal, risk: RiskAssessment): MarginEfficiency {
    // Expected return
    const expectedReturn = alphaSignal.alphaScore * state.volatility5m * 0.05

    // Margin required for optimal position
    const marginRequired = state.price * risk.optimalPositionSize * 0.01 / risk.maxSafeLeverage

    // Capital usage (simulated)
    const capitalUsage = 45 + Math.random() * 30

    // Efficiency score
    const efficiencyScore = Math.min(100, Math.max(0,
      (expectedReturn / (marginRequired + 0.001)) * 1000 +
      (100 - risk.riskScore) * 0.3 +
      alphaSignal.confidence * 0.2
    ))

    // Liquidation risk increase
    const liquidationRiskIncrease = state.volatility5m * 0.5 + 
      Math.abs(alphaSignal.alphaScore) * 0.01

    return {
      symbol: state.symbol,
      efficiencyScore: Math.round(efficiencyScore * 100) / 100,
      expectedReturn: Math.round(expectedReturn * 100) / 100,
      marginRequired: Math.round(marginRequired * 100) / 100,
      capitalUsage: Math.round(capitalUsage * 100) / 100,
      liquidationRiskIncrease: Math.round(liquidationRiskIncrease * 100) / 100,
      timestamp: new Date()
    }
  }
}

// ==================== ORDERBOOK GENERATOR ====================
function generateOrderbook(state: MarketState): Orderbook {
  const levels = 10
  const bidLevels: OrderbookLevel[] = []
  const askLevels: OrderbookLevel[] = []

  for (let i = 0; i < levels; i++) {
    const spread = state.price * 0.0001 * (i + 1)
    const bidPrice = state.price - spread
    const askPrice = state.price + spread
    
    // Volume distribution with realistic decay
    const decayFactor = Math.exp(-i * 0.3)
    const bidBase = state.bidVolume / levels
    const askBase = state.askVolume / levels
    
    bidLevels.push({
      price: Math.round(bidPrice * 100) / 100,
      volume: Math.round(bidBase * decayFactor * (0.8 + Math.random() * 0.4) * 100) / 100
    })
    askLevels.push({
      price: Math.round(askPrice * 100) / 100,
      volume: Math.round(askBase * decayFactor * (0.8 + Math.random() * 0.4) * 100) / 100
    })
  }

  const imbalance = (state.bidVolume - state.askVolume) / (state.bidVolume + state.askVolume)
  let pressure: Orderbook['pressure']
  if (imbalance > 0.25) pressure = 'BULLISH'
  else if (imbalance < -0.25) pressure = 'BEARISH'
  else pressure = 'NEUTRAL'

  return {
    bids: bidLevels,
    asks: askLevels,
    imbalance: Math.round(imbalance * 100) / 100,
    pressure
  }
}

// ==================== WHALE ACTIVITY GENERATOR ====================
function generateWhaleActivity(state: MarketState): WhaleActivity | null {
  // Only generate whale activity occasionally
  if (Math.random() > 0.92) {
    const activityType = Math.random() > 0.5 ? 'LONG' : 'SHORT'
    const size = Math.random() * 5 + 0.5 // 0.5M to 5.5M
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      symbol: state.symbol,
      activityType,
      size: Math.round(size * 100) / 100,
      leverage: Math.round((Math.random() * 15 + 5) * 10) / 10,
      confidence: Math.round((Math.random() * 20 + 75) * 100) / 100,
      price: state.price,
      timestamp: new Date()
    }
  }
  return null
}

// ==================== MAIN ENGINE ====================
const marketEngine = new MarketDataEngine()
const alphaEngine = new AlphaEngine()
const riskEngine = new RiskEngine()
const marginEngine = new MarginEfficiencyEngine()

let systemState: SystemState = {
  smartMode: false,
  autoExecute: false,
  minAlphaScore: 75,
  maxRiskScore: 40,
  minEfficiency: 65,
  accountBalance: 10000
}

// Store recent whale activities
const recentWhaleActivities: WhaleActivity[] = []

// ==================== WEBSOCKET HANDLERS ====================
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Send initial state
  socket.emit('system-state', systemState)
  
  // Send all current market states
  marketEngine.getAllStates().forEach(state => {
    socket.emit('market-state', state)
  })

  // Send recent whale activities
  socket.emit('whale-activities', recentWhaleActivities.slice(-20))

  // Handle system state updates
  socket.on('update-system-state', (newState: Partial<SystemState>) => {
    systemState = { ...systemState, ...newState }
    io.emit('system-state', systemState)
    console.log('System state updated:', systemState)
  })

  // Handle trade execution request
  socket.on('execute-trade', (data: { symbol: string; side: 'LONG' | 'SHORT'; size: number }) => {
    console.log('Trade execution request:', data)
    const state = marketEngine.getState(data.symbol)
    if (state) {
      io.emit('trade-executed', {
        ...data,
        price: state.price,
        timestamp: new Date(),
        status: 'EXECUTED'
      })
    }
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// ==================== MARKET DATA BROADCAST ====================
setInterval(() => {
  marketEngine.symbols.forEach(symbol => {
    // Update market state
    const state = marketEngine.updateMarketState(symbol)
    
    // Calculate signals
    const alpha = alphaEngine.calculateAlpha(state)
    const risk = riskEngine.calculateRisk(state, alpha)
    const margin = marginEngine.calculate(state, alpha, risk)
    const orderbook = generateOrderbook(state)
    
    // Check for whale activity
    const whaleActivity = generateWhaleActivity(state)
    if (whaleActivity) {
      recentWhaleActivities.push(whaleActivity)
      if (recentWhaleActivities.length > 50) recentWhaleActivities.shift()
      io.emit('whale-activity', whaleActivity)
    }

    // Broadcast updates
    io.emit('market-state', state)
    io.emit('alpha-signal', alpha)
    io.emit('risk-assessment', risk)
    io.emit('margin-efficiency', margin)
    io.emit('orderbook', { symbol, ...orderbook })

    // Auto-execution check
    if (systemState.smartMode && systemState.autoExecute) {
      if (alpha.alphaScore > systemState.minAlphaScore &&
          risk.riskScore < systemState.maxRiskScore &&
          margin.efficiencyScore > systemState.minEfficiency) {
        const side = alpha.alphaScore > 0 ? 'LONG' : 'SHORT'
        console.log(`AUTO-EXECUTE: ${side} ${symbol} at ${state.price}`)
        io.emit('auto-trade-executed', {
          symbol,
          side,
          size: risk.optimalPositionSize,
          price: state.price,
          alphaScore: alpha.alphaScore,
          riskScore: risk.riskScore,
          efficiencyScore: margin.efficiencyScore,
          timestamp: new Date()
        })
      }
    }
  })
}, 1000) // 1 second interval

// ==================== SERVER START ====================
const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Pacifica Market Data Service running on port ${PORT}`)
  console.log('Symbols:', marketEngine.symbols)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...')
  httpServer.close(() => process.exit(0))
})

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...')
  httpServer.close(() => process.exit(0))
})
