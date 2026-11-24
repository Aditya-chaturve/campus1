import supabase from './db-client.js';

// One round-trip for everything the page needs: app metadata, the current
// release, feature chapters, screens, install steps and FAQs.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [config, release, features, screens, steps, faqs] = await Promise.all([
      supabase.from('app_config').select('*').order('id', { ascending: true }).limit(1).maybeSingle(),
      supabase
        .from('releases')
        .select('*')
        .eq('is_current', true)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from('features').select('*').order('position', { ascending: true }),
      supabase.from('screens').select('*').order('position', { ascending: true }),
      supabase.from('install_steps').select('*').order('position', { ascending: true }),
      supabase.from('faqs').select('*').order('position', { ascending: true }),
    ]);

    for (const result of [config, release, features, screens, steps, faqs]) {
      if (result.error) throw result.error;
    }
    if (!config.data) {
      return res.status(404).json({ error: 'The app details have not been set up yet.' });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
    return res.status(200).json({
      config: config.data,
      release: release.data ?? null,
      features: features.data ?? [],
      screens: screens.data ?? [],
      steps: steps.data ?? [],
      faqs: faqs.data ?? [],
    });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Could not load the site content.' });
  }
}
