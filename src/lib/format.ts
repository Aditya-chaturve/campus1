import type { CSSProperties } from 'react';

export function formatBytes(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  if (mb >= 1) return `${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function formatVersion(version: string | null | undefined): string | null {
  const clean = version?.trim();
  if (!clean) return null;
  return /^v/i.test(clean) ? clean : `v${clean}`;
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Typed helper for inline CSS custom properties. */
export const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;
