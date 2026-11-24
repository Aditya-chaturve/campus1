import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

interface QrCodeProps {
  value: string;
  label: string;
  className?: string;
}

const QUIET = 4;
const INK = '#060914';

/** Scannable QR code drawn as SVG, with softened corner markers. */
export default function QrCode({ value, label, className = '' }: QrCodeProps) {
  const { count, cells } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    const inFinder = (r: number, c: number) =>
      (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
    const dark: Array<[number, number]> = [];
    for (let r = 0; r < n; r += 1) {
      for (let c = 0; c < n; c += 1) {
        if (!inFinder(r, c) && qr.isDark(r, c)) dark.push([r, c]);
      }
    }
    return { count: n, cells: dark };
  }, [value]);

  const total = count + QUIET * 2;
  const finders: Array<[number, number]> = [
    [0, 0],
    [0, count - 7],
    [count - 7, 0],
  ];

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${total} ${total}`}
      className={className}
      shapeRendering="geometricPrecision"
    >
      <rect width={total} height={total} fill="#ffffff" />
      <g fill={INK}>
        {cells.map(([r, c]) => (
          <rect key={`${r}-${c}`} x={c + QUIET} y={r + QUIET} width={1.02} height={1.02} rx={0.22} />
        ))}
      </g>
      {finders.map(([r, c]) => (
        <g key={`${r}-${c}`} transform={`translate(${c + QUIET} ${r + QUIET})`}>
          <rect width={7} height={7} rx={1.9} fill={INK} />
          <rect x={1} y={1} width={5} height={5} rx={1.1} fill="#ffffff" />
          <rect x={2} y={2} width={3} height={3} rx={0.8} fill={INK} />
        </g>
      ))}
    </svg>
  );
}
