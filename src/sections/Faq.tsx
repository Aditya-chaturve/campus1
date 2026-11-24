import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { EASE, fadeUp, inView } from '../lib/motion';
import type { Faq } from '../lib/types';
import { SectionLabel } from '../components/SectionLabel';
import { Words } from '../components/Words';

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(faqs[0]?.id ?? null);

  return (
    <section id="faq" tabIndex={-1} aria-labelledby="faq-title" className="relative px-5 py-24 sm:px-8 lg:px-[4vw] lg:py-40">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionLabel index="06" className="text-cyan">
              Questions
            </SectionLabel>
            <h2 id="faq-title" className="mt-6 text-[2.5rem] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[clamp(3rem,4.6vw,5rem)]">
              <Words text="Before you install." />
            </h2>
          </div>
        </div>

        <div className="lg:col-span-7">
          {faqs.map((faq, i) => {
            const expanded = open === faq.id;
            return (
              <motion.div key={faq.id} {...inView} variants={fadeUp} custom={i * 0.6} className="border-t border-line last:border-b">
                <h3 className="font-sans">
                  <button
                    type="button"
                    id={`faq-button-${faq.id}`}
                    aria-expanded={expanded}
                    aria-controls={`faq-panel-${faq.id}`}
                    onClick={() => setOpen(expanded ? null : faq.id)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span
                      className={`font-display text-xl font-semibold tracking-tight transition-colors duration-300 sm:text-2xl ${
                        expanded ? 'text-white' : 'text-ink/85 group-hover:text-white'
                      }`}
                    >
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-500 ${
                        expanded ? 'rotate-45 border-white bg-white text-paper-ink' : 'border-line text-mist group-hover:border-white/50'
                      }`}
                    >
                      <Plus size={18} />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      id={`faq-panel-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-button-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.55, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 pr-12 text-lg leading-relaxed text-mist">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
