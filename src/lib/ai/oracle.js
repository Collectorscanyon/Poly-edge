import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const anthropic = new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const askPolyEdgeOracle = async (market, analysis) => {
  const context = `
Question: ${market.question}
Price: ${market.price.toFixed(4)} (${(market.price*100).toFixed(1)}%)
Volume: $${market.volume24h.toLocaleString()}
Liquidity: $${market.liquidity.toLocaleString()}
Whales (15m): ${market.whaleCount15m}
Score: ${analysis.score}/10
Tags: ${analysis.tags.join(', ')}
`;

  let claudeJson = {};
  let geminiJson = {};

  try {
    const claudeRes = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: 'You are PolyEdge Oracle. Output strict JSON: {score: number, direction: "YES"|"NO", conviction: "LOW"|"MEDIUM"|"HIGH"|"NUCLEAR", reasoning: array, targetPrice: number, stopLoss: number, confidenceScore: number}',
      messages: [{ role: 'user', content: context }]
    });
    claudeJson = JSON.parse(claudeRes.content[0].text);
  } catch (e) { console.log('Claude failed'); }

  try {
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-09-2025' });
    const geminiRes = await geminiModel.generateContent(context);
    geminiJson = JSON.parse(geminiRes.response.text());
  } catch (e) { console.log('Gemini failed'); }

  const votes = [claudeJson, geminiJson].filter(Boolean);
  const avgScore = votes.reduce((a, v) => a + (v.score || 0), 0) / votes.length || 0;
  const directionVotes = votes.reduce((acc, v) => { acc[v.direction || 'NO'] = (acc[v.direction || 'NO'] || 0) + 1; return acc; }, {});
  const winningDirection = Object.entries(directionVotes).sort((a, b) => b[1] - a[1])[0][0] || 'NO';
  const conviction = avgScore >= 9.2 ? 'NUCLEAR' : avgScore >= 8.5 ? 'HIGH' : avgScore >= 7.5 ? 'MEDIUM' : 'LOW';
  const confidenceScore = Math.round((votes.filter(v => v.direction === winningDirection).length / votes.length) * 100) || 0;

  return {
    score: Number(avgScore.toFixed(1)),
    direction: winningDirection,
    conviction,
    reasoning: [...new Set([...(claudeJson.reasoning || []), ...(geminiJson.reasoning || [])])],
    targetPrice: claudeJson.targetPrice || geminiJson.targetPrice,
    stopLoss: claudeJson.stopLoss || geminiJson.stopLoss,
    confidenceScore
  };
};
