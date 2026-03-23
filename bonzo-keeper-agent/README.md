# Bonzo Intelligent Keeper Agent

An AI-powered keeper agent for Bonzo Finance vaults that uses real-time market data, sentiment analysis, and volatility metrics to optimize DeFi yield strategies on the Hedera network.

## 🎯 Features

### 🤖 Intelligent Decision Making
- **Volatility-Aware Rebalancing**: Automatically adjusts liquidity ranges based on market volatility
- **Sentiment-Based Harvesting**: Uses AI-powered sentiment analysis to time reward harvesting
- **Risk Management**: Implements comprehensive risk assessment across multiple metrics

### 📊 Real-Time Data Integration
- **Price Oracle**: Integration with CoinGecko and Supra Oracles for real-time pricing
- **Sentiment Analysis**: AI-powered analysis of news and social media sentiment
- **Volatility Calculation**: Real-time volatility metrics for risk assessment

### 🔗 Hedera Integration
- **Smart Contract Interaction**: Seamless integration with Bonzo vault contracts
- **Hedera Agent Kit**: Built on the Hedera Agent Kit framework
- **Secure Transactions**: Non-custodial operation with proper key management

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Price Oracle  │    │ Sentiment Oracle │    │  Risk Metrics   │
│                 │    │                  │    │                 │
│ • CoinGecko     │    │ • OpenAI GPT     │    │ • Volatility    │
│ • Supra Oracles │    │ • News API       │    │ • Sentiment     │
│ • Real-time     │    │ • Social Media   │    │ • Liquidity     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Intelligent     │
                    │ Keeper Agent    │
                    │                 │
                    │ • Decision Logic│
                    │ • Strategy      │
                    │ • Risk Analysis │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Agent Executor │
                    │                 │
                    │ • Transaction  │
                    │ • Scheduling   │
                    │ • Monitoring   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Bonzo Vaults    │
                    │                 │
                    │ • Harvest       │
                    │ • Rebalance     │
                    │ • Withdraw      │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Hedera testnet account
- OpenAI API key (for sentiment analysis)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bonzo-keeper-agent

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Configure your environment
nano .env
```

### Environment Configuration

```bash
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.123456
HEDERA_OPERATOR_KEY=302e0201...

# Bonzo Configuration
BONZO_VAULT_CONTRACT=0.0.789012

# Oracle Configuration
COINGECKO_API_KEY=your_coingecko_api_key
SUPRA_ORACLE_URL=https://oracle.testnet.supraoracles.com

# AI Configuration
OPENAI_API_KEY=your_openai_api_key

# Agent Configuration
AGENT_NAME=BonzoIntelligentKeeper
CHECK_INTERVAL_SECONDS=300
MAX_VOLATILITY_THRESHOLD=0.05
MIN_SENTIMENT_SCORE=-0.3
HARVEST_THRESHOLD_USD=100
```

### Running the Agent

```bash
# Build the project
npm run build

# Start the agent
npm start

# Or run in development mode
npm run dev
```

## 🎮 CLI Commands

```bash
# Run single analysis cycle
npm run dev analyze

# Check current price
npm run dev price HBAR

# Analyze sentiment
npm run dev sentiment HBAR
```

## 🧠 Decision Logic

The agent uses a sophisticated decision-making process:

### 1. High Volatility Detection
- **Condition**: Volatility > 70% threshold
- **Action**: Rebalance to wider liquidity ranges
- **Goal**: Reduce impermanent loss risk

### 2. Negative Sentiment Detection
- **Condition**: Sentiment score below threshold
- **Action**: Immediate harvest
- **Goal**: Avoid price decline in reward tokens

### 3. Low Volatility Environment
- **Condition**: Volatility < 30% and low risk
- **Action**: Tighten liquidity ranges
- **Goal**: Maximize fee collection

### 4. Harvest Threshold
- **Condition**: Estimated rewards > threshold
- **Action**: Harvest rewards
- **Goal**: Realize gains at optimal times

### 5. High Risk Withdrawal
- **Condition**: Overall risk score high
- **Action**: Withdraw to single-sided staking
- **Goal**: Capital preservation

## 📈 Risk Metrics

The agent calculates comprehensive risk metrics:

- **Volatility Score**: Based on price volatility over timeframes
- **Sentiment Score**: AI analysis of news and social media
- **Liquidity Risk**: Based on volume and market depth
- **Overall Risk**: Weighted combination of all factors

## 🔧 Configuration Options

### Risk Tolerance Levels
- **CONSERVATIVE**: Lower thresholds, frequent rebalancing
- **MODERATE**: Balanced approach (default)
- **AGGRESSIVE**: Higher thresholds for maximum yields

### Check Intervals
- **Fast**: 60 seconds (high frequency)
- **Normal**: 300 seconds (default)
- **Slow**: 900 seconds (low gas cost)

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📊 Monitoring

The agent provides real-time monitoring:
- Decision logs with confidence scores
- Transaction execution status
- Risk metric trends
- Performance analytics

## 🔒 Security

- Non-custodial operation
- Private keys never exposed
- All transactions signed locally
- Comprehensive error handling
- Fail-safe mechanisms

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [Bonzo Finance Docs](https://docs.bonzo.finance)
- Issues: Create GitHub issue
- Community: [Telegram](https://t.me/bonzo_finance)

## 🎯 Bounty Requirements

This implementation addresses all requirements for the Bonzo Intelligent Keeper Agent bounty:

✅ **Hedera Agent Kit Integration**: Built on Hedera Agent Kit framework  
✅ **External Data Integration**: Price oracles, sentiment analysis, volatility metrics  
✅ **Autonomous Decision Making**: AI-powered decision logic without human intervention  
✅ **Bonzo Vault Interaction**: Harvest, rebalance, and withdraw operations  
✅ **Risk Management**: Comprehensive risk assessment and mitigation  
✅ **Documentation**: Complete setup guide and API documentation  

### Key Features Delivered

1. **Volatility-Aware Rebalancing**: Real-time volatility monitoring with automatic range adjustments
2. **Sentiment-Based Harvesting**: AI-powered sentiment analysis for optimal harvest timing  
3. **Risk Management**: Multi-factor risk assessment with configurable thresholds
4. **Autonomous Operation**: Fully automated with configurable check intervals
5. **Smart Contract Integration**: Direct interaction with Bonzo vault contracts
6. **Real-Time Data**: Multiple oracle integrations for accurate market data
7. **Monitoring & Logging**: Comprehensive logging and decision tracking
