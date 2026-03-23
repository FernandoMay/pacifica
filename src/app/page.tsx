'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Activity, 
  Zap,
  Fish,
  BarChart3,
  Clock
} from 'lucide-react'
import { usePacifica } from '@/hooks/use-pacifica'
import { TerminalHeader } from '@/components/terminal-header'
import { AlphaGauge } from '@/components/alpha-gauge'
import { RiskMatrix } from '@/components/risk-matrix'
import { OrderbookHeatmap } from '@/components/orderbook-heatmap'
import { MarginEfficiencyPanel } from '@/components/margin-efficiency-panel'
import { WhaleActivityFeed } from '@/components/whale-activity-feed'
import { SmartModeToggle } from '@/components/smart-mode-toggle'

export default function PacificaTerminal() {
  const {
    marketStates,
    alphaSignals,
    riskAssessments,
    marginEfficiencies,
    orderbooks,
    whaleActivities,
    systemState,
    isConnected,
    recentTrades,
    updateSystemState,
    executeTrade
  } = usePacifica()

  const [selectedSymbol, setSelectedSymbol] = useState('BTC-PERP')
  const symbols = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP']

  // Get current data for selected symbol
  const marketState = marketStates.get(selectedSymbol)
  const alphaSignal = alphaSignals.get(selectedSymbol)
  const riskAssessment = riskAssessments.get(selectedSymbol)
  const marginEfficiency = marginEfficiencies.get(selectedSymbol)
  const orderbook = orderbooks.get(selectedSymbol)

  // Auto-select symbol with best alpha
  useEffect(() => {
    const allSignals = Array.from(alphaSignals.values())
    if (allSignals.length > 0) {
      const bestSignal = allSignals.reduce((best, current) => 
        Math.abs(current.alphaScore) > Math.abs(best.alphaScore) ? current : best
      )
      // Only switch if significantly better
      if (Math.abs(bestSignal.alphaScore) > 80) {
        // Could auto-switch to best symbol here
      }
    }
  }, [alphaSignals])

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <TerminalHeader
        isConnected={isConnected}
        selectedSymbol={selectedSymbol}
        symbols={symbols}
        onSelectSymbol={setSelectedSymbol}
        price={marketState?.price}
        alphaScore={alphaSignal?.alphaScore}
        signal={alphaSignal?.signal}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left Column - Alpha & Risk */}
          <div className="col-span-3 space-y-4">
            {/* Alpha Gauge */}
            <Card className="bg-zinc-900/95 border-zinc-800 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                  <Brain className="h-4 w-4 text-cyan-500" />
                  Alpha Engine
                  {alphaSignal && (
                    <Badge 
                      variant="outline" 
                      className={`ml-auto text-[10px] ${
                        alphaSignal.timeHorizon === 'SHORT' 
                          ? 'bg-red-600/20 text-red-400 border-red-500/30'
                          : alphaSignal.timeHorizon === 'MEDIUM'
                          ? 'bg-amber-600/20 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {alphaSignal.timeHorizon}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                {alphaSignal ? (
                  <AlphaGauge
                    score={alphaSignal.alphaScore}
                    confidence={alphaSignal.confidence}
                    signal={alphaSignal.signal}
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-pulse text-zinc-500">Loading...</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Matrix */}
            <Card className="bg-zinc-900/95 border-zinc-800 backdrop-blur-sm flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                  <Shield className="h-4 w-4 text-amber-500" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskAssessment && marketState ? (
                  <RiskMatrix
                    riskScore={riskAssessment.riskScore}
                    liquidationDistance={riskAssessment.liquidationDistance}
                    maxSafeLeverage={riskAssessment.maxSafeLeverage}
                    optimalPositionSize={riskAssessment.optimalPositionSize}
                    riskToReward={riskAssessment.riskToReward}
                    volatilityAdjustedStop={riskAssessment.volatilityAdjustedStop}
                    currentPrice={marketState.price}
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-pulse text-zinc-500">Loading...</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center - Orderbook & Chart */}
          <div className="col-span-6 space-y-4">
            {/* Top Row - Orderbook */}
            <Card className="bg-zinc-900/95 border-zinc-800 backdrop-blur-sm h-[320px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                  <BarChart3 className="h-4 w-4 text-violet-500" />
                  Orderbook Depth
                  {orderbook && (
                    <Badge 
                      variant="outline" 
                      className={`ml-auto text-[10px] ${
                        orderbook.pressure === 'BULLISH' 
                          ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                          : orderbook.pressure === 'BEARISH'
                          ? 'bg-red-600/20 text-red-400 border-red-500/30'
                          : 'bg-amber-600/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {orderbook.pressure}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[260px]">
                {orderbook && marketState ? (
                  <OrderbookHeatmap
                    bids={orderbook.bids}
                    asks={orderbook.asks}
                    imbalance={orderbook.imbalance}
                    pressure={orderbook.pressure}
                    currentPrice={marketState.price}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse text-zinc-500">Loading orderbook...</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bottom Row - Market Stats */}
            <Card className="bg-zinc-900/95 border-zinc-800 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {symbols.map(symbol => {
                    const state = marketStates.get(symbol)
                    const alpha = alphaSignals.get(symbol)
                    const risk = riskAssessments.get(symbol)
                    
                    return (
                      <div 
                        key={symbol}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedSymbol === symbol
                            ? 'bg-cyan-600/10 border-cyan-500/30'
                            : 'bg-zinc-800/30 border-zinc-700/30 hover:border-zinc-600'
                        }`}
                        onClick={() => setSelectedSymbol(symbol)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{symbol}</span>
                          {alpha && (
                            <Badge 
                              variant="outline"
                              className={`text-[10px] ${
                                alpha.alphaScore > 50
                                  ? 'bg-emerald-600/20 text-emerald-400'
                                  : alpha.alphaScore < -50
                                  ? 'bg-red-600/20 text-red-400'
                                  : 'bg-zinc-600/20 text-zinc-400'
                              }`}
                            >
                              {alpha.alphaScore.toFixed(0)}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-zinc-500">Price</p>
                            <p className="font-mono text-white">
                              {state ? `$${state.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Risk</p>
                            <p className={`font-mono ${risk && risk.riskScore < 40 ? 'text-emerald-400' : risk && risk.riskScore < 70 ? 'text-amber-400' : 'text-red-400'}`}>
                              {risk ? risk.riskScore.toFixed(0) : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500">OI Δ</p>
                            <p className={`font-mono ${state && state.oiChange5m > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {state ? `${state.oiChange5m > 0 ? '+' : ''}${state.oiChange5m.toFixed(2)}%` : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Funding</p>
                            <p className={`font-mono ${state && state.fundingRate > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {state ? `${(state.fundingRate * 100).toFixed(4)}%` : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Whale Feed & Smart Mode */}
          <div className="col-span-3 space-y-4">
            {/* Smart Mode Toggle */}
            <SmartModeToggle
              systemState={systemState}
              onUpdateState={updateSystemState}
              onExecuteTrade={executeTrade}
              selectedSymbol={selectedSymbol}
              alphaScore={alphaSignal?.alphaScore || 0}
              riskScore={riskAssessment?.riskScore || 100}
              efficiencyScore={marginEfficiency?.efficiencyScore || 0}
            />

            {/* Margin Efficiency */}
            {marginEfficiency && (
              <MarginEfficiencyPanel
                efficiencyScore={marginEfficiency.efficiencyScore}
                expectedReturn={marginEfficiency.expectedReturn}
                marginRequired={marginEfficiency.marginRequired}
                capitalUsage={marginEfficiency.capitalUsage}
                liquidationRiskIncrease={marginEfficiency.liquidationRiskIncrease}
              />
            )}

            {/* Recent Trades */}
            <Card className="bg-zinc-900/95 border-zinc-800 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                  <Clock className="h-4 w-4 text-cyan-500" />
                  Recent Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTrades.length > 0 ? (
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {recentTrades.slice(0, 5).map((trade, i) => (
                        <div 
                          key={i}
                          className={`p-2 rounded border text-xs ${
                            trade.side === 'LONG'
                              ? 'bg-emerald-600/10 border-emerald-500/20'
                              : 'bg-red-600/10 border-red-500/20'
                          }`}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{trade.symbol}</span>
                            <Badge variant="outline" className={`text-[10px] ${
                              trade.side === 'LONG'
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}>
                              {trade.side}
                            </Badge>
                          </div>
                          <div className="flex justify-between mt-1 text-zinc-400">
                            <span>${trade.price.toLocaleString()}</span>
                            <span>α:{trade.alphaScore.toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-24 flex items-center justify-center text-zinc-500 text-sm">
                    No trades yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Bar - Whale Feed */}
      <footer className="border-t border-zinc-800 bg-zinc-900/95 p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Fish className="h-5 w-5 text-cyan-500" />
            <span className="text-sm font-medium text-white">Whale Feed</span>
            <Badge variant="outline" className="bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
              {whaleActivities.length}
            </Badge>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <WhaleActivityFeed 
              activities={whaleActivities} 
              className="h-12"
              compact={true}
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
