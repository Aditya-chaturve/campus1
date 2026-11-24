import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowDownToLine, Menu, X } from 'lucide-react';
import { SITE } from '../config/site';
import type { SectionLink } from '../config/site';
import { useActiveSection } from '../hooks/useActiveSection';
import { lockScroll } from '../lib/scroll';
import { EASE } from '../lib/motion';
import type { AppConfig } from '../lib/types';
import { AppIcon } from './AppIcon';
import { Magnetic } from './Magnetic';
import { GlowButton } from './GlowButton';

const OBSERVED = ['top', ...SITE.sections.map((s) => s.id), 'get'];

export function Nav({ config, ready, sections: links }: { config: AppConfig; ready: boolean; sections: readonly SectionLink[] }) {
  const active = useActiveSection(OBSERVED);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24));

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onResize = () => desktop.matches && setOpen(false);
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
    };
  }, [open]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: -90, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : { y: -90, opacity: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 1.15 }}
      >
        <div
          className={`absolute inset-0 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
            scrolled || open
              ? 'border-white/10 bg-void/75 backdrop-blur-xl'
              : 'border-transparent bg-transparent'
          }`}
          aria-hidden="true"
        />
        <div className="relative flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-[4vw] lg:py-4">
          <a
            href="#top"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-full pr-2"
            aria-label={`${config.name}, back to top`}
          >
            <AppIcon name={config.name} src={config.icon_url} size={34} />
            <span className="font-display text-[1.05rem] font-semibold tracking-tight">{config.name}</span>
            {config.is_placeholder && <span className="tag hidden xl:inline-flex">Preview content</span>}
          </a>

          <nav aria-label="Sections" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <ul className="glass flex items-center rounded-full p-1">
              {links.map((section) => {
                const current = active === section.id;
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      aria-current={current ? 'location' : undefined}
                      className={`relative block rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                        current ? 'text-white' : 'text-mist hover:text-white'
                      }`}
                    >
                      {current && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-white/12 shadow-[0_0_0_1px_rgb(190_205_255/0.2)_inset]"
                          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        />
                      )}
                      <span className="relative">{section.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Magnetic strength={0.25} className="hidden sm:inline-flex">
              <GlowButton
                href="#download"
                size="sm"
                onClick={() => setOpen(false)}
                icon={<ArrowDownToLine size={16} aria-hidden="true" />}
              >
                Download
              </GlowButton>
            </Magnetic>
            <button
              type="button"
              className="glass grid h-11 w-11 place-items-center rounded-full lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-void/95 px-6 pb-8 pt-24 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="hero-base absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
            <nav aria-label="Sections">
              <ul className="flex flex-col">
                {links.map((section, i) => (
                  <motion.li
                    key={section.id}
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.06 + i * 0.05 }}
                    className="border-b border-white/10"
                  >
                    <a
                      href={`#${section.id}`}
                      onClick={() => setOpen(false)}
                      aria-current={active === section.id ? 'location' : undefined}
                      className="flex items-baseline justify-between py-4 font-display text-[2rem] font-semibold tracking-tight"
                    >
                      <span>{section.label}</span>
                      <span className="label text-dim" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto flex flex-col gap-4 pt-10">
              {config.is_placeholder && <span className="tag self-start">Preview content</span>}
              <GlowButton
                href="#download"
                size="lg"
                className="w-full"
                onClick={() => setOpen(false)}
                icon={<ArrowDownToLine size={18} aria-hidden="true" />}
              >
                Download the app
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
