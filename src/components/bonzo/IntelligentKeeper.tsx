'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Signal {
  id: string
  symbol: string
  type: string
  strength: number
  direction: 'long' | 'short' | 'neutral'
  confidence: number
  description: string
  timestamp: number
}

interface Position {
  id: string
  symbol: string
  side: 'long' | 'short'
  size: number
  entryPrice: number
  markPrice: number
  pnl: number
  pnlPercent: number
}

export function IntelligentKeeper() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [autoExecution, setAutoExecution] = useState(false)
  const [riskScore, setRiskScore] = useState(0.45)

  useEffect(() => {
    // Simulated Bonzo signals
    const bonzoSignals: Signal[] = [
      {
        id: '1',
        symbol: 'HBAR-USDC',
        type: 'volatility_aware',
        strength: 0.85,
        direction: 'long',
        confidence: 0.92,
        description: 'Low volatility detected - tightening liquidity ranges',
        timestamp: Date.now() - 120000
      },
      {
        id: '2',
        symbol: 'HBAR-USDC',
        type: 'sentiment_based',
        strength: 0.72,
        direction: 'short',
        confidence: 0.78,
        description: 'Negative sentiment spike - immediate harvest recommended',
        timestamp: Date.now() - 300000
      }
    ]

    const bonzoPositions: Position[] = [
      {
        id: '1',
        symbol: 'HBAR-USDC',
        side: 'long',
        size: 1000,
        entryPrice: 0.075,
        markPrice: 0.078,
        pnl: 40.00,
        pnlPercent: 5.33
      }
    ]

    setSignals(bonzoSignals)
    setPositions(bonzoPositions)
  }, [])

  const executeSignal = (signalId: string) => {
    if (autoExecution) {
      console.log(`Executing Bonzo signal: ${signalId}`)
    } else {
      alert('Enable auto-execution to execute Bonzo signals')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bonzo Intelligent Keeper</h2>
        <div className="flex items-center space-x-2">
          <Badge variant={autoExecution ? 'default' : 'secondary'}>
            Auto Mode: {autoExecution ? 'ON' : 'OFF'}
          </Badge>
          <Button
            onClick={() => setAutoExecution(!autoExecution)}
            variant={autoExecution ? 'default' : 'outline'}
            size="sm"
          >
            <i className="fas fa-robot mr-2" />
            Toggle Auto
          </Button>
        </div>
      </div>

      {/* Bonzo Signals */}
      <Card>
        <Card.Header>
          <Card.Title>Bonzo Vault Signals</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            {signals.map(signal => (
              <div key={signal.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{signal.symbol}</span>
                    <Badge variant={signal.direction === 'long' ? 'default' : signal.direction === 'short' ? 'destructive' : 'secondary'}>
                      {signal.direction.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {(signal.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{signal.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Strength: {(signal.strength * 100).toFixed(0)}%</span>
                    <span>Type: {signal.type.replace('_', ' ')}</span>
                  </div>
                  <Button
                    onClick={() => executeSignal(signal.id)}
                    size="sm"
                    disabled={!autoExecution}
                  >
                    Execute
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Bonzo Positions */}
      <Card>
        <Card.Header>
          <Card.Title>Bonzo Vault Positions</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            {positions.map(position => (
              <div key={position.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{position.symbol}</span>
                    <Badge variant={position.side === 'long' ? 'default' : 'destructive'}>
                      {position.side.toUpperCase()}
                    </Badge>
                  </div>
                  <div className={`font-semibold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Size: {position.size}</div>
                  <div>Entry: ${position.entryPrice}</div>
                  <div>Mark: ${position.markPrice}</div>
                  <div className={position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Risk Metrics */}
      <Card>
        <Card.Header>
          <Card.Title>Risk Assessment</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Risk Score</span>
                <span>{(riskScore * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{width: `${riskScore * 100}%`}}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Max Safe Leverage</div>
                <div className="font-semibold">6.8x</div>
              </div>
              <div>
                <div className="text-gray-600">Liquidity Range</div>
                <div className="font-semibold">0.05 - 0.15</div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}
