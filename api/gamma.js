export default async function handler(req, res) {
  try {
    const url = `https://gamma.api.polymarket.com/markets${req.url.replace('/api/gamma', '')}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Gamma API error: ${response.status}`);
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    console.error('Gamma proxy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch real markets' });
  }
}
