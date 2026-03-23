'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface AlphaGaugeProps {
  score: number // -100 to 100
  confidence: number // 0 to 100
  signal: 'STRONG_LONG' | 'LONG' | 'NEUTRAL' | 'SHORT' | 'STRONG_SHORT'
}

// Color constants for the gauge zones
const COLORS = {
  bearish: '#ef4444', // red-500
  neutral: '#eab308', // yellow-500
  bullish: '#22c55e', // green-500
  background: '#1e293b', // slate-800
  needle: '#f8fafc', // slate-50
}

// Gauge arc data - 180 degree semi-circle
// Zones: -100 to -30 (bearish), -30 to 30 (neutral), 30 to 100 (bullish)
// We map -100 to 100 to 0 to 180 degrees
interface GaugeArc {
  value: number
  color: string
}

const createGaugeArcs = (): GaugeArc[] => {
  // Each arc segment is 1 degree, total 180 segments
  const arcs: GaugeArc[] = []
  
  for (let i = 0; i < 180; i++) {
    // Map degree position to score value
    const scoreAtPosition = -100 + (i * 200 / 180)
    const scoreAtNextPosition = -100 + ((i + 1) * 200 / 180)
    
    let color: string
    
    // Determine zone color based on score position
    if (scoreAtNextPosition <= -30) {
      color = COLORS.bearish
    } else if (scoreAtPosition >= 30) {
      color = COLORS.bullish
    } else {
      color = COLORS.neutral
    }
    
    arcs.push({
      value: 1,
      color,
    })
  }
  
  return arcs
}

// Signal display configuration
const SIGNAL_CONFIG: Record<AlphaGaugeProps['signal'], { label: string; color: string }> = {
  STRONG_LONG: { label: 'STRONG LONG', color: 'text-green-400' },
  LONG: { label: 'LONG', color: 'text-green-500' },
  NEUTRAL: { label: 'NEUTRAL', color: 'text-yellow-500' },
  SHORT: { label: 'SHORT', color: 'text-red-500' },
  STRONG_SHORT: { label: 'STRONG SHORT', color: 'text-red-400' },
}

// Score color based on value
const getScoreColor = (score: number): string => {
  if (score >= 30) return 'text-green-400'
  if (score <= -30) return 'text-red-400'
  return 'text-yellow-400'
}

export function AlphaGauge({ score, confidence, signal }: AlphaGaugeProps) {
  // Clamp score to valid range
  const clampedScore = Math.max(-100, Math.min(100, score))
  const clampedConfidence = Math.max(0, Math.min(100, confidence))
  
  // Calculate needle angle (0 to 180 degrees)
  // -100 maps to 0 degrees, 100 maps to 180 degrees
  const needleAngle = ((clampedScore + 100) / 200) * 180
  
  // Pre-compute gauge arcs
  const gaugeArcs = useMemo(() => createGaugeArcs(), [])
  
  const signalConfig = SIGNAL_CONFIG[signal]
  const scoreColor = getScoreColor(clampedScore)
  
  return (
    <div className="relative flex flex-col items-center justify-center bg-slate-900 rounded-xl p-6 border border-slate-700/50 shadow-2xl">
      {/* Title */}
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
        Alpha Score
      </h3>
      
      {/* Gauge Container */}
      <div className="relative w-64 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeArcs}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={0}
              dataKey="value"
              isAnimationActive={false}
            >
              {gaugeArcs.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Inner dark background arc */}
        <div 
          className="absolute inset-0 flex items-end justify-center pointer-events-none"
          style={{ paddingBottom: '10px' }}
        >
          <div className="w-44 h-22 rounded-t-full bg-slate-900" />
        </div>
        
        {/* Needle */}
        <div 
          className="absolute left-1/2 bottom-0 origin-bottom pointer-events-none"
          style={{
            transform: `translateX(-50%) rotate(${needleAngle - 90}deg)`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.5s ease-out',
          }}
        >
          <div className="relative">
            {/* Needle shape */}
            <div 
              className="w-1 h-20 bg-gradient-to-t from-slate-50 to-slate-300 rounded-t-full shadow-lg"
              style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                boxShadow: '0 0 10px rgba(248, 250, 252, 0.5)',
              }}
            />
            {/* Needle base circle */}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-50 border-2 border-slate-300 shadow-lg"
            />
          </div>
        </div>
        
        {/* Center Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none">
          <span 
            className={cn(
              'text-4xl font-bold font-mono tracking-tight',
              scoreColor
            )}
          >
            {clampedScore >= 0 ? '+' : ''}{clampedScore.toFixed(0)}
          </span>
        </div>
      </div>
      
      {/* Scale labels */}
      <div className="w-64 flex justify-between text-xs text-slate-500 font-mono mt-1">
        <span>-100</span>
        <span>0</span>
        <span>+100</span>
      </div>
      
      {/* Signal Label */}
      <div className={cn(
        'mt-4 px-4 py-1.5 rounded-full border font-bold text-sm tracking-wide',
        signal === 'STRONG_LONG' && 'bg-green-500/10 border-green-500/30 text-green-400',
        signal === 'LONG' && 'bg-green-500/10 border-green-600/30 text-green-500',
        signal === 'NEUTRAL' && 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
        signal === 'SHORT' && 'bg-red-500/10 border-red-600/30 text-red-500',
        signal === 'STRONG_SHORT' && 'bg-red-500/10 border-red-500/30 text-red-400',
      )}>
        {signalConfig.label}
      </div>
      
      {/* Confidence */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-wide">Confidence</span>
        <span className="text-sm font-mono font-semibold text-slate-300">
          {clampedConfidence.toFixed(0)}%
        </span>
      </div>
      
      {/* Confidence Bar */}
      <div className="mt-2 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500',
            clampedConfidence >= 70 ? 'bg-green-500' :
            clampedConfidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          )}
          style={{ width: `${clampedConfidence}%` }}
        />
      </div>
    </div>
  )
}

export default AlphaGauge
