import { useState } from 'react';
import type { Screen } from '../lib/types';
import { SchematicScreen } from './SchematicScreen';

/** A real screenshot when one exists; otherwise the labelled schematic. */
export function ScreenContent({ screen, index, eager = false }: { screen: Screen; index: number; eager?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (screen.image_url && !failed) {
    return (
      <img
        src={screen.image_url}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  return <SchematicScreen kind={screen.kind} index={index} />;
}
