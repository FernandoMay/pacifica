'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface OrderbookLevel {
  price: number
  volume: number
}

interface OrderbookHeatmapProps {
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  imbalance: number // -1 to 1
  pressure: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  currentPrice: number
}

export function OrderbookHeatmap({
  bids,
  asks,
  imbalance,
  pressure,
  currentPrice,
}: OrderbookHeatmapProps) {
  // Calculate max volume for scaling
  const maxVolume = useMemo(() => {
    const allVolumes = [...bids, ...asks].map(l => l.volume)
    return Math.max(...allVolumes, 1)
  }, [bids, asks])

  // Calculate spread
  const spread = useMemo(() => {
    if (bids.length === 0 || asks.length === 0) return null
    const bestBid = Math.max(...bids.map(b => b.price))
    const bestAsk = Math.min(...asks.map(a => a.price))
    return {
      value: bestAsk - bestBid,
      percent: ((bestAsk - bestBid) / bestBid) * 100,
    }
  }, [bids, asks])

  // Calculate total volumes
  const totalBidVolume = useMemo(() => bids.reduce((sum, b) => sum + b.volume, 0), [bids])
  const totalAskVolume = useMemo(() => asks.reduce((sum, a) => sum + a.volume, 0), [asks])

  // Create merged price levels for display
  const priceLevels = useMemo(() => {
    const allPrices = new Set([
      ...bids.map(b => b.price),
      ...asks.map(a => a.price),
    ])
    return Array.from(allPrices).sort((a, b) => b - a) // Descending order
  }, [bids, asks])

  // Get volume intensity color
  const getVolumeIntensity = (volume: number, side: 'bid' | 'ask') => {
    const intensity = volume / maxVolume
    if (side === 'bid') {
      return `rgba(34, 197, 94, ${0.2 + intensity * 0.8})` // Green with varying opacity
    }
    return `rgba(239, 68, 68, ${0.2 + intensity * 0.8})` // Red with varying opacity
  }

  // Pressure indicator colors
  const pressureConfig = {
    BULLISH: {
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
      icon: '↑',
    },
    BEARISH: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      glow: 'shadow-red-500/20',
      icon: '↓',
    },
    NEUTRAL: {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
      icon: '↔',
    },
  }

  const pressureStyle = pressureConfig[pressure]

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] border border-white/5 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0d1117]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
            Orderbook Depth
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Imbalance Ratio */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/40">IMBALANCE</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${((imbalance + 1) / 2) * 100}%`,
                    background: imbalance >= 0 
                      ? 'linear-gradient(90deg, #22c55e80, #22c55e)' 
                      : 'linear-gradient(90deg, #ef4444, #ef444480)',
                  }}
                />
              </div>
              <span className={cn(
                'text-[10px] font-mono font-bold w-12 text-right',
                imbalance > 0.1 ? 'text-emerald-400' : imbalance < -0.1 ? 'text-red-400' : 'text-white/60'
              )}>
                {imbalance > 0 ? '+' : ''}{(imbalance * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Pressure Indicator */}
          <div className={cn(
            'px-2.5 py-1 rounded border flex items-center gap-1.5 shadow-lg',
            pressureStyle.bg,
            pressureStyle.border,
            pressureStyle.glow
          )}>
            <span className={cn('text-sm font-bold', pressureStyle.text)}>
              {pressureStyle.icon}
            </span>
            <span className={cn('text-[10px] font-mono font-bold tracking-wider', pressureStyle.text)}>
              {pressure}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Column Headers */}
        <div className="flex items-center px-2 py-2 border-b border-white/5 bg-[#0d1117]/50">
          <div className="flex-1 text-right pr-2">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Bid Volume</span>
          </div>
          <div className="w-20 text-center">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Price</span>
          </div>
          <div className="flex-1 text-left pl-2">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Ask Volume</span>
          </div>
        </div>

        {/* Spread Indicator */}
        {spread && (
          <div className="flex items-center justify-center px-2 py-1.5 bg-cyan-500/5 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-cyan-400/60">SPREAD</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400">
                ${spread.value.toFixed(2)}
              </span>
              <span className="text-[9px] font-mono text-cyan-400/60">
                ({spread.percent.toFixed(3)}%)
              </span>
            </div>
          </div>
        )}

        {/* Orderbook Rows */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {priceLevels.slice(0, 15).map((price, idx) => {
              const bid = bids.find(b => b.price === price)
              const ask = asks.find(a => a.price === price)
              const isCurrentPrice = Math.abs(price - currentPrice) < 0.01
              const bidIntensity = bid ? bid.volume / maxVolume : 0
              const askIntensity = ask ? ask.volume / maxVolume : 0

              return (
                <div
                  key={price}
                  className={cn(
                    'flex items-center h-7 relative transition-all duration-200',
                    isCurrentPrice && 'bg-cyan-500/10'
                  )}
                >
                  {/* Bid Volume Bar (left side) */}
                  <div className="flex-1 relative h-full">
                    {bid && (
                      <>
                        <div
                          className="absolute inset-y-0 right-0 transition-all duration-300"
                          style={{
                            width: `${bidIntensity * 100}%`,
                            background: `linear-gradient(90deg, transparent, rgba(34, 197, 94, ${0.1 + bidIntensity * 0.3}))`,
                          }}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-2 z-10">
                          <span className="text-[10px] font-mono font-medium text-emerald-400/80">
                            {bid.volume.toLocaleString()}
                          </span>
                        </div>
                        {/* Heatmap cell overlay */}
                        <div
                          className="absolute inset-y-0 right-0 border-r border-emerald-500/20"
                          style={{
                            width: `${Math.max(bidIntensity * 100, 2)}%`,
                            backgroundColor: getVolumeIntensity(bid.volume, 'bid'),
                          }}
                        />
                      </>
                    )}
                  </div>

                  {/* Price Center */}
                  <div className={cn(
                    'w-20 text-center relative z-20',
                    isCurrentPrice && 'bg-cyan-500/20 border-x border-cyan-500/30'
                  )}>
                    <span className={cn(
                      'text-[10px] font-mono font-bold',
                      isCurrentPrice ? 'text-cyan-400' : 'text-white/70'
                    )}>
                      ${price.toFixed(2)}
                    </span>
                    {isCurrentPrice && (
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 w-1 h-1 rounded-full bg-cyan-400" />
                    )}
                  </div>

                  {/* Ask Volume Bar (right side) */}
                  <div className="flex-1 relative h-full">
                    {ask && (
                      <>
                        <div
                          className="absolute inset-y-0 left-0 transition-all duration-300"
                          style={{
                            width: `${askIntensity * 100}%`,
                            background: `linear-gradient(270deg, transparent, rgba(239, 68, 68, ${0.1 + askIntensity * 0.3}))`,
                          }}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center justify-start pl-2 z-10">
                          <span className="text-[10px] font-mono font-medium text-red-400/80">
                            {ask.volume.toLocaleString()}
                          </span>
                        </div>
                        {/* Heatmap cell overlay */}
                        <div
                          className="absolute inset-y-0 left-0 border-l border-red-500/20"
                          style={{
                            width: `${Math.max(askIntensity * 100, 2)}%`,
                            backgroundColor: getVolumeIntensity(ask.volume, 'ask'),
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Depth Visualization Bar */}
        <div className="px-3 py-2 border-t border-white/5 bg-[#0d1117]/50">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-mono text-white/40">DEPTH VISUALIZATION</span>
          </div>
          <div className="relative h-6 flex items-center">
            {/* Bid depth bar */}
            <div className="absolute right-1/2 h-4 flex items-center">
              <div
                className="h-full rounded-l transition-all duration-300"
                style={{
                  width: `${(totalBidVolume / (totalBidVolume + totalAskVolume)) * 150}px`,
                  background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6))',
                }}
              />
            </div>
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500/50" />
            {/* Ask depth bar */}
            <div className="absolute left-1/2 h-4 flex items-center">
              <div
                className="h-full rounded-r transition-all duration-300"
                style={{
                  width: `${(totalAskVolume / (totalBidVolume + totalAskVolume)) * 150}px`,
                  background: 'linear-gradient(270deg, transparent, rgba(239, 68, 68, 0.6))',
                }}
              />
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-emerald-400/60">BID</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">
                {(totalBidVolume / 1000).toFixed(1)}K
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-red-400">
                {(totalAskVolume / 1000).toFixed(1)}K
              </span>
              <span className="text-[9px] font-mono text-red-400/60">ASK</span>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-3 gap-px bg-white/5">
          <div className="bg-[#0d1117] px-3 py-2 text-center">
            <div className="text-[9px] font-mono text-white/40 mb-0.5">BEST BID</div>
            <div className="text-[11px] font-mono font-bold text-emerald-400">
              {bids.length > 0 ? `$${Math.max(...bids.map(b => b.price)).toFixed(2)}` : '-'}
            </div>
          </div>
          <div className="bg-[#0d1117] px-3 py-2 text-center">
            <div className="text-[9px] font-mono text-white/40 mb-0.5">CURRENT</div>
            <div className="text-[11px] font-mono font-bold text-cyan-400">
              ${currentPrice.toFixed(2)}
            </div>
          </div>
          <div className="bg-[#0d1117] px-3 py-2 text-center">
            <div className="text-[9px] font-mono text-white/40 mb-0.5">BEST ASK</div>
            <div className="text-[11px] font-mono font-bold text-red-400">
              {asks.length > 0 ? `$${Math.min(...asks.map(a => a.price)).toFixed(2)}` : '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
