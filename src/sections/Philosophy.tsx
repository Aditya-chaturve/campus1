import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import type { AppConfig } from '../lib/types';
import { SectionLabel } from '../components/SectionLabel';

/** "Why this app exists": one statement that lights up word by word on scroll. */
export function Philosophy({ config }: { config: AppConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.82', 'end 0.5'] });
  const { scrollYProgress: sectionProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const arcY = useTransform(sectionProgress, [0, 1], ['18%', '-18%']);

  const body = config.philosophy_body?.trim();
  if (!body) return null;
  const words = body.split(/\s+/);

  return (
    <section id="why" tabIndex={-1} aria-labelledby="why-title" className="relative overflow-clip px-5 py-28 sm:px-8 lg:px-[4vw] lg:py-48">
      <motion.div
        aria-hidden="true"
        style={{ y: arcY }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line [mask-image:linear-gradient(180deg,#000,transparent_62%)]"
      />
      <div className="relative mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <SectionLabel index="01" className="text-cyan">
            <span id="why-title">{config.philosophy_heading || 'Why it exists'}</span>
          </SectionLabel>
          {config.is_placeholder && <span className="tag mt-5">Placeholder copy</span>}
        </div>
        <div ref={ref} className="lg:col-span-9">
          <p className="font-display text-[2rem] font-semibold leading-[1.12] tracking-[-0.025em] sm:text-5xl lg:text-[clamp(2.75rem,4.3vw,4.75rem)]">
            <span className="sr-only">{body}</span>
            <span aria-hidden="true">
              {words.map((word, i) => (
                <ScrollWord
                  key={`${word}-${i}`}
                  progress={scrollYProgress}
                  from={i / words.length}
                  to={(i + 1.6) / words.length}
                  still={Boolean(reduced)}
                >
                  {word}
                </ScrollWord>
              ))}
            </span>
          </p>
          <motion.div
            aria-hidden="true"
            style={{ scaleX: lineScale }}
            className="mt-14 h-px origin-left bg-gradient-to-r from-cyan via-electric to-transparent"
          />
          {config.developer_name && <p className="label mt-6 text-mist">{config.developer_name}</p>}
        </div>
      </div>
    </section>
  );
}

function ScrollWord({
  children,
  progress,
  from,
  to,
  still,
}: {
  children: string;
  progress: MotionValue<number>;
  from: number;
  to: number;
  still: boolean;
}) {
  const opacity = useTransform(progress, [from, Math.min(1, to)], [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity: still ? 1 : opacity }}>{children}</motion.span>{' '}
    </>
  );
}
