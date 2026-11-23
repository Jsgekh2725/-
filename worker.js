/**
 * بروكسي فحص يوزرات ديسكورد — Cloudflare Worker
 * ------------------------------------------------
 * الطريقة:
 * 1) ادخل dash.cloudflare.com ← Workers & Pages ← Create ← Worker
 * 2) Deploy ثم Edit code، امسح الموجود والصق هذا الملف كامل
 * 3) Deploy وانسخ رابط workers.dev وحطه بإعدادات الموقع
 *
 * اختياري: عشان محد غيرك يستخدم البروكسي، غيّر ALLOWED_ORIGIN لرابط موقعك
 * مثال: const ALLOWED_ORIGIN = 'https://yourname.github.io';
 */

const ALLOWED_ORIGIN = '*';
const DISCORD_URL = 'https://discord.com/api/v9/unique-username/username-attempt-unauthed';

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allow = ALLOWED_ORIGIN === '*' ? '*' : (origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(data, status, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method === 'GET') {
      return json({ ok: true, message: 'Discord username checker proxy is running' }, 200, request);
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, request);
    }

    if (ALLOWED_ORIGIN !== '*') {
      const origin = request.headers.get('Origin') || '';
      if (origin !== ALLOWED_ORIGIN) return json({ error: 'Origin not allowed' }, 403, request);
    }

    let username = '';
    try {
      const body = JSON.parse(await request.text());
      username = String(body.username || '').trim().toLowerCase();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, request);
    }

    if (!/^[a-z0-9_.]{2,32}$/.test(username) || username.includes('..')) {
      return json({ error: 'Invalid username' }, 400, request);
    }

    let res;
    try {
      res = await fetch(DISCORD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
        body: JSON.stringify({ username }),
      });
    } catch (e) {
      return json({ error: 'Failed to reach Discord' }, 502, request);
    }

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
    });
  },
};
