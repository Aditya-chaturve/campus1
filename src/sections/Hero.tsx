import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { ArrowDownToLine, ArrowRight, Smartphone } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePointer } from '../hooks/usePointer';
import type { Pointer } from '../hooks/usePointer';
import { EASE } from '../lib/motion';
import { cssVars, formatVersion } from '../lib/format';
import type { AppConfig, Release, Screen } from '../lib/types';
import { AppIcon } from '../components/AppIcon';
import { FitText } from '../components/FitText';
import { GlowButton } from '../components/GlowButton';
import { Magnetic } from '../components/Magnetic';
import { Particles } from '../components/Particles';
import { Phone } from '../components/Phone';
import { ScreenContent } from '../components/ScreenContent';
import { describeScreen } from '../lib/describe';
import { Words } from '../components/Words';

interface HeroProps {
  config: AppConfig;
  release: Release | null;
  screens: Screen[];
  ready: boolean;
}

export function Hero({ config, release, screens, ready }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduced = useReducedMotion();
  const inView = useInView(ref, { amount: 0.2 });
  const pointer = usePointer(isDesktop && !reduced);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const available = Boolean(release?.apk_url?.trim());
  const version = formatVersion(release?.version);

  // Scroll-out: the name drifts up and dims, the phone settles back and lies down.
  const wordY = useTransform(scrollYProgress, [0, 1], ['0%', '-22%']);
  const wordOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.42], [1, 0]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const phoneScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const chipsOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  // Entrance: the phone swings in from a steep angle, then follows the pointer.
  const intro = useMotionValue(1);
  const restY = useMotionValue(0);
  const layBack = useMotionValue(26);
  useEffect(() => {
    restY.set(isDesktop ? 0 : -13);
    layBack.set(isDesktop ? 26 : 10);
  }, [isDesktop, restY, layBack]);
  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      intro.set(0);
      return;
    }
    const controls = animate(intro, 0, { duration: 2, ease: EASE, delay: 0.4 });
    return () => controls.stop();
  }, [ready, reduced, intro]);

  const tiltX = useTransform<number, number>(
    [pointer.y, scrollYProgress, intro, layBack],
    ([py, progress, k, lay]) => 5 - py * 8 + progress * lay + k * 34,
  );
  const tiltY = useTransform<number, number>(
    [pointer.x, intro, restY],
    ([px, k, rest]) => rest + px * 14 - k * 26,
  );
  const glare = useTransform(pointer.x, (v) => `${v * -18}%`);

  // The hero phone quietly pages through the app's screens.
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!ready || reduced || !inView || screens.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % screens.length), 3800);
    return () => window.clearInterval(timer);
  }, [ready, reduced, inView, screens.length]);
  const screen = screens.length > 0 ? screens[index % screens.length] : null;

  const state = ready ? 'show' : 'hidden';
  const letters = Array.from(config.name);

  const wordmark = (
    <motion.h1
      className="wordmark select-none text-center font-display font-extrabold"
      style={{ y: wordY, opacity: wordOpacity }}
      aria-label={config.name}
    >
      <FitText measureKey={config.name} maxVh={isDesktop ? 0.33 : 0.24}>
        <span className="block overflow-hidden px-[0.04em] pb-[0.2em] pt-[0.06em]" aria-hidden="true">
          {letters.map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              className="inline-block will-change-transform"
              initial="hidden"
              animate={state}
              variants={{
                hidden: { y: '118%' },
                show: { y: '0%', transition: { duration: 1.5, ease: EASE, delay: 0.3 + i * 0.05 } },
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}
        </span>
      </FitText>
    </motion.h1>
  );

  const statusLine = (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className={`absolute inset-0 rounded-full ${available ? 'bg-cyan' : 'bg-amber'}`} />
        <span className={`absolute -inset-1 animate-ping rounded-full opacity-40 ${available ? 'bg-cyan' : 'bg-amber'}`} />
      </span>
      <span>
        {available
          ? `Android APK ${version ? `${version} ` : ''}is available`
          : 'Android build not yet published'}
      </span>
    </span>
  );

  const rise = (delay: number) => ({
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE, delay } },
  });

  const eyebrow = config.eyebrow && (
    <motion.p
      className="label mb-5 flex items-center gap-3 text-cyan"
      initial="hidden"
      animate={state}
      variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE, delay: 0.95 } } }}
    >
      <span className="h-px w-8 bg-current" aria-hidden="true" />
      {config.eyebrow}
    </motion.p>
  );

  const headline = config.headline && (
    <p className="max-w-[20ch] font-display text-[1.75rem] font-semibold leading-[1.08] tracking-[-0.02em] [text-wrap:balance] sm:text-4xl lg:text-[clamp(1.75rem,2.6vw,2.9rem)]">
      <Words text={config.headline} show={ready} delay={1.0} />
    </p>
  );

  const description = config.description && (
    <motion.p
      className="max-w-md text-[1.02rem] leading-relaxed text-mist"
      initial="hidden"
      animate={state}
      variants={rise(1.3)}
    >
      {config.description}
    </motion.p>
  );

  const actions = (
    <>
      <motion.div
        className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap"
        initial="hidden"
        animate={state}
        variants={rise(1.45)}
      >
        <Magnetic className="w-full sm:w-auto">
          <GlowButton
            href="#download"
            size="lg"
            className="w-full sm:w-auto"
            icon={<ArrowDownToLine size={18} aria-hidden="true" />}
          >
            Download the app
          </GlowButton>
        </Magnetic>
        <Magnetic className="w-full sm:w-auto">
          <GlowButton
            href="#experience"
            variant="ghost"
            size="lg"
            className="group w-full sm:w-auto"
            trailing={
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            }
          >
            Explore the experience
          </GlowButton>
        </Magnetic>
      </motion.div>
      <motion.p
        className="label mt-6 text-mist"
        initial="hidden"
        animate={state}
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1, delay: 1.7 } } }}
      >
        {statusLine}
      </motion.p>
    </>
  );

  const phone = (width: string) => (
    <motion.div style={isDesktop ? { y: phoneY, scale: phoneScale } : undefined}>
      <motion.div
        initial="hidden"
        animate={state}
        variants={{
          hidden: { opacity: 0, y: 160, scale: 0.86 },
          show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.9, ease: EASE, delay: 0.4 } },
        }}
      >
        <div className="float-slow">
          <Phone
            width={width}
            rotateX={tiltX}
            rotateY={tiltY}
            glare={glare}
            depth={14}
            halo
            label={screen ? describeScreen(screen, config.name) : `${config.name} on a phone`}
          >
            <AnimatePresence initial={false}>
              {screen && (
                <motion.div
                  key={screen.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <ScreenContent screen={screen} index={index % screens.length} eager />
                </motion.div>
              )}
            </AnimatePresence>
          </Phone>
        </div>
      </motion.div>
    </motion.div>
  );

  const releaseChip = (
    <div className="glass flex w-max items-center gap-3 whitespace-nowrap rounded-2xl py-3 pl-3 pr-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-electric to-violet">
        <Smartphone size={18} aria-hidden="true" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="label text-mist">Android · APK</span>
        <span className="text-sm font-medium leading-none">
          {available ? `${version ?? 'Build'} ready` : 'Not yet published'}
        </span>
      </span>
    </div>
  );

  const noticeChip = (
    <div className="glass flex w-56 items-center gap-3 rounded-2xl p-3">
      <AppIcon name={config.name} src={config.icon_url} size={40} />
      <span className="flex flex-1 flex-col gap-2" aria-hidden="true">
        <span className="h-2 w-24 rounded-full bg-white/50" />
        <span className="h-2 w-full rounded-full bg-white/20" />
        <span className="h-2 w-3/5 rounded-full bg-white/20" />
      </span>
    </div>
  );

  const controlChip = (
    <div className="glass flex w-48 flex-col gap-4 rounded-2xl p-4" aria-hidden="true">
      <span className="flex items-center justify-between">
        <span className="h-2 w-16 rounded-full bg-white/40" />
        <span className="flex h-6 w-11 items-center justify-end rounded-full bg-gradient-to-r from-electric to-cyan p-0.5">
          <span className="h-5 w-5 rounded-full bg-white" />
        </span>
      </span>
      <span className="relative h-1.5 rounded-full bg-white/15">
        <span className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-gradient-to-r from-violet to-electric" />
        <span className="absolute left-2/3 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_rgb(120_150_255/0.9)]" />
      </span>
    </div>
  );

  const orbChip = (
    <div className="glass grid h-24 w-24 place-items-center rounded-full" aria-hidden="true">
      <svg width="62" height="62" viewBox="0 0 62 62">
        <circle cx="31" cy="31" r="25" fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="5" />
        <circle
          cx="31"
          cy="31"
          r="25"
          fill="none"
          stroke="url(#orb-stroke)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="110 200"
          transform="rotate(-90 31 31)"
        />
        <defs>
          <linearGradient id="orb-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#63e6ff" />
            <stop offset="1" stopColor="#8f6bff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  return (
    <section
      ref={ref}
      id="top"
      tabIndex={-1}
      aria-label={`${config.name} introduction`}
      className="relative isolate overflow-clip lg:h-[100svh] lg:min-h-[680px]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="hero-base absolute inset-0" />
        <div className="aurora aurora-a" />
        <div className="aurora aurora-b" />
        <div className="hero-grid absolute inset-0" />
        <div className="hero-beam absolute inset-0" />
        <Particles />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-void" />
      </div>

      {isDesktop ? (
        <>
          <div className="absolute inset-x-[4vw] top-[13vh]">{wordmark}</div>

          <div className="absolute left-1/2 top-[25vh] -translate-x-1/2">
            <div className="relative">
              {phone('min(21.5vw, 30vh)')}
              <motion.div style={{ opacity: chipsOpacity }} className="pointer-events-none absolute inset-0">
                <Chip pointer={pointer} depth={1.5} ready={ready} delay={1.5} floatDelay="-1s" className="right-[106%] top-[23%]">
                  {releaseChip}
                </Chip>
                <Chip pointer={pointer} depth={2.3} ready={ready} delay={1.65} floatDelay="-3s" className="left-[98%] top-[16%]">
                  {noticeChip}
                </Chip>
                <Chip pointer={pointer} depth={1.1} ready={ready} delay={1.8} floatDelay="-2s" className="left-[106%] top-[40%] [@media(max-height:780px)]:hidden">
                  {controlChip}
                </Chip>
                <Chip pointer={pointer} depth={2.8} ready={ready} delay={1.95} floatDelay="-4s" className="right-[122%] top-[4%]">
                  {orbChip}
                </Chip>
              </motion.div>
            </div>
          </div>

          <motion.div
            style={{ y: copyY, opacity: copyOpacity }}
            className="absolute bottom-[7vh] left-[4vw] flex w-[min(33rem,35vw)] flex-col items-start"
          >
            {eyebrow}
            {headline}
            {actions}
          </motion.div>

          <motion.div style={{ y: copyY, opacity: copyOpacity }} className="absolute bottom-[7vh] right-[4vw] w-[min(22rem,24vw)]">
            {description}
            <motion.div
              className="mt-7 flex items-end justify-between gap-4 border-t border-line pt-5"
              initial="hidden"
              animate={state}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1.2, delay: 1.8 } } }}
            >
              <dl className="label grid gap-2 whitespace-nowrap text-dim">
                <div>
                  <dt className="inline">Platform </dt>
                  <dd className="inline text-ink">Android</dd>
                </div>
                <div>
                  <dt className="inline">Format </dt>
                  <dd className="inline text-ink">APK</dd>
                </div>
                <div>
                  <dt className="inline">Release </dt>
                  <dd className="inline text-ink">{version ?? 'Unreleased'}</dd>
                </div>
              </dl>
              <a
                href={config.philosophy_body?.trim() ? '#why' : '#download'}
                className="label flex flex-col items-center gap-3 text-mist transition-colors hover:text-white"
              >
                <span className="scroll-cue" aria-hidden="true" />
                Scroll
              </a>
            </motion.div>
          </motion.div>
        </>
      ) : (
        <div className="flex flex-col px-5 pb-0 pt-28 sm:px-8 sm:pt-32">
          {wordmark}
          <div className="mt-8 flex flex-col items-start sm:mt-10 sm:max-w-xl">
            {eyebrow}
            {headline}
            <div className="mt-5">{description}</div>
            {actions}
          </div>
          <div
            className="relative mt-14 flex justify-center overflow-hidden pt-6"
            style={{
              ...cssVars({ '--pw': 'min(62vw, 300px)' }),
              height: 'calc(var(--pw) * 1.62)',
              WebkitMaskImage: 'linear-gradient(180deg, #000 68%, transparent 100%)',
              maskImage: 'linear-gradient(180deg, #000 68%, transparent 100%)',
            }}
          >
            <div className="relative">
              {phone('min(62vw, 300px)')}
              <Chip pointer={pointer} depth={0} ready={ready} delay={1.5} floatDelay="-1s" className="-left-[19%] top-[3%] origin-left scale-[0.86] sm:scale-100">
                {releaseChip}
              </Chip>
              <Chip pointer={pointer} depth={0} ready={ready} delay={1.7} floatDelay="-3s" className="-right-[19%] top-[40%] origin-right scale-[0.76] sm:scale-100">
                {controlChip}
              </Chip>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

interface ChipProps {
  children: ReactNode;
  pointer: Pointer;
  /** Parallax strength; larger values sit "closer" to the viewer. */
  depth: number;
  ready: boolean;
  delay: number;
  floatDelay: string;
  className?: string;
}

/** A floating interface fragment that drifts with the pointer for depth. */
function Chip({ children, pointer, depth, ready, delay, floatDelay, className = '' }: ChipProps) {
  const x: MotionValue<number> = useTransform(pointer.x, (v) => v * depth * -16);
  const y: MotionValue<number> = useTransform(pointer.y, (v) => v * depth * -12);
  return (
    <div className={`absolute z-10 ${className}`}>
      <motion.div style={{ x, y }}>
        <motion.div
          initial="hidden"
          animate={ready ? 'show' : 'hidden'}
          variants={{
            hidden: { opacity: 0, scale: 0.7, y: 30 },
            show: { opacity: 1, scale: 1, y: 0, transition: { duration: 1.1, ease: EASE, delay } },
          }}
        >
          <div className="float-chip" style={cssVars({ '--float-delay': floatDelay })}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
