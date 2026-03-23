import { Position, MarketData, MarginEfficiency, RiskMetrics } from '../types';

export class MarginEfficiencyEngine {
  private readonly TARGET_MARGIN_UTILIZATION = 0.7; // 70%
  private readonly RISK_FREE_RATE = 0.05; // 5% annual

  async calculateMarginEfficiency(
    positions: Position[],
    totalMargin: number,
    marketDataMap: Record<string, MarketData>,
    riskMetricsMap: Record<string, RiskMetrics>
  ): Promise<MarginEfficiency> {
    // Calculate current margin utilization
    const usedMargin = positions.reduce((sum, pos) => sum + pos.marginUsed, 0);
    const marginUtilization = totalMargin > 0 ? usedMargin / totalMargin : 0;

    // Calculate capital efficiency
    const capitalEfficiency = this.calculateCapitalEfficiency(positions, totalMargin);

    // Calculate risk-adjusted returns
    const riskAdjustedReturn = this.calculateRiskAdjustedReturn(
      positions,
      marketDataMap,
      riskMetricsMap
    );

    // Calculate optimization score
    const optimizationScore = this.calculateOptimizationScore(
      marginUtilization,
      capitalEfficiency,
      riskAdjustedReturn
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      marginUtilization,
      capitalEfficiency,
      positions,
      riskMetricsMap
    );

    return {
      capitalEfficiency,
      marginUtilization,
      riskAdjustedReturn,
      optimizationScore,
      recommendations
    };
  }

  private calculateCapitalEfficiency(positions: Position[], totalMargin: number): number {
    if (totalMargin === 0 || positions.length === 0) return 0;

    // Calculate total notional value
    const totalNotional = positions.reduce((sum, pos) => {
      return sum + Math.abs(pos.size * pos.markPrice);
    }, 0);

    // Calculate total unrealized PnL
    const totalPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);

    // Efficiency based on leverage utilization and PnL generation
    const leverageUtilization = totalNotional / totalMargin;
    const pnlEfficiency = totalPnL / totalMargin;

    // Combine metrics (weighted)
    const efficiency = (leverageUtilization * 0.6) + (Math.max(0, pnlEfficiency) * 0.4);

    return Math.min(efficiency / 10, 1); // Normalize to 0-1
  }

  private calculateRiskAdjustedReturn(
    positions: Position[],
    marketDataMap: Record<string, MarketData>,
    riskMetricsMap: Record<string, RiskMetrics>
  ): number {
    let totalReturn = 0;
    let totalRisk = 0;
    let totalWeight = 0;

    for (const position of positions) {
      const marketData = marketDataMap[position.symbol];
      const riskMetrics = riskMetricsMap[position.id];

      if (!marketData || !riskMetrics) continue;

      // Calculate position return (annualized)
      const positionReturn = this.calculatePositionReturn(position, marketData);
      
      // Weight by position size
      const weight = Math.abs(position.size * position.markPrice);
      
      totalReturn += positionReturn * weight;
      totalRisk += riskMetrics.riskScore * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) return 0;

    const avgReturn = totalReturn / totalWeight;
    const avgRisk = totalRisk / totalWeight;

    // Sharpe-like ratio
    const riskAdjustedReturn = avgRisk > 0 ? avgReturn / avgRisk : avgReturn;

    return Math.max(0, Math.min(riskAdjustedReturn, 1));
  }

  private calculatePositionReturn(position: Position, marketData: MarketData): number {
    // Simple return calculation (would be more sophisticated in production)
    const holdingPeriod = (Date.now() - position.timestamp) / (1000 * 60 * 60 * 24); // days
    const currentReturn = position.unrealizedPnl / position.marginUsed;

    if (holdingPeriod === 0) return currentReturn;

    // Annualize return
    const annualizedReturn = currentReturn * (365 / holdingPeriod);
    
    return annualizedReturn;
  }

  private calculateOptimizationScore(
    marginUtilization: number,
    capitalEfficiency: number,
    riskAdjustedReturn: number
  ): number {
    // Target optimization around 70% margin utilization with high efficiency
    const utilizationScore = 1 - Math.abs(marginUtilization - this.TARGET_MARGIN_UTILIZATION);
    
    // Weighted combination
    const optimizationScore = (
      utilizationScore * 0.3 +
      capitalEfficiency * 0.4 +
      riskAdjustedReturn * 0.3
    );

    return Math.min(optimizationScore, 1);
  }

  private generateRecommendations(
    marginUtilization: number,
    capitalEfficiency: number,
    positions: Position[],
    riskMetricsMap: Record<string, RiskMetrics>
  ): string[] {
    const recommendations: string[] = [];

    // Margin utilization recommendations
    if (marginUtilization > 0.9) {
      recommendations.push('Margin utilization too high - consider reducing position sizes');
    } else if (marginUtilization < 0.3) {
      recommendations.push('Margin utilization low - consider increasing position sizes or adding positions');
    }

    // Capital efficiency recommendations
    if (capitalEfficiency < 0.3) {
      recommendations.push('Low capital efficiency - review leverage usage and position allocation');
    } else if (capitalEfficiency > 0.8) {
      recommendations.push('High capital efficiency - current allocation looks optimal');
    }

    // Position-specific recommendations
    for (const position of positions) {
      const riskMetrics = riskMetricsMap[position.id];
      if (!riskMetrics) continue;

      if (riskMetrics.riskScore > 0.8) {
        recommendations.push(`High risk in ${position.symbol} - consider reducing leverage or size`);
      }

      if (position.leverage > riskMetrics.maxSafeLeverage) {
        recommendations.push(`Reduce ${position.symbol} leverage to ${riskMetrics.maxSafeLeverage.toFixed(1)}x`);
      }

      if (riskMetrics.liquidationDistance < 0.05) {
        recommendations.push(`${position.symbol} too close to liquidation - add margin or reduce position`);
      }
    }

    // Portfolio-level recommendations
    const profitablePositions = positions.filter(p => p.unrealizedPnl > 0);
    const losingPositions = positions.filter(p => p.unrealizedPnl < 0);

    if (losingPositions.length > profitablePositions.length) {
      recommendations.push('More losing than winning positions - consider portfolio rebalancing');
    }

    return recommendations;
  }

  async optimizeMarginAllocation(
    availableMargin: number,
    targetPositions: Array<{
      symbol: string;
      side: 'long' | 'short';
      confidence: number; // 0-1
      expectedReturn: number; // Annualized
    }>,
    riskMetricsMap: Record<string, RiskMetrics>
  ): Promise<{
    allocations: Array<{
      symbol: string;
      side: 'long' | 'short';
      size: number;
      leverage: number;
      marginUsed: number;
    }>;
    expectedReturn: number;
    riskScore: number;
  }> {
    const allocations = [];
    let remainingMargin = availableMargin;
    let totalExpectedReturn = 0;
    let totalRiskScore = 0;

    // Sort by confidence-adjusted return
    const sortedTargets = targetPositions
      .map(t => ({
        ...t,
        adjustedReturn: t.expectedReturn * t.confidence
      }))
      .sort((a, b) => b.adjustedReturn - a.adjustedReturn);

    for (const target of sortedTargets) {
      if (remainingMargin <= 0) break;

      const riskMetrics = riskMetricsMap[target.symbol];
      if (!riskMetrics) continue;

      // Allocate margin based on confidence and risk
      const marginAllocation = Math.min(
        remainingMargin * target.confidence * 0.5, // Max 50% per position
        availableMargin * 0.3 // Max 30% of total margin per position
      );

      // Calculate optimal leverage
      const optimalLeverage = Math.min(
        riskMetrics.maxSafeLeverage * 0.8, // Conservative
        10 // Max 10x leverage
      );

      // Calculate position size
      const positionSize = marginAllocation * optimalLeverage;

      allocations.push({
        symbol: target.symbol,
        side: target.side,
        size: positionSize,
        leverage: optimalLeverage,
        marginUsed: marginAllocation
      });

      remainingMargin -= marginAllocation;
      totalExpectedReturn += target.expectedReturn * marginAllocation;
      totalRiskScore += riskMetrics.riskScore * marginAllocation;
    }

    return {
      allocations,
      expectedReturn: totalExpectedReturn / availableMargin,
      riskScore: totalRiskScore / availableMargin
    };
  }

  calculateMarginRequirement(
    symbol: string,
    side: 'long' | 'short',
    size: number,
    leverage: number,
    price: number
  ): number {
    const notionalValue = Math.abs(size * price);
    const marginRequirement = notionalValue / leverage;
    
    return marginRequirement;
  }

  async simulateMarginScenario(
    positions: Position[],
    priceChanges: Record<string, number>,
    marketDataMap: Record<string, MarketData>
  ): Promise<{
    newMarginUtilization: number;
    liquidatedPositions: string[];
    marginCallRisk: number;
  }> {
    let totalMarginUsed = 0;
    let liquidatedPositions: string[] = [];
    let marginCallPositions = 0;

    for (const position of positions) {
      const marketData = marketDataMap[position.symbol];
      if (!marketData) continue;

      const priceChange = priceChanges[position.symbol] || 0;
      const newPrice = marketData.price * (1 + priceChange);

      // Calculate new PnL
      let newPnL: number;
      if (position.side === 'long') {
        newPnL = (newPrice - position.entryPrice) * position.size / position.entryPrice;
      } else {
        newPnL = (position.entryPrice - newPrice) * position.size / position.entryPrice;
      }

      // Check for liquidation
      const liquidationPrice = position.liquidationPrice;
      const isLiquidated = position.side === 'long' 
        ? newPrice <= liquidationPrice
        : newPrice >= liquidationPrice;

      if (isLiquidated) {
        liquidatedPositions.push(position.id);
        totalMarginUsed += 0; // Liquidated positions use no margin
      } else {
        // Check for margin call (simplified)
        const marginRatio = (position.marginUsed + newPnL) / position.marginUsed;
        if (marginRatio < 0.2) { // 20% margin ratio threshold
          marginCallPositions++;
        }
        totalMarginUsed += position.marginUsed;
      }
    }

    const totalMargin = positions.reduce((sum, pos) => sum + pos.marginUsed, 0);
    const newMarginUtilization = totalMargin > 0 ? totalMarginUsed / totalMargin : 0;
    const marginCallRisk = positions.length > 0 ? marginCallPositions / positions.length : 0;

    return {
      newMarginUtilization,
      liquidatedPositions,
      marginCallRisk
    };
  }
}
