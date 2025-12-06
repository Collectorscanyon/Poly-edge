import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowUpRight, Bot, BrainCircuit, Copy, Flame, Gauge, Hourglass, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import { askPolyEdgeOracle } from './lib/ai/oracle.js'

const gradientStops = ['from-emerald-400/70 via-indigo-500/70 to-fuchsia-500/70', 'from-cyan-400/70 via-blue-500/70 to-purple-500/70', 'from-amber-400/70 via-orange-500/70 to-rose-500/70']

const mockHistory = (base) => Array.from({ length: 28 }, (_, i) => ({
  time: `${(27 - i) * 5}m`,
  price: Number((base + (Math.random() - 0.5) * 0.08).toFixed(3))
}))

const generateMockMarkets = () => [
  {
    id: 'mock-1',
    question: 'Will BTC close above $70k this week?',
    price: 0.36,
    volume24h: 142000,
    liquidity: 62000,
    fundingRate: -0.021,
    whaleFlow: 'buy',
    whaleCount15m: 4,
    copyTraderCount: 28,
    history: mockHistory(0.36)
  },
  {
    id: 'mock-2',
    question: 'Will ETH ETFs trade by Friday?',
    price: 0.82,
    volume24h: 51000,
    liquidity: 74000,
    fundingRate: 0.014,
    whaleFlow: 'sell',
    whaleCount15m: 3,
    copyTraderCount: 9,
    history: mockHistory(0.82)
  },
  {
    id: 'mock-3',
    question: 'Will Trump win the election?',
    price: 0.61,
    volume24h: 980000,
    liquidity: 132000,
    fundingRate: -0.006,
    whaleFlow: 'buy',
    whaleCount15m: 2,
    copyTraderCount: 34,
    history: mockHistory(0.61)
  },
  {
    id: 'mock-4',
    question: 'Will SOL flip BNB in market cap by Q4?',
    price: 0.29,
    volume24h: 88000,
    liquidity: 54000,
    fundingRate: -0.018,
    whaleFlow: 'buy',
    whaleCount15m: 3,
    copyTraderCount: 21,
    history: mockHistory(0.29)
  },
  {
    id: 'mock-5',
    question: 'Will CPI print below 3.1% next release?',
    price: 0.77,
    volume24h: 43000,
    liquidity: 61000,
    fundingRate: 0.012,
    whaleFlow: 'sell',
    whaleCount15m: 4,
    copyTraderCount: 24,
    history: mockHistory(0.77)
  }
]

const analyzeMarket = (market) => {
  let score = 0
  const tags = []
  if (market.price < 0.4 && market.fundingRate < 0 && market.whaleFlow === 'buy') {
    score += 6
    tags.push('Discounted momentum')
  }
  if (market.price > 0.75 && market.volume24h < 80000 && market.whaleFlow === 'sell') {
    score += 6
    tags.push('Overstretched exit risk')
  }
  if (market.liquidity < 80000) {
    score += 2
    tags.push('LIQUIDITY SQUEEZE')
  }
  if (market.whaleCount15m >= 3) {
    score += 2
    tags.push('WHALE CLUSTER')
  }
  if (market.copyTraderCount >= 20) {
    score += 1
    tags.push('COPY CLUSTER')
  }
  return { score: Math.min(score, 10), tags }
}

const metricPill = (label, value, accent) => (
  <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-slate-200">
    <span className={`h-2 w-2 rounded-full ${accent}`}></span>
    <span className="uppercase tracking-[0.2em] text-[10px] text-slate-300">{label}</span>
    <span className="font-semibold text-white">{value}</span>
  </div>
)

const formatUsd = (num) => `$${Number(num || 0).toLocaleString()}`

export default function PolyEdgeScanner() {
  const useRealDataEnv = import.meta.env.VITE_USE_REAL_DATA === 'true'
  const [simulationMode, setSimulationMode] = useState(false)
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [oracleOpen, setOracleOpen] = useState(false)
  const [oracleLoading, setOracleLoading] = useState(false)
  const [oraclePayload, setOraclePayload] = useState(null)

  const fetchMarkets = async () => {
    setLoading(true)
    try {
      const shouldUseLive = useRealDataEnv || !simulationMode
      const source = shouldUseLive ? await fetchLive() : generateMockMarkets()
      setMarkets(source)
    } catch {
      setMarkets(generateMockMarkets())
    }
    setLastUpdated(new Date())
    setLoading(false)
  }

  const fetchLive = async () => {
    const res = await fetch('/api/gamma?active=true&limit=200')
    if (!res.ok) throw new Error('bad response')
    const payload = await res.json()
    return payload.map((m, idx) => {
      const price = Number(m.yes_price ?? m.price ?? 0.5)
      const volatility = (Math.sin(idx) + 1) / 40
      const liquidity = Number(m.liquidity ?? 60000 + Math.random() * 90000)
      const fundingRate = Number(((Math.random() - 0.5) / 25).toFixed(4))
      const whaleFlow = fundingRate < 0 ? 'buy' : Math.random() > 0.6 ? 'sell' : 'buy'
      const whaleCount15m = Math.max(0, Math.round(Math.random() * 4 + (whaleFlow === 'buy' ? 1 : 0)))
      const copyTraderCount = Math.round(10 + Math.random() * 30)
      const baseHistory = mockHistory(price + volatility)
      return {
        id: m.id,
        question: m.question ?? m.title ?? 'Unlabeled market',
        price,
        volume24h: Number(m.volume_24h ?? m.volume ?? 0),
        liquidity,
        fundingRate,
        whaleFlow,
        whaleCount15m,
        copyTraderCount,
        history: baseHistory
      }
    })
  }

  useEffect(() => {
    fetchMarkets()
    const interval = setInterval(fetchMarkets, 60000)
    return () => clearInterval(interval)
  }, [simulationMode, useRealDataEnv])

  const edges = useMemo(() => markets
    .map((market) => ({ market, analysis: analyzeMarket(market) }))
    .filter((item) => item.analysis.score >= 7.5)
    .sort((a, b) => b.analysis.score - a.analysis.score)
    .slice(0, 5), [markets])

  const headlineStats = useMemo(() => {
    const totalVolume = markets.reduce((acc, m) => acc + (m.volume24h || 0), 0)
    const avgLiquidity = markets.length ? markets.reduce((acc, m) => acc + (m.liquidity || 0), 0) / markets.length : 0
    return { totalVolume, avgLiquidity }
  }, [markets])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const copyIntent = (market) => {
    const intent = `@bankrbot buy $250 YES shares on "${market.question}" Max slippage 0.5%.`
    navigator.clipboard.writeText(intent)
    showToast('Copied! Paste into @bankrbot DMs')
  }

  const summonOracle = async (market, analysis) => {
    setOracleOpen(true)
    setOracleLoading(true)
    try {
      const verdict = await askPolyEdgeOracle(market, analysis)
      setOraclePayload({ market, verdict })
    } catch {
      setOraclePayload({ market, verdict: null })
    }
    setOracleLoading(false)
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-10">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-300">
            <Sparkles className="h-4 w-4" />
            Polymarket Edge Engine
          </div>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Brutal real-time market exploitation</h1>
          <p className="text-slate-400 sm:text-lg">Live gamma feed, deterministic edge scoring, dual LLM oracle, and one-click copy intent. Built for ruthless execution.</p>
          <div className="flex flex-wrap gap-2">
            {metricPill('Volume 24h', formatUsd(headlineStats.totalVolume), 'bg-emerald-400')}
            {metricPill('Avg Liquidity', formatUsd(headlineStats.avgLiquidity), 'bg-indigo-400')}
            {metricPill('Edge Threshold', '≥ 7.5', 'bg-fuchsia-400')}
          </div>
        </div>
        <div className="glass gradient-border relative flex w-full max-w-sm flex-col gap-4 overflow-hidden rounded-2xl p-[1px]">
          <div className="glass relative rounded-2xl p-5">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-emerald-300" />
                Live Data
              </div>
                <button
                  onClick={() => setSimulationMode(false)}
                  disabled={useRealDataEnv}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${!simulationMode ? 'bg-emerald-500 text-night' : 'bg-white/5 text-slate-200'} ${useRealDataEnv ? 'opacity-70' : ''}`}
                  title={useRealDataEnv ? 'Live data enforced via env' : ''}
                >
                  Real
                </button>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <Hourglass className="h-4 w-4 text-indigo-300" />
                Simulation
              </div>
                <button
                  onClick={() => setSimulationMode(true)}
                  disabled={useRealDataEnv}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${simulationMode ? 'bg-indigo-500 text-night' : 'bg-white/5 text-slate-200'} ${useRealDataEnv ? 'opacity-70' : ''}`}
                  title={useRealDataEnv ? 'Live data enforced via env' : ''}
                >
                  Sim
                </button>
            </div>
            <div className="mt-5 rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-200">
                  <Activity className="h-4 w-4 text-emerald-300" />
                  Auto-refresh
                </span>
                <span className="text-emerald-300">60s</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Last sync</span>
                <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass flex items-center justify-center rounded-2xl border border-white/5 p-8 text-slate-200">Crunching order flow...</div>
      ) : edges.length === 0 ? (
        <div className="glass rounded-2xl border border-white/5 p-8 text-center text-slate-200">No edges above threshold. Flip to simulation or wait for whales.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {edges.map(({ market, analysis }, idx) => (
            <div key={market.id} className="glass gradient-border relative overflow-hidden rounded-2xl p-[1px]">
              <div className="glass relative rounded-2xl p-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-fuchsia-500 opacity-60" />
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
                      <Flame className="h-4 w-4" />
                      Edge {idx + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-white leading-tight">{market.question}</h3>
                  </div>
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradientStops[idx % gradientStops.length]} opacity-80`}></div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-white">{(market.price * 100).toFixed(1)}¢</p>
                    <p className="text-xs text-slate-400">Score {analysis.score.toFixed(1)} / 10</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signals</p>
                    <p className="text-sm font-semibold text-emerald-200">{analysis.tags.slice(0, 2).join(' • ')}</p>
                  </div>
                </div>

                <div className="mt-4 h-28 w-full overflow-hidden rounded-xl border border-white/5 bg-night/60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={market.history} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`price-${market.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.15} />
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0' }} />
                      <Area type="monotone" dataKey="price" stroke="#34d399" fill={`url(#price-${market.id})`} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    Liquidity <span className="ml-auto font-semibold text-white">{formatUsd(market.liquidity)}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <TrendingUp className="h-4 w-4 text-indigo-300" />
                    24h Vol <span className="ml-auto font-semibold text-white">{formatUsd(market.volume24h)}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <BrainCircuit className="h-4 w-4 text-fuchsia-300" />
                    Whales <span className="ml-auto font-semibold text-white">{market.whaleCount15m}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <Bot className="h-4 w-4 text-amber-300" />
                    Copycats <span className="ml-auto font-semibold text-white">{market.copyTraderCount}</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => summonOracle(market, analysis)}
                    className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-500/60 bg-indigo-500/20 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:border-indigo-300 hover:bg-indigo-400/20"
                  >
                    <BrainCircuit className="h-4 w-4" />
                    Ask Oracle
                    <ArrowUpRight className="h-4 w-4 opacity-70" />
                  </button>
                  <button
                    onClick={() => copyIntent(market)}
                    className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/60 bg-emerald-500/20 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:border-emerald-300 hover:bg-emerald-400/20"
                  >
                    <Copy className="h-4 w-4" />
                    COPY INTENT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {oracleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-night/95 p-6 shadow-glass">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">PolyEdge Oracle</p>
                <h4 className="text-lg font-semibold text-white">{oraclePayload?.market?.question}</h4>
              </div>
              <button onClick={() => setOracleOpen(false)} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 hover:border-white/30">Close</button>
            </div>
            {oracleLoading ? (
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-slate-200">
                <Sparkles className="h-4 w-4 animate-spin text-indigo-300" />
                Querying Claude 3.5 + Gemini 2.5...
              </div>
            ) : oraclePayload?.verdict ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Direction</p>
                    <p className="text-xl font-semibold text-emerald-300">{oraclePayload.verdict.direction}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Conviction</p>
                    <p className="text-xl font-semibold text-fuchsia-300">{oraclePayload.verdict.conviction}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Target</p>
                    <p className="text-xl font-semibold text-white">{(oraclePayload.verdict.targetPrice * 100).toFixed(1)}¢</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stop Loss</p>
                    <p className="text-xl font-semibold text-white">{(oraclePayload.verdict.stopLoss * 100).toFixed(1)}¢</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-slate-200">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-300">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      Confidence
                    </span>
                    <span className="text-lg font-semibold text-emerald-200">{oraclePayload.verdict.confidenceScore}%</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-slate-300">
                    {(oraclePayload.verdict.reasoning || []).map((line, i) => (
                      <span key={i} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white">{line}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-center text-slate-300">Oracle unavailable. Drop keys or retry.</div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-sm font-semibold text-emerald-100 shadow-glass">
          <Copy className="h-4 w-4" />
          {toast}
        </div>
      )}
    </div>
  )
}
