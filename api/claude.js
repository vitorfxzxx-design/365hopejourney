export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, anthropic-version, dangerously-allow-browser, anthropic-dangerous-direct-browser-access');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const { apiKey, model, max_tokens, temperature, system, messages } = body || {};
    const headerKey = req.headers['x-api-key'] || req.headers['X-Api-Key'] || req.headers['authorization'];
    const cleanHeaderKey = headerKey ? headerKey.replace(/^Bearer\s+/i, '').trim() : '';
    const keyToUse = (apiKey || cleanHeaderKey || process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY || '').trim();

    if (!keyToUse) {
      return res.status(400).json({ error: 'Missing Anthropic API Key.' });
    }

    const normalizeClaudeModel = (name) => {
      if (!name) return 'claude-sonnet-4-5-20250929';
      const lower = String(name).toLowerCase();
      if (lower.includes('4-6') && lower.includes('opus')) {
        return 'claude-opus-4-6';
      }
      if (lower.includes('4-6')) {
        return 'claude-sonnet-4-6';
      }
      if (lower.includes('haiku')) {
        return 'claude-haiku-4-5-20251001';
      }
      if (lower.includes('opus')) {
        return 'claude-opus-4-5-20251101';
      }
      return 'claude-sonnet-4-5-20250929';
    };

    const targetModel = normalizeClaudeModel(model);

    const payload = {
      model: targetModel,
      max_tokens: typeof max_tokens === 'number' ? max_tokens : 1024,
      temperature: typeof temperature === 'number' ? temperature : 0.2,
      messages: Array.isArray(messages) ? messages : []
    };
    if (system) {
      payload.system = system;
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': keyToUse,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    const data = await anthropicRes.json();
    return res.status(anthropicRes.status).json(data);
  } catch (error) {
    console.error('Claude API Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

