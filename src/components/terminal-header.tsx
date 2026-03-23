'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Zap, 
  Brain,
  TrendingUp
} from 'lucide-react'

interface TerminalHeaderProps {
  isConnected: boolean
  selectedSymbol: string
  symbols: string[]
  onSelectSymbol: (symbol: string) => void
  price?: number
  alphaScore?: number
  signal?: string
}

export function TerminalHeader({
  isConnected,
  selectedSymbol,
  symbols,
  onSelectSymbol,
  price,
  alphaScore,
  signal
}: TerminalHeaderProps) {
  const getSignalColor = (sig?: string) => {
    if (!sig) return 'bg-zinc-700 text-zinc-300'
    if (sig.includes('LONG')) return 'bg-emerald-600/30 text-emerald-400 border-emerald-500/30'
    if (sig.includes('SHORT')) return 'bg-red-600/30 text-red-400 border-red-500/30'
    return 'bg-amber-600/30 text-amber-400 border-amber-500/30'
  }

  const getAlphaColor = (score?: number) => {
    if (score === undefined) return 'text-zinc-400'
    if (score > 70) return 'text-emerald-400'
    if (score > 30) return 'text-emerald-300'
    if (score > -30) return 'text-amber-400'
    if (score > -70) return 'text-red-300'
    return 'text-red-400'
  }

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left - Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="h-8 w-8 text-cyan-500" />
              <Zap className="h-4 w-4 text-amber-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                PACIFICA
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest -mt-1">
                Intelligence Terminal
              </p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-zinc-800" />
          
          {/* Symbol Tabs */}
          <div className="flex items-center gap-1">
            {symbols.map((symbol) => (
              <Button
                key={symbol}
                variant="ghost"
                size="sm"
                onClick={() => onSelectSymbol(symbol)}
                className={`px-3 py-1.5 h-7 text-xs font-medium transition-all ${
                  selectedSymbol === symbol
                    ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>

        {/* Center - Current Symbol Info */}
        <div className="flex items-center gap-6">
          {price && (
            <div className="text-center">
              <p className="text-2xl font-mono font-bold text-white">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {selectedSymbol}
              </p>
            </div>
          )}
          
          {alphaScore !== undefined && (
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className={`text-xl font-mono font-bold ${getAlphaColor(alphaScore)}`}>
                  {alphaScore.toFixed(1)}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  Alpha
                </p>
              </div>
              
              {signal && (
                <Badge 
                  variant="outline" 
                  className={`px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${getSignalColor(signal)}`}
                >
                  {signal.replace('_', ' ')}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Right - Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-500 animate-pulse" />
            <span className="text-xs text-zinc-400">Real-Time</span>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isConnected 
              ? 'bg-emerald-600/20 text-emerald-400' 
              : 'bg-red-600/20 text-red-400'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Disconnected</span>
              </>
            )}
          </div>
          
          <Badge 
            variant="outline" 
            className="bg-violet-600/20 text-violet-400 border-violet-500/30 px-3"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Testnet
          </Badge>
        </div>
      </div>
    </header>
  )
}

export default TerminalHeader
