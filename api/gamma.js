export default async function handler(req, res) {
  try {
    const url = `https://gamma.api.polymarket.com/markets${req.url}`;
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Gamma API' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
