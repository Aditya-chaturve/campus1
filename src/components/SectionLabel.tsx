import type { ReactNode } from 'react';

/** Small monospaced marker that opens each section: a rule, a number, a name. */
export function SectionLabel({ index, children, className = '' }: { index: string; children: ReactNode; className?: string }) {
  return (
    <p className={`label flex items-center gap-3 ${className}`}>
      <span className="h-px w-8 bg-current opacity-50" aria-hidden="true" />
      <span aria-hidden="true">{index}</span>
      <span>{children}</span>
    </p>
  );
}
