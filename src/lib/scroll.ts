import type Lenis from 'lenis';

let lenis: Lenis | null = null;
let locked = false;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Starts inertial wheel scrolling on desktop. The library is fetched on demand,
 * so phones and reduced-motion visitors never download it. Returns a cleanup.
 */
export function initSmoothScroll(): () => void {
  let cancelled = false;
  let frame = 0;
  let instance: Lenis | null = null;

  import('lenis')
    .then(({ default: LenisClass }) => {
      if (cancelled || lenis) return;
      instance = new LenisClass({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
      lenis = instance;
      if (locked) instance.stop();
      const loop = (time: number) => {
        instance?.raf(time);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    })
    .catch(() => undefined);

  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    instance?.destroy();
    if (lenis === instance) lenis = null;
  };
}

interface ScrollOptions {
  immediate?: boolean;
  offset?: number;
}

/** Scrolls to a selector or a pixel position, with or without Lenis. */
export function scrollToTarget(target: string | number, { immediate = false, offset = 0 }: ScrollOptions = {}) {
  let top: number;
  let element: HTMLElement | null = null;

  if (typeof target === 'number') {
    top = target;
  } else {
    try {
      element = document.querySelector<HTMLElement>(target);
    } catch {
      element = null;
    }
    if (!element) return;
    top = element.getBoundingClientRect().top + window.scrollY + offset;
  }

  const instant = immediate || prefersReducedMotion();
  if (lenis) {
    lenis.scrollTo(top, { immediate: instant, duration: 1.5, force: true });
  } else {
    window.scrollTo({ top, behavior: instant ? 'auto' : 'smooth' });
  }

  if (element) {
    // Keep keyboard and screen-reader focus in step with the visual jump.
    element.focus({ preventScroll: true });
    if (element.id) history.replaceState(null, '', `#${element.id}`);
  }
}

export function lockScroll(shouldLock: boolean) {
  locked = shouldLock;
  document.documentElement.style.overflow = shouldLock ? 'hidden' : '';
  if (lenis) {
    if (shouldLock) lenis.stop();
    else lenis.start();
  }
}
