'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Bot, 
  Settings2, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import type { SystemState } from '@/lib/types'

interface SmartModeToggleProps {
  systemState: SystemState | null
  onUpdateState: (updates: Partial<SystemState>) => void
  onExecuteTrade: (symbol: string, side: 'LONG' | 'SHORT', size: number) => void
  selectedSymbol: string
  alphaScore: number
  riskScore: number
  efficiencyScore: number
}

export function SmartModeToggle({
  systemState,
  onUpdateState,
  onExecuteTrade,
  selectedSymbol,
  alphaScore,
  riskScore,
  efficiencyScore
}: SmartModeToggleProps) {
  // Get thresholds from systemState with defaults
  const minAlphaScore = systemState?.minAlphaScore ?? 75
  const maxRiskScore = systemState?.maxRiskScore ?? 40
  const minEfficiency = systemState?.minEfficiency ?? 65

  const canExecute = 
    alphaScore > minAlphaScore &&
    riskScore < maxRiskScore &&
    efficiencyScore > minEfficiency

  const handleSmartModeToggle = (enabled: boolean) => {
    onUpdateState({ smartMode: enabled })
  }

  const handleAutoExecuteToggle = (enabled: boolean) => {
    onUpdateState({ autoExecute: enabled })
  }

  const handleThresholdChange = (key: keyof SystemState, value: number[]) => {
    const newValue = value[0]
    onUpdateState({ [key]: newValue })
  }

  const handleManualExecute = (side: 'LONG' | 'SHORT') => {
    const size = systemState?.accountBalance ? systemState.accountBalance * 0.02 : 100
    onExecuteTrade(selectedSymbol, side, size)
  }

  if (!systemState) {
    return (
      <Card className="bg-zinc-900/95 border-zinc-800">
        <CardContent className="p-6">
          <div className="animate-pulse flex items-center justify-center">
            <div className="h-8 w-48 bg-zinc-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900/95 border-zinc-800 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
          <Zap className="h-5 w-5 text-amber-500" />
          Smart Execution
          {systemState.smartMode && (
            <Badge variant="outline" className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30">
              ACTIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Smart Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
          <div className="flex items-center gap-3">
            <Bot className={`h-5 w-5 ${systemState.smartMode ? 'text-amber-400' : 'text-zinc-500'}`} />
            <div>
              <p className="text-sm font-medium text-white">Smart Mode</p>
              <p className="text-xs text-zinc-400">Enable intelligent monitoring</p>
            </div>
          </div>
          <Switch
            checked={systemState.smartMode}
            onCheckedChange={handleSmartModeToggle}
            className="data-[state=checked]:bg-amber-500"
          />
        </div>

        {/* Auto Execute Toggle */}
        <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
          systemState.smartMode 
            ? 'bg-emerald-900/20 border-emerald-700/30' 
            : 'bg-zinc-800/30 border-zinc-700/30 opacity-50'
        }`}>
          <div className="flex items-center gap-3">
            <Shield className={`h-5 w-5 ${systemState.autoExecute && systemState.smartMode ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <div>
              <p className="text-sm font-medium text-white">Auto-Execute</p>
              <p className="text-xs text-zinc-400">Automatic trade execution</p>
            </div>
          </div>
          <Switch
            checked={systemState.autoExecute}
            onCheckedChange={handleAutoExecuteToggle}
            disabled={!systemState.smartMode}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        {/* Thresholds */}
        {systemState.smartMode && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider">
              <Settings2 className="h-3.5 w-3.5" />
              Execution Thresholds
            </div>

            {/* Min Alpha Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Min Alpha Score</span>
                <span className="text-emerald-400 font-mono">{minAlphaScore}</span>
              </div>
              <Slider
                value={[minAlphaScore]}
                onValueChange={(v) => handleThresholdChange('minAlphaScore', v)}
                min={50}
                max={95}
                step={5}
                className="w-full"
              />
            </div>

            {/* Max Risk Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Max Risk Score</span>
                <span className="text-amber-400 font-mono">{maxRiskScore}</span>
              </div>
              <Slider
                value={[maxRiskScore]}
                onValueChange={(v) => handleThresholdChange('maxRiskScore', v)}
                min={10}
                max={70}
                step={5}
                className="w-full"
              />
            </div>

            {/* Min Efficiency */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Min Efficiency</span>
                <span className="text-cyan-400 font-mono">{minEfficiency}</span>
              </div>
              <Slider
                value={[minEfficiency]}
                onValueChange={(v) => handleThresholdChange('minEfficiency', v)}
                min={40}
                max={90}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Execution Status */}
        <div className={`p-3 rounded-lg border ${
          canExecute 
            ? 'bg-emerald-900/20 border-emerald-700/30' 
            : 'bg-zinc-800/30 border-zinc-700/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {canExecute ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-zinc-500" />
            )}
            <span className="text-sm font-medium text-white">Execution Criteria</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`flex items-center gap-1 ${alphaScore > minAlphaScore ? 'text-emerald-400' : 'text-zinc-500'}`}>
              <TrendingUp className="h-3 w-3" />
              Alpha: {alphaScore.toFixed(0)}
            </div>
            <div className={`flex items-center gap-1 ${riskScore < maxRiskScore ? 'text-emerald-400' : 'text-amber-400'}`}>
              <Shield className="h-3 w-3" />
              Risk: {riskScore.toFixed(0)}
            </div>
            <div className={`flex items-center gap-1 ${efficiencyScore > minEfficiency ? 'text-emerald-400' : 'text-zinc-500'}`}>
              <Zap className="h-3 w-3" />
              Eff: {efficiencyScore.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Manual Execute Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManualExecute('LONG')}
            disabled={!canExecute}
            className="bg-emerald-600/20 border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/30 hover:text-emerald-300 disabled:opacity-50"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Execute Long
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManualExecute('SHORT')}
            disabled={!canExecute}
            className="bg-red-600/20 border-red-600/30 text-red-400 hover:bg-red-600/30 hover:text-red-300 disabled:opacity-50"
          >
            <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
            Execute Short
          </Button>
        </div>

        {/* Warning */}
        {systemState.autoExecute && (
          <div className="flex items-start gap-2 p-2 rounded bg-amber-900/20 border border-amber-700/30">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-200">
              Auto-execution enabled. Trades will execute automatically when criteria are met.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SmartModeToggle
