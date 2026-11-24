/**
 * Site-level configuration. Everything about the app itself (name, copy,
 * screens, release, APK link) lives in the database and arrives through
 * /api/site, so nothing here needs to change when the app's details do.
 */
export const SITE = {
  api: {
    site: '/api/site',
    release: '/api/release',
    waitlist: '/api/waitlist',
  },
  /** In-page navigation, in scroll order. */
  sections: [
    { id: 'why', label: 'Why' },
    { id: 'experience', label: 'Experience' },
    { id: 'features', label: 'Features' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'download', label: 'Download' },
    { id: 'faq', label: 'FAQ' },
  ],
  /** How long a successful APK link check is trusted before re-checking. */
  verifyTtlMs: 60_000,
  /** Shortest time the opening curtain stays up, so it never just flickers. */
  minLoaderMs: 650,
} as const;

export type SectionId = (typeof SITE.sections)[number]['id'];
export type SectionLink = (typeof SITE.sections)[number];
