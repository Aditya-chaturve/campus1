import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDownToLine, ArrowUp, ArrowUpRight } from 'lucide-react';
import type { SectionLink } from '../config/site';
import { fadeUp, inView } from '../lib/motion';
import { formatVersion } from '../lib/format';
import type { AppConfig, Release } from '../lib/types';
import { AppIcon } from '../components/AppIcon';
import { FitText } from '../components/FitText';
import { GlowButton } from '../components/GlowButton';
import { Magnetic } from '../components/Magnetic';
import { Words } from '../components/Words';

/** Closing call to action, followed by the footer. */
export function FinalCta({
  config,
  release,
  sections: links,
}: {
  config: AppConfig;
  release: Release | null;
  sections: readonly SectionLink[];
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const glowScale = useTransform(scrollYProgress, [0, 1], [0.6, 1.15]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const wordY = useTransform(scrollYProgress, [0.3, 1], ['35%', '0%']);

  const available = Boolean(release?.apk_url?.trim());
  const version = formatVersion(release?.version);

  const social = [
    { label: 'Website', href: config.website_url },
    { label: 'GitHub', href: config.github_url },
    { label: 'X', href: config.twitter_url },
    { label: 'Instagram', href: config.instagram_url },
    { label: 'LinkedIn', href: config.linkedin_url },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href?.trim()));

  const owner = config.developer_name?.trim() || config.name;

  return (
    <footer ref={ref} className="relative isolate overflow-clip">
      <motion.div
        aria-hidden="true"
        style={{ scale: glowScale, opacity: glowOpacity }}
        className="pointer-events-none absolute bottom-[-55vmin] left-1/2 -z-10 h-[150vmin] w-[150vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(77_124_255/0.42),rgb(143_107_255/0.18)_45%,transparent_70%)]"
      />
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />

      <section id="get" tabIndex={-1} aria-labelledby="get-title" className="px-5 pb-20 pt-28 text-center sm:px-8 lg:px-[4vw] lg:pb-28 lg:pt-44">
        <motion.div {...inView} variants={fadeUp} className="flex justify-center">
          <AppIcon name={config.name} src={config.icon_url} size={84} className="shadow-[0_30px_80px_-20px_rgb(77_124_255/0.9)]" />
        </motion.div>
        <h2 id="get-title" className="mx-auto mt-10 max-w-5xl text-[2.9rem] font-bold leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[clamp(4.5rem,7.6vw,8.5rem)]">
          <Words text={`Put ${config.name} in your pocket.`} />
        </h2>
        <motion.p {...inView} variants={fadeUp} custom={2} className="mx-auto mt-7 max-w-md text-lg text-mist">
          {available
            ? `The Android build${version ? ` (${version})` : ''} is ready to download.`
            : 'The Android build isn’t published yet. The download section shows its status and takes your email for the release announcement.'}
        </motion.p>
        <motion.div {...inView} variants={fadeUp} custom={3} className="mt-10 flex justify-center">
          <Magnetic>
            <GlowButton href="#download" size="lg" icon={<ArrowDownToLine size={18} aria-hidden="true" />}>
              {available ? 'Download the app' : 'See download status'}
            </GlowButton>
          </Magnetic>
        </motion.div>
      </section>

      <div className="px-5 sm:px-8 lg:px-[4vw]">
        <div className="mx-auto grid max-w-[1500px] gap-10 border-t border-line py-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href="#top" className="inline-flex min-h-11 items-center gap-3" aria-label={`${config.name}, back to top`}>
              <AppIcon name={config.name} src={config.icon_url} size={36} />
              <span className="font-display text-xl font-semibold tracking-tight">{config.name}</span>
            </a>
            {config.headline && <p className="mt-4 max-w-xs text-mist">{config.headline}</p>}
          </div>

          <nav aria-label="Footer" className="lg:col-span-3">
            <p className="label text-dim">Explore</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6">
              {links.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex min-h-11 items-center text-ink/85 transition-colors hover:text-white">
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <p className="label text-dim">Get the app</p>
            <ul className="mt-4">
              <li>
                <a href="#download" className="flex min-h-11 items-center justify-between gap-4 border-b border-line text-ink/85 transition-colors hover:text-white">
                  <span>Android APK</span>
                  <span className="label text-dim">{available ? (version ?? 'Available') : 'Not yet published'}</span>
                </a>
              </li>
              <li>
                {release?.ios_url ? (
                  <a
                    href={release.ios_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-between gap-4 border-b border-line text-ink/85 transition-colors hover:text-white"
                  >
                    <span>iPhone, on the App Store</span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                ) : (
                  <p className="flex min-h-11 items-center justify-between gap-4 border-b border-line text-mist">
                    <span>iPhone</span>
                    <span className="label text-dim">Not available</span>
                  </p>
                )}
              </li>
              {config.contact_email && (
                <li>
                  <a
                    href={`mailto:${config.contact_email}`}
                    className="flex min-h-11 items-center justify-between gap-4 border-b border-line text-ink/85 transition-colors hover:text-white"
                  >
                    <span>{config.contact_email}</span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </li>
              )}
            </ul>
            {social.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Social links">
                {social.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm transition-colors hover:text-white"
                    >
                      {item.label}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 border-t border-line py-5">
          <p className="label text-dim">
            © {new Date().getFullYear()} {owner}
          </p>
          <a href="#top" className="label flex min-h-11 items-center gap-2 text-mist transition-colors hover:text-white">
            Back to top
            <ArrowUp size={14} aria-hidden="true" />
          </a>
        </div>
      </div>

      <motion.div aria-hidden="true" style={{ y: wordY }} className="wordmark-outline -mb-[0.16em] select-none px-[2vw] text-center font-display font-extrabold">
        <FitText measureKey={config.name} maxVh={0.5}>
          {config.name}
        </FitText>
      </motion.div>
    </footer>
  );
}
