import type { CSSProperties, ReactNode } from 'react';
import type { ScreenKind } from '../lib/types';
import { cssVars, pad2 } from '../lib/format';

/**
 * Stand-in screens, drawn as abstract wireframes. They are shown only while a
 * screen has no real screenshot, and every one carries a visible "placeholder"
 * mark so it can't be mistaken for the app's actual interface.
 */

function Block({ i = 0, className = '', style, children }: { i?: number; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <span className={`sk-in ${className}`} style={{ ...cssVars({ '--i': i }), ...style }}>
      {children}
    </span>
  );
}

function Row({ i, wide = '68%' }: { i: number; wide?: string }) {
  return (
    <Block i={i} className="flex items-center gap-[1em]">
      <span className="sk" style={{ width: '3.6em', height: '3.6em', flex: 'none' }} />
      <span className="flex flex-1 flex-col gap-[0.65em]">
        <span className="sk-line" style={{ width: wide }} />
        <span className="sk-line" style={{ width: '42%', opacity: 0.5 }} />
      </span>
      <span className="sk" style={{ width: '1.1em', height: '1.1em', borderRadius: '50%', flex: 'none' }} />
    </Block>
  );
}

function TabBar({ active }: { active: number }) {
  return (
    <span className="sk-tabbar">
      {[0, 1, 2, 3].map((n) => (
        <span
          key={n}
          className={n === active ? 'sk-accent' : 'sk'}
          style={{
            width: n === active ? '4.4em' : '1.7em',
            height: '1.7em',
            borderRadius: '1em',
            display: 'block',
          }}
        />
      ))}
    </span>
  );
}

function Home() {
  return (
    <>
      <span className="flex items-center justify-between">
        <span className="flex flex-col gap-[0.75em]">
          <Block i={0} className="sk-line" style={{ width: '7em', opacity: 0.55 }} />
          <Block i={1} className="sk-line" style={{ width: '13em', height: '1.6em' }} />
        </span>
        <Block i={1} className="sk" style={{ width: '3.6em', height: '3.6em', borderRadius: '50%' }} />
      </span>
      <Block i={2} className="sk-card" style={{ height: '17em', flex: 'none' }}>
        <span className="absolute bottom-[1.6em] left-[1.6em] flex flex-col gap-[0.7em]">
          <span className="sk-line" style={{ width: '10em', height: '1.3em', background: 'rgb(255 255 255 / 0.85)' }} />
          <span className="sk-line" style={{ width: '6em', background: 'rgb(255 255 255 / 0.45)' }} />
        </span>
      </Block>
      <span className="grid grid-cols-4 gap-[1em]">
        {[0, 1, 2, 3].map((n) => (
          <Block key={n} i={3 + n} className="sk" style={{ aspectRatio: '1', borderRadius: '1.5em' }} />
        ))}
      </span>
      <Block i={7} className="sk-line" style={{ width: '9em', flex: 'none' }} />
      <Row i={8} />
      <Row i={9} wide="54%" />
      <Row i={10} wide="62%" />
      <TabBar active={0} />
    </>
  );
}

function Feed() {
  return (
    <>
      <span className="flex items-center justify-between">
        <Block i={0} className="sk-line" style={{ width: '11em', height: '1.9em' }} />
        <Block i={0} className="sk" style={{ width: '3.2em', height: '3.2em', borderRadius: '1em' }} />
      </span>
      <span className="flex gap-[0.8em]">
        {['5.5em', '6.5em', '4.5em', '6em'].map((w, n) => (
          <Block
            key={n}
            i={1 + n}
            className={n === 0 ? 'sk-accent' : 'sk'}
            style={{ width: w, height: '2.5em', borderRadius: '1.3em', flex: 'none', display: 'block' }}
          />
        ))}
      </span>
      {[0, 1, 2].map((n) => (
        <Block key={n} i={5 + n * 2} className="sk flex flex-col gap-[0.9em]" style={{ padding: '1em', borderRadius: '1.8em', flex: 'none' }}>
          <span
            className="block"
            style={{
              height: n === 0 ? '10em' : '7.2em',
              borderRadius: '1.1em',
              background:
                n === 0
                  ? 'linear-gradient(135deg, #3a5cf0, #8f6bff)'
                  : n === 1
                    ? 'linear-gradient(135deg, #1b2c6e, #2fb6d8)'
                    : 'linear-gradient(135deg, #2a1f6b, #5a7dff)',
            }}
          />
          <span className="sk-line" style={{ width: '72%' }} />
          <span className="sk-line" style={{ width: '44%', opacity: 0.5 }} />
        </Block>
      ))}
      <TabBar active={1} />
    </>
  );
}

function Detail() {
  return (
    <>
      <Block
        i={0}
        className="sk-card"
        style={{ height: '25em', margin: '-1.2em -0.4em 0', borderRadius: '2.4em', flex: 'none' }}
      >
        <span
          className="absolute left-[1.3em] top-[1.3em] block"
          style={{ width: '3em', height: '3em', borderRadius: '50%', background: 'rgb(4 6 14 / 0.55)' }}
        />
      </Block>
      <Block i={1} className="sk-line" style={{ width: '6em', opacity: 0.55, flex: 'none' }} />
      <Block i={2} className="sk-line" style={{ width: '17em', height: '2em', flex: 'none' }} />
      <Block i={3} className="sk-line" style={{ width: '12em', height: '2em', flex: 'none' }} />
      <span className="flex flex-col gap-[0.8em]">
        {['100%', '94%', '97%', '60%'].map((w, n) => (
          <Block key={n} i={4 + n} className="sk-line" style={{ width: w, opacity: 0.45 }} />
        ))}
      </span>
      <span className="flex gap-[0.9em]">
        {[0, 1, 2].map((n) => (
          <Block key={n} i={8 + n} className="sk" style={{ flex: 1, height: '4.4em', borderRadius: '1.3em', display: 'block' }} />
        ))}
      </span>
      <Block
        i={11}
        className="sk-accent absolute"
        style={{
          left: '1.6em',
          right: '1.6em',
          bottom: '1.6em',
          height: '4.6em',
          borderRadius: '2.3em',
          boxShadow: '0 1em 2.6em -0.8em rgb(77 124 255 / 0.9)',
        }}
      />
    </>
  );
}

function Profile() {
  const bars = [38, 62, 46, 84, 58, 72, 44];
  return (
    <>
      <span className="flex flex-col items-center gap-[0.9em] pt-[0.6em]">
        <Block
          i={0}
          className="sk-accent"
          style={{ width: '8em', height: '8em', borderRadius: '50%', boxShadow: '0 0 0 0.35em rgb(6 9 20), 0 0 0 0.5em rgb(99 230 255 / 0.6)', display: 'block' }}
        />
        <Block i={1} className="sk-line" style={{ width: '11em', height: '1.5em' }} />
        <Block i={2} className="sk-line" style={{ width: '7em', opacity: 0.5 }} />
      </span>
      <span className="grid grid-cols-3 gap-[0.9em]">
        {[0, 1, 2].map((n) => (
          <Block key={n} i={3 + n} className="sk flex flex-col gap-[0.6em]" style={{ padding: '1em', borderRadius: '1.4em' }}>
            <span className="sk-line" style={{ width: '70%', height: '1.3em' }} />
            <span className="sk-line" style={{ width: '90%', opacity: 0.45 }} />
          </Block>
        ))}
      </span>
      <Block i={6} className="sk flex items-end gap-[0.8em]" style={{ height: '13em', padding: '1.2em', borderRadius: '1.8em', flex: 'none' }}>
        {bars.map((h, n) => (
          <span
            key={n}
            className={n === 3 ? 'sk-accent' : ''}
            style={{
              flex: 1,
              height: `${h}%`,
              borderRadius: '0.6em',
              background: n === 3 ? undefined : 'rgb(170 190 255 / 0.22)',
              display: 'block',
            }}
          />
        ))}
      </Block>
      <Row i={7} />
      <Row i={8} wide="50%" />
      <TabBar active={3} />
    </>
  );
}

function Grid() {
  const tints = [
    'linear-gradient(135deg, #3a5cf0, #8f6bff)',
    'rgb(170 190 255 / 0.11)',
    'rgb(170 190 255 / 0.11)',
    'linear-gradient(135deg, #16306e, #2fb6d8)',
    'linear-gradient(135deg, #2a1f6b, #5a7dff)',
    'rgb(170 190 255 / 0.11)',
  ];
  return (
    <>
      <Block i={0} className="sk-line" style={{ width: '12em', height: '1.9em', flex: 'none' }} />
      <Block i={1} className="sk flex items-center gap-[0.9em]" style={{ height: '4.2em', padding: '0 1.3em', borderRadius: '2.1em', flex: 'none' }}>
        <span style={{ width: '1.4em', height: '1.4em', borderRadius: '50%', border: '0.2em solid rgb(200 212 255 / 0.55)', display: 'block' }} />
        <span className="sk-line" style={{ width: '9em', opacity: 0.5 }} />
      </Block>
      <span className="grid grid-cols-2 gap-[1em]">
        {tints.map((background, n) => (
          <Block key={n} i={2 + n} className="flex flex-col justify-end gap-[0.6em]" style={{ height: n % 3 === 0 ? '13em' : '11em', padding: '1em', borderRadius: '1.7em', background }}>
            <span className="sk-line" style={{ width: '70%', background: 'rgb(255 255 255 / 0.6)' }} />
            <span className="sk-line" style={{ width: '45%', background: 'rgb(255 255 255 / 0.3)' }} />
          </Block>
        ))}
      </span>
      <TabBar active={2} />
    </>
  );
}

const LAYOUTS: Record<ScreenKind, () => ReactNode> = {
  home: Home,
  feed: Feed,
  detail: Detail,
  profile: Profile,
  grid: Grid,
};
const ORDER: ScreenKind[] = ['home', 'feed', 'detail', 'profile', 'grid'];

export function SchematicScreen({ kind, index }: { kind: string | null; index: number }) {
  const key = (kind && kind in LAYOUTS ? kind : ORDER[index % ORDER.length]) as ScreenKind;
  const Layout = LAYOUTS[key];
  return (
    <span className="sx" aria-hidden="true">
      <span className="sx-status">
        <span>Placeholder {pad2(index + 1)}</span>
        <span className="flex items-center gap-[0.5em]">
          <span style={{ width: '1.5em', height: '0.9em', borderRadius: '0.25em', background: 'currentColor', opacity: 0.7, display: 'block' }} />
          <span style={{ width: '2.1em', height: '0.9em', borderRadius: '0.3em', border: '0.14em solid currentColor', opacity: 0.7, display: 'block' }} />
        </span>
      </span>
      <Layout />
    </span>
  );
}
