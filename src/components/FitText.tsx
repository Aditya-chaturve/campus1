import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';

interface FitTextProps {
  children: ReactNode;
  /** Re-measure when this changes (normally the text itself). */
  measureKey: string;
  /** Upper bound for the font size, as a fraction of the viewport height. */
  maxVh?: number;
  className?: string;
}

/** Scales one line of text so it spans the full width of its container. */
export function FitText({ children, measureKey, maxVh = 1, className = '' }: FitTextProps) {
  const outer = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const box = outer.current;
    const text = inner.current;
    if (!box || !text) return;
    let alive = true;

    const fit = () => {
      if (!alive) return;
      text.style.fontSize = '100px';
      const natural = text.offsetWidth;
      if (natural === 0) return;
      const fitted = (box.clientWidth / natural) * 100;
      const cap = window.innerHeight * maxVh;
      text.style.fontSize = `${Math.floor(Math.min(fitted, cap) * 100) / 100}px`;
      text.style.visibility = 'visible';
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    document.fonts?.ready.then(fit).catch(() => undefined);
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [measureKey, maxVh]);

  return (
    <span ref={outer} className={`block w-full ${className}`}>
      <span ref={inner} className="inline-block whitespace-nowrap" style={{ visibility: 'hidden' }}>
        {children}
      </span>
    </span>
  );
}
