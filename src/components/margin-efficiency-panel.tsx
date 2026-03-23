'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MarginEfficiencyPanelProps {
  efficiencyScore: number
  expectedReturn: number
  marginRequired: number
  capitalUsage: number
  liquidationRiskIncrease: number
}

// Helper function to get efficiency color based on score
function getEfficiencyColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

// Helper function to get progress bar gradient based on score
function getEfficiencyGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-emerald-400'
  if (score >= 60) return 'from-amber-500 to-amber-400'
  if (score >= 40) return 'from-orange-500 to-orange-400'
  return 'from-red-500 to-red-400'
}

// Helper function to get risk level color
function getRiskColor(risk: number): string {
  if (risk <= 5) return 'text-emerald-400'
  if (risk <= 15) return 'text-amber-400'
  if (risk <= 30) return 'text-orange-400'
  return 'text-red-400'
}

// Capital Efficiency Gauge Component
function CapitalEfficiencyGauge({ value }: { value: number }) {
  const rotation = (value / 100) * 180 - 90 // -90 to 90 degrees
  
  return (
    <div className="relative w-32 h-20 mx-auto">
      {/* Gauge background arc */}
      <svg
        viewBox="0 0 120 70"
        className="w-full h-full"
      >
        {/* Background arc */}
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-zinc-800"
        />
        {/* Colored segments */}
        <path
          d="M 10 65 A 50 50 0 0 1 60 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-red-500"
        />
        <path
          d="M 35 30 A 50 50 0 0 1 85 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-amber-500"
        />
        <path
          d="M 60 15 A 50 50 0 0 1 110 65"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-emerald-500"
        />
        {/* Needle */}
        <g transform={`rotate(${rotation} 60 65)`}>
          <line
            x1="60"
            y1="65"
            x2="60"
            y2="25"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="60" cy="65" r="5" fill="white" />
        </g>
      </svg>
      {/* Value display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span className={cn('text-lg font-bold', getEfficiencyColor(value))}>
          {value.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

// Progress Bar Component with custom styling
function MetricProgressBar({ 
  value, 
  max = 100,
  colorClass 
}: { 
  value: number
  max?: number
  colorClass?: string 
}) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          colorClass || 'bg-gradient-to-r from-cyan-500 to-cyan-400'
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

// Metric Row Component
function MetricRow({ 
  label, 
  value, 
  unit, 
  colorClass = 'text-white' 
}: { 
  label: string
  value: string | number
  unit?: string
  colorClass?: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
      <span className="text-zinc-400 text-sm font-medium">{label}</span>
      <span className={cn('font-mono font-semibold', colorClass)}>
        {value}{unit && <span className="text-zinc-500 ml-1">{unit}</span>}
      </span>
    </div>
  )
}

export function MarginEfficiencyPanel({
  efficiencyScore,
  expectedReturn,
  marginRequired,
  capitalUsage,
  liquidationRiskIncrease,
}: MarginEfficiencyPanelProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="bg-zinc-900/95 border-zinc-800 backdrop-blur-sm shadow-2xl shadow-black/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          Margin Efficiency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Efficiency Score - Large Display */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-zinc-400 text-sm">Efficiency Score</span>
            <span className={cn('text-3xl font-bold font-mono', getEfficiencyColor(efficiencyScore))}>
              {efficiencyScore.toFixed(1)}
            </span>
          </div>
          <MetricProgressBar 
            value={efficiencyScore} 
            colorClass={cn('bg-gradient-to-r', getEfficiencyGradient(efficiencyScore))}
          />
          <div className="flex justify-between text-xs text-zinc-600">
            <span>Low</span>
            <span>Optimal</span>
          </div>
        </div>

        {/* Capital Efficiency Gauge */}
        <div className="py-3 border-y border-zinc-800">
          <span className="text-zinc-400 text-sm block text-center mb-2">Capital Efficiency</span>
          <CapitalEfficiencyGauge value={efficiencyScore} />
        </div>

        {/* Metrics Grid */}
        <div className="space-y-1">
          <MetricRow
            label="Expected Return"
            value={expectedReturn >= 0 ? '+' : ''}
            unit={`${expectedReturn.toFixed(2)}%`}
            colorClass={expectedReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <MetricRow
            label="Margin Required"
            value={formatCurrency(marginRequired)}
            colorClass="text-cyan-400"
          />
          
          {/* Capital Usage with Progress Bar */}
          <div className="py-2 border-b border-zinc-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm font-medium">Capital Usage</span>
              <span className={cn(
                'font-mono font-semibold',
                capitalUsage > 80 ? 'text-red-400' : capitalUsage > 60 ? 'text-amber-400' : 'text-emerald-400'
              )}>
                {capitalUsage.toFixed(1)}%
              </span>
            </div>
            <MetricProgressBar 
              value={capitalUsage}
              colorClass={cn(
                capitalUsage > 80 
                  ? 'from-red-500 to-red-400' 
                  : capitalUsage > 60 
                    ? 'from-amber-500 to-amber-400' 
                    : 'from-emerald-500 to-emerald-400',
                'bg-gradient-to-r'
              )}
            />
          </div>

          <MetricRow
            label="Liq. Risk Increase"
            value={liquidationRiskIncrease.toFixed(2)}
            unit="%"
            colorClass={getRiskColor(liquidationRiskIncrease)}
          />
        </div>

        {/* Status Indicator */}
        <div className={cn(
          'mt-4 px-3 py-2 rounded-md text-center text-xs font-medium uppercase tracking-wide',
          efficiencyScore >= 80 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : efficiencyScore >= 60 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : efficiencyScore >= 40
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
        )}>
          {efficiencyScore >= 80 && 'Optimal Capital Allocation'}
          {efficiencyScore >= 60 && efficiencyScore < 80 && 'Moderate Efficiency'}
          {efficiencyScore >= 40 && efficiencyScore < 60 && 'Sub-Optimal Allocation'}
          {efficiencyScore < 40 && 'High Risk Position'}
        </div>
      </CardContent>
    </Card>
  )
}

export default MarginEfficiencyPanel
