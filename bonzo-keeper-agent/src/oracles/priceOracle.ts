import axios from 'axios';
import { MarketData, VolatilityData } from '../types';

export class PriceOracle {
  private coingeckoApiKey: string;
  private supraOracleUrl: string;

  constructor(coingeckoApiKey: string, supraOracleUrl: string) {
    this.coingeckoApiKey = coingeckoApiKey;
    this.supraOracleUrl = supraOracleUrl;
  }

  async getCurrentPrice(symbol: string): Promise<MarketData> {
    try {
      const coinGeckoId = this.getCoinGeckoId(symbol);
      
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: coinGeckoId,
            vs_currencies: 'usd',
            include_24hr_vol: true,
            include_24hr_change: true,
          },
          headers: this.coingeckoApiKey ? {
            'x-cg-demo-api-key': this.coingeckoApiKey
          } : {}
        }
      );

      const data = response.data[coinGeckoId];
      
      return {
        symbol,
        price: data.usd,
        volume24h: data.usd_24h_vol || 0,
        change24h: data.usd_24h_change || 0,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  }

  async calculateVolatility(symbol: string, timeframe: string = '24h'): Promise<VolatilityData> {
    try {
      const coinGeckoId = this.getCoinGeckoId(symbol);
      const days = this.getTimeframeDays(timeframe);
      
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinGeckoId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: days,
            interval: 'hourly'
          },
          headers: this.coingeckoApiKey ? {
            'x-cg-demo-api-key': this.coingeckoApiKey
          } : {}
        }
      );

      const prices = response.data.prices.map(([, price]) => price);
      const volatility = this.calculateStandardDeviation(prices);
      
      return {
        symbol,
        volatility,
        timeframe,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error calculating volatility for ${symbol}:`, error);
      throw error;
    }
  }

  async getSupraOraclePrice(symbol: string): Promise<number> {
    try {
      const response = await axios.get(`${this.supraOracleUrl}/price/${symbol}`);
      return response.data.price;
    } catch (error) {
      console.error(`Error fetching Supra oracle price for ${symbol}:`, error);
      throw error;
    }
  }

  private getCoinGeckoId(symbol: string): string {
    const symbolMap: { [key: string]: string } = {
      'HBAR': 'hedera-hashgraph',
      'USDC': 'usd-coin',
      'ETH': 'ethereum',
      'BTC': 'bitcoin',
      'SAUCE': 'saucerswap'
    };
    return symbolMap[symbol] || symbol.toLowerCase();
  }

  private getTimeframeDays(timeframe: string): number {
    const timeframeMap: { [key: string]: number } = {
      '1h': 1,
      '24h': 1,
      '7d': 7,
      '30d': 30
    };
    return timeframeMap[timeframe] || 1;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }
}
