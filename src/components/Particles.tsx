import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { PARTICLE_COLORS } from '../config/theme';

interface Dot {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  phase: number;
  color: string;
}

/** Slow dust drifting through the light. Pauses whenever it is off screen. */
export function Particles({ count = 70, className = '' }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const total = window.innerWidth < 768 ? Math.round(count * 0.5) : count;
    const dots: Dot[] = Array.from({ length: total }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.25 + Math.random() * 0.75,
      vx: (Math.random() - 0.5) * 0.00014,
      vy: -(0.00005 + Math.random() * 0.00018),
      phase: Math.random() * Math.PI * 2,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }));

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let targetX = 0;
    let targetY = 0;
    let offsetX = 0;
    let offsetY = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      offsetX += (targetX - offsetX) * 0.04;
      offsetY += (targetY - offsetY) * 0.04;
      for (const dot of dots) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.y < -0.02) dot.y = 1.02;
        if (dot.x < -0.02) dot.x = 1.02;
        if (dot.x > 1.02) dot.x = -0.02;
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.0007 + dot.phase));
        ctx.globalAlpha = twinkle * dot.z * 0.75;
        ctx.fillStyle = dot.color;
        ctx.beginPath();
        ctx.arc(dot.x * width + offsetX * dot.z * 30, dot.y * height + offsetY * dot.z * 20, dot.z * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      if (!running) return;
      draw(time);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onResize = () => {
      resize();
      if (!running) draw(0);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      targetX = -((event.clientX / window.innerWidth) * 2 - 1);
      targetY = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    resize();
    draw(0);

    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    visibility.observe(canvas);
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      stop();
      visibility.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [count, reduced]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
