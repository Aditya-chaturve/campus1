import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { fadeUp, inView } from '../lib/motion';
import { cssVars, pad2 } from '../lib/format';
import type { Screen } from '../lib/types';
import { ScreenContent } from '../components/ScreenContent';
import { describeScreen } from '../lib/describe';
import { SectionLabel } from '../components/SectionLabel';
import { Words } from '../components/Words';

interface GalleryProps {
  screens: Screen[];
  /** Opens the chosen screen in the interactive viewer above. */
  onOpen: (index: number) => void;
}

export function Gallery({ screens, onOpen }: GalleryProps) {
  const wide = useMediaQuery('(min-width: 1024px) and (min-height: 620px)');
  const reduced = useReducedMotion();

  return (
    <section id="gallery" tabIndex={-1} aria-labelledby="gallery-title" className="relative">
      {wide && !reduced ? <PinnedGallery screens={screens} onOpen={onOpen} /> : <SwipeGallery screens={screens} onOpen={onOpen} />}
    </section>
  );
}

function Intro() {
  return (
    <>
      <SectionLabel index="04" className="text-cyan">
        Interface gallery
      </SectionLabel>
      <h2 id="gallery-title" className="mt-6 text-[2.5rem] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[clamp(3rem,4.6vw,5rem)]">
        <Words text="Every screen, side by side." />
      </h2>
      <motion.p {...inView} variants={fadeUp} custom={2} className="mt-6 max-w-sm text-lg text-mist">
        Pick any one to open it in the viewer.
      </motion.p>
    </>
  );
}

function Card({ screen, index, onOpen, width }: { screen: Screen; index: number; onOpen: (i: number) => void; width: string }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`Open ${screen.label} in the viewer. ${describeScreen(screen)}`}
      className="group block shrink-0 text-left"
    >
      <span
        className="screen-card block transition-[transform,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-3 group-hover:border-white/40 group-hover:shadow-[0_40px_80px_-30px_rgb(77_124_255/0.7)]"
        style={cssVars({ '--pw': width })}
      >
        <ScreenContent screen={screen} index={index} />
        <span className="absolute inset-0 z-10 flex items-end justify-end bg-gradient-to-t from-void/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-paper-ink">
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </span>
      </span>
      <span className="mt-4 flex items-baseline justify-between gap-4">
        <span className="font-display text-lg font-semibold tracking-tight">{screen.label}</span>
        <span className="label text-dim">{pad2(index + 1)}</span>
      </span>
    </button>
  );
}

/** Desktop: vertical scrolling drives the strip sideways through a pinned frame. */
function PinnedGallery({ screens, onOpen }: GalleryProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const travelRef = useRef(0);
  const [travel, setTravel] = useState(0);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const next = Math.max(0, el.scrollWidth - document.documentElement.clientWidth);
      travelRef.current = next;
      setTravel(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [screens.length]);

  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, (v) => -v * travelRef.current);
  const glowX = useTransform(scrollYProgress, [0, 1], ['-20%', '40%']);

  return (
    <div ref={wrap} style={{ height: `calc(100vh + ${travel}px)` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div
          aria-hidden="true"
          style={{ x: glowX }}
          className="pointer-events-none absolute left-1/4 top-1/2 h-[90vh] w-[90vh] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(143_107_255/0.2),transparent_70%)]"
        />
        <motion.div ref={track} style={{ x }} className="relative flex w-max items-center gap-[3.5vw] pl-[4vw] pr-[10vw] will-change-transform">
          <div className="w-[34vw] shrink-0 pr-[3vw]">
            <Intro />
          </div>
          {screens.map((screen, i) => (
            <div key={screen.id} style={{ marginTop: i % 2 ? '9vh' : '-9vh' }}>
              <Card screen={screen} index={i} onOpen={onOpen} width="min(19vw, 27vh)" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/** Touch and reduced motion: a native, snapping horizontal strip. */
function SwipeGallery({ screens, onOpen }: GalleryProps) {
  return (
    <div className="py-24 lg:py-36">
      <div className="px-5 sm:px-8 lg:px-[4vw]">
        <Intro />
      </div>
      <ul className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-[4vw]">
        {screens.map((screen, i) => (
          <li key={screen.id} className="snap-center">
            <Card screen={screen} index={i} onOpen={onOpen} width="min(62vw, 260px)" />
          </li>
        ))}
      </ul>
    </div>
  );
}
