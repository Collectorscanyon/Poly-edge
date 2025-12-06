import React, { useState, useEffect, useMemo } from 'react'
import { Copy, Sparkles } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { askPolyEdgeOracle } from './lib/ai/oracle.js'

const analyzeMarket = (m) => {
  let score = 0
  const tags = []
  const price = m.price
  const volume = m.volume24h || 0
  const liquidity = m.liquidity || 0

  if (price < 0.4) score += 6
  if (price > 0.75) score += 6
  if (liquidity < 80000) {
    score += 2
    tags.push('SQUEEZE')
  }
  if (volume > 1000000) {
    score += 3
    tags.push('HIGH VOLUME')
  }
  if (volume > 500000 && volume < 2000000) {
    score += 2
    tags.push('EMERGING')
  }

  return { score: Math.min(score, 10), tags }
}

export default function PolyEdgeScanner() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [oracleOpen, setOracleOpen] = useState(false)
  const [oracleLoading, setOracleLoading] = useState(false)
  const [oraclePayload, setOraclePayload] = useState(null)

  const fetchMarkets = async () => {
    try {
      setError('')
      const res = await fetch(
        '/api/gamma?closed=false&order=id&ascending=false&limit=200'
      )
      if (!res.ok) throw new Error(`Upstream error ${res.status}`)
      const data = await res.json()
      const processed = (Array.isArray(data) ? data : []).map((m) => {
        const price = Number(m.yes_price ?? m.price ?? 0.5)
        const volume24h = Number(m.volume_24h ?? m.volume24h ?? 0)
        const liquidity = Number(m.liquidity ?? m.liquidity_in ?? 0)
        const historyBase = price || 0.5
        return {
          ...m,
          price,
          volume24h,
          liquidity,
          history: m.history ||
            Array.from({ length: 20 }, (_, i) => ({
              time: `${i}m`,
              price: historyBase + (Math.random() - 0.5) * 0.05,
            })),
        }
      })
      setMarkets(processed)
    } catch (err) {
      console.error('Real market fetch failed', err)
      setError('Live market fetch failed — showing no edges until it recovers.')
      setMarkets([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMarkets()
    const i = setInterval(fetchMarkets, 60000)
    return () => clearInterval(i)
  }, [])

  const edges = useMemo(
    () =>
      markets
        .map((m) => ({ market: m, analysis: analyzeMarket(m) }))
        .filter((e) => e.analysis.score >= 6.5)
        .sort((a, b) => b.analysis.score - a.analysis.score)
        .slice(0, 8),
    [markets]
  )

  const copyIntent = (q) => {
    navigator.clipboard.writeText(
      `@bankrbot buy $250 YES shares on "${q}" Max slippage 0.5%`
    )
    alert('Copied! Paste into @bankrbot DMs')
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0b14] text-white flex items-center justify-center">
        Loading real markets...
      </div>
    )

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white p-8">
      <h1 className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
        PolyEdge Scanner
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {edges.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 text-xl">
            {error || 'No edges right now — markets are efficient. Waiting for whale moves...'}
          </div>
        ) : (
          edges.map(({ market, analysis }) => (
            <a
              key={market.id}
              href={`https://polymarket.com/event/${market.slug || market.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold line-clamp-2 leading-snug">{market.question}</h3>
                  <Sparkles className="h-5 w-5 text-purple-300" />
                </div>
                <p className="text-4xl font-bold mb-2">{(market.price * 100).toFixed(1)}¢</p>
                <p className="text-2xl text-green-400 mb-4">Score {analysis.score.toFixed(1)}/10</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {analysis.tags.map((t) => (
                    <span key={t} className="px-3 py-1 bg-purple-600 rounded-full text-xs font-bold">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="h-32 mb-4">
                  <ResponsiveContainer>
                    <AreaChart data={market.history || []}>
                      <Area type="monotone" dataKey="price" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    copyIntent(market.question)
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  COPY INTENT
                </button>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
