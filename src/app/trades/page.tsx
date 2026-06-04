'use client';

import { useEffect, useState } from 'react';

interface Trade {
  id: string; symbol: string; side: string; size: number; leverage: number;
  entryPrice: number; exitPrice?: number; status: string; pnl?: number;
  timestamp: string; closedAt?: string;
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trades').then(r => r.json()).then(d => { setTrades(d.trades || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Trade History</h1>
        <p className="text-gray-400 mb-6">Execution log for Pacifica Intelligence Terminal</p>

        {loading ? <p className="text-gray-500">Loading...</p> : trades.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">📊</p>
            <p className="text-lg">No trades executed yet</p>
            <p className="text-sm mt-2">Enable Smart Mode on the dashboard to start auto-trading</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left py-3 px-2">Symbol</th>
                  <th className="text-left py-3 px-2">Side</th>
                  <th className="text-right py-3 px-2">Size</th>
                  <th className="text-right py-3 px-2">Leverage</th>
                  <th className="text-right py-3 px-2">Entry</th>
                  <th className="text-right py-3 px-2">Exit</th>
                  <th className="text-right py-3 px-2">PnL</th>
                  <th className="text-center py-3 px-2">Status</th>
                  <th className="text-right py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="py-3 px-2 font-mono">{t.symbol}</td>
                    <td className={py-3 px-2 font-semibold }>{t.side}</td>
                    <td className="text-right py-3 px-2 font-mono">{t.size.toFixed(2)}</td>
                    <td className="text-right py-3 px-2">{t.leverage}x</td>
                    <td className="text-right py-3 px-2 font-mono"></td>
                    <td className="text-right py-3 px-2 font-mono">{t.exitPrice ? $ : '-'}</td>
                    <td className={	ext-right py-3 px-2 font-mono }>
                      {t.pnl ? ${t.pnl > 0 ? '+' : ''} : '-'}
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={px-2 py-0.5 rounded-full text-xs }>{t.status}</span>
                    </td>
                    <td className="text-right py-3 px-2 text-gray-400">{new Date(t.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Quick Trade</h2>
          <p className="text-sm text-gray-400">Execute a manual trade to test the system:</p>
          <button onClick={async () => {
            const res = await fetch('/api/trades', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                symbol: 'BTC-PERP', side: 'LONG', size: 0.5, leverage: 5,
                entryPrice: 67500, alphaScore: 85, riskScore: 25, efficiencyScore: 72,
              }),
            });
            if (res.ok) { window.location.reload(); }
          }} className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            Execute Demo Trade
          </button>
        </div>
      </div>
    </div>
  );
}
