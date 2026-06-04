import { MarketData, OrderBook, Liquidation, AlphaSignal } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AlphaEngine {
  private signals: AlphaSignal[] = [];
  private readonly SIGNAL_THRESHOLD = 0.6;
  private readonly VOLATILITY_WINDOW = 20; // periods
  private priceHistory: Map<string, number[]> = new Map();

  async analyzeMarketData(marketData: MarketData, orderBook: OrderBook, liquidations: Liquidation[]): Promise<AlphaSignal[]> {
    const signals: AlphaSignal[] = [];
    const symbol = marketData.symbol;

    // Update price history
    this.updatePriceHistory(symbol, marketData.price);

    // 1. Orderbook Imbalance Analysis
    const imbalanceSignal = this.analyzeOrderbookImbalance(orderBook);
    if (imbalanceSignal) signals.push(imbalanceSignal);

    // 2. Funding Rate Divergence
    if (marketData.fundingRate !== undefined) {
      const fundingSignal = this.analyzeFundingDivergence(marketData);
      if (fundingSignal) signals.push(fundingSignal);
    }

    // 3. Liquidation Cluster Detection
    const liquidationSignal = this.analyzeLiquidationClusters(liquidations);
    if (liquidationSignal) signals.push(liquidationSignal);

    // 4. Volatility Expansion
    const volatilitySignal = this.analyzeVolatilityExpansion(symbol);
    if (volatilitySignal) signals.push(volatilitySignal);

    // 5. Volume Spike Detection
    const volumeSignal = this.analyzeVolumeSpike(marketData);
    if (volumeSignal) signals.push(volumeSignal);

    // Store and return signals
    this.signals.push(...signals);
    return signals;
  }

  private analyzeOrderbookImbalance(orderBook: OrderBook): AlphaSignal | null {
    const bidSize = orderBook.bids.reduce((sum, level) => sum + level.size, 0);
    const askSize = orderBook.asks.reduce((sum, level) => sum + level.size, 0);
    const totalSize = bidSize + askSize;
    
    if (totalSize === 0) return null;

    const imbalance = (bidSize - askSize) / totalSize;
    const strength = Math.abs(imbalance);
    
    if (strength < 0.3) return null; // Not significant

    return {
      id: uuidv4(),
      type: 'orderbook_imbalance',
      symbol: orderBook.symbol,
      strength,
      direction: imbalance > 0 ? 'long' : 'short',
      confidence: Math.min(strength * 1.5, 1),
      timestamp: Date.now(),
      metadata: {
        bidSize,
        askSize,
        imbalance,
        spread: orderBook.spread
      },
      description: `Orderbook ${imbalance > 0 ? 'bid-heavy' : 'ask-heavy'} (${(strength * 100).toFixed(1)}% imbalance)`
    };
  }

  private analyzeFundingDivergence(marketData: MarketData): AlphaSignal | null {
    if (!marketData.fundingRate) return null;

    const fundingRate = marketData.fundingRate;
    const absFundingRate = Math.abs(fundingRate);
    
    // High funding rate indicates potential reversal
    if (absFundingRate < 0.0001) return null; // 0.01% threshold

    const strength = Math.min(absFundingRate * 100, 1); // Normalize to 0-1
    const direction = fundingRate > 0 ? 'short' : 'long'; // High funding for longs suggests short opportunity

    return {
      id: uuidv4(),
      type: 'funding_divergence',
      symbol: marketData.symbol,
      strength,
      direction,
      confidence: strength * 0.8,
      timestamp: Date.now(),
      metadata: {
        fundingRate,
        annualizedRate: fundingRate * 365 * 100 * 100, // Annualized percentage
        threshold: 0.0001
      },
      description: `Funding rate ${(fundingRate * 100).toFixed(4)}% (${direction} bias)`
    };
  }

  private analyzeLiquidationClusters(liquidations: Liquidation[]): AlphaSignal | null {
    if (liquidations.length === 0) return null;

    // Group recent liquidations (last 5 minutes)
    const now = Date.now();
    const recentLiquidations = liquidations.filter(liq => now - liq.timestamp < 300000);

    if (recentLiquidations.length < 3) return null; // Need cluster

    const totalLiquidated = recentLiquidations.reduce((sum, liq) => sum + liq.usdValue, 0);
    const avgSize = totalLiquidated / recentLiquidations.length;

    // Determine dominant side
    const longLiquidations = recentLiquidations.filter(liq => liq.side === 'long').length;
    const shortLiquidations = recentLiquidations.filter(liq => liq.side === 'short').length;
    const dominantSide = longLiquidations > shortLiquidations ? 'short' : 'long';

    const strength = Math.min(recentLiquidations.length / 10, 1); // Normalize
    const confidence = Math.min(avgSize / 100000, 1); // Based on average size

    return {
      id: uuidv4(),
      type: 'liquidation_cluster',
      symbol: recentLiquidations[0].symbol,
      strength,
      direction: dominantSide,
      confidence,
      timestamp: Date.now(),
      metadata: {
        liquidationCount: recentLiquidations.length,
        totalValue: totalLiquidated,
        avgSize,
        longLiquidations,
        shortLiquidations,
        timeWindow: '5m'
      },
      description: `${recentLiquidations.length} liquidations detected ($${(totalLiquidated / 1000).toFixed(0)}K total)`
    };
  }

  private analyzeVolatilityExpansion(symbol: string): AlphaSignal | null {
    const prices = this.priceHistory.get(symbol);
    if (!prices || prices.length < this.VOLATILITY_WINDOW) return null;

    // Calculate recent volatility
    const recentPrices = prices.slice(-this.VOLATILITY_WINDOW);
    const returns: number[] = [];
    
    for (let i = 1; i < recentPrices.length; i++) {
      returns.push((recentPrices[i] - recentPrices[i-1]) / recentPrices[i-1]);
    }

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(24 * 60); // Annualized

    // Compare with historical volatility (simple approach)
    const historicalPrices = prices.slice(-100, -this.VOLATILITY_WINDOW);
    if (historicalPrices.length < this.VOLATILITY_WINDOW) return null;

    const historicalReturns: number[] = [];
    for (let i = 1; i < historicalPrices.length; i++) {
      historicalReturns.push((historicalPrices[i] - historicalPrices[i-1]) / historicalPrices[i-1]);
    }

    const histAvgReturn = historicalReturns.reduce((sum, r) => sum + r, 0) / historicalReturns.length;
    const histVariance = historicalReturns.reduce((sum, r) => sum + Math.pow(r - histAvgReturn, 2), 0) / historicalReturns.length;
    const historicalVolatility = Math.sqrt(histVariance) * Math.sqrt(24 * 60);

    const volatilityRatio = volatility / historicalVolatility;
    
    if (volatilityRatio < 1.5) return null; // Not significant expansion

    const strength = Math.min(volatilityRatio / 3, 1); // Normalize
    const direction = 'neutral'; // Volatility alone doesn't indicate direction

    return {
      id: uuidv4(),
      type: 'volatility_expansion',
      symbol,
      strength,
      direction,
      confidence: strength * 0.7,
      timestamp: Date.now(),
      metadata: {
        currentVolatility: volatility,
        historicalVolatility,
        expansionRatio: volatilityRatio,
        window: this.VOLATILITY_WINDOW
      },
      description: `Volatility expansion ${(volatilityRatio * 100).toFixed(0)}% above normal`
    };
  }

  private analyzeVolumeSpike(marketData: MarketData): AlphaSignal | null {
    const symbol = marketData.symbol;
    const prices = this.priceHistory.get(symbol);
    if (!prices || prices.length < 50) return null;

    // Simple volume spike detection (would need historical volume data in real implementation)
    // For now, we'll use a placeholder based on current volume
    const avgVolume = 1000000; // Placeholder - would calculate from historical data
    const volumeRatio = marketData.volume / avgVolume;

    if (volumeRatio < 2.0) return null; // Not significant spike

    const strength = Math.min(volumeRatio / 5, 1); // Normalize
    const direction = 'neutral'; // Volume alone doesn't indicate direction

    return {
      id: uuidv4(),
      type: 'volume_spike',
      symbol,
      strength,
      direction,
      confidence: strength * 0.6,
      timestamp: Date.now(),
      metadata: {
        currentVolume: marketData.volume,
        avgVolume,
        volumeRatio
      },
      description: `Volume spike ${(volumeRatio * 100).toFixed(0)}% above average`
    };
  }

  private updatePriceHistory(symbol: string, price: number): void {
    const history = this.priceHistory.get(symbol) || [];
    history.push(price);
    
    // Keep only last 200 data points
    if (history.length > 200) {
      history.shift();
    }
    
    this.priceHistory.set(symbol, history);
  }

  getSignals(symbol?: string, maxAge?: number): AlphaSignal[] {
    let signals = this.signals;
    
    if (symbol) {
      signals = signals.filter(s => s.symbol === symbol);
    }
    
    if (maxAge) {
      const cutoff = Date.now() - maxAge;
      signals = signals.filter(s => s.timestamp > cutoff);
    }
    
    return signals.sort((a, b) => b.timestamp - a.timestamp);
  }

  getTopSignals(limit: number = 10): AlphaSignal[] {
    return this.signals
      .filter(s => s.confidence >= this.SIGNAL_THRESHOLD)
      .sort((a, b) => (b.confidence * b.strength) - (a.confidence * a.strength))
      .slice(0, limit);
  }

  clearOldSignals(maxAge: number = 3600000): void { // 1 hour default
    const cutoff = Date.now() - maxAge;
    this.signals = this.signals.filter(s => s.timestamp > cutoff);
  }
}
