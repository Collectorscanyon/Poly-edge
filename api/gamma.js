export default async function handler(req, res) {
  try {
    const params = new URLSearchParams(req.url.split('?')[1] || '');
    const url = `https://gamma-api.polymarket.com/markets?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Gamma error');
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch real markets' });
  }
}
