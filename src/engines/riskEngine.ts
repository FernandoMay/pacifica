import { MarketData, Position, RiskMetrics } from '../types';

export class RiskEngine {
  private readonly VOLATILITY_MULTIPLIER = 2.0;
  private readonly MIN_LIQUIDATION_DISTANCE = 0.05; // 5%
  private readonly MAX_LEVERAGE_MULTIPLIER = 0.8; // 80% of max safe leverage

  async calculateRiskMetrics(
    position: Position, 
    marketData: MarketData, 
    volatility: number
  ): Promise<RiskMetrics> {
    const markPrice = marketData.markPrice || marketData.price;
    const liquidationPrice = position.liquidationPrice;
    
    // Calculate liquidation distance
    const liquidationDistance = this.calculateLiquidationDistance(
      position.side, 
      markPrice, 
      liquidationPrice
    );

    // Calculate volatility-adjusted stop loss
    const volatilityAdjustedStop = this.calculateVolatilityAdjustedStop(
      position.side,
      markPrice,
      volatility
    );

    // Calculate maximum safe leverage
    const maxSafeLeverage = this.calculateMaxSafeLeverage(
      liquidationDistance,
      volatility
    );

    // Calculate optimal position size
    const positionSize = this.calculateOptimalPositionSize(
      position.marginUsed,
      maxSafeLeverage,
      liquidationDistance
    );

    // Calculate overall risk score
    const riskScore = this.calculateRiskScore(
      liquidationDistance,
      volatility,
      position.leverage,
      maxSafeLeverage
    );

    return {
      liquidationDistance,
      volatilityAdjustedStop,
      maxSafeLeverage,
      positionSize,
      riskScore,
      liquidationPrice,
      markPrice
    };
  }

  private calculateLiquidationDistance(
    side: 'long' | 'short', 
    markPrice: number, 
    liquidationPrice: number
  ): number {
    if (side === 'long') {
      return (markPrice - liquidationPrice) / markPrice;
    } else {
      return (liquidationPrice - markPrice) / markPrice;
    }
  }

  private calculateVolatilityAdjustedStop(
    side: 'long' | 'short',
    markPrice: number,
    volatility: number
  ): number {
    const stopDistance = volatility * this.VOLATILITY_MULTIPLIER;
    
    if (side === 'long') {
      return markPrice * (1 - stopDistance);
    } else {
      return markPrice * (1 + stopDistance);
    }
  }

  private calculateMaxSafeLeverage(
    liquidationDistance: number,
    volatility: number
  ): number {
    // Conservative leverage based on liquidation distance and volatility
    const volatilityAdjustedLeverage = Math.min(
      this.MIN_LIQUIDATION_DISTANCE / volatility,
      liquidationDistance / this.MIN_LIQUIDATION_DISTANCE
    );

    return Math.max(1, volatilityAdjustedLeverage * this.MAX_LEVERAGE_MULTIPLIER);
  }

  private calculateOptimalPositionSize(
    marginUsed: number,
    maxSafeLeverage: number,
    liquidationDistance: number
  ): number {
    // Position size should be conservative based on risk
    const riskAdjustedSize = marginUsed * maxSafeLeverage * (liquidationDistance / 0.1);
    
    return Math.min(riskAdjustedSize, marginUsed * 10); // Cap at 10x margin
  }

  private calculateRiskScore(
    liquidationDistance: number,
    volatility: number,
    currentLeverage: number,
    maxSafeLeverage: number
  ): number {
    // Risk score components (0-1, higher = riskier)
    
    // 1. Liquidation distance risk (closer = riskier)
    const liquidationRisk = Math.max(0, 1 - (liquidationDistance / 0.2)); // 20% as reference
    
    // 2. Volatility risk
    const volatilityRisk = Math.min(volatility / 0.05, 1); // 5% daily vol as reference
    
    // 3. Leverage risk
    const leverageRisk = Math.min(currentLeverage / maxSafeLeverage, 1);
    
    // Weighted combination
    const totalRisk = (
      liquidationRisk * 0.4 +
      volatilityRisk * 0.3 +
      leverageRisk * 0.3
    );

    return Math.min(totalRisk, 1);
  }

  async assessPortfolioRisk(
    positions: Position[], 
    marketDataMap: Record<string, MarketData>,
    volatilityMap: Record<string, number>
  ): Promise<{
    totalRisk: number;
    positionRisks: Record<string, RiskMetrics>;
    recommendations: string[];
  }> {
    const positionRisks: Record<string, RiskMetrics> = {};
    let totalRiskScore = 0;
    const recommendations: string[] = [];

    for (const position of positions) {
      const marketData = marketDataMap[position.symbol];
      const volatility = volatilityMap[position.symbol] || 0.02; // Default 2%

      if (marketData) {
        const riskMetrics = await this.calculateRiskMetrics(position, marketData, volatility);
        positionRisks[position.id] = riskMetrics;
        totalRiskScore += riskMetrics.riskScore;

        // Generate recommendations
        if (riskMetrics.liquidationDistance < 0.05) {
          recommendations.push(`Reduce ${position.symbol} position - liquidation distance too low`);
        }

        if (riskMetrics.riskScore > 0.8) {
          recommendations.push(`High risk detected in ${position.symbol} - consider reducing leverage`);
        }

        if (position.leverage > riskMetrics.maxSafeLeverage) {
          recommendations.push(`Leverage too high for ${position.symbol} - reduce to ${riskMetrics.maxSafeLeverage.toFixed(1)}x`);
        }
      }
    }

    const avgRisk = positions.length > 0 ? totalRiskScore / positions.length : 0;

    return {
      totalRisk: avgRisk,
      positionRisks,
      recommendations
    };
  }

  calculateLiquidationPrice(
    side: 'long' | 'short',
    entryPrice: number,
    leverage: number,
    maintenanceMarginRate: number = 0.005 // 0.5%
  ): number {
    const marginFraction = 1 / leverage;
    
    if (side === 'long') {
      return entryPrice * (1 - marginFraction + maintenanceMarginRate);
    } else {
      return entryPrice * (1 + marginFraction - maintenanceMarginRate);
    }
  }

  async simulateLiquidationScenario(
    positions: Position[],
    priceShock: number, // Percentage change in price
    marketDataMap: Record<string, MarketData>
  ): Promise<{
    liquidatedPositions: string[];
    totalLoss: number;
    survivingPositions: Position[];
  }> {
    const liquidatedPositions: string[] = [];
    let totalLoss = 0;
    const survivingPositions: Position[] = [];

    for (const position of positions) {
      const marketData = marketDataMap[position.symbol];
      if (!marketData) continue;

      const currentPrice = marketData.price;
      const shockedPrice = currentPrice * (1 + priceShock);
      
      // Calculate new PnL under shock
      let pnl: number;
      if (position.side === 'long') {
        pnl = (shockedPrice - position.entryPrice) * position.size / position.entryPrice;
      } else {
        pnl = (position.entryPrice - shockedPrice) * position.size / position.entryPrice;
      }

      // Check if position would be liquidated
      const newLiquidationPrice = this.calculateLiquidationPrice(
        position.side,
        position.entryPrice,
        position.leverage
      );

      const wouldBeLiquidated = position.side === 'long' 
        ? shockedPrice <= newLiquidationPrice
        : shockedPrice >= newLiquidationPrice;

      if (wouldBeLiquidated) {
        liquidatedPositions.push(position.id);
        totalLoss += Math.abs(position.marginUsed * 0.9); // Assume 90% of margin lost
      } else {
        survivingPositions.push({
          ...position,
          markPrice: shockedPrice,
          unrealizedPnl: pnl
        });
      }
    }

    return {
      liquidatedPositions,
      totalLoss,
      survivingPositions
    };
  }
}
