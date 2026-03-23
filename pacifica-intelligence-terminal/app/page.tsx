'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeSignals, setActiveSignals] = useState(12)
  const [riskScore, setRiskScore] = useState(0.45)
  const [marginEfficiency, setMarginEfficiency] = useState(87)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setActiveSignals(prev => Math.max(8, Math.min(20, prev + Math.floor(Math.random() * 5) - 2)))
      setRiskScore(prev => Math.max(0.1, Math.min(0.9, prev + (Math.random() - 0.5) * 0.1)))
      setMarginEfficiency(prev => Math.max(70, Math.min(95, prev + Math.floor(Math.random() * 10) - 5)))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTechnology = () => {
    document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToDashboard = () => {
    router.push('/dashboard')
  }

  const launchDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 hero-gradient rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-white"></i>
              </div>
              <span className="text-xl font-bold">Pacifica Intelligence</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={scrollToFeatures} className="hover:text-purple-400 transition">Features</button>
              <button onClick={scrollToTechnology} className="hover:text-purple-400 transition">Technology</button>
              <button onClick={scrollToDashboard} className="hover:text-purple-400 transition">Dashboard</button>
              <button onClick={launchDashboard} className="hero-gradient px-6 py-2 rounded-full text-white font-semibold hover:opacity-90 transition">
                Launch Dashboard
              </button>
            </div>
            <button className="md:hidden text-white">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="container mx-auto text-center">
          <div className={`slide-in ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
            <div className="inline-flex items-center space-x-2 bg-purple-900/30 px-4 py-2 rounded-full mb-6 border border-purple-500/30">
              <span className="pulse-dot w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-sm">System Online • Real-time Processing</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">AI-Driven Trading</span><br />
              <span className="text-white">Intelligence Terminal</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform raw perpetual futures data into actionable alpha, risk-aware decisions, and automated execution. 
              Institutional-grade tools for the modern trader.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <button onClick={launchDashboard} className="hero-gradient px-8 py-4 rounded-full text-white font-semibold text-lg hover:opacity-90 transition glow">
                <i className="fas fa-rocket mr-2"></i>
                Launch Dashboard
              </button>
              <button onClick={scrollToFeatures} className="border border-purple-500 px-8 py-4 rounded-full text-white font-semibold text-lg hover:bg-purple-500/20 transition">
                <i className="fas fa-play-circle mr-2"></i>
                View Demo
              </button>
            </div>
            
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">94%</div>
                <div className="text-sm text-gray-400">Signal Accuracy</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">0.8</div>
                <div className="text-sm text-gray-400">Sharpe Ratio</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">5ms</div>
                <div className="text-sm text-gray-400">Latency</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-gray-400">Operation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Intelligence Engines</span>
            </h2>
            <p className="text-xl text-gray-300">Multi-layer analysis for superior trading decisions</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Alpha Engine */}
            <div className="card p-8">
              <div className="w-16 h-16 hero-gradient rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-chart-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Alpha Engine</h3>
              <p className="text-gray-300 mb-6">
                Real-time signal detection using orderbook imbalance, funding divergence, 
                liquidation clusters, and volatility expansion patterns.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Orderbook Imbalance</li>
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Funding Rate Divergence</li>
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Liquidation Clusters</li>
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Volatility Expansion</li>
              </ul>
            </div>

            {/* Risk Engine */}
            <div className="card p-8">
              <div className="w-16 h-16 hero-gradient rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-shield-alt text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Risk Intelligence</h3>
              <p className="text-gray-300 mb-6">
                Advanced risk management with liquidation distance calculation, 
                dynamic position sizing, and volatility-adjusted stops.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Liquidation Distance</li>
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Dynamic Position Sizing</li>
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Max Safe Leverage</li>
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Risk Scoring</li>
              </ul>
            </div>

            {/* Margin Engine */}
            <div className="card p-8">
              <div className="w-16 h-16 hero-gradient rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-coins text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Margin Efficiency</h3>
              <p className="text-gray-300 mb-6">
                Optimize capital deployment with efficiency scoring, 
                utilization tracking, and risk-adjusted return modeling.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Capital Efficiency</li>
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Margin Utilization</li>
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Portfolio Optimization</li>
                <li><i className="fas fa-check text-purple-400 mr-2"></i>Return Modeling</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 px-6 bg-gray-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Technology Stack</span>
            </h2>
            <p className="text-xl text-gray-300">Built for performance, reliability, and scalability</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Real-Time Processing Pipeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 hero-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-bolt text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">WebSocket Integration</h4>
                    <p className="text-gray-400">Sub-millisecond data ingestion from Pacifica exchanges</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 hero-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-brain text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">AI-Powered Analysis</h4>
                    <p className="text-gray-400">Machine learning algorithms for pattern recognition</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 hero-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-robot text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Smart Execution</h4>
                    <p className="text-gray-400">Automated trading with risk validation</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold mb-2">Live Signal Detection</h4>
                <p className="text-sm text-gray-400">Real-time alpha signals</p>
              </div>
              {/* Simulated Chart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Signals</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{width: `${(activeSignals / 20) * 100}%`}}></div>
                    </div>
                    <span className="text-sm text-green-400">{activeSignals}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Risk Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full transition-all duration-500" style={{width: `${riskScore * 100}%`}}></div>
                    </div>
                    <span className="text-sm text-yellow-400">{riskScore.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Efficiency</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{width: `${marginEfficiency}%`}}></div>
                    </div>
                    <span className="text-sm text-purple-400">{marginEfficiency}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              <span className="gradient-text">Ready to Transform Your Trading?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join traders worldwide using AI-powered intelligence to gain an edge in the markets.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={launchDashboard} className="hero-gradient px-8 py-4 rounded-full text-white font-semibold text-lg hover:opacity-90 transition">
                <i className="fas fa-rocket mr-2"></i>
                Start Trading Now
              </button>
              <button onClick={scrollToFeatures} className="border border-purple-500 px-8 py-4 rounded-full text-white font-semibold text-lg hover:bg-purple-500/20 transition">
                <i className="fas fa-info-circle mr-2"></i>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-white text-sm"></i>
              </div>
              <span className="text-lg font-semibold">Pacifica Intelligence Terminal</span>
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-purple-400 transition">Documentation</a>
              <a href="#" className="hover:text-purple-400 transition">API</a>
              <a href="#" className="hover:text-purple-400 transition">Support</a>
              <a href="#" className="hover:text-purple-400 transition">Discord</a>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-500 text-sm">
            © 2024 Pacifica Intelligence Terminal. Built for the future of trading.
          </div>
        </div>
      </footer>
    </div>
  )
}
