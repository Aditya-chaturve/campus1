import { motion, useScroll, useSpring } from 'framer-motion';

/** Thin line across the top of the window showing how far the page has scrolled. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-electric via-cyan to-violet"
      style={{ scaleX }}
    />
  );
}
