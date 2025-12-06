export default async function handler(req, res) {
  try {
    const params = new URLSearchParams(req.url.split('?')[1] || '')
    const url = `https://gamma.api.polymarket.com/markets?${params.toString()}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Gamma API error: ${response.status}`)
    const data = await response.json()
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    res.status(200).json(data)
  } catch (error) {
    console.error('Gamma proxy error:', error.message)
    res.status(500).json({ error: 'Failed to fetch real markets' })
  }
}

export const config = {
  api: {
    externalResolver: true
  }
}
