'use client'

import * as React from 'react'
import { ArrowUp, ArrowDown, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface WhaleActivity {
  id: string
  symbol: string
  activityType: 'LONG' | 'SHORT' | 'LIQUIDATION'
  size: number
  leverage: number
  confidence: number
  price: number
  timestamp: Date | string
}

interface WhaleActivityFeedProps {
  activities: WhaleActivity[]
  className?: string
  compact?: boolean
}

// Utility function to format relative time
function formatRelativeTime(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) {
    return `${diffSec}s ago`
  } else if (diffMin < 60) {
    return `${diffMin}m ago`
  } else if (diffHour < 24) {
    return `${diffHour}h ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

// Utility function to format size in millions
function formatSize(size: number): string {
  return `${(size / 1000000).toFixed(1)}M`
}

// Utility function to format price with appropriate precision
function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  } else if (price >= 1) {
    return price.toFixed(4)
  } else {
    return price.toFixed(6)
  }
}

// Activity type configuration
const activityConfig = {
  LONG: {
    icon: ArrowUp,
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-l-emerald-500',
    iconColor: 'text-emerald-500',
    textColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-500/20',
    label: 'LONG',
  },
  SHORT: {
    icon: ArrowDown,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500',
    textColor: 'text-red-400',
    glowColor: 'shadow-red-500/20',
    label: 'SHORT',
  },
  LIQUIDATION: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-400',
    glowColor: 'shadow-amber-500/20',
    label: 'LIQ',
  },
}

function WhaleActivityItem({ activity }: { activity: WhaleActivity }) {
  const config = activityConfig[activity.activityType]
  const IconComponent = config.icon

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-lg border-l-4 bg-card/50 px-4 py-3',
        'transition-all duration-200 hover:bg-card/80 hover:shadow-lg',
        config.borderColor,
        config.glowColor
      )}
    >
      {/* Activity Type Icon */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          config.bgColor
        )}
      >
        <IconComponent className={cn('h-5 w-5', config.iconColor)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              {activity.symbol}
            </span>
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-xs font-bold tracking-wide',
                config.bgColor,
                config.textColor
              )}
            >
              {config.label}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>

        {/* Details Row */}
        <div className="mt-2 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Size</span>
            <span className="font-mono font-semibold text-foreground">
              {formatSize(activity.size)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Lev</span>
            <span className="font-mono font-semibold text-foreground">
              {activity.leverage}x
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Conf</span>
            <span
              className={cn(
                'font-mono font-semibold',
                activity.confidence >= 80
                  ? 'text-emerald-400'
                  : activity.confidence >= 60
                    ? 'text-amber-400'
                    : 'text-red-400'
              )}
            >
              {activity.confidence}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Price</span>
            <span className="font-mono font-semibold text-foreground">
              ${formatPrice(activity.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Pulse indicator for recent activity */}
      {(() => {
        const date =
          typeof activity.timestamp === 'string'
            ? new Date(activity.timestamp)
            : activity.timestamp
        const diffSec = Math.floor((Date.now() - date.getTime()) / 1000)
        return diffSec < 30 ? (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          </span>
        ) : null
      })()}
    </div>
  )
}

export function WhaleActivityFeed({
  activities,
  className,
  compact = false,
}: WhaleActivityFeedProps) {
  // Compact mode - horizontal scrolling feed
  if (compact) {
    return (
      <div className={cn('flex items-center', className)}>
        <ScrollArea className="flex-1">
          <div className="flex gap-3 pb-2">
            {activities.length === 0 ? (
              <div className="text-xs text-muted-foreground">No whale activity</div>
            ) : (
              activities.slice(0, 10).map((activity) => {
                const config = activityConfig[activity.activityType]
                const IconComponent = config.icon
                return (
                  <div
                    key={activity.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg border-l-2 transition-all hover:bg-card/50 shrink-0',
                      config.borderColor,
                      config.bgColor
                    )}
                  >
                    <IconComponent className={cn('h-3.5 w-3.5', config.iconColor)} />
                    <span className="font-mono text-xs font-medium text-foreground">
                      {activity.symbol}
                    </span>
                    <span className={cn('text-xs font-bold', config.textColor)}>
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatSize(activity.size)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    )
  }

  // Full mode - vertical list
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-xl border border-border bg-background/95 backdrop-blur-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold text-foreground">
            Whale Activity Feed
          </h3>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
          {activities.length} alerts
        </span>
      </div>

      {/* Activity List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {activities.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No whale activity detected
            </div>
          ) : (
            activities.map((activity) => (
              <WhaleActivityItem key={activity.id} activity={activity} />
            ))
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )
}

// Re-export types for consumers
export type { WhaleActivity, WhaleActivityFeedProps }
