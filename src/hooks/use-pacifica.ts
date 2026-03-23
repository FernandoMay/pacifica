'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type {
  MarketState,
  AlphaSignal,
  RiskAssessment,
  MarginEfficiency,
  Orderbook,
  WhaleActivity,
  SystemState,
  Trade
} from '@/lib/types'

interface PacificaData {
  marketStates: Map<string, MarketState>
  alphaSignals: Map<string, AlphaSignal>
  riskAssessments: Map<string, RiskAssessment>
  marginEfficiencies: Map<string, MarginEfficiency>
  orderbooks: Map<string, Orderbook>
  whaleActivities: WhaleActivity[]
  systemState: SystemState | null
  isConnected: boolean
  recentTrades: Trade[]
}

export function usePacifica() {
  const socketRef = useRef<Socket | null>(null)
  const [data, setData] = useState<PacificaData>({
    marketStates: new Map(),
    alphaSignals: new Map(),
    riskAssessments: new Map(),
    marginEfficiencies: new Map(),
    orderbooks: new Map(),
    whaleActivities: [],
    systemState: null,
    isConnected: false,
    recentTrades: []
  })

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to Pacifica Market Data Service')
      setData(prev => ({ ...prev, isConnected: true }))
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from Pacifica Market Data Service')
      setData(prev => ({ ...prev, isConnected: false }))
    })

    // Market state updates
    socket.on('market-state', (state: MarketState) => {
      setData(prev => {
        const newMap = new Map(prev.marketStates)
        newMap.set(state.symbol, state)
        return { ...prev, marketStates: newMap }
      })
    })

    // Alpha signal updates
    socket.on('alpha-signal', (signal: AlphaSignal) => {
      setData(prev => {
        const newMap = new Map(prev.alphaSignals)
        newMap.set(signal.symbol, signal)
        return { ...prev, alphaSignals: newMap }
      })
    })

    // Risk assessment updates
    socket.on('risk-assessment', (risk: RiskAssessment) => {
      setData(prev => {
        const newMap = new Map(prev.riskAssessments)
        newMap.set(risk.symbol, risk)
        return { ...prev, riskAssessments: newMap }
      })
    })

    // Margin efficiency updates
    socket.on('margin-efficiency', (margin: MarginEfficiency) => {
      setData(prev => {
        const newMap = new Map(prev.marginEfficiencies)
        newMap.set(margin.symbol, margin)
        return { ...prev, marginEfficiencies: newMap }
      })
    })

    // Orderbook updates
    socket.on('orderbook', (orderbook: Orderbook) => {
      setData(prev => {
        const newMap = new Map(prev.orderbooks)
        newMap.set(orderbook.symbol, orderbook)
        return { ...prev, orderbooks: newMap }
      })
    })

    // Whale activity updates
    socket.on('whale-activity', (activity: WhaleActivity) => {
      setData(prev => ({
        ...prev,
        whaleActivities: [activity, ...prev.whaleActivities].slice(0, 50)
      }))
    })

    // Initial whale activities
    socket.on('whale-activities', (activities: WhaleActivity[]) => {
      setData(prev => ({ ...prev, whaleActivities: activities }))
    })

    // System state
    socket.on('system-state', (state: SystemState) => {
      setData(prev => ({ ...prev, systemState: state }))
    })

    // Auto trade executed
    socket.on('auto-trade-executed', (trade: Trade) => {
      setData(prev => ({
        ...prev,
        recentTrades: [trade, ...prev.recentTrades].slice(0, 20)
      }))
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Update system state
  const updateSystemState = useCallback((updates: Partial<SystemState>) => {
    if (socketRef.current) {
      socketRef.current.emit('update-system-state', updates)
    }
  }, [])

  // Execute manual trade
  const executeTrade = useCallback((symbol: string, side: 'LONG' | 'SHORT', size: number) => {
    if (socketRef.current) {
      socketRef.current.emit('execute-trade', { symbol, side, size })
    }
  }, [])

  return {
    ...data,
    updateSystemState,
    executeTrade
  }
}
