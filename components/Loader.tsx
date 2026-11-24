import { AnimatePresence, motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { EASE_IN_OUT } from '../lib/motion';

interface LoaderProps {
  show: boolean;
  error: string | null;
  onRetry: () => void;
}

/** Opening curtain. Lifts once content and typefaces are ready. */
export function Loader({ show, error, onRetry }: LoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] grid place-items-center bg-void px-6"
          style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 1.05, ease: EASE_IN_OUT } }}
        >
          <div className="absolute inset-0 hero-base opacity-60" aria-hidden="true" />
          {error ? (
            <div role="alert" className="relative flex max-w-sm flex-col items-center gap-5 text-center">
              <p className="label text-amber">Couldn’t load</p>
              <p className="font-display text-2xl font-semibold leading-tight">
                The page content didn’t arrive.
              </p>
              <p className="text-mist">{error}</p>
              <button type="button" onClick={onRetry} className="btn btn-ghost mt-2">
                <RotateCw size={16} aria-hidden="true" />
                <span>Try again</span>
              </button>
            </div>
          ) : (
            <div role="status" className="relative flex flex-col items-center gap-7">
              <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
                <circle cx="36" cy="36" r="26" fill="none" stroke="rgb(160 180 255 / 0.16)" strokeWidth="1.5" />
                <circle
                  className="loader-ring"
                  cx="36"
                  cy="36"
                  r="26"
                  fill="none"
                  stroke="url(#loader-stroke)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="52 200"
                />
                <circle cx="36" cy="36" r="4" fill="#fff" />
                <defs>
                  <linearGradient id="loader-stroke" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#63e6ff" />
                    <stop offset="1" stopColor="#8f6bff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="h-px w-40 overflow-hidden bg-white/10">
                <div className="loader-bar h-full w-2/5 bg-gradient-to-r from-transparent via-cyan to-transparent" />
              </div>
              <p className="label text-mist">Loading</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
