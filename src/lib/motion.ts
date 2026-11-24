import type { Variants } from 'framer-motion';

/** Shared easing curves so every animation on the page moves the same way. */
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const SPRING_POSE = { stiffness: 70, damping: 18, mass: 0.9 } as const;
export const SPRING_TILT = { stiffness: 110, damping: 16, mass: 0.5 } as const;

/** Rise-and-fade used for blocks of content. `custom` is the stagger index. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: EASE, delay: i * 0.09 },
  }),
};

export const inView = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-12% 0px -8% 0px' },
} as const;
