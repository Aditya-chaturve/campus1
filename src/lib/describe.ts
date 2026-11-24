import type { Screen } from './types';

/** Text alternative for a device showing the given screen. */
export function describeScreen(screen: Screen, appName: string | null = null): string {
  const subject = appName ? `${appName} ` : '';
  return screen.image_url
    ? `${subject}screenshot: ${screen.label}${screen.caption ? `. ${screen.caption}` : ''}`
    : `Placeholder for ${screen.label.toLowerCase()}. No screenshot has been added yet.`;
}
