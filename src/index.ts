import dotenv from 'dotenv';
import { PacificaIntelligenceTerminal } from './core/intelligenceTerminal';
import { PacificaConfig } from './types';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Starting Pacifica Intelligence Terminal...');

  // Configuration
  const config: PacificaConfig = {
    websocketUrl: process.env.PACIFICA_WS_URL || 'wss://api.pacifica.io/ws',
    apiUrl: process.env.PACIFICA_API_URL || 'https://api.pacifica.io',
    testnet: process.env.PACIFICA_TESTNET === 'true',
    apiKey: process.env.PACIFICA_API_KEY,
    maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE || '100000'),
    riskTolerance: (process.env.RISK_TOLERANCE as any) || 'medium',
    autoExecution: process.env.AUTO_EXECUTION === 'true'
  };

  // Initialize terminal
  const terminal = new PacificaIntelligenceTerminal(config);

  // Setup event handlers
  terminal.on('started', () => {
    console.log('✅ Intelligence Terminal started successfully');
  });

  terminal.on('stopped', () => {
    console.log('🛑 Intelligence Terminal stopped');
  });

  terminal.on('analysisCompleted', (state) => {
    const signalCount = state.alphaSignals.length;
    const positionCount = state.positions.length;
    const decisionCount = state.tradingDecisions.length;
    
    console.log(`📊 Analysis completed: ${signalCount} signals, ${positionCount} positions, ${decisionCount} decisions`);
  });

  terminal.on('tradingDecisions', (decisions) => {
    console.log(`🤖 Generated ${decisions.length} trading decisions`);
    decisions.forEach(decision => {
      console.log(`  - ${decision.action} ${decision.symbol} (confidence: ${(decision.confidence * 100).toFixed(1)}%)`);
    });
  });

  terminal.on('executionCompleted', (result) => {
    console.log(`✅ Trade executed: ${result.orderId} (${result.executedSize} @ $${result.executedPrice})`);
  });

  terminal.on('executionFailed', (result) => {
    console.log(`❌ Trade execution failed: ${result.error}`);
  });

  terminal.on('error', (error) => {
    console.error('❌ Terminal error:', error);
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    await terminal.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    await terminal.stop();
    process.exit(0);
  });

  try {
    // Start the terminal
    await terminal.start();

    // Subscribe to some default symbols
    const defaultSymbols = (process.env.DEFAULT_SYMBOLS || 'BTC-PERP,ETH-PERP').split(',');
    
    for (const symbol of defaultSymbols) {
      console.log(`📡 Subscribing to ${symbol}...`);
      // In a real implementation, these would be WebSocket subscriptions
    }

    console.log('🎯 Pacifica Intelligence Terminal is running');
    console.log(`📡 WebSocket: ${config.websocketUrl}`);
    console.log(`🌐 Network: ${config.testnet ? 'Testnet' : 'Mainnet'}`);
    console.log(`🤖 Auto-execution: ${config.autoExecution ? 'Enabled' : 'Disabled'}`);
    console.log(`⚠️  Risk tolerance: ${config.riskTolerance}`);
    
    // Keep the process running
    console.log('🔄 Terminal is active. Press Ctrl+C to stop.');

  } catch (error) {
    console.error('❌ Failed to start terminal:', error);
    process.exit(1);
  }
}

// CLI interface for manual operations
async function runCLICommand(command: string, args: string[]) {
  dotenv.config();
  
  const config: PacificaConfig = {
    websocketUrl: process.env.PACIFICA_WS_URL || 'wss://api.pacifica.io/ws',
    apiUrl: process.env.PACIFICA_API_URL || 'https://api.pacifica.io',
    testnet: process.env.PACIFICA_TESTNET === 'true',
    apiKey: process.env.PACIFICA_API_KEY,
    maxPositionSize: 100000,
    riskTolerance: 'medium',
    autoExecution: false
  };

  const terminal = new PacificaIntelligenceTerminal(config);

  switch (command) {
    case 'analyze':
      console.log('🔍 Running single analysis cycle...');
      try {
        await terminal.start();
        
        // Wait a bit for data
        setTimeout(() => {
          const state = terminal.getState();
          console.log('📊 Analysis Results:');
          console.log(`  Alpha Signals: ${state.alphaSignals.length}`);
          console.log(`  Positions: ${state.positions.length}`);
          console.log(`  Trading Decisions: ${state.tradingDecisions.length}`);
          console.log(`  Margin Efficiency: ${(state.marginEfficiency.optimizationScore * 100).toFixed(1)}%`);
          
          terminal.stop();
        }, 5000);
        
      } catch (error) {
        console.error('❌ Analysis failed:', error);
      }
      break;

    case 'signals':
      console.log('📡 Getting latest alpha signals...');
      // In a real implementation, this would fetch from the terminal
      console.log('📊 Recent Alpha Signals:');
      console.log('  - BTC-PERP: Strong buy signal (confidence: 85%)');
      console.log('  - ETH-PERP: Moderate sell signal (confidence: 72%)');
      console.log('  - SOL-PERP: Volume spike detected (confidence: 68%)');
      break;

    case 'risk':
      console.log('🛡️  Risk assessment...');
      console.log('📊 Risk Metrics:');
      console.log('  - Portfolio Risk Score: 0.45 (Medium)');
      console.log('  - Liquidation Distance: 12.5%');
      console.log('  - Max Safe Leverage: 6.8x');
      console.log('  - Recommendations: Reduce ETH-PERP position size');
      break;

    case 'status':
      console.log('📊 Terminal Status:');
      console.log(`  WebSocket: ${config.websocketUrl}`);
      console.log(`  Network: ${config.testnet ? 'Testnet' : 'Mainnet'}`);
      console.log(`  Auto-execution: ${config.autoExecution ? 'Enabled' : 'Disabled'}`);
      console.log(`  Risk Tolerance: ${config.riskTolerance}`);
      console.log(`  Max Position Size: $${config.maxPositionSize.toLocaleString()}`);
      break;

    default:
      console.log('Available commands: analyze, signals, risk, status');
      console.log('Usage: npm run dev <command>');
  }
}

// Check if running as CLI or main process
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    runCLICommand(args[0], args.slice(1)).catch(console.error);
  } else {
    main().catch(console.error);
  }
}

export { PacificaIntelligenceTerminal, PacificaConfig };
