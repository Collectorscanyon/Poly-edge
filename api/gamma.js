export default async function handler(req, res) {
  try {
    // Use a stable proxy to avoid DNS issues
    const params = new URLSearchParams(req.url.split('?')[1] || '');
    const url = `https://api.polymarket.com/markets?${params.toString()}`; // Direct stable endpoint
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    console.error('Real data fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch real markets', details: error.message });
  }
}

export const config = { api: { externalResolver: true } };