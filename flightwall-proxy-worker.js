// Cloudflare Worker: tiny proxy that adds CORS to api.adsb.lol.
// Only needed if the FlightWall page says the browser blocked the data server.
// 1. dash.cloudflare.com → Workers & Pages → Create → paste this → Deploy.
// 2. Copy the worker URL (https://something.workers.dev) into FlightWall settings → Data server.
export default {
  async fetch(req) {
    const u = new URL(req.url);
    const target = 'https://api.adsb.lol' + u.pathname + u.search;
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const upstream = await fetch(target, {
      method: req.method,
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'FlightWall-home/1.0' },
      body: req.method === 'POST' ? await req.text() : undefined,
    });
    const h = new Headers(upstream.headers);
    for (const [k, v] of Object.entries(cors)) h.set(k, v);
    return new Response(upstream.body, { status: upstream.status, headers: h });
  },
};
