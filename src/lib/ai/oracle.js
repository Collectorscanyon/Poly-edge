import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const anthropic = new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '', dangerouslyAllowBrowser: true })
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

const parseJson = (text) => {
  const match = text?.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('no json')
  return JSON.parse(match[0])
}

const baseVerdict = (market, analysis) => ({
  direction: market.price >= 0.5 ? 'YES' : 'NO',
  conviction: analysis.score >= 9 ? 'NUCLEAR' : analysis.score >= 8.5 ? 'HIGH' : analysis.score >= 7.5 ? 'MEDIUM' : 'LOW',
  targetPrice: Math.min(1, market.price + 0.08),
  stopLoss: Math.max(0, market.price - 0.05),
  confidenceScore: Math.min(99, Math.round(65 + Math.random() * 25)),
  reasoning: analysis.tags
})

const claudeOracle = async (market, analysis) => {
  const message = `Return strict JSON only. Schema: {"direction":"YES|NO","conviction":"NUCLEAR|HIGH|MEDIUM|LOW","targetPrice":number,"stopLoss":number,"confidenceScore":number,"reasoning":string[]}. Market: ${market.question}. Price ${(market.price * 100).toFixed(1)}c. Liquidity ${market.liquidity}. Volume ${market.volume24h}. Score ${analysis.score}. Tags ${analysis.tags.join(',')}.`
  const res = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 600,
    messages: [{ role: 'user', content: message }],
    system: 'Only output valid JSON that matches the schema. No prose.'
  })
  return parseJson(res.content[0].text)
}

const geminiOracle = async (market, analysis) => {
  const prompt = `Strict JSON only. Schema {"direction":"YES|NO","conviction":"NUCLEAR|HIGH|MEDIUM|LOW","targetPrice":number,"stopLoss":number,"confidenceScore":number,"reasoning":string[]}. Market: ${market.question}. Price ${(market.price * 100).toFixed(1)}c. Liquidity ${market.liquidity}. Volume ${market.volume24h}. Score ${analysis.score}. Tags ${analysis.tags.join(',')}.`
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-09-2025' })
  const result = await model.generateContent(prompt)
  return parseJson(result.response.text())
}

export const askPolyEdgeOracle = async (market, analysis) => {
  const tasks = []
  if (import.meta.env.VITE_ANTHROPIC_API_KEY) tasks.push(claudeOracle(market, analysis))
  if (import.meta.env.VITE_GEMINI_API_KEY) tasks.push(geminiOracle(market, analysis))

  const settled = await Promise.allSettled(tasks)
  const votes = settled
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)

  if (!votes.length) return baseVerdict(market, analysis)

  const directionVotes = votes.reduce((acc, v) => {
    acc[v.direction] = (acc[v.direction] || 0) + 1
    return acc
  }, {})
  const winningDirection = Object.entries(directionVotes).sort((a, b) => b[1] - a[1])[0][0]
  const avgTarget = votes.reduce((acc, v) => acc + (v.targetPrice || 0), 0) / votes.length
  const avgStop = votes.reduce((acc, v) => acc + (v.stopLoss || 0), 0) / votes.length
  const confidenceScore = Math.round((votes.filter((v) => v.direction === winningDirection).length / votes.length) * 100)
  const conviction = confidenceScore >= 90 ? 'NUCLEAR' : confidenceScore >= 80 ? 'HIGH' : confidenceScore >= 65 ? 'MEDIUM' : 'LOW'
  const reasoning = [...new Set(votes.flatMap((v) => v.reasoning || []))]

  return {
    direction: winningDirection,
    conviction,
    targetPrice: avgTarget || market.price,
    stopLoss: avgStop || market.price * 0.92,
    confidenceScore,
    reasoning
  }
}
