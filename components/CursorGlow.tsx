import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useMediaQuery } from '../hooks/useMediaQuery';

const INTERACTIVE = 'a, button, input, select, label, [role="tab"]';

/**
 * Desktop-only pointer companion: a soft pool of light that trails the cursor
 * and a ring that widens over anything clickable. The system cursor stays.
 */
export function CursorGlow() {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const glowX = useSpring(x, { stiffness: 60, damping: 20, mass: 0.8 });
  const glowY = useSpring(y, { stiffness: 60, damping: 20, mass: 0.8 });
  const ringX = useSpring(x, { stiffness: 380, damping: 32, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 380, damping: 32, mass: 0.4 });
  const [hot, setHot] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      setHot(Boolean((event.target as Element | null)?.closest?.(INTERACTIVE)));
    };
    const onLeave = () => setVisible(false);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      <motion.div
        className="absolute -left-[280px] -top-[280px] h-[560px] w-[560px] rounded-full mix-blend-screen"
        style={{
          x: glowX,
          y: glowY,
          opacity: visible ? 1 : 0,
          background: 'radial-gradient(closest-side, rgb(77 124 255 / 0.13), rgb(143 107 255 / 0.05) 50%, transparent)',
          transition: 'opacity 0.5s',
        }}
      />
      <motion.div
        className="absolute -left-[18px] -top-[18px] h-9 w-9 rounded-full border border-white/70 mix-blend-difference"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hot ? 1.7 : 1, opacity: visible ? (hot ? 0.9 : 0.4) : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      />
    </div>
  );
}
