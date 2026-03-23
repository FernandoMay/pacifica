'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface RiskMatrixProps {
  riskScore: number
  liquidationDistance: number
  maxSafeLeverage: number
  optimalPositionSize: number
  riskToReward: number
  volatilityAdjustedStop: number
  currentPrice: number
}

type RiskLevel = 'low' | 'medium' | 'high'

function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return 'low'
  if (score <= 60) return 'medium'
  return 'high'
}

function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'text-emerald-400'
    case 'medium':
      return 'text-amber-400'
    case 'high':
      return 'text-red-400'
  }
}

function getRiskBgColor(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'bg-emerald-500'
    case 'medium':
      return 'bg-amber-500'
    case 'high':
      return 'bg-red-500'
  }
}

function getRiskBarBg(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'bg-emerald-500/20'
    case 'medium':
      return 'bg-amber-500/20'
    case 'high':
      return 'bg-red-500/20'
  }
}

function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'LOW RISK'
    case 'medium':
      return 'MEDIUM RISK'
    case 'high':
      return 'HIGH RISK'
  }
}

interface MetricCardProps {
  label: string
  value: string | number
  subValue?: string
  progress?: number
  progressColor?: string
  progressBg?: string
  valueColor?: string
  icon?: React.ReactNode
}

function MetricCard({
  label,
  value,
  subValue,
  progress,
  progressColor,
  progressBg,
  valueColor,
  icon,
}: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border/50 bg-secondary/30 p-4 transition-all hover:border-border hover:bg-secondary/50">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn('text-2xl font-bold font-mono tracking-tight', valueColor)}>
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-muted-foreground">{subValue}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <div
            className={cn(
              'relative h-1.5 w-full overflow-hidden rounded-full',
              progressBg || 'bg-primary/20'
            )}
          >
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out',
                progressColor || 'bg-primary'
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Icons as simple SVG components for terminal aesthetic
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function TrendingDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  )
}

function GaugeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  )
}

function PercentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
}

function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  )
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export function RiskMatrix({
  riskScore,
  liquidationDistance,
  maxSafeLeverage,
  optimalPositionSize,
  riskToReward,
  volatilityAdjustedStop,
  currentPrice,
}: RiskMatrixProps) {
  const riskLevel = getRiskLevel(riskScore)
  const riskColor = getRiskColor(riskLevel)
  const riskBgColor = getRiskBgColor(riskLevel)
  const riskBarBg = getRiskBarBg(riskLevel)
  const riskLabel = getRiskLabel(riskLevel)

  // Calculate stop distance percentage
  const stopDistancePercent = ((currentPrice - volatilityAdjustedStop) / currentPrice) * 100

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            Risk Matrix
          </CardTitle>
          <div className={cn('text-xs font-bold tracking-widest', riskColor)}>
            {riskLabel}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Main Risk Score Display */}
        <div className="mb-6 rounded-lg border border-border/50 bg-secondary/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Overall Risk Score
            </span>
            <span className={cn('text-3xl font-bold font-mono', riskColor)}>
              {riskScore}
            </span>
          </div>
          <div className={cn('relative h-3 w-full overflow-hidden rounded-full', riskBarBg)}>
            <div
              className={cn('h-full transition-all duration-700 ease-out', riskBgColor)}
              style={{ width: `${riskScore}%` }}
            />
            {/* Risk zone markers */}
            <div className="absolute inset-0 flex">
              <div className="w-[30%] border-r border-border/30" />
              <div className="w-[30%] border-r border-border/30" />
              <div className="w-[40%]" />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>LOW</span>
            <span>MEDIUM</span>
            <span>HIGH</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Liquidation Distance"
            value={`${liquidationDistance.toFixed(1)}%`}
            subValue="Distance to liquidation"
            progress={Math.min(100, liquidationDistance)}
            progressColor="bg-violet-500"
            progressBg="bg-violet-500/20"
            valueColor="text-violet-400"
            icon={<TrendingDownIcon />}
          />

          <MetricCard
            label="Max Safe Leverage"
            value={`${maxSafeLeverage}x`}
            subValue="Recommended maximum"
            progress={(maxSafeLeverage / 20) * 100}
            progressColor="bg-sky-500"
            progressBg="bg-sky-500/20"
            valueColor="text-sky-400"
            icon={<GaugeIcon />}
          />

          <MetricCard
            label="Optimal Position Size"
            value={`${optimalPositionSize.toFixed(1)}%`}
            subValue="Of portfolio"
            progress={optimalPositionSize * 5}
            progressColor="bg-cyan-500"
            progressBg="bg-cyan-500/20"
            valueColor="text-cyan-400"
            icon={<PercentIcon />}
          />

          <MetricCard
            label="Risk-to-Reward"
            value={`1:${riskToReward.toFixed(1)}`}
            subValue="Ratio"
            progress={(riskToReward / 5) * 100}
            progressColor={riskToReward >= 2 ? 'bg-emerald-500' : riskToReward >= 1 ? 'bg-amber-500' : 'bg-red-500'}
            progressBg={riskToReward >= 2 ? 'bg-emerald-500/20' : riskToReward >= 1 ? 'bg-amber-500/20' : 'bg-red-500/20'}
            valueColor={riskToReward >= 2 ? 'text-emerald-400' : riskToReward >= 1 ? 'text-amber-400' : 'text-red-400'}
            icon={<ScaleIcon />}
          />
        </div>

        {/* Volatility Adjusted Stop */}
        <div className="mt-3 rounded-lg border border-border/50 bg-secondary/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-orange-500/10 p-2 text-orange-400">
                <TargetIcon />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Volatility Adjusted Stop
                </p>
                <p className="text-lg font-bold font-mono text-orange-400">
                  ${volatilityAdjustedStop.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Stop Distance</p>
              <p className="text-sm font-mono text-muted-foreground">
                -{stopDistancePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Current Price Reference */}
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border/50 bg-secondary/10 px-4 py-2">
          <span className="text-xs text-muted-foreground">Current Price</span>
          <span className="font-mono text-sm font-medium">
            ${currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default RiskMatrix
