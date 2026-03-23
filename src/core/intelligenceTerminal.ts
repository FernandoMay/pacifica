import { EventEmitter } from 'events';
import { AlphaEngine } from '../engines/alphaEngine';
import { RiskEngine } from '../engines/riskEngine';
import { MarginEfficiencyEngine } from '../engines/marginEngine';
import { PacificaWebSocket } from '../data/pacificaWebSocket';
import { 
  MarketData, 
  OrderBook, 
  Liquidation, 
  AlphaSignal, 
  RiskMetrics, 
  MarginEfficiency, 
  TradingDecision, 
  Position, 
  PacificaConfig,
  DashboardState,
  ExecutionResult
} from '../types';

export class PacificaIntelligenceTerminal extends EventEmitter {
  private alphaEngine: AlphaEngine;
  private riskEngine: RiskEngine;
  private marginEngine: MarginEfficiencyEngine;
  private webSocket: PacificaWebSocket;
  private config: PacificaConfig;
  private state: DashboardState;
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config: PacificaConfig) {
    super();
    this.config = config;
    this.alphaEngine = new AlphaEngine();
    this.riskEngine = new RiskEngine();
    this.marginEngine = new MarginEfficiencyEngine();
    this.webSocket = new PacificaWebSocket(config.websocketUrl);
    
    this.state = {
      marketData: {},
      orderBook: {},
      liquidations: [],
      whalePositions: [],
      alphaSignals: [],
      riskMetrics: {},
      marginEfficiency: {
        capitalEfficiency: 0,
        marginUtilization: 0,
        riskAdjustedReturn: 0,
        optimizationScore: 0,
        recommendations: []
      },
      positions: [],
      tradingDecisions: [],
      lastUpdate: Date.now()
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.webSocket.on('marketData', (data: MarketData) => {
      this.handleMarketData(data);
    });

    this.webSocket.on('orderBook', (data: OrderBook) => {
      this.handleOrderBook(data);
    });

    this.webSocket.on('liquidations', (data: Liquidation[]) => {
      this.handleLiquidations(data);
    });

    this.webSocket.on('whalePositions', (data: any[]) => {
      this.handleWhalePositions(data);
    });

    this.webSocket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Intelligence Terminal already running');
      return;
    }

    try {
      await this.webSocket.connect();
      this.isRunning = true;
      
      // Start periodic analysis
      this.updateInterval = setInterval(() => {
        this.performAnalysis();
      }, 5000); // Every 5 seconds

      console.log('🚀 Pacifica Intelligence Terminal started');
      this.emit('started');
    } catch (error) {
      console.error('Failed to start Intelligence Terminal:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    await this.webSocket.disconnect();
    console.log('🛑 Pacifica Intelligence Terminal stopped');
    this.emit('stopped');
  }

  private async handleMarketData(data: MarketData): Promise<void> {
    this.state.marketData[data.symbol] = data;
    this.state.lastUpdate = Date.now();
    this.emit('marketDataUpdated', data);
  }

  private async handleOrderBook(data: OrderBook): Promise<void> {
    this.state.orderBook[data.symbol] = data;
    this.state.lastUpdate = Date.now();
    this.emit('orderBookUpdated', data);
  }

  private async handleLiquidations(data: Liquidation[]): Promise<void> {
    this.state.liquidations = [...data, ...this.state.liquidations.slice(0, 100)]; // Keep last 100
    this.state.lastUpdate = Date.now();
    this.emit('liquidationsUpdated', data);
  }

  private async handleWhalePositions(data: any[]): Promise<void> {
    this.state.whalePositions = [...data, ...this.state.whalePositions.slice(0, 50)]; // Keep last 50
    this.state.lastUpdate = Date.now();
    this.emit('whalePositionsUpdated', data);
  }

  private async performAnalysis(): Promise<void> {
    try {
      // Analyze each symbol
      for (const symbol of Object.keys(this.state.marketData)) {
        const marketData = this.state.marketData[symbol];
        const orderBook = this.state.orderBook[symbol];
        
        if (marketData && orderBook) {
          // Alpha analysis
          const alphaSignals = await this.alphaEngine.analyzeMarketData(
            marketData, 
            orderBook, 
            this.state.liquidations.filter(l => l.symbol === symbol)
          );

          // Update signals
          this.state.alphaSignals.push(...alphaSignals);
          
          // Keep only recent signals
          this.state.alphaSignals = this.state.alphaSignals
            .filter(s => Date.now() - s.timestamp < 3600000) // 1 hour
            .slice(-100); // Max 100 signals
        }
      }

      // Risk analysis for positions
      if (this.state.positions.length > 0) {
        await this.updateRiskMetrics();
      }

      // Margin efficiency analysis
      if (this.state.positions.length > 0) {
        await this.updateMarginEfficiency();
      }

      // Generate trading decisions
      if (this.config.autoExecution) {
        await this.generateTradingDecisions();
      }

      this.state.lastUpdate = Date.now();
      this.emit('analysisCompleted', this.state);

    } catch (error) {
      console.error('Analysis error:', error);
      this.emit('analysisError', error);
    }
  }

  private async updateRiskMetrics(): Promise<void> {
    for (const position of this.state.positions) {
      const marketData = this.state.marketData[position.symbol];
      if (!marketData) continue;

      // Calculate volatility (simplified)
      const volatility = this.calculateVolatility(position.symbol);

      const riskMetrics = await this.riskEngine.calculateRiskMetrics(
        position, 
        marketData, 
        volatility
      );

      this.state.riskMetrics[position.id] = riskMetrics;
    }
  }

  private async updateMarginEfficiency(): Promise<void> {
    const totalMargin = this.state.positions.reduce((sum, pos) => sum + pos.marginUsed, 0);
    
    if (totalMargin > 0) {
      this.state.marginEfficiency = await this.marginEngine.calculateMarginEfficiency(
        this.state.positions,
        totalMargin,
        this.state.marketData,
        this.state.riskMetrics
      );
    }
  }

  private async generateTradingDecisions(): Promise<void> {
    const decisions: TradingDecision[] = [];

    // Get top alpha signals
    const topSignals = this.alphaEngine.getTopSignals(5);

    for (const signal of topSignals) {
      if (signal.confidence < 0.7) continue; // High confidence only

      // Check if we already have position in this symbol
      const existingPosition = this.state.positions.find(p => p.symbol === signal.symbol);
      
      if (existingPosition) {
        // Decision to adjust or exit
        const decision = this.evaluatePositionAdjustment(existingPosition, signal);
        if (decision) decisions.push(decision);
      } else {
        // Decision to enter new position
        const decision = this.evaluateNewPosition(signal);
        if (decision) decisions.push(decision);
      }
    }

    this.state.tradingDecisions = decisions;
    this.emit('tradingDecisions', decisions);
  }

  private evaluatePositionAdjustment(position: Position, signal: AlphaSignal): TradingDecision | null {
    const riskMetrics = this.state.riskMetrics[position.id];
    if (!riskMetrics) return null;

    // Simple logic: if signal opposes position, consider exiting
    if (position.side === 'long' && signal.direction === 'short') {
      return {
        id: `exit_${position.id}_${Date.now()}`,
        action: 'exit_long',
        symbol: position.symbol,
        size: position.size,
        confidence: signal.confidence,
        alphaScore: signal.strength,
        riskScore: riskMetrics.riskScore,
        efficiencyScore: this.state.marginEfficiency.optimizationScore,
        timestamp: Date.now(),
        reasoning: `Bearish signal detected (${signal.description}) - consider exiting long position`
      };
    }

    if (position.side === 'short' && signal.direction === 'long') {
      return {
        id: `exit_${position.id}_${Date.now()}`,
        action: 'exit_short',
        symbol: position.symbol,
        size: position.size,
        confidence: signal.confidence,
        alphaScore: signal.strength,
        riskScore: riskMetrics.riskScore,
        efficiencyScore: this.state.marginEfficiency.optimizationScore,
        timestamp: Date.now(),
        reasoning: `Bullish signal detected (${signal.description}) - consider exiting short position`
      };
    }

    return null;
  }

  private evaluateNewPosition(signal: AlphaSignal): TradingDecision | null {
    if (signal.direction === 'neutral') return null;

    const action = signal.direction === 'long' ? 'enter_long' : 'enter_short';
    
    return {
      id: `enter_${signal.symbol}_${Date.now()}`,
      action,
      symbol: signal.symbol,
      size: 1000, // Default size - would be calculated based on margin
      confidence: signal.confidence,
      alphaScore: signal.strength,
      riskScore: 0.5, // Default risk - would be calculated
      efficiencyScore: this.state.marginEfficiency.optimizationScore,
      timestamp: Date.now(),
      reasoning: signal.description
    };
  }

  private calculateVolatility(symbol: string): number {
    // Simplified volatility calculation
    // In production, would use historical price data
    return 0.02; // 2% default volatility
  }

  async executeDecision(decisionId: string): Promise<ExecutionResult> {
    const decision = this.state.tradingDecisions.find(d => d.id === decisionId);
    if (!decision) {
      return {
        success: false,
        error: 'Decision not found',
        timestamp: Date.now()
      };
    }

    try {
      // In production, this would execute via Pacifica API
      console.log(`🤖 Executing decision: ${decision.action} ${decision.symbol}`);
      
      // Simulate execution
      const result: ExecutionResult = {
        success: true,
        orderId: `order_${Date.now()}`,
        executedPrice: this.state.marketData[decision.symbol]?.price || 0,
        executedSize: decision.size,
        fees: decision.size * 0.001, // 0.1% fee
        timestamp: Date.now()
      };

      this.emit('executionCompleted', result);
      return result;

    } catch (error) {
      const result: ExecutionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        timestamp: Date.now()
      };

      this.emit('executionFailed', result);
      return result;
    }
  }

  getState(): DashboardState {
    return { ...this.state };
  }

  getAlphaSignals(symbol?: string, limit?: number): AlphaSignal[] {
    let signals = this.state.alphaSignals;
    
    if (symbol) {
      signals = signals.filter(s => s.symbol === symbol);
    }
    
    if (limit) {
      signals = signals.slice(0, limit);
    }
    
    return signals.sort((a, b) => b.timestamp - a.timestamp);
  }

  getRiskMetrics(positionId?: string): RiskMetrics | Record<string, RiskMetrics> {
    if (positionId) {
      return this.state.riskMetrics[positionId];
    }
    return this.state.riskMetrics;
  }

  getMarginEfficiency(): MarginEfficiency {
    return this.state.marginEfficiency;
  }

  getTradingDecisions(): TradingDecision[] {
    return this.state.tradingDecisions.sort((a, b) => b.timestamp - a.timestamp);
  }

  async updatePositions(positions: Position[]): Promise<void> {
    this.state.positions = positions;
    await this.updateRiskMetrics();
    await this.updateMarginEfficiency();
    this.emit('positionsUpdated', positions);
  }

  isAutoExecutionEnabled(): boolean {
    return this.config.autoExecution;
  }

  setAutoExecution(enabled: boolean): void {
    this.config.autoExecution = enabled;
    this.emit('autoExecutionChanged', enabled);
  }
}
