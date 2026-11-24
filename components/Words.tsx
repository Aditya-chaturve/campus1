import { motion } from 'framer-motion';
import { EASE } from '../lib/motion';

interface WordsProps {
  text: string;
  /** When set, the reveal is driven by this flag instead of scroll position. */
  show?: boolean;
  delay?: number;
  stagger?: number;
  className?: string;
}

/**
 * Reveals a line of text word by word, each word rising out of its own mask.
 * Screen readers get the sentence once, intact.
 */
export function Words({ text, show, delay = 0, stagger = 0.045, className = '' }: WordsProps) {
  const words = text.split(/\s+/).filter(Boolean);
  const trigger =
    show === undefined
      ? { whileInView: 'show', viewport: { once: true, margin: '-10% 0px -8% 0px' } }
      : { animate: show ? 'show' : 'hidden' };

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <motion.span aria-hidden="true" initial="hidden" {...trigger}>
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span className="-mb-[0.18em] inline-block overflow-hidden pb-[0.18em] align-bottom">
              <motion.span
                className="inline-block will-change-transform"
                variants={{
                  hidden: { y: '115%' },
                  show: { y: '0%', transition: { duration: 1.05, ease: EASE, delay: delay + i * stagger } },
                }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
