import { PriceOracle } from '../oracles/priceOracle';
import { SentimentOracle } from '../oracles/sentimentOracle';
import { AgentDecision, AgentConfig, RiskMetrics, VaultInfo, MarketData, VolatilityData, SentimentData } from '../types';

export class IntelligentKeeper {
  private priceOracle: PriceOracle;
  private sentimentOracle: SentimentOracle;
  private config: AgentConfig;
  private vaults: Map<string, VaultInfo> = new Map();

  constructor(priceOracle: PriceOracle, sentimentOracle: SentimentOracle, config: AgentConfig) {
    this.priceOracle = priceOracle;
    this.sentimentOracle = sentimentOracle;
    this.config = config;
  }

  async analyzeVault(vaultAddress: string): Promise<AgentDecision> {
    try {
      const vault = this.vaults.get(vaultAddress);
      if (!vault) {
        throw new Error(`Vault ${vaultAddress} not found`);
      }

      const marketData = await this.priceOracle.getCurrentPrice(vault.token0);
      const volatilityData = await this.priceOracle.calculateVolatility(vault.token0);
      const sentimentData = await this.sentimentOracle.getSentimentAnalysis(vault.token0);

      const riskMetrics = this.calculateRiskMetrics(volatilityData, sentimentData, marketData);
      const decision = this.makeDecision(vault, riskMetrics, marketData);

      return decision;
    } catch (error) {
      console.error(`Error analyzing vault ${vaultAddress}:`, error);
      return {
        action: 'WAIT',
        vault: vaultAddress,
        reason: `Analysis failed: ${error}`,
        confidence: 0
      };
    }
  }

  async addVault(vaultInfo: VaultInfo): Promise<void> {
    this.vaults.set(vaultInfo.address, vaultInfo);
  }

  private calculateRiskMetrics(volatility: VolatilityData, sentiment: SentimentData, market: MarketData): RiskMetrics {
    const volatilityScore = Math.min(volatility.volatility / this.config.maxVolatilityThreshold, 1);
    const sentimentScore = (sentiment.sentiment + 1) / 2; // Normalize -1 to 1 -> 0 to 1
    const liquidityRisk = this.calculateLiquidityRisk(market);

    const overallRiskValue = (volatilityScore * 0.4 + (1 - sentimentScore) * 0.3 + liquidityRisk * 0.3);
    
    let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    if (overallRiskValue < 0.3) overallRisk = 'LOW';
    else if (overallRiskValue < 0.7) overallRisk = 'MEDIUM';
    else overallRisk = 'HIGH';

    return {
      volatilityScore,
      sentimentScore,
      liquidityRisk,
      overallRisk
    };
  }

  private makeDecision(vault: VaultInfo, risk: RiskMetrics, market: MarketData): AgentDecision {
    const timeSinceLastHarvest = Date.now() - vault.lastHarvest;
    const harvestThreshold = this.config.harvestThresholdUSD;
    const estimatedRewards = this.estimateRewards(vault, timeSinceLastHarvest);

    // High volatility detected - widen ranges or withdraw
    if (risk.volatilityScore > 0.7) {
      return {
        action: 'REBALANCE',
        vault: vault.address,
        reason: `High volatility detected (${(risk.volatilityScore * 100).toFixed(1)}%). Widening liquidity ranges to reduce impermanent loss risk.`,
        confidence: 0.8,
        parameters: {
          newRange: {
            lower: vault.liquidityRange.lower * 0.8,
            upper: vault.liquidityRange.upper * 1.2
          }
        }
      };
    }

    // Negative sentiment detected - harvest immediately
    if (risk.sentimentScore < this.config.minSentimentScore) {
      return {
        action: 'HARVEST',
        vault: vault.address,
        reason: `Negative sentiment detected (${risk.sentimentScore.toFixed(2)}). Harvesting rewards to avoid potential price decline.`,
        confidence: 0.7
      };
    }

    // Low volatility - tighten ranges for higher fees
    if (risk.volatilityScore < 0.3 && risk.overallRisk === 'LOW') {
      return {
        action: 'REBALANCE',
        vault: vault.address,
        reason: `Low volatility environment detected. Tightening liquidity ranges to maximize fee collection.`,
        confidence: 0.6,
        parameters: {
          newRange: {
            lower: vault.liquidityRange.lower * 1.1,
            upper: vault.liquidityRange.upper * 0.9
          }
        }
      };
    }

    // Harvest if threshold met
    if (estimatedRewards >= harvestThreshold) {
      return {
        action: 'HARVEST',
        vault: vault.address,
        reason: `Estimated rewards ($${estimatedRewards.toFixed(2)}) exceed threshold ($${harvestThreshold}).`,
        confidence: 0.9
      };
    }

    // High overall risk - withdraw to safety
    if (risk.overallRisk === 'HIGH') {
      return {
        action: 'WITHDRAW',
        vault: vault.address,
        reason: `High overall risk detected (volatility: ${(risk.volatilityScore * 100).toFixed(1)}%, sentiment: ${(risk.sentimentScore * 100).toFixed(1)}%). Withdrawing to single-sided staking.`,
        confidence: 0.8
      };
    }

    // Default - wait
    return {
      action: 'WAIT',
      vault: vault.address,
      reason: `Market conditions favorable. Current position optimal.`,
      confidence: 0.5
    };
  }

  private calculateLiquidityRisk(market: MarketData): number {
    // Simple liquidity risk based on volume and price change
    const volumeScore = Math.min(market.volume24h / 1000000, 1); // Normalize to $1M
    const volatilityScore = Math.abs(market.change24h) / 20; // Normalize to 20% change
    
    return Math.max(0, 1 - (volumeScore * 0.6 + (1 - volatilityScore) * 0.4));
  }

  private estimateRewards(vault: VaultInfo, timeSinceLastHarvest: number): number {
    const hoursSinceHarvest = timeSinceLastHarvest / (1000 * 60 * 60);
    const hourlyRate = vault.apr / 100 / 365 / 24;
    return vault.totalValueLocked * hourlyRate * hoursSinceHarvest;
  }

  async getAllDecisions(): Promise<AgentDecision[]> {
    const decisions: AgentDecision[] = [];
    
    for (const vaultAddress of this.vaults.keys()) {
      const decision = await this.analyzeVault(vaultAddress);
      decisions.push(decision);
    }
    
    return decisions;
  }

  getVaultInfo(vaultAddress: string): VaultInfo | undefined {
    return this.vaults.get(vaultAddress);
  }

  getAllVaults(): VaultInfo[] {
    return Array.from(this.vaults.values());
  }
}
