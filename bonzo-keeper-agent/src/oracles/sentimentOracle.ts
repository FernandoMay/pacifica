import axios from 'axios';
import { SentimentData } from '../types';

export class SentimentOracle {
  private openaiApiKey: string;
  private newsApiKey: string;

  constructor(openaiApiKey: string, newsApiKey?: string) {
    this.openaiApiKey = openaiApiKey;
    this.newsApiKey = newsApiKey || '';
  }

  async getSentimentAnalysis(symbol: string): Promise<SentimentData> {
    try {
      const newsArticles = await this.fetchNewsArticles(symbol);
      const sentimentPromises = newsArticles.map(article => 
        this.analyzeTextSentiment(article.title + ' ' + article.description)
      );
      
      const sentiments = await Promise.all(sentimentPromises);
      const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
      const confidence = this.calculateConfidence(sentiments);
      
      return {
        symbol,
        sentiment: avgSentiment,
        confidence,
        sources: newsArticles.map(article => article.source),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error analyzing sentiment for ${symbol}:`, error);
      throw error;
    }
  }

  async getSocialSentiment(symbol: string): Promise<SentimentData> {
    try {
      const tweets = await this.fetchTweets(symbol);
      const sentimentPromises = tweets.map(tweet => 
        this.analyzeTextSentiment(tweet.text)
      );
      
      const sentiments = await Promise.all(sentimentPromises);
      const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
      const confidence = this.calculateConfidence(sentiments);
      
      return {
        symbol,
        sentiment: avgSentiment,
        confidence,
        sources: ['Twitter'],
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error analyzing social sentiment for ${symbol}:`, error);
      throw error;
    }
  }

  private async fetchNewsArticles(symbol: string): Promise<any[]> {
    try {
      if (!this.newsApiKey) {
        return this.getMockNews(symbol);
      }

      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: `${symbol} OR ${symbol.toLowerCase()} cryptocurrency`,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 10,
          apiKey: this.newsApiKey
        }
      });

      return response.data.articles;
    } catch (error) {
      console.warn('News API failed, using mock data');
      return this.getMockNews(symbol);
    }
  }

  private async fetchTweets(symbol: string): Promise<any[]> {
    return this.getMockTweets(symbol);
  }

  private async analyzeTextSentiment(text: string): Promise<number> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Analyze the sentiment of the following text about cryptocurrency. Return only a number between -1 (very negative) and 1 (very positive), where 0 is neutral.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 10,
          temperature: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = parseFloat(response.data.choices[0].message.content.trim());
      return isNaN(result) ? 0 : Math.max(-1, Math.min(1, result));
    } catch (error) {
      console.error('OpenAI sentiment analysis failed:', error);
      return 0;
    }
  }

  private calculateConfidence(sentiments: number[]): number {
    const variance = sentiments.reduce((sum, s) => {
      const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
      return sum + Math.pow(s - mean, 2);
    }, 0) / sentiments.length;
    
    return Math.max(0, 1 - variance);
  }

  private getMockNews(symbol: string): any[] {
    return [
      {
        title: `${symbol} shows strong market performance`,
        description: `Recent analysis indicates positive momentum for ${symbol}`,
        source: 'CryptoNews'
      },
      {
        title: `Investors remain cautious about ${symbol} volatility`,
        description: `Market experts advise careful monitoring of ${symbol} trends`,
        source: 'BlockchainDaily'
      }
    ];
  }

  private getMockTweets(symbol: string): any[] {
    return [
      {
        text: `Bullish on ${symbol}! The fundamentals look strong 🚀`,
        source: 'Twitter'
      },
      {
        text: `Concerned about ${symbol} short-term volatility, but long-term prospects remain positive`,
        source: 'Twitter'
      }
    ];
  }
}
