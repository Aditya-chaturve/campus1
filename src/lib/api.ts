import { SITE } from '../config/site';
import type { Platform, SiteData, VerifyResult } from './types';

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  if (body === null) throw new Error('The server sent an empty response.');
  return body as T;
}

export function fetchSite(signal?: AbortSignal): Promise<SiteData> {
  return fetch(SITE.api.site, { signal }).then((r) => readJson<SiteData>(r));
}

export function verifyRelease(): Promise<VerifyResult> {
  return fetch(`${SITE.api.release}?verify=1`, { cache: 'no-store' }).then((r) =>
    readJson<VerifyResult>(r),
  );
}

export function joinWaitlist(email: string, platform: Platform): Promise<{ ok: true; already: boolean }> {
  return fetch(SITE.api.waitlist, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, platform }),
  }).then((r) => readJson<{ ok: true; already: boolean }>(r));
}
