import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { cssVars } from '../lib/format';

type Angle = MotionValue<number> | number;

interface PhoneProps {
  children: ReactNode;
  /** Any CSS length. Every part of the device scales from this one value. */
  width: string;
  /** Accessible description of what the device is showing. */
  label: string;
  rotateX?: Angle;
  rotateY?: Angle;
  rotateZ?: Angle;
  /** Horizontal travel of the glass reflection, e.g. a tilt-linked "12%". */
  glare?: MotionValue<string> | string;
  /** Number of stacked layers that make up the device's side wall. */
  depth?: number;
  halo?: boolean;
  className?: string;
}

/**
 * A phone built from layered CSS: a metal frame, a bezel, a glass screen with a
 * moving reflection, and a stack of offset layers that give it a real edge when
 * it turns in 3D. Whatever is passed as children renders on the screen.
 */
export function Phone({
  children,
  width,
  label,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  glare = '0%',
  depth = 12,
  halo = false,
  className = '',
}: PhoneProps) {
  return (
    <div className={`phone ${className}`} style={cssVars({ '--pw': width })} role="img" aria-label={label}>
      {halo && <span className="phone-halo" />}
      <span className="phone-shadow" />
      <motion.div className="phone-body" style={{ rotateX, rotateY, rotateZ }}>
        {Array.from({ length: depth }, (_, i) => (
          <span key={i} className="phone-edge" style={{ transform: `translateZ(${-((i + 1) * 0.22).toFixed(2)}em)` }} />
        ))}
        <span className="phone-btn" style={{ top: '15em', height: '5em' }} />
        <span className="phone-btn" style={{ top: '22em', height: '9em' }} />
        <div className="phone-frame">
          <div className="phone-bezel">
            <div className="phone-screen">
              {children}
              <span className="phone-camera" />
              <motion.span className="phone-glare" style={{ x: glare }} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
