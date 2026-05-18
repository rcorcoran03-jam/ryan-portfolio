export async function onRequest(context) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-api-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (context.request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (context.request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

  // Rate limiting — 10 requests per IP per day
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
  const today = new Date().toISOString().slice(0, 10);
  const rateLimitKey = `rate_${ip}_${today}`;
  
  try {
    const kv = context.env.RATE_LIMIT;
    if (kv) {
      const count = parseInt(await kv.get(rateLimitKey) || '0');
      if (count >= 10) {
        return new Response(JSON.stringify({ error: 'Daily limit reached. Try again tomorrow.' }), {
          status: 429, headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }
      await kv.put(rateLimitKey, String(count + 1), { expirationTtl: 86400 });
    }
  } catch(e) {}

  try {
    const body = await context.request.json();
    const apiKey = context.request.headers.get('x-user-api-key')
      || context.env.ANTHROPIC_API_KEY || '';
    if (!apiKey) return new Response(JSON.stringify({ error: 'No API key configured.' }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' }
    });

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body),
    });
    const data = await resp.text();
    return new Response(data, { status: resp.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
}
