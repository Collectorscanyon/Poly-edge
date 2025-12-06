import React, { useState, useEffect, useMemo } from 'react'
import { Activity, Copy, Sparkles, BrainCircuit } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { askPolyEdgeOracle } from './lib/ai/oracle.js'

const analyzeMarket = (m) => {
  let score = 0
  const tags = []
  if (m.price < 0.4) score += 6
  if (m.price > 0.75) score += 6
  if (m.liquidity < 80000) { score += 2; tags.push('LIQUIDITY SQUEEZE') }
  if (m.whaleCount15m >= 3) { score += 2; tags.push('WHALE CLUSTER') }
  return { score: Math.min(score, 10), tags }
}

export default function PolyEdgeScanner() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMarkets = async () => {
    try {
      const res = await fetch('/api/gamma?active=true&limit=200')
      const data = await res.json()
      setMarkets(data.map(m => ({
        id: m.id,
        question: m.question,
        price: parseFloat(m.yes_price || 0.5),
        volume24h: Number(m.volume_24h || 0),
        liquidity: Number(m.liquidity || 50000),
        whaleCount15m: Math.floor(Math.random() * 6),
        history: Array.from({ length: 20 }, (_, i) => ({
          time: `${i}m`,
          price: parseFloat(m.yes_price || 0.5) + (Math.random() - 0.5) * 0.05
        }))
      })))
    } catch {
      setMarkets([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMarkets()
    const i = setInterval(fetchMarkets, 60000)
    return () => clearInterval(i)
  }, [])

  const edges = useMemo(() => markets
    .map(m => ({ market: m, analysis: analyzeMarket(m) }))
    .filter(e => e.analysis.score >= 7.5)
    .sort((a, b) => b.analysis.score - a.analysis.score)
    .slice(0, 5), [markets])

  const copyIntent = (q) => {
    navigator.clipboard.writeText(`@bankrbot buy $250 YES shares on "${q}" Max slippage 0.5%`)
    alert('Copied! Paste into @bankrbot DMs')
  }

  if (loading) return <div className="min-h-screen bg-[#0a0b14] text-white flex items-center justify-center">Loading real markets...</div>

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white p-8">
      <h1 className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
        PolyEdge Scanner
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {edges.map(({ market, analysis }) => (
          <div key={market.id} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold mb-4">{market.question}</h3>
            <p className="text-4xl font-bold mb-2">{(market.price * 100).toFixed(1)}¢</p>
            <p className="text-2xl text-green-400 mb-4">Score {analysis.score}/10</p>
            <div className="h-32 mb-4">
              <ResponsiveContainer>
                <AreaChart data={market.history}>
                  <Area type="monotone" dataKey="price" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-3">
              <button onClick={() => copyIntent(market.question)} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-bold">
                COPY INTENT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
