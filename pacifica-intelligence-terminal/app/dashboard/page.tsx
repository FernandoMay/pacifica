'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Signal {
  id: string
  symbol: string
  type: string
  strength: number
  direction: string
  confidence: number
  description: string
  timestamp: number
}

interface Position {
  id: string
  symbol: string
  side: string
  size: number
  entryPrice: number
  markPrice: number
  pnl: number
  pnlPercent: number
}

export default function Dashboard() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState('')
  const [autoExecutionEnabled, setAutoExecutionEnabled] = useState(false)
  const [activeSignals, setActiveSignals] = useState(12)
  const [riskScore, setRiskScore] = useState(0.45)
  const [marginEfficiency, setMarginEfficiency] = useState(87)
  const [pnl24h, setPnl24h] = useState(2847)
  const [signals, setSignals] = useState<Signal[]>([])
  const [positions, setPositions] = useState<Position[]>([])

  useEffect(() => {
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)
    
    loadData()
    const dataInterval = setInterval(() => {
      updateMetrics()
      updateSignals()
      updatePositions()
    }, 5000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(dataInterval)
    }
  }, [])

  function updateTime() {
    const now = new Date()
    setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }))
  }

  function loadData() {
    // Load initial signals
    const initialSignals: Signal[] = [
      {
        id: '1',
        symbol: 'BTC-PERP',
        type: 'orderbook_imbalance',
        strength: 0.85,
        direction: 'long',
        confidence: 0.92,
        description: 'Strong bid imbalance detected',
        timestamp: Date.now() - 120000
      },
      {
        id: '2',
        symbol: 'ETH-PERP',
        type: 'funding_divergence',
        strength: 0.72,
        direction: 'short',
        confidence: 0.78,
        description: 'High funding rate suggests short opportunity',
        timestamp: Date.now() - 300000
      },
      {
        id: '3',
        symbol: 'SOL-PERP',
        type: 'volatility_expansion',
        strength: 0.68,
        direction: 'neutral',
        confidence: 0.65,
        description: 'Volatility expanding, monitor closely',
        timestamp: Date.now() - 450000
      }
    ]
    setSignals(initialSignals)

    // Load initial positions
    const initialPositions: Position[] = [
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
    ]
    setPositions(initialPositions)
  }

  function updateMetrics() {
    setActiveSignals(prev => Math.max(8, Math.min(20, prev + Math.floor(Math.random() * 5) - 2)))
    setRiskScore(prev => Math.max(0.1, Math.min(0.9, prev + (Math.random() - 0.5) * 0.1)))
    setMarginEfficiency(prev => Math.max(70, Math.min(95, prev + Math.floor(Math.random() * 10) - 5)))
    
    const currentPnl = pnl24h
    const pnlChange = Math.floor(Math.random() * 200) - 100
    setPnl24h(currentPnl + pnlChange)
  }

  function updateSignals() {
    if (Math.random() > 0.7) {
      const newSignal: Signal = {
        id: Date.now().toString(),
        symbol: ['BTC-PERP', 'ETH-PERP', 'SOL-PERP', 'AVAX-PERP'][Math.floor(Math.random() * 4)],
        type: 'volume_spike',
        strength: Math.random(),
        direction: Math.random() > 0.5 ? 'long' : 'short',
        confidence: Math.random(),
        description: 'New signal detected',
        timestamp: Date.now()
      }
      
      setSignals(prev => [newSignal, ...prev.slice(0, 9)])
      setActiveSignals(prev => prev + 1)
    }
  }

  function updatePositions() {
    setPositions(prev => prev.map(position => {
      if (Math.random() > 0.8) {
        const priceChange = (Math.random() - 0.5) * 0.02
        const newMarkPrice = position.markPrice * (1 + priceChange)
        const pnlChange = position.side === 'long' 
          ? (newMarkPrice - position.entryPrice) * position.size / position.entryPrice
          : (position.entryPrice - newMarkPrice) * position.size / position.entryPrice
        
        return {
          ...position,
          markPrice: newMarkPrice,
          pnl: pnlChange,
          pnlPercent: (pnlChange / (position.entryPrice * position.size)) * 100
        }
      }
      return position
    }))
  }

  function toggleAutoExecution() {
    setAutoExecutionEnabled(!autoExecutionEnabled)
  }

  function executeSignal(symbol: string) {
    if (autoExecutionEnabled) {
      alert(`Executing signal for ${symbol}...`)
    } else {
      alert(`Auto-execution disabled. Enable to execute ${symbol} signal.`)
    }
  }

  function formatTime(timestamp: number) {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="min-h-screen bg-gray-900">
      
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.push('/')} className="flex items-center space-x-2">
                <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
                  <i className="fas fa-brain text-white text-sm"></i>
                </div>
                <span className="text-lg font-bold">Pacifica Terminal</span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="pulse-dot w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-sm text-green-400">System Online</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                <span>{currentTime}</span>
              </div>
              <button 
                onClick={toggleAutoExecution}
                className={`px-4 py-2 rounded-lg border text-sm transition ${
                  autoExecutionEnabled 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-robot mr-2"></i>
                <span>Auto Mode: {autoExecutionEnabled ? 'ON' : 'OFF'}</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-700 transition">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-6">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Signals</span>
              <i className="fas fa-chart-line text-purple-400"></i>
            </div>
            <div className="text-2xl font-bold">{activeSignals}</div>
            <div className="text-xs text-gray-500">+3 from last hour</div>
          </div>
          
          <div className="card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Risk Score</span>
              <i className="fas fa-shield-alt text-yellow-400"></i>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{riskScore.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Medium Risk</div>
          </div>
          
          <div className="card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Margin Efficiency</span>
              <i className="fas fa-coins text-green-400"></i>
            </div>
            <div className="text-2xl font-bold text-green-400">{marginEfficiency}%</div>
            <div className="text-xs text-gray-500">Optimal</div>
          </div>
          
          <div className="card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">24h P&L</span>
              <i className="fas fa-dollar-sign text-blue-400"></i>
            </div>
            <div className={`text-2xl font-bold ${pnl24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pnl24h >= 0 ? '+$' : '-$'}{Math.abs(pnl24h).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">+3.2%</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Alpha Signals */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Alpha Signals */}
            <div className="card rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Alpha Signals</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded hover:bg-gray-700 transition">
                    <i className="fas fa-sync-alt text-sm"></i>
                  </button>
                  <select className="bg-gray-700 text-sm rounded px-2 py-1">
                    <option>All Signals</option>
                    <option>High Confidence</option>
                    <option>Recent</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                {signals.map(signal => (
                  <div key={signal.id} className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">{signal.symbol}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          signal.direction === 'long' ? 'signal-positive' :
                          signal.direction === 'short' ? 'signal-negative' : 'signal-neutral'
                        }`}>
                          <i className={`fas ${
                            signal.direction === 'long' ? 'fa-arrow-up' :
                            signal.direction === 'short' ? 'fa-arrow-down' : 'fa-minus'
                          } mr-1`}></i>
                          {signal.direction.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{(signal.confidence * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-500">confidence</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">{signal.description}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span><i className="fas fa-chart-line mr-1"></i>{(signal.strength * 100).toFixed(0)}% strength</span>
                        <span><i className="fas fa-clock mr-1"></i>{formatTime(signal.timestamp)}</span>
                      </div>
                      <button 
                        onClick={() => executeSignal(signal.symbol)}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition"
                      >
                        Execute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Chart */}
            <div className="card rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Performance Overview</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm rounded bg-purple-600 text-white">Performance</button>
                  <button className="px-3 py-1 text-sm rounded bg-gray-700 text-gray-300">Signals</button>
                  <button className="px-3 py-1 text-sm rounded bg-gray-700 text-gray-300">Risk</button>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-800 rounded">
                <div className="text-center">
                  <i className="fas fa-chart-line text-4xl text-purple-400 mb-4"></i>
                  <p className="text-gray-400">Interactive Chart</p>
                  <p className="text-sm text-gray-500">Performance visualization</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Risk & Positions */}
          <div className="space-y-6">
            
            {/* Risk Metrics */}
            <div className="card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Portfolio Risk</span>
                    <span>{(riskScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{width: `${riskScore * 100}%`}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Liquidation Distance</span>
                    <span>12.5%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Leverage Usage</span>
                    <span>3.2x</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{width: '32%'}}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-800 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Max Safe Leverage</span>
                  <span className="text-sm font-semibold text-green-400">6.8x</span>
                </div>
              </div>
            </div>

            {/* Active Positions */}
            <div className="card rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Active Positions</h3>
                <span className="text-sm text-gray-400">{positions.length} positions</span>
              </div>
              
              <div className="space-y-3">
                {positions.map(position => (
                  <div key={position.id} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{position.symbol}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          position.side === 'long' ? 'signal-positive' : 'signal-negative'
                        }`}>
                          {position.side.toUpperCase()}
                        </span>
                      </div>
                      <span className={`font-semibold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.pnl >= 0 ? '+' : ''}$${Math.abs(position.pnl).toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>Size: {position.size}</div>
                      <div>Entry: ${position.entryPrice}</div>
                      <div>Mark: ${position.markPrice}</div>
                      <div className={position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
                <div className="flex items-start space-x-3 p-2 bg-gray-800 rounded">
                  <i className="fas fa-chart-line text-purple-400 mt-1"></i>
                  <div className="flex-1">
                    <div className="text-sm">New alpha signal for BTC-PERP</div>
                    <div className="text-xs text-gray-500">2 min ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 bg-gray-800 rounded">
                  <i className="fas fa-play text-green-400 mt-1"></i>
                  <div className="flex-1">
                    <div className="text-sm">Executed long position on ETH-PERP</div>
                    <div className="text-xs text-gray-500">5 min ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 bg-gray-800 rounded">
                  <i className="fas fa-shield-alt text-yellow-400 mt-1"></i>
                  <div className="flex-1">
                    <div className="text-sm">Risk score updated to {riskScore.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">8 min ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
