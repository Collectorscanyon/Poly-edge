// api/gamma.js — Gamma markets proxy
export default async function handler(req, res) {
  try {
    const queryString = req.url.split('?')[1] || '';
    const incomingParams = new URLSearchParams(queryString);

    const url = new URL('https://gamma-api.polymarket.com/markets');
    const limitParam = incomingParams.get('limit');
    const safeLimit = Math.min(Math.max(Number(limitParam) || 200, 1), 200);

    incomingParams.delete('limit');
    incomingParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    url.searchParams.set('limit', String(safeLimit));

    const response = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      console.error('Gamma API non-OK:', response.status, details);
      return res
        .status(502)
        .json({ error: 'Upstream Gamma error', status: response.status });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.status(200).json(data);
  } catch (error) {
    console.error('Real data fetch failed:', error);
    res.status(500).json({ error: 'Failed to load real markets' });
  }
}

export const config = { api: { externalResolver: true } };
