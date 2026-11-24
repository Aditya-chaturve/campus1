import { useState } from 'react';

interface AppIconProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

/**
 * The app's icon. Until a real icon URL is supplied it draws a neutral mark
 * (a ring with an off-centre point) on the site's light palette.
 */
export function AppIcon({ name, src, size = 40, className = '' }: AppIconProps) {
  const [failed, setFailed] = useState(false);
  const radius = Math.round(size * 0.26);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${name} app icon`}
        width={size}
        height={size}
        decoding="async"
        onError={() => setFailed(true)}
        className={`shrink-0 object-cover ${className}`}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  return (
    <svg
      role="img"
      aria-label={`${name} app icon`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`shrink-0 ${className}`}
      style={{ borderRadius: radius }}
    >
      <defs>
        <linearGradient id="icon-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a2a6c" />
          <stop offset="1" stopColor="#05070f" />
        </linearGradient>
        <radialGradient id="icon-a" cx="0.2" cy="0.15" r="0.8">
          <stop offset="0" stopColor="#8f6bff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#8f6bff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="icon-b" cx="0.85" cy="0.9" r="0.75">
          <stop offset="0" stopColor="#63e6ff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#63e6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" fill="url(#icon-bg)" />
      <rect width="64" height="64" fill="url(#icon-a)" />
      <rect width="64" height="64" fill="url(#icon-b)" />
      <circle cx="32" cy="32" r="14.5" fill="none" stroke="#fff" strokeWidth="4.5" />
      <circle cx="42.5" cy="21.5" r="5" fill="#fff" />
    </svg>
  );
}
