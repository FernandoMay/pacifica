'use client'

import { useState, useEffect } from 'react'

interface Agent {
  id: string
  name: string
  protocol: string
  status: 'active' | 'inactive'
  capabilities: string[]
  lastActive: string
}

interface Message {
  id: string
  from: string
  to: string
  protocol: string
  content: string
  timestamp: string
}

export function RegistryAgent() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Simulated HOL registry agents
    const holAgents: Agent[] = [
      {
        id: '1',
        name: 'HOL Alpha Agent',
        protocol: 'HCS-10',
        status: 'active',
        capabilities: ['alpha_generation', 'risk_analysis', 'execution'],
        lastActive: '2 minutes ago'
      },
      {
        id: '2',
        name: 'HOL Bridge Agent',
        protocol: 'A2A',
        status: 'active',
        capabilities: ['cross_chain', 'arbitrage', 'liquidity'],
        lastActive: '5 minutes ago'
      },
      {
        id: '3',
        name: 'HOL Social Agent',
        protocol: 'XMTP',
        status: 'inactive',
        capabilities: ['messaging', 'social_trading', 'signals'],
        lastActive: '1 hour ago'
      }
    ]

    const holMessages: Message[] = [
      {
        id: '1',
        from: 'HOL Alpha Agent',
        to: 'Pacifica Terminal',
        protocol: 'HCS-10',
        content: 'New alpha signal detected for BTC-PERP with 92% confidence',
        timestamp: '2 minutes ago'
      },
      {
        id: '2',
        from: 'HOL Bridge Agent',
        to: 'HOL Alpha Agent',
        protocol: 'A2A',
        content: 'Cross-chain arbitrage opportunity identified',
        timestamp: '5 minutes ago'
      }
    ]

    setAgents(holAgents)
    setMessages(holMessages)
  }, [])

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.protocol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">HOL Registry Agent</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
            <i className="fas fa-plus mr-2" />
            Register Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map(agent => (
          <div key={agent.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{agent.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                agent.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {agent.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Protocol:</span>
                <span className="font-medium">{agent.protocol}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Active:</span>
                <span>{agent.lastActive}</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Capabilities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.capabilities.map(cap => (
                    <span key={cap} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Message
              </button>
              <button className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Messages</h3>
        </div>
        <div className="divide-y">
          {messages.map(message => (
            <div key={message.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{message.from}</span>
                  <i className="fas fa-arrow-right text-gray-400 text-sm"></i>
                  <span className="text-gray-600">{message.to}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {message.protocol}
                  </span>
                  <span className="text-sm text-gray-500">{message.timestamp}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{message.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Protocol Support */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'HCS-10', description: 'Hedera Consensus Service', status: 'active' },
          { name: 'A2A', description: 'Agent-to-Agent Protocol', status: 'active' },
          { name: 'XMTP', description: 'Extensible Message Transport', status: 'beta' },
          { name: 'MCP', description: 'Model Context Protocol', status: 'coming' }
        ].map(protocol => (
          <div key={protocol.name} className="p-3 border rounded-lg text-center">
            <div className="font-semibold">{protocol.name}</div>
            <div className="text-sm text-gray-600">{protocol.description}</div>
            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
              protocol.status === 'active' ? 'bg-green-100 text-green-800' :
              protocol.status === 'beta' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {protocol.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
