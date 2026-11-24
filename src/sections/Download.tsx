import type { FormEvent, MouseEvent } from 'react';
import { Suspense, lazy, useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  LoaderCircle,
  RotateCw,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from 'lucide-react';
import { SITE } from '../config/site';
import { joinWaitlist, verifyRelease } from '../lib/api';
import { EASE, fadeUp, inView as inViewProps } from '../lib/motion';
import { formatBytes, formatDate, formatVersion, pad2 } from '../lib/format';
import type { AppConfig, InstallStep, Platform, Release, VerifyResult } from '../lib/types';
import { AppIcon } from '../components/AppIcon';
import { Magnetic } from '../components/Magnetic';
import { SectionLabel } from '../components/SectionLabel';
import { Words } from '../components/Words';

const QrCode = lazy(() => import('../components/QrCode'));

type Phase = 'idle' | 'checking' | 'started' | 'error';

interface DownloadProps {
  config: AppConfig;
  release: Release | null;
  steps: InstallStep[];
}

export function DownloadSection({ config, release, steps }: DownloadProps) {
  const ref = useRef<HTMLElement>(null);
  const near = useInView(ref, { once: true, margin: '400px 0px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.3'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [88, 44]);

  // The single value that turns the download on: releases.apk_url.
  const apkUrl = release?.apk_url?.trim() || null;
  const iosUrl = release?.ios_url?.trim() || null;
  const playUrl = release?.play_url?.trim() || null;

  const [verify, setVerify] = useState<VerifyResult | null>(null);
  const verifiedAt = useRef(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [problem, setProblem] = useState<string | null>(null);
  const [opened, setOpened] = useState<'file' | 'page'>('file');

  const runVerify = useCallback(async () => {
    const result = await verifyRelease();
    verifiedAt.current = Date.now();
    setVerify(result);
    return result;
  }, []);

  // Check the link quietly as the section approaches, so the click is instant.
  useEffect(() => {
    if (!apkUrl || !near) return;
    let alive = true;
    verifyRelease()
      .then((result) => {
        if (!alive) return;
        verifiedAt.current = Date.now();
        setVerify(result);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [apkUrl, near]);

  const onDownload = async (event: MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, save link as) behave as normal links.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (!apkUrl || phase === 'checking') return;

    setPhase('checking');
    setProblem(null);
    try {
      const fresh = verify?.available && Date.now() - verifiedAt.current < SITE.verifyTtlMs;
      const result = fresh && verify ? verify : await runVerify();
      if (!result.available) {
        setProblem(result.reason ?? 'The download link is not responding.');
        setPhase('error');
        return;
      }
      if (result.kind === 'page') {
        window.open(apkUrl, '_blank', 'noopener');
        setOpened('page');
      } else {
        const link = document.createElement('a');
        link.href = apkUrl;
        link.rel = 'noopener';
        link.download = '';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setOpened('file');
      }
      setPhase('started');
    } catch {
      setProblem('We couldn’t check the download link just now.');
      setPhase('error');
    }
  };

  const version = formatVersion(release?.version);
  const size = formatBytes(release?.apk_size_bytes ?? verify?.size ?? null);
  const released = formatDate(release?.released_at);
  const requires = release?.min_android?.trim() ? `Android ${release.min_android.trim()} or later` : null;
  const linkDown = Boolean(apkUrl && verify && !verify.available);
  const isPage = verify?.kind === 'page';

  const meta = [
    { term: 'Version', value: version ?? (apkUrl ? 'Not specified' : 'Unreleased') },
    { term: 'File size', value: size ?? (apkUrl ? 'Not specified' : 'Not available') },
    { term: 'Released', value: released ?? (apkUrl ? 'Not specified' : 'Not yet') },
    { term: 'Requires', value: requires ?? 'To be announced' },
  ];

  // The QR code carries the APK link itself; until one exists it opens this page.
  const qrValue = apkUrl ?? `${window.location.origin}/#download`;

  const buttonLabel =
    phase === 'checking' ? 'Checking the file…' : phase === 'started' ? (opened === 'page' ? 'Download page opened' : 'Download started') : phase === 'error' ? 'Try again' : 'Download for Android';
  const buttonSub = ['APK', version, size].filter(Boolean).join(' · ');

  const waitlistPlatforms: Platform[] = [];
  if (!apkUrl) waitlistPlatforms.push('android');
  if (!iosUrl) waitlistPlatforms.push('ios');

  return (
    <section ref={ref} id="download" tabIndex={-1} aria-labelledby="download-title" className="relative z-10 px-2 sm:px-3">
      <motion.div style={{ scale, borderRadius: radius }} className="paper-panel origin-top overflow-hidden">
        <div className="mx-auto max-w-[1500px] px-4 py-20 sm:px-8 lg:px-[3.2vw] lg:py-32">
          {/* Heading */}
          <div className="grid items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <SectionLabel index="05" className="text-[#2743c4]">
                Download
              </SectionLabel>
              <h2 id="download-title" className="mt-6 text-[2.75rem] font-bold leading-[0.98] tracking-[-0.035em] sm:text-7xl lg:text-[clamp(3.75rem,6.4vw,7rem)]">
                <Words text={`Get ${config.name} on your phone.`} />
              </h2>
            </div>
            <motion.p {...inViewProps} variants={fadeUp} custom={2} className="max-w-sm text-lg text-paper-mist lg:col-span-4 lg:pb-3">
              {apkUrl
                ? 'A direct Android download. No store account needed.'
                : 'The Android build hasn’t been published yet. Everything below switches on the moment it is.'}
            </motion.p>
          </div>

          {/* Release + QR */}
          <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-12">
            <motion.div {...inViewProps} variants={fadeUp} className="release-card p-5 sm:p-9 lg:col-span-8">
              <div className="flex flex-wrap items-center gap-5">
                <AppIcon name={config.name} src={config.icon_url} size={76} className="shadow-[0_20px_50px_-15px_rgb(77_124_255/0.9)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-3xl font-bold leading-none tracking-tight sm:text-4xl">{config.name}</p>
                  <p className="label mt-3 text-mist">Android · APK</p>
                </div>
                <p
                  className={`label inline-flex items-center gap-2 rounded-full border px-3 py-2 ${
                    !apkUrl || linkDown ? 'border-amber/40 text-amber' : 'border-cyan/40 text-cyan'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${!apkUrl || linkDown ? 'bg-amber' : 'bg-cyan'}`} aria-hidden="true" />
                  {!apkUrl ? 'Not yet published' : linkDown ? 'Link not responding' : 'Available'}
                </p>
              </div>

              <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-line py-7 sm:grid-cols-4">
                {meta.map((item) => (
                  <div key={item.term}>
                    <dt className="label text-dim">{item.term}</dt>
                    <dd className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight sm:text-xl">{item.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8">
                {apkUrl ? (
                  <>
                    <Magnetic strength={0.12} className="w-full">
                      <a
                        href={apkUrl}
                        onClick={onDownload}
                        data-phase={phase}
                        aria-describedby="download-status"
                        aria-busy={phase === 'checking'}
                        className="dl-btn"
                      >
                        <span className="dl-btn-icon">
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                              key={phase}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.25 }}
                              className="grid place-items-center"
                            >
                              {phase === 'checking' ? (
                                <LoaderCircle size={24} className="spin" aria-hidden="true" />
                              ) : phase === 'started' ? (
                                <Check size={24} aria-hidden="true" />
                              ) : phase === 'error' ? (
                                <RotateCw size={22} aria-hidden="true" />
                              ) : (
                                <ArrowDownToLine size={24} aria-hidden="true" />
                              )}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <span className="font-display text-xl font-bold leading-none tracking-tight sm:text-2xl">{buttonLabel}</span>
                          <span className="label text-[#3a4466]">{buttonSub}</span>
                        </span>
                      </a>
                    </Magnetic>

                    <div id="download-status" aria-live="polite" className="mt-4 min-h-6 text-[0.95rem] text-mist">
                      {phase === 'started' && (
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <Check size={16} className="text-cyan" aria-hidden="true" />
                          {opened === 'page'
                            ? 'The download page opened in a new tab.'
                            : 'Your download has started. When it finishes, open the file to install.'}
                          <a href={apkUrl} target="_blank" rel="noopener noreferrer" className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                            Nothing happened? Use the direct link
                          </a>
                        </p>
                      )}
                      {phase === 'error' && (
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-amber">
                          <TriangleAlert size={16} aria-hidden="true" />
                          {problem} Try again in a moment, or
                          <a href={apkUrl} target="_blank" rel="noopener noreferrer" className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                            open the direct link
                          </a>
                        </p>
                      )}
                      {phase === 'idle' && linkDown && (
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-amber">
                          <TriangleAlert size={16} aria-hidden="true" />
                          {verify?.reason ?? 'The download link is not responding.'} You can still try.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div role="status" className="flex items-start gap-4 rounded-3xl border border-dashed border-white/25 bg-white/[0.04] p-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-amber">
                      <Clock size={22} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl">Android build not yet published</p>
                      <p className="mt-2 text-mist">
                        There is no APK to download yet, so there is no download button. It appears here as soon as a build is released.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/[0.05] p-4 text-[0.95rem] leading-relaxed text-mist">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-cyan" aria-hidden="true" />
                <p>
                  <strong className="font-semibold text-ink">Android will ask you to confirm.</strong> Because the app is installed from outside
                  Google Play, your phone asks you to allow installs from your browser first. That prompt is expected.
                </p>
              </div>
            </motion.div>

            {/* QR */}
            <motion.div {...inViewProps} variants={fadeUp} custom={1} className="flex flex-col rounded-[32px] border border-paper-ink/10 bg-white/70 p-5 backdrop-blur sm:p-8 lg:col-span-4">
              <p className="label text-paper-mist">{!apkUrl ? 'Scan to open this page' : isPage ? 'Scan to open the download page' : 'Scan to download'}</p>
              <div className="mx-auto mt-6 aspect-square w-full max-w-[280px] overflow-hidden rounded-3xl bg-white p-2 shadow-[0_30px_60px_-30px_rgb(20_40_140/0.5)]">
                <Suspense fallback={<div className="h-full w-full animate-pulse rounded-2xl bg-paper" />}>
                    <QrCode
                      value={qrValue}
                      className="h-full w-full"
                      label={!apkUrl ? 'QR code that opens this download page' : isPage ? 'QR code that opens the official download page' : 'QR code that downloads the Android APK'}
                    />
                </Suspense>
              </div>
              <p className="mt-6 text-paper-mist">
                {!apkUrl
                  ? 'There is no APK yet, so this code opens the download page on your phone instead.'
                  : isPage
                    ? 'Point your phone’s camera at the code to open the official download page on that phone.'
                    : 'Point your phone’s camera at the code to start the APK download on that phone.'}
              </p>
              <CopyLink value={qrValue} />
            </motion.div>
          </div>

          {/* Install guide */}
          {steps.length > 0 && (
            <div className="mt-20 lg:mt-28">
              <h3 className="text-3xl font-bold tracking-[-0.03em] sm:text-5xl">
                <Words text={`Install it in ${steps.length} ${steps.length === 1 ? 'step' : 'steps'}.`} />
              </h3>
              <ol className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, i) => (
                  <motion.li key={step.id} {...inViewProps} variants={fadeUp} custom={i} className="group relative border-t border-paper-ink/20 pt-6">
                    <span
                      aria-hidden="true"
                      className="absolute -top-px left-0 h-px w-0 bg-[#2743c4] transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
                    />
                    <span className="label text-[#2743c4]">Step {pad2(i + 1)}</span>
                    <p className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight">{step.title}</p>
                    {step.body && <p className="mt-3 text-paper-mist">{step.body}</p>}
                  </motion.li>
                ))}
              </ol>
            </div>
          )}

          {/* Compatibility + notify */}
          <div className="mt-20 grid gap-5 lg:mt-28 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h3 className="text-3xl font-bold tracking-[-0.03em] sm:text-5xl">
                <Words text="Where it runs." />
              </h3>
              <ul className="mt-10 border-t border-paper-ink/20">
                <PlatformRow
                  name="Android phones and tablets"
                  detail={
                    [requires ?? 'Minimum Android version to be announced', release?.architectures?.trim()].filter(Boolean).join(' · ')
                  }
                  status={apkUrl ? 'Direct APK' : 'Not yet published'}
                  live={Boolean(apkUrl)}
                />
                {playUrl && (
                  <PlatformRow name="Google Play" detail="Install and update through the Play Store." status="Open" live href={playUrl} />
                )}
                <PlatformRow
                  name="iPhone and iPad"
                  detail={iosUrl ? 'Available through the App Store.' : 'No iOS version has been released. If one is, the App Store link appears here.'}
                  status={iosUrl ? 'App Store' : 'Not available'}
                  live={Boolean(iosUrl)}
                  href={iosUrl ?? undefined}
                />
              </ul>
            </div>

            {waitlistPlatforms.length > 0 && (
              <motion.div {...inViewProps} variants={fadeUp} custom={1} className="rounded-[32px] border border-paper-ink/10 bg-white/70 p-5 backdrop-blur sm:p-8 lg:col-span-5">
                <NotifyForm platforms={waitlistPlatforms} />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function PlatformRow({ name, detail, status, live, href }: { name: string; detail: string; status: string; live: boolean; href?: string }) {
  const badge = (
    <span
      className={`label inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 ${
        live ? 'border-[#2743c4]/40 text-[#2743c4]' : 'border-paper-ink/25 text-paper-mist'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-[#2743c4]' : 'bg-paper-mist'}`} aria-hidden="true" />
      {status}
      {href && <ArrowUpRight size={13} aria-hidden="true" />}
    </span>
  );
  return (
    <motion.li {...inViewProps} variants={fadeUp} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-paper-ink/20 py-6">
      <div className="flex min-w-0 items-start gap-4">
        <Smartphone size={22} className="mt-1 shrink-0 text-paper-mist" aria-hidden="true" />
        <div>
          <p className="font-display text-xl font-bold tracking-tight sm:text-2xl">{name}</p>
          <p className="mt-1 max-w-md text-paper-mist">{detail}</p>
        </div>
      </div>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="rounded-full transition-transform duration-300 hover:-translate-y-0.5">
          {badge}
        </a>
      ) : (
        badge
      )}
    </motion.li>
  );
}

function CopyLink({ value }: { value: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2600);
  };

  return (
    <div className="mt-auto pt-6">
      <div className="flex items-center gap-2 rounded-2xl border border-paper-ink/15 bg-white/80 p-1.5 pl-4">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-paper-mist" title={value}>
          {value.replace(/^https?:\/\//, '')}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-paper-ink px-4 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
        >
          {state === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span aria-live="polite">{state === 'copied' ? 'Copied' : 'Copy link'}</span>
        </button>
      </div>
      {state === 'failed' && (
        <p role="alert" className="mt-2 text-sm text-[#a3271d]">
          Copying is blocked in this browser. Select the link above and copy it by hand.
        </p>
      )}
    </div>
  );
}

const PLATFORM_LABEL: Record<Platform, string> = { android: 'Android', ios: 'iPhone' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function NotifyForm({ platforms }: { platforms: Platform[] }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [chosen, setPlatform] = useState<Platform>(platforms[0]);
  const platform = platforms.includes(chosen) ? chosen : platforms[0];
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [already, setAlready] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setError('Enter your email address.');
      return;
    }
    if (!EMAIL.test(value)) {
      setError('That email address doesn’t look right. Check for a missing @ or domain.');
      return;
    }
    setError(null);
    setStatus('sending');
    try {
      const result = await joinWaitlist(value, platform);
      setAlready(result.already);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We couldn’t save that just now. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} role="status" className="flex h-full flex-col justify-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-paper-ink text-white">
          <Check size={22} aria-hidden="true" />
        </span>
        <p className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {already ? 'You’re already on the list.' : 'You’re on the list.'}
        </p>
        <p className="mt-2 text-paper-mist">
          {email.trim()} is saved for the {PLATFORM_LABEL[platform]} release announcement.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            setEmail('');
          }}
          className="mt-5 inline-flex min-h-11 items-center self-start font-semibold text-[#2743c4] underline decoration-[#2743c4]/40 underline-offset-4 hover:decoration-[#2743c4]"
        >
          Add another address
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <p className="label text-paper-mist">Get notified</p>
      <p className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">Hear when it’s out.</p>

      {platforms.length > 1 && (
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Which version?</legend>
          <div className="mt-2 flex gap-2">
            {platforms.map((option) => (
              <label
                key={option}
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-5 text-sm font-semibold transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#2743c4] ${
                  platform === option ? 'border-paper-ink bg-paper-ink text-white' : 'border-paper-ink/25 text-paper-ink hover:border-paper-ink/60'
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-platform`}
                  value={option}
                  checked={platform === option}
                  onChange={() => setPlatform(option)}
                  className="sr-only"
                />
                {PLATFORM_LABEL[option]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6">
        <label htmlFor={`${id}-email`} className="text-sm font-semibold">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="field mt-2"
        />
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-2 flex items-start gap-2 text-sm font-medium text-[#a3271d]">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      <button type="submit" disabled={status === 'sending'} className="btn btn-ink mt-5 w-full disabled:cursor-progress">
        {status === 'sending' ? <LoaderCircle size={18} className="spin" aria-hidden="true" /> : null}
        <span>{status === 'sending' ? 'Saving…' : 'Notify me'}</span>
      </button>
    </form>
  );
}
