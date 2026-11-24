import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { EASE, SPRING_POSE, fadeUp, inView } from '../lib/motion';
import { pad2 } from '../lib/format';
import { scrollToTarget } from '../lib/scroll';
import type { Feature, FeatureLayout, Screen } from '../lib/types';
import { Phone } from '../components/Phone';
import { ScreenContent } from '../components/ScreenContent';
import { describeScreen } from '../lib/describe';
import { SectionLabel } from '../components/SectionLabel';
import { Words } from '../components/Words';

interface FeaturesProps {
  features: Feature[];
  screens: Screen[];
}

const LAYOUTS: FeatureLayout[] = ['right', 'left', 'zoom', 'center'];

const layoutOf = (feature: Feature, index: number): FeatureLayout =>
  LAYOUTS.includes(feature.layout as FeatureLayout) ? (feature.layout as FeatureLayout) : LAYOUTS[index % LAYOUTS.length];

/** The screen a chapter points at, falling back to cycling through them all. */
function screenFor(feature: Feature, index: number, screens: Screen[]): { screen: Screen; index: number } | null {
  if (screens.length === 0) return null;
  const match = screens.findIndex((s) => s.key === feature.screen_key);
  const at = match >= 0 ? match : index % screens.length;
  return { screen: screens[at], index: at };
}

export function Features({ features, screens }: FeaturesProps) {
  const wide = useMediaQuery('(min-width: 1024px) and (min-height: 620px)');
  const reduced = useReducedMotion();
  const pinned = wide && !reduced;

  return (
    <section id="features" tabIndex={-1} aria-labelledby="features-title" className="relative">
      {pinned ? (
        <PinnedFeatures features={features} screens={screens} />
      ) : (
        <StackedFeatures features={features} screens={screens} />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------
   Desktop: one pinned frame. The phone travels and turns between
   chapters while the copy and backdrop change around it.
   ------------------------------------------------------------------ */

const POSES: Record<FeatureLayout, { x: string; y: string; scale: number; rx: number; ry: number; rz: number }> = {
  right: { x: '23vw', y: '0vh', scale: 1, rx: 6, ry: -22, rz: 0 },
  left: { x: '-23vw', y: '0vh', scale: 1, rx: 6, ry: 22, rz: 0 },
  zoom: { x: '21vw', y: '21vh', scale: 1.45, rx: 14, ry: -12, rz: -7 },
  center: { x: '0vw', y: '2vh', scale: 0.94, rx: 12, ry: 0, rz: 0 },
};

function PinnedFeatures({ features, screens }: FeaturesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const count = features.length;
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(value * count)));
    setActive((current) => (current === next ? current : next));
  });

  const layout = layoutOf(features[active], active);
  const pose = POSES[layout];
  const rotateX = useSpring(pose.rx, SPRING_POSE);
  const rotateY = useSpring(pose.ry, SPRING_POSE);
  const rotateZ = useSpring(pose.rz, SPRING_POSE);
  useEffect(() => {
    rotateX.set(pose.rx);
    rotateY.set(pose.ry);
    rotateZ.set(pose.rz);
  }, [pose, rotateX, rotateY, rotateZ]);
  const glare = useTransform(rotateY, (v) => `${v * -1.1}%`);

  const shown = screenFor(features[active], active, screens);

  const jump = (index: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    scrollToTarget(top + (span * (index + 0.5)) / count);
  };

  return (
    <div ref={ref} className="relative" style={{ height: `${count * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute left-[4vw] top-[13vh] z-20">
          <SectionLabel index="03" className="text-cyan">
            <span id="features-title" role="heading" aria-level={2}>
              What it does
            </span>
          </SectionLabel>
        </div>

        {/* The travelling phone and its per-chapter backdrop */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-10"
          initial={false}
          animate={{ x: pose.x, y: pose.y, scale: pose.scale }}
          transition={{ type: 'spring', ...SPRING_POSE }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0">
            {features.map((feature, i) => (
              <motion.div
                key={feature.id}
                className="absolute left-0 top-0"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 0.86 }}
                transition={{ duration: 1.1, ease: EASE }}
              >
                <ChapterBackdrop variant={i % 4} />
              </motion.div>
            ))}
          </div>
          <div className="-translate-x-1/2 -translate-y-1/2">
            {shown && (
              <Phone
                width="min(20vw, 29vh)"
                rotateX={rotateX}
                rotateY={rotateY}
                rotateZ={rotateZ}
                glare={glare}
                depth={14}
                label={describeScreen(shown.screen)}
              >
                {screens.map((screen, i) => (
                  <motion.div
                    key={screen.id}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: i === shown.index ? 1 : 0, scale: i === shown.index ? 1 : 1.06 }}
                    transition={{ duration: 0.9, ease: EASE }}
                  >
                    {Math.abs(i - shown.index) <= 1 && <ScreenContent screen={screen} index={i} />}
                  </motion.div>
                ))}
              </Phone>
            )}
          </div>
        </motion.div>

        {/* Chapter copy */}
        {features.map((feature, i) => (
          <ChapterCopy key={feature.id} feature={feature} index={i} active={active} layout={layoutOf(feature, i)} />
        ))}

        {/* Chapter rail */}
        <nav aria-label="Feature chapters" className="absolute bottom-[5vh] left-[4vw] z-20">
          <ol className="flex items-center gap-5">
            {features.map((feature, i) => (
              <li key={feature.id}>
                <RailItem
                  index={i}
                  count={count}
                  title={feature.title}
                  current={i === active}
                  progress={scrollYProgress}
                  onSelect={() => jump(i)}
                />
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}

function RailItem({
  index,
  count,
  title,
  current,
  progress,
  onSelect,
}: {
  index: number;
  count: number;
  title: string;
  current: boolean;
  progress: MotionValue<number>;
  onSelect: () => void;
}) {
  const scaleX = useTransform(progress, [index / count, (index + 1) / count], [0, 1]);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={current ? 'step' : undefined}
      aria-label={`Chapter ${index + 1}: ${title}`}
      className={`group flex min-h-11 items-center gap-3 transition-colors duration-300 ${
        current ? 'text-white' : 'text-dim hover:text-white'
      }`}
    >
      <span className="label">{pad2(index + 1)}</span>
      <span className="relative block h-px w-14 overflow-hidden bg-white/15 xl:w-20">
        <motion.span className="absolute inset-0 origin-left bg-gradient-to-r from-cyan to-electric" style={{ scaleX }} />
      </span>
    </button>
  );
}

function ChapterCopy({
  feature,
  index,
  active,
  layout,
}: {
  feature: Feature;
  index: number;
  active: number;
  layout: FeatureLayout;
}) {
  const on = index === active;
  const shift = index < active ? -48 : 48;
  const reveal = {
    initial: false,
    animate: { opacity: on ? 1 : 0, y: on ? 0 : shift },
    transition: { duration: on ? 0.9 : 0.45, ease: EASE, delay: on ? 0.18 : 0 },
  } as const;

  const numeral = (
    <span aria-hidden="true" className="numeral mb-6 text-[clamp(5rem,10vw,10rem)]">
      {pad2(index + 1)}
    </span>
  );
  const kicker = (
    <p className="label flex flex-wrap items-center gap-3 text-cyan">
      {feature.kicker}
      {feature.is_placeholder && <span className="tag">Placeholder</span>}
    </p>
  );
  const title = (size: string) => (
    <h3 className={`mt-5 font-bold leading-[1.0] tracking-[-0.035em] ${size}`}>
      <Words text={feature.title} show={on} delay={0.2} />
    </h3>
  );
  const description = feature.description && (
    <p className="max-w-md text-lg leading-relaxed text-mist">{feature.description}</p>
  );

  return (
    <article
      className={`absolute inset-0 grid grid-cols-12 items-center gap-x-8 px-[4vw] ${on ? '' : 'pointer-events-none'}`}
    >
      {layout === 'center' ? (
        <>
          <motion.div {...reveal} className="col-span-4 col-start-1">
            {numeral}
            {kicker}
            {title('text-[clamp(2.25rem,3.6vw,4rem)]')}
          </motion.div>
          <motion.div {...reveal} className="col-span-3 col-start-10">
            <span aria-hidden="true" className="mb-6 block h-px w-16 bg-gradient-to-r from-cyan to-transparent" />
            {description}
          </motion.div>
        </>
      ) : (
        <motion.div
          {...reveal}
          className={
            layout === 'left' ? 'col-span-5 col-start-8' : layout === 'zoom' ? 'col-span-6 col-start-1' : 'col-span-5 col-start-1'
          }
        >
          {numeral}
          {kicker}
          {title(layout === 'zoom' ? 'text-[clamp(2.75rem,5vw,5.75rem)]' : 'text-[clamp(2.5rem,4.2vw,4.75rem)]')}
          <div className="mt-7">{description}</div>
        </motion.div>
      )}
    </article>
  );
}

/** Four distinct light compositions that sit behind the phone, one per chapter. */
function ChapterBackdrop({ variant }: { variant: number }) {
  if (variant === 0) {
    return (
      <>
        <span className="fx-glow" style={{ background: 'radial-gradient(closest-side, rgb(77 124 255 / 0.34), transparent 70%)' }} />
        {[58, 82, 108].map((size, i) => (
          <span key={size} className="fx-ring" style={{ width: `${size}vh`, height: `${size}vh` }}>
            <span
              className="fx-orbit"
              style={{ animationDuration: `${24 + i * 10}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}
            >
              <i className="fx-dot" />
            </span>
          </span>
        ))}
      </>
    );
  }
  if (variant === 1) {
    return (
      <>
        <span className="fx-glow" style={{ background: 'radial-gradient(closest-side, rgb(99 230 255 / 0.2), transparent 70%)' }} />
        <span className="fx-beams">
          <span className="fx-scan" />
        </span>
      </>
    );
  }
  if (variant === 2) {
    const cards = [
      { x: '-31vh', y: '-40vh', r: -10, w: '24vh' },
      { x: '8vh', y: '-17vh', r: 7, w: '20vh' },
      { x: '11vh', y: '-41vh', r: 5, w: '17vh' },
    ];
    return (
      <>
        <span className="fx-glow" style={{ background: 'radial-gradient(closest-side, rgb(143 107 255 / 0.36), transparent 70%)' }} />
        {cards.map((card, i) => (
          <span
            key={i}
            className="absolute block"
            style={{ left: card.x, top: card.y, width: card.w, transform: `rotate(${card.r}deg)` }}
          >
            <span className="glass float-chip flex flex-col gap-[1.2vh] rounded-[2vh] p-[1.8vh]" style={{ animationDelay: `${-i * 1.7}s` }}>
              <span className="block h-[6vh] rounded-[1.2vh] bg-gradient-to-br from-electric/70 to-violet/70" />
              <span className="block h-[0.8vh] w-3/4 rounded-full bg-white/40" />
              <span className="block h-[0.8vh] w-1/2 rounded-full bg-white/20" />
            </span>
          </span>
        ))}
      </>
    );
  }
  return (
    <>
      <span className="fx-glow" style={{ background: 'radial-gradient(closest-side, rgb(143 107 255 / 0.3), rgb(77 124 255 / 0.12) 50%, transparent 72%)' }} />
      {[0, 1.8, 3.6].map((delay) => (
        <span key={delay} className="fx-pulse" style={{ animationDelay: `${delay}s` }} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------
   Phones, tablets and reduced motion: chapters stack, and each one
   frames the device differently.
   ------------------------------------------------------------------ */

function StackedFeatures({ features, screens }: FeaturesProps) {
  return (
    <div className="px-5 py-24 sm:px-8 lg:px-[4vw] lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <SectionLabel index="03" className="text-cyan">
          <span id="features-title" role="heading" aria-level={2}>
            What it does
          </span>
        </SectionLabel>
        <div className="mt-14 flex flex-col gap-24 lg:gap-36">
          {features.map((feature, i) => (
            <StackedChapter key={feature.id} feature={feature} index={i} shown={screenFor(feature, i, screens)} />
          ))}
        </div>
      </div>
    </div>
  );
}

const CROPS = [
  { width: 'min(56vw, 250px)', top: '9%', rotateY: 0, rotateX: 8, rotateZ: 0, shift: '0%' },
  { width: 'min(60vw, 270px)', top: '14%', rotateY: -24, rotateX: 6, rotateZ: 5, shift: '16%' },
  { width: 'min(92vw, 420px)', top: '-34%', rotateY: 0, rotateX: 0, rotateZ: 0, shift: '0%' },
  { width: 'min(40vw, 180px)', top: '7%', rotateY: 14, rotateX: 8, rotateZ: -4, shift: '0%' },
];

function StackedChapter({
  feature,
  index,
  shown,
}: {
  feature: Feature;
  index: number;
  shown: { screen: Screen; index: number } | null;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: panel, offset: ['start end', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], [36, -36]);
  const crop = CROPS[index % CROPS.length];
  const flip = index % 2 === 1;

  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={flip ? 'lg:order-2' : ''}>
        <motion.span {...inView} variants={fadeUp} aria-hidden="true" className="numeral mb-5 text-[5.5rem] sm:text-[7rem]">
          {pad2(index + 1)}
        </motion.span>
        <motion.p {...inView} variants={fadeUp} className="label flex flex-wrap items-center gap-3 text-cyan">
          {feature.kicker}
          {feature.is_placeholder && <span className="tag">Placeholder</span>}
        </motion.p>
        <h3 className="mt-5 text-[2.4rem] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
          <Words text={feature.title} />
        </h3>
        {feature.description && (
          <motion.p {...inView} variants={fadeUp} custom={2} className="mt-6 max-w-md text-lg leading-relaxed text-mist">
            {feature.description}
          </motion.p>
        )}
      </div>

      <motion.div
        ref={panel}
        {...inView}
        variants={fadeUp}
        custom={1}
        className="relative h-[26rem] overflow-hidden rounded-[2rem] border border-line bg-abyss sm:h-[32rem]"
      >
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 scale-[0.62]">
          <ChapterBackdrop variant={index % 4} />
        </div>
        {shown && (
          <motion.div
            className="absolute left-1/2"
            style={{ top: crop.top, y: drift, x: crop.shift }}
          >
            <div className="-translate-x-1/2">
              <Phone
                width={crop.width}
                rotateX={crop.rotateX}
                rotateY={crop.rotateY}
                rotateZ={crop.rotateZ}
                depth={8}
                label={describeScreen(shown.screen)}
              >
                <ScreenContent screen={shown.screen} index={shown.index} />
              </Phone>
            </div>
          </motion.div>
        )}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-abyss" />
      </motion.div>
    </article>
  );
}
