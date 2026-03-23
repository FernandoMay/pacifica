import dotenv from 'dotenv';
import { Client } from '@hashgraph/sdk';
import { PriceOracle } from './oracles/priceOracle';
import { SentimentOracle } from './oracles/sentimentOracle';
import { IntelligentKeeper } from './agents/intelligentKeeper';
import { AgentExecutor } from './agentExecutor';
import { AgentConfig, VaultInfo } from './types';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Starting Bonzo Intelligent Keeper Agent...');

  // Initialize Hedera client
  const client = Client.forName(process.env.HEDERA_NETWORK || 'testnet');
  
  if (process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY) {
    client.setOperator(
      process.env.HEDERA_OPERATOR_ID,
      process.env.HEDERA_OPERATOR_KEY
    );
  }

  // Initialize oracles
  const priceOracle = new PriceOracle(
    process.env.COINGECKO_API_KEY || '',
    process.env.SUPRA_ORACLE_URL || 'https://oracle.testnet.supraoracles.com'
  );

  const sentimentOracle = new SentimentOracle(
    process.env.OPENAI_API_KEY || '',
    process.env.NEWS_API_KEY
  );

  // Initialize agent configuration
  const config: AgentConfig = {
    name: process.env.AGENT_NAME || 'BonzoIntelligentKeeper',
    checkInterval: parseInt(process.env.CHECK_INTERVAL_SECONDS || '300'),
    maxVolatilityThreshold: parseFloat(process.env.MAX_VOLATILITY_THRESHOLD || '0.05'),
    minSentimentScore: parseFloat(process.env.MIN_SENTIMENT_SCORE || '-0.3'),
    harvestThresholdUSD: parseFloat(process.env.HARVEST_THRESHOLD_USD || '100'),
    riskTolerance: 'MODERATE'
  };

  // Initialize intelligent keeper
  const keeper = new IntelligentKeeper(priceOracle, sentimentOracle, config);

  // Add sample vaults (in production, these would be fetched from Bonzo registry)
  const sampleVaults: VaultInfo[] = [
    {
      address: process.env.BONZO_VAULT_CONTRACT || '0.0.123456',
      token0: 'HBAR',
      token1: 'USDC',
      totalValueLocked: 100000,
      apr: 15.5,
      liquidityRange: {
        lower: 0.05,
        upper: 0.15
      },
      lastHarvest: Date.now() - 4 * 60 * 60 * 1000 // 4 hours ago
    }
  ];

  for (const vault of sampleVaults) {
    await keeper.addVault(vault);
  }

  // Initialize executor
  const executor = new AgentExecutor(keeper, client);

  // Handle process signals
  process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    await executor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    await executor.stop();
    process.exit(0);
  });

  // Start the agent
  try {
    await executor.start(config);
    console.log('✅ Agent started successfully');
    console.log(`📊 Monitoring ${sampleVaults.length} vault(s)`);
    console.log(`⏰ Check interval: ${config.checkInterval} seconds`);
    console.log(`🎯 Risk tolerance: ${config.riskTolerance}`);
    
    // Keep the process running
    console.log('🔄 Agent is running. Press Ctrl+C to stop.');
    
  } catch (error) {
    console.error('❌ Failed to start agent:', error);
    process.exit(1);
  }
}

// CLI interface for manual operations
async function runManualCommand(command: string, args: string[]) {
  dotenv.config();
  
  const client = Client.forName(process.env.HEDERA_NETWORK || 'testnet');
  if (process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY) {
    client.setOperator(process.env.HEDERA_OPERATOR_ID, process.env.HEDERA_OPERATOR_KEY);
  }

  const priceOracle = new PriceOracle(
    process.env.COINGECKO_API_KEY || '',
    process.env.SUPRA_ORACLE_URL || 'https://oracle.testnet.supraoracles.com'
  );

  const sentimentOracle = new SentimentOracle(process.env.OPENAI_API_KEY || '');
  
  const config: AgentConfig = {
    name: 'BonzoIntelligentKeeper',
    checkInterval: 300,
    maxVolatilityThreshold: 0.05,
    minSentimentScore: -0.3,
    harvestThresholdUSD: 100,
    riskTolerance: 'MODERATE'
  };

  const keeper = new IntelligentKeeper(priceOracle, sentimentOracle, config);
  const executor = new AgentExecutor(keeper, client);

  switch (command) {
    case 'analyze':
      const decisions = await executor.runOnce();
      console.log('📊 Analysis Results:');
      decisions.forEach(decision => {
        console.log(`Vault ${decision.vault}: ${decision.action} (${decision.confidence.toFixed(2)})`);
        console.log(`  Reason: ${decision.reason}`);
      });
      break;
      
    case 'price':
      const symbol = args[0] || 'HBAR';
      const priceData = await priceOracle.getCurrentPrice(symbol);
      console.log(`💰 ${symbol} Price: $${priceData.price} (${priceData.change24h.toFixed(2)}% 24h)`);
      break;
      
    case 'sentiment':
      const sentimentSymbol = args[0] || 'HBAR';
      const sentimentData = await sentimentOracle.getSentimentAnalysis(sentimentSymbol);
      console.log(`💭 ${sentimentSymbol} Sentiment: ${sentimentData.sentiment.toFixed(2)} (confidence: ${sentimentData.confidence.toFixed(2)})`);
      break;
      
    default:
      console.log('Available commands: analyze, price [symbol], sentiment [symbol]');
  }
}

// Check if running as CLI or main process
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    runManualCommand(args[0], args.slice(1)).catch(console.error);
  } else {
    main().catch(console.error);
  }
}

export { main, AgentExecutor, IntelligentKeeper, PriceOracle, SentimentOracle };
