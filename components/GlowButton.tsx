import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PointerEvent, ReactNode } from 'react';

interface Common {
  variant?: 'primary' | 'ghost' | 'ink';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
}

type AnchorProps = Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & { href: string };
type NativeButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & { href?: undefined };

const trackPointer = (event: PointerEvent<HTMLElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
};

/** Pill button with a rotating light halo and a highlight that follows the pointer. */
export function GlowButton(props: AnchorProps | NativeButtonProps) {
  const { variant = 'primary', size = 'md', icon, trailing, children, className = '', ...rest } = props;
  const classes = `btn btn-${variant} ${size === 'md' ? '' : `btn-${size}`} ${className}`;
  const content = (
    <>
      <span className="btn-shine" aria-hidden="true" />
      {icon}
      <span>{children}</span>
      {trailing}
    </>
  );

  if (typeof rest.href === 'string') {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={classes} onPointerMove={trackPointer}>
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      className={classes}
      onPointerMove={trackPointer}
    >
      {content}
    </button>
  );
}
