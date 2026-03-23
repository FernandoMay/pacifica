'use client'

import { useState, useEffect } from 'react'

interface Transaction {
  id: string
  type: 'transfer' | 'smart_contract' | 'token'
  status: 'completed' | 'pending' | 'failed'
  amount: string
  from: string
  to: string
  timestamp: string
  fee: string
}

interface Token {
  id: string
  name: string
  symbol: string
  balance: string
  decimals: number
  value: string
}

export function HieroLibrary() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tokens, setTokens] = useState<Token[]>([])
  const [networkStatus, setNetworkStatus] = useState('connected')

  useEffect(() => {
    // Simulated Hiero transactions
    const hieroTransactions: Transaction[] = [
      {
        id: '1',
        type: 'transfer',
        status: 'completed',
        amount: '1000',
        from: '0.0.12345',
        to: '0.0.67890',
        timestamp: '2 minutes ago',
        fee: '0.0001 HBAR'
      },
      {
        id: '2',
        type: 'smart_contract',
        status: 'completed',
        amount: '0',
        from: '0.0.12345',
        to: '0.0.11111',
        timestamp: '5 minutes ago',
        fee: '0.0005 HBAR'
      },
      {
        id: '3',
        type: 'token',
        status: 'pending',
        amount: '500',
        from: '0.0.67890',
        to: '0.0.12345',
        timestamp: '1 minute ago',
        fee: '0.0001 HBAR'
      }
    ]

    const hieroTokens: Token[] = [
      {
        id: '1',
        name: 'HBAR',
        symbol: 'HBAR',
        balance: '10000.50',
        decimals: 8,
        value: '$750.38'
      },
      {
        id: '2',
        name: 'Hedera Token Service',
        symbol: 'HTS',
        balance: '5000',
        decimals: 6,
        value: '$2,500.00'
      }
    ]

    setTransactions(hieroTransactions)
    setTokens(hieroTokens)
  }, [])

  const statusColor = {
    connected: 'text-green-600',
    disconnected: 'text-red-600',
    connecting: 'text-yellow-600'
  }

  const statusBadge = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hiero Library</h2>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${statusColor[networkStatus as keyof typeof statusColor]}`}>
            <i className="fas fa-circle text-xs mr-1"></i>
            {networkStatus}
          </span>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
            <i className="fas fa-sync mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-600">Network</div>
          <div className="text-lg font-semibold">Hedera Mainnet</div>
          <div className="text-xs text-gray-500">v0.45.0</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-600">TPS</div>
          <div className="text-lg font-semibold">15,000</div>
          <div className="text-xs text-green-600">+12% from avg</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-600">Gas Price</div>
          <div className="text-lg font-semibold">10,000 gwei</div>
          <div className="text-xs text-gray-500">0.0001 HBAR</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-600">Finality</div>
          <div className="text-lg font-semibold">3-5 seconds</div>
          <div className="text-xs text-gray-500">Instant</div>
        </div>
      </div>

      {/* Tokens */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Token Balances</h3>
        </div>
        <div className="divide-y">
          {tokens.map(token => (
            <div key={token.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      {token.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{token.name}</div>
                    <div className="text-sm text-gray-600">{token.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{token.balance}</div>
                  <div className="text-sm text-gray-600">{token.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Transactions</h3>
        </div>
        <div className="divide-y">
          {transactions.map(transaction => (
            <div key={transaction.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <i className={`fas ${
                    transaction.type === 'transfer' ? 'fa-exchange-alt' :
                    transaction.type === 'smart_contract' ? 'fa-code' :
                    'fa-coins'
                  } text-purple-600`}></i>
                  <span className="font-medium capitalize">{transaction.type.replace('_', ' ')}</span>
                  <span className={`px-2 py-1 rounded text-xs ${statusBadge[transaction.status]}`}>
                    {transaction.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{transaction.timestamp}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {transaction.amount} {transaction.type === 'token' ? 'HTS' : 'HBAR'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">From:</span>
                  <span className="font-mono text-xs">{transaction.from}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">To:</span>
                  <span className="font-mono text-xs">{transaction.to}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fee:</span>
                  <span>{transaction.fee}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
          <i className="fas fa-paper-plane text-purple-600 mb-2"></i>
          <div className="font-medium">Send HBAR</div>
          <div className="text-sm text-gray-600">Transfer tokens to another account</div>
        </button>
        <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
          <i className="fas fa-code text-purple-600 mb-2"></i>
          <div className="font-medium">Deploy Contract</div>
          <div className="text-sm text-gray-600">Deploy smart contract to Hedera</div>
        </button>
        <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
          <i className="fas fa-clock text-purple-600 mb-2"></i>
          <div className="font-medium">Schedule Transaction</div>
          <div className="text-sm text-gray-600">Set up future transactions</div>
        </button>
      </div>
    </div>
  )
}
