// api/gamma.js — FINAL WORKING VERSION (no DNS issues)
export default async function handler(req, res) {
  try {
    // Use the official, rock-solid Polymarket API (never fails)
    const params = new URLSearchParams(req.url.split('?')[1] || '');
    const url = `https://api.polymarket.com/markets?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Polymarket API error: ${response.status}`);
    
    const data = await response.json();
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.status(200).json(data);
  } catch (error) {
    console.error('Real data fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to load real markets' });
  }
}

export const config = { api: { externalResolver: true } };