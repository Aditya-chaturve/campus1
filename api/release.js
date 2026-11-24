import supabase from './db-client.js';

const TIMEOUT_MS = 8000;

function isSafeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return false;
    // Refuse bare IP addresses so the check can't be pointed at private ranges.
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) return false;
    return true;
  } catch {
    return false;
  }
}

function sizeFrom(response) {
  const range = response.headers.get('content-range');
  if (range && range.includes('/')) {
    const total = Number(range.split('/').pop());
    if (Number.isFinite(total) && total > 0) return total;
  }
  if (response.status === 206) return null;
  const length = Number(response.headers.get('content-length'));
  return Number.isFinite(length) && length > 0 ? length : null;
}

// Ask the file host whether the APK is really there, without downloading it.
async function probe(url) {
  const base = {
    redirect: 'follow',
    headers: { 'User-Agent': 'app-download-check/1.0', Accept: '*/*' },
  };

  let response = await fetch(url, { ...base, method: 'HEAD', signal: AbortSignal.timeout(TIMEOUT_MS) });
  let size = response.ok ? sizeFrom(response) : null;

  // Some hosts reject HEAD or omit the length; a one-byte ranged GET settles it.
  if (!response.ok || size === null) {
    const ranged = await fetch(url, {
      ...base,
      method: 'GET',
      headers: { ...base.headers, Range: 'bytes=0-0' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    try {
      await ranged.body?.cancel();
    } catch {
      /* nothing to cancel */
    }
    if (ranged.ok) {
      response = ranged;
      size = sizeFrom(ranged);
    } else if (!response.ok) {
      response = ranged;
    }
  }

  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  return { ok: response.ok, status: response.status, size, contentType };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data: release, error } = await supabase
      .from('releases')
      .select('*')
      .eq('is_current', true)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;

    res.setHeader('Cache-Control', 'no-store');

    if (!req.query.verify) return res.status(200).json(release ?? null);

    const url = release?.apk_url?.trim();
    if (!url) {
      return res.status(200).json({
        available: false,
        kind: null,
        status: null,
        size: null,
        contentType: null,
        reason: 'No Android build has been published yet.',
      });
    }
    if (!isSafeUrl(url)) {
      return res.status(200).json({
        available: false,
        kind: null,
        status: null,
        size: null,
        contentType: null,
        reason: 'The download link is not a valid https address.',
      });
    }

    try {
      const result = await probe(url);
      const isPage = result.contentType === 'text/html';
      return res.status(200).json({
        available: result.ok,
        kind: result.ok ? (isPage ? 'page' : 'file') : null,
        status: result.status,
        size: isPage ? null : result.size,
        contentType: result.contentType || null,
        reason: result.ok ? null : `The file host answered with an error (HTTP ${result.status}).`,
      });
    } catch (probeError) {
      const timedOut = probeError?.name === 'TimeoutError' || probeError?.name === 'AbortError';
      return res.status(200).json({
        available: false,
        kind: null,
        status: null,
        size: null,
        contentType: null,
        reason: timedOut
          ? 'The file host took too long to respond.'
          : 'The file host could not be reached.',
      });
    }
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Could not check the release.' });
  }
}
