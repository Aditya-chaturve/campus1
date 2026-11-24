import { useEffect } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

export interface Pointer {
  /** -1 (left edge) to 1 (right edge), spring-smoothed. */
  x: MotionValue<number>;
  /** -1 (top edge) to 1 (bottom edge), spring-smoothed. */
  y: MotionValue<number>;
}

/** Pointer position across the viewport. Stays at 0,0 on touch devices. */
export function usePointer(enabled: boolean): Pointer {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 55, damping: 16, mass: 0.9 });
  const y = useSpring(rawY, { stiffness: 55, damping: 16, mass: 0.9 });

  useEffect(() => {
    if (!enabled || !window.matchMedia('(pointer: fine)').matches) {
      rawX.set(0);
      rawY.set(0);
      return;
    }
    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}
