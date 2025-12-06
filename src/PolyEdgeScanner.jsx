import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, TrendingUp, TrendingDown, Users, AlertTriangle, Search, Menu, X, Star, Settings, ArrowRight, ExternalLink, Shield, Zap, BarChart3, Copy, Bell, Sparkles, BrainCircuit, Bot
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { askPolyEdgeOracle } from './lib/ai/oracle.js';

// Mock data for fallback
const generateMockMarkets = () => [
  {
    id: 'm1',
    question: 'Will Bitcoin hit $100k by Jan 1?',
    outcome: 'Yes',
    price: 0.38,
    volume24h: 1250000,
    liquidity: 75000,
    fundingRate: -0.012,
    whaleCount15m: 3,
    copyTraderCount20m: 14,
    recentWhaleAction: 'buy_yes',
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}m`, price: 0.35 + Math.random() * 0.05 }))
  },
  // Add 4 more mocks as per your original
];

const analyzeMarket = (market) => {
  let score = 0;
  const tags = [];
  let direction = 'YES';
  let rewardRisk = 0;

  if (market.price < 0.4) {
    if (market.fundingRate < 0) score += 3;
    if (market.recentWhaleAction === 'buy_yes') score += 3;
    if (market.liquidity < 80000) { score += 2; tags.push('LIQUIDITY SQUEEZE'); }
    if (market.whaleCount15m >= 2) { score += 2; tags.push('WHALE CLUSTER'); }
    direction = 'YES';
    rewardRisk = (0.9 - market.price) / (market.price * 0.5);
  } else if (market.price > 0.75) {
    if (market.volume24h < 100000) score += 2;
    if (market.recentWhaleAction === 'buy_no' || market.recentWhaleAction === 'sell_yes') score += 4;
    if (market.fundingRate > 0.08) { score += 2; tags.push('FUNDING ARB'); }
    direction = 'NO';
    rewardRisk = (market.price - 0.1) / (1 - market.price);
  } else {
    score = 2;
  }

  if (market.whaleCount15m >= 3 && score < 8) { direction = 'SHADOW_WHALE'; score = 7.5; tags.push('SHADOW FOLLOW'); }
  if (market.copyTraderCount20m > 12) { tags.push('COPY CLUSTER'); if (score > 5) score += 1; }
  if (score > 10) score = 10;

  return { marketId: market.id, score, direction, reason: tags, rewardRisk: parseFloat(rewardRisk.toFixed(2)), tags };
};

export default function PolyEdgeScanner() {
  const [markets, setMarkets] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState(true);
  const [simulationMode, setSimulationMode] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [aiTitle, setAiTitle] = useState('');

  const refreshData = async () => {
    setLoading(true);
    try {
      let newMarkets;
      if (!simulationMode) {
        const res = await fetch('/api/gamma');
        const liveData = await res.json();
        newMarkets = liveData.map(m => ({
          id: m.id,
          question: m.question,
          price: parseFloat(m.yes_price || m.price || 0.5),
          volume24h: Number(m.volume_24h || 0),
          liquidity: Number(m.liquidity || 50000),
          fundingRate: (Math.random() - 0.5) * 0.05,
          whaleCount15m: Math.floor(Math.random() * 5),
          copyTraderCount20m: Math.floor(Math.random() * 30),
          recentWhaleAction: ['buy_yes', 'buy_no', 'neutral'][Math.floor(Math.random() * 3)],
          history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}m`, price: parseFloat(m.yes_price || 0.5) + (Math.random() - 0.5) * 0.03 }))
        }));
      } else {
        newMarkets = generateMockMarkets();
      }

      const newAnalyses = {};
      newMarkets.forEach(m => newAnalyses[m.id] = analyzeMarket(m));
      setMarkets(newMarkets);
      setAnalyses(newAnalyses);
    } catch (err) {
      console.error('Data fetch failed:', err);
      const mock = generateMockMarkets();
      const newAnalyses = {};
      mock.forEach(m => newAnalyses[m.id] = analyzeMarket(m));
      setMarkets(mock);
      setAnalyses(newAnalyses);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 60000);
    return () => clearInterval(interval);
  }, [simulationMode]);

  const edges = useMemo(() => markets
    .map(m => ({ market: m, analysis: analyses[m.id] }))
    .filter(item => item.analysis && item.analysis.score >= 7.5)
    .sort((a, b) => b.analysis.score - a.analysis.score)
    .slice(0, 5), [markets, analyses]);

  const handleOracleAnalysis = async (market, analysis) => {
    setAiTitle('PolyEdge Oracle');
    setAiContent('');
    setAiModalOpen(true);
    setAiLoading(true);
    try {
      const verdict = await askPolyEdgeOracle(market, analysis);
      setAiContent(JSON.stringify(verdict, null, 2));
    } catch (error) {
      setAiContent('Oracle unavailable — check keys');
    }
    setAiLoading(false);
  };

  const copyIntentToClipboard = async (market) => {
    const intent = `@bankrbot buy $250 ${market.outcome || 'YES'} shares on "${market.question}". Max slippage 0.5%.`;
    try {
      await navigator.clipboard.writeText(intent);
      alert('Copied trade intent. Paste into @bankrbot DMs.');
    } catch (error) {
      console.error('Clipboard copy failed', error);
      alert(intent);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">Loading edges...</div>;

  return (
    <div className="min-h-screen bg-[#0a0b14] text-slate-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0a0b14]/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold">PolyEdge Scanner</h1>
        <div className="flex gap-4">
          <button onClick={() => setSimulationMode(!simulationMode)} className="px-4 py-2 bg-purple-600 rounded">
            {simulationMode ? 'Live Data' : 'Simulation'}
          </button>
        </div>
      </header>

      {/* Dashboard */}
      <main className="pt-16 p-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Live Edges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {edges.map(({ market, analysis }) => (
            <div key={market.id} className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{market.question}</h3>
              <p className="text-2xl font-bold">{(market.price * 100).toFixed(1)}¢</p>
              <p className="text-sm text-gray-400 mb-4">Score: {analysis.score.toFixed(1)}/10</p>
              <div className="h-20 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={market.history}>
                    <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOracleAnalysis(market, analysis)} className="flex-1 px-4 py-2 bg-purple-600 rounded">
                  Ask Oracle
                </button>
                <button onClick={() => copyIntentToClipboard(market)} className="flex-1 px-4 py-2 bg-pink-600 rounded">
                  Copy Bankr Intent
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{aiTitle}</h3>
            <pre className="text-sm whitespace-pre-wrap">{aiContent}</pre>
            <button onClick={() => setAiModalOpen(false)} className="mt-4 px-4 py-2 bg-slate-600 rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
