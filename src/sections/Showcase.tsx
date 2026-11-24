import type { KeyboardEvent, PointerEvent } from 'react';
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EASE, SPRING_TILT, fadeUp, inView } from '../lib/motion';
import { pad2 } from '../lib/format';
import type { Screen } from '../lib/types';
import { Phone } from '../components/Phone';
import { ScreenContent } from '../components/ScreenContent';
import { describeScreen } from '../lib/describe';
import { SectionLabel } from '../components/SectionLabel';
import { Words } from '../components/Words';

interface ShowcaseProps {
  screens: Screen[];
  active: number;
  onChange: (index: number) => void;
  placeholder: boolean;
}

const screenMotion = {
  enter: (dir: number) => ({ x: `${dir * 62}%`, opacity: 0, scale: 0.94 }),
  center: { x: '0%', opacity: 1, scale: 1, transition: { duration: 0.85, ease: EASE } },
  exit: (dir: number) => ({ x: `${dir * -38}%`, opacity: 0, scale: 0.94, transition: { duration: 0.6, ease: EASE } }),
};

/** Step through the app's screens on a device: click, arrow keys or swipe. */
export function Showcase({ screens, active, onChange, placeholder }: ShowcaseProps) {
  const [dir, setDir] = useState(1);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const count = screens.length;
  const screen = screens[active];
  const anySchematic = screens.some((s) => !s.image_url);

  const go = (target: number, focus = false) => {
    const next = (target + count) % count;
    if (next === active) return;
    setDir(target > active ? 1 : -1);
    onChange(next);
    if (focus) tabs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: count - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    go(keys[event.key], true);
  };

  // Device leans toward the pointer while it is over the stage.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-1, 1], [-16, 16]), SPRING_TILT);
  const rotateX = useSpring(useTransform(py, [-1, 1], [10, -10]), SPRING_TILT);
  const glare = useTransform(rotateY, (v) => `${v * -1.4}%`);
  const onStageMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    py.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };
  const onStageLeave = () => {
    px.set(0);
    py.set(0);
  };
  const onPanEnd = (_: unknown, info: PanInfo) => {
    const { x, y } = info.offset;
    if (Math.abs(x) > 48 && Math.abs(x) > Math.abs(y) * 1.2) go(active + (x < 0 ? 1 : -1));
  };

  return (
    <section id="experience" tabIndex={-1} aria-labelledby="experience-title" className="relative px-5 py-24 sm:px-8 lg:px-[4vw] lg:py-36">
      <div className="mx-auto grid max-w-[1500px] gap-x-10 gap-y-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
        <div className="lg:col-span-5 lg:row-start-1">
          <SectionLabel index="02" className="text-cyan">
            The experience
          </SectionLabel>
          <h2 id="experience-title" className="mt-6 text-[2.5rem] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[clamp(3rem,4.6vw,5rem)]">
            <Words text="Walk through it before you install it." />
          </h2>
          <motion.p {...inView} variants={fadeUp} custom={2} className="mt-6 max-w-md text-lg text-mist">
            {anySchematic
              ? 'These are schematic stand-ins, not the real interface. Each one is replaced by a screenshot from the app as soon as one is added.'
              : 'Screenshots from the app, shown on a mock device. This is a preview, not a running copy of the app.'}
          </motion.p>
        </div>

        {/* Stage */}
        <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
          <motion.div
            {...inView}
            variants={fadeUp}
            className="relative flex flex-col items-center lg:sticky lg:top-[9vh]"
          >
            <motion.div
              className="relative flex w-full touch-pan-y items-center justify-center py-10"
              onPointerMove={onStageMove}
              onPointerLeave={onStageLeave}
              onPanEnd={onPanEnd}
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[min(120vw,760px)] w-[min(120vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(77_124_255/0.3),rgb(143_107_255/0.08)_55%,transparent)]" />
                <div className="absolute left-1/2 top-1/2 h-[min(96vw,620px)] w-[min(96vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line" />
                <div className="absolute left-1/2 top-1/2 h-[min(130vw,860px)] w-[min(130vw,860px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line opacity-50" />
              </div>
              <div
                id="experience-panel"
                role="tabpanel"
                aria-labelledby={`screen-tab-${screen.id}`}
                className="relative"
              >
                <Phone
                  width="min(66vw, 28vh, 310px)"
                  rotateX={rotateX}
                  rotateY={rotateY}
                  glare={glare}
                  label={describeScreen(screen)}
                >
                  <AnimatePresence initial={false} custom={dir}>
                    <motion.div
                      key={screen.id}
                      custom={dir}
                      variants={screenMotion}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute inset-0"
                    >
                      <ScreenContent screen={screen} index={active} />
                    </motion.div>
                  </AnimatePresence>
                </Phone>
              </div>
            </motion.div>

            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => go(active - 1)}
                aria-label="Previous screen"
                className="glass grid h-12 w-12 place-items-center rounded-full transition-transform duration-300 hover:-translate-x-0.5"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <p className="label min-w-20 text-center text-mist" aria-live="polite">
                <span className="text-ink">{pad2(active + 1)}</span> / {pad2(count)}
                <span className="sr-only">: {screen.label}</span>
              </p>
              <button
                type="button"
                onClick={() => go(active + 1)}
                aria-label="Next screen"
                className="glass grid h-12 w-12 place-items-center rounded-full transition-transform duration-300 hover:translate-x-0.5"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-5 max-w-xs text-center text-sm text-mist lg:hidden">{screen.caption}</p>
          </motion.div>
        </div>

        {/* Screen navigation */}
        <div className="min-w-0 lg:col-span-5 lg:col-start-1 lg:row-start-2">
          <div
            role="tablist"
            aria-label="App screens"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {screens.map((item, i) => {
              const selected = i === active;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  id={`screen-tab-${item.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="experience-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => go(i)}
                  className={`group relative shrink-0 rounded-full border px-5 py-3 text-left transition-colors duration-300 lg:w-full lg:rounded-none lg:border-0 lg:border-t lg:px-0 lg:py-5 ${
                    selected
                      ? 'border-white/40 bg-white/10 text-white lg:bg-transparent'
                      : 'border-line text-mist hover:text-white'
                  } lg:border-line`}
                >
                  {selected && (
                    <motion.span
                      layoutId="screen-rule"
                      aria-hidden="true"
                      className="absolute -top-px left-0 hidden h-px w-full bg-gradient-to-r from-cyan via-electric to-transparent lg:block"
                      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                    />
                  )}
                  <span className="flex items-baseline gap-4">
                    <span className={`label ${selected ? 'text-cyan' : 'text-dim'}`}>{pad2(i + 1)}</span>
                    <span className="font-display text-base font-semibold tracking-tight lg:text-[1.65rem] lg:transition-transform lg:duration-500 lg:group-hover:translate-x-1.5">
                      {item.label}
                    </span>
                    {item.is_placeholder && placeholder && selected && (
                      <span className="tag ml-auto hidden lg:inline-flex">Placeholder</span>
                    )}
                  </span>
                  <AnimatePresence initial={false}>
                    {selected && item.caption && (
                      <motion.span
                        key="caption"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="hidden overflow-hidden lg:block"
                      >
                        <span className="block pl-[2.6rem] pt-2 text-mist">{item.caption}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
          <p className="label mt-6 hidden text-dim lg:block">Arrow keys or swipe to move between screens</p>
        </div>
      </div>
    </section>
  );
}
