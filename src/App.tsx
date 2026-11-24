import { useEffect, useMemo, useState } from 'react';
import { MotionConfig, useReducedMotion } from 'framer-motion';
import { SITE } from './config/site';
import { useSiteData } from './hooks/useSiteData';
import { useMediaQuery } from './hooks/useMediaQuery';
import { initSmoothScroll, lockScroll, scrollToTarget } from './lib/scroll';
import type { SiteData } from './lib/types';
import { Loader } from './components/Loader';
import { Nav } from './components/Nav';
import { ScrollProgress } from './components/ScrollProgress';
import { CursorGlow } from './components/CursorGlow';
import { Hero } from './sections/Hero';
import { Philosophy } from './sections/Philosophy';
import { Showcase } from './sections/Showcase';
import { Features } from './sections/Features';
import { Gallery } from './sections/Gallery';
import { DownloadSection } from './sections/Download';
import { FaqSection } from './sections/Faq';
import { FinalCta } from './sections/FinalCta';

const FONT_FACES = [
  '800 1em "Funnel Display Variable"',
  '400 1em "Funnel Sans Variable"',
  '500 1em "Martian Mono Variable"',
];

export default function App() {
  const { data, error, retry } = useSiteData();
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const [fontsReady, setFontsReady] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);

  // Hold the curtain until the display faces are in, so nothing reflows on reveal.
  useEffect(() => {
    let alive = true;
    const done = () => {
      if (alive) setFontsReady(true);
    };
    const cap = window.setTimeout(done, 1800);
    const min = window.setTimeout(() => alive && setMinElapsed(true), SITE.minLoaderMs);
    if (document.fonts?.load) {
      Promise.all(FONT_FACES.map((face) => document.fonts.load(face))).then(done, done);
    } else {
      done();
    }
    return () => {
      alive = false;
      window.clearTimeout(cap);
      window.clearTimeout(min);
    };
  }, []);

  const ready = Boolean(data) && fontsReady && minElapsed;

  useEffect(() => {
    if (reduced || !finePointer) return;
    return initSmoothScroll();
  }, [reduced, finePointer]);

  useEffect(() => {
    lockScroll(!ready);
    return () => lockScroll(false);
  }, [ready]);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Loader show={!ready} error={error} onRetry={retry} />
      {data && <Site data={data} ready={ready} />}
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
  );
}

function Site({ data, ready }: { data: SiteData; ready: boolean }) {
  const { config, release, features, screens, steps, faqs } = data;
  const [activeScreen, setActiveScreen] = useState(0);
  const placeholder = Boolean(config.is_placeholder);

  // Navigation only lists sections that have content to show.
  const hasStory = Boolean(config.philosophy_body?.trim());
  const sections = useMemo(() => {
    const shown: Record<string, boolean> = {
      why: hasStory,
      experience: screens.length > 0,
      features: features.length > 0,
      gallery: screens.length > 1,
      download: true,
      faq: faqs.length > 0,
    };
    return SITE.sections.filter((section) => shown[section.id]);
  }, [hasStory, screens.length, features.length, faqs.length]);

  useEffect(() => {
    document.title = config.headline ? `${config.name} — ${config.headline}` : config.name;
  }, [config.name, config.headline]);

  // In-page links glide instead of jumping, and move focus to the section.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const hash = link?.getAttribute('href');
      if (!hash || hash === '#') return;
      event.preventDefault();
      scrollToTarget(hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Honour deep links such as /#download, which is what the QR code opens.
  useEffect(() => {
    if (!ready || !window.location.hash) return;
    const hash = window.location.hash;
    const timer = window.setTimeout(() => scrollToTarget(hash, { immediate: true }), 120);
    return () => window.clearTimeout(timer);
  }, [ready]);

  const openScreen = (index: number) => {
    setActiveScreen(index);
    scrollToTarget('#experience');
  };

  return (
    <div className="relative overflow-x-clip">
      <ScrollProgress />
      <CursorGlow />
      <Nav config={config} ready={ready} sections={sections} />
      <main id="main" tabIndex={-1}>
        <Hero config={config} release={release} screens={screens} ready={ready} />
        <Philosophy config={config} />
        {screens.length > 0 && (
          <Showcase
            screens={screens}
            active={Math.min(activeScreen, screens.length - 1)}
            onChange={setActiveScreen}
            placeholder={placeholder}
          />
        )}
        {features.length > 0 && <Features features={features} screens={screens} />}
        {screens.length > 1 && <Gallery screens={screens} onOpen={openScreen} />}
        <DownloadSection config={config} release={release} steps={steps} />
        {faqs.length > 0 && <FaqSection faqs={faqs} />}
      </main>
      <FinalCta config={config} release={release} sections={sections} />
    </div>
  );
}
