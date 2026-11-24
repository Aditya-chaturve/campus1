/**
 * JavaScript mirror of the colour tokens declared in src/index.css (@theme).
 * Used where CSS variables can't reach, such as canvas drawing.
 */
export const THEME = {
  void: '#04050a',
  ink: '#eef1fb',
  electric: '#4d7cff',
  violet: '#8f6bff',
  cyan: '#63e6ff',
} as const;

export const PARTICLE_COLORS = [THEME.ink, THEME.ink, THEME.electric, THEME.cyan, THEME.violet] as const;
