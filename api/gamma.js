export default async function handler(req, res) {
  try {
    const gammaPath = (req.url || '').replace(/^\/api\/gamma/, '') || '';
    const url = `https://gamma.api.polymarket.com/markets${gammaPath}`;
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gamma proxy upstream error:', response.status, errorBody);
      return res
        .status(response.status)
        .json({ error: 'Gamma upstream error', status: response.status });
    }
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    console.error('Gamma proxy failed:', error);
    res.status(500).json({ error: 'Failed to fetch real markets' });
  }
}

export const config = { api: { externalResolver: true } };
