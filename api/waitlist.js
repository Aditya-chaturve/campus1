import supabase from './db-client.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PLATFORMS = ['android', 'ios'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const email = String(body.email ?? '').trim().toLowerCase();
    const platform = String(body.platform ?? 'android').toLowerCase();

    if (!email) return res.status(400).json({ error: 'Enter your email address.' });
    if (email.length > 254 || !EMAIL.test(email)) {
      return res.status(400).json({ error: 'That email address doesn’t look right.' });
    }
    if (!PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: 'Choose Android or iOS.' });
    }

    const { data: existing, error: lookupError } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email)
      .eq('platform', platform)
      .limit(1);
    if (lookupError) throw lookupError;
    if (existing && existing.length > 0) {
      return res.status(200).json({ ok: true, already: true });
    }

    const { error } = await supabase
      .from('waitlist')
      .insert({ email, platform, created_at: new Date().toISOString() });
    if (error) throw error;

    return res.status(201).json({ ok: true, already: false });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'We couldn’t save that just now. Please try again.' });
  }
}
