const express = require('express');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        activeSignals: 12,
        riskScore: 0.45,
        marginEfficiency: 0.87,
        pnl24h: 2847
    });
});

app.get('/api/signals', (req, res) => {
    const signals = [
        {
            id: '1',
            symbol: 'BTC-PERP',
            type: 'orderbook_imbalance',
            strength: 0.85,
            direction: 'long',
            confidence: 0.92,
            description: 'Strong bid imbalance detected',
            timestamp: new Date(Date.now() - 120000).toISOString()
        },
        {
            id: '2',
            symbol: 'ETH-PERP',
            type: 'funding_divergence',
            strength: 0.72,
            direction: 'short',
            confidence: 0.78,
            description: 'High funding rate suggests short opportunity',
            timestamp: new Date(Date.now() - 300000).toISOString()
        },
        {
            id: '3',
            symbol: 'SOL-PERP',
            type: 'volatility_expansion',
            strength: 0.68,
            direction: 'neutral',
            confidence: 0.65,
            description: 'Volatility expanding, monitor closely',
            timestamp: new Date(Date.now() - 450000).toISOString()
        }
    ];
    
    res.json(signals);
});

app.get('/api/positions', (req, res) => {
    const positions = [
        {
            id: '1',
            symbol: 'BTC-PERP',
            side: 'long',
            size: 0.5,
            entryPrice: 43250,
            markPrice: 44120,
            pnl: 435.50,
            pnlPercent: 2.01
        },
        {
            id: '2',
            symbol: 'ETH-PERP',
            side: 'short',
            size: 5.2,
            entryPrice: 2280,
            markPrice: 2245,
            pnl: 182.00,
            pnlPercent: 1.53
        },
        {
            id: '3',
            symbol: 'SOL-PERP',
            side: 'long',
            size: 100,
            entryPrice: 98.50,
            markPrice: 96.80,
            pnl: -170.00,
            pnlPercent: -1.73
        }
    ];
    
    res.json(positions);
});

// WebSocket for real-time updates
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    // Send initial data
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Pacifica Intelligence Terminal'
    }));
    
    // Simulate real-time data updates
    const interval = setInterval(() => {
        const update = {
            type: 'market_update',
            data: {
                timestamp: new Date().toISOString(),
                activeSignals: Math.floor(Math.random() * 5) + 10,
                riskScore: (Math.random() * 0.4 + 0.3).toFixed(2),
                marginEfficiency: (Math.random() * 0.2 + 0.8).toFixed(2),
                pnl24h: Math.floor(Math.random() * 1000) + 2000
            }
        };
        
        ws.send(JSON.stringify(update));
    }, 5000);
    
    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        
        // Handle different message types
        try {
            const data = JSON.parse(message.toString());
            
            switch (data.type) {
                case 'subscribe':
                    ws.send(JSON.stringify({
                        type: 'subscribed',
                        channel: data.channel
                    }));
                    break;
                    
                case 'execute_signal':
                    ws.send(JSON.stringify({
                        type: 'execution_result',
                        success: true,
                        orderId: `order_${Date.now()}`,
                        signal: data.signal
                    }));
                    break;
                    
                default:
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Unknown message type'
                    }));
            }
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid JSON'
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket connection closed');
        clearInterval(interval);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Pacifica Intelligence Terminal server running on port ${PORT}`);
    console.log(`📡 Landing page: http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    server.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
    });
});
