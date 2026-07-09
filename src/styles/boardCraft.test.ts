import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../App.css', import.meta.url), 'utf8');

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[^}]*)\\}`));
  return match?.groups?.body ?? '';
}

describe('crafted board styles', () => {
  it('uses a measured board surface with inset play area and crisp SVG lines', () => {
    const gridRule = cssRule('.board-grid');
    const playAreaRule = cssRule('.board-play-area');
    const linesRule = cssRule('.board-lines');
    const boardLineRule = cssRule('.board-line');
    const palaceRule = cssRule('.palace-line');
    const riverRule = cssRule('.river-label');

    expect(gridRule).toContain('--board-padding: clamp(24px, 5vw, 50px)');
    expect(gridRule).toContain('aspect-ratio: 8 / 9');
    expect(gridRule).toContain('border: 8px solid #6f3f1f');
    expect(gridRule).toContain('radial-gradient(circle at 50% 46%');
    expect(gridRule).toContain('repeating-linear-gradient(90deg, rgba(118, 68, 28, 0.045)');
    expect(gridRule).toContain('inset 0 0 0 5px rgba(247, 194, 111, 0.58)');
    expect(gridRule).toContain('inset 0 0 0 16px rgba(75, 42, 20, 0.9)');
    expect(playAreaRule).toContain('inset: var(--board-padding)');
    expect(playAreaRule).toContain('aspect-ratio: 8 / 9');
    expect(playAreaRule).toContain('container-type: inline-size');
    expect(playAreaRule).toContain('margin: auto');
    expect(linesRule).toContain('inset: 0');
    expect(linesRule).toContain('overflow: visible');
    expect(boardLineRule).toContain('stroke: #3a2114');
    expect(boardLineRule).toContain('stroke-width: 1.78px');
    expect(boardLineRule).toContain('vector-effect: non-scaling-stroke');
    expect(boardLineRule).toContain('shape-rendering: crispEdges');
    expect(palaceRule).toContain('stroke-width: 2.05px');
    expect(riverRule).toContain('font-family: "STKaiti", "Kaiti SC"');
  });

  it('draws traditional cannon and soldier point markers on the board', () => {
    const markerRule = cssRule('.board-marker');

    expect(css).toContain('.board-marker');
    expect(markerRule).toContain('stroke-width: 0.08');
    expect(markerRule).toContain('stroke: #2a170f');
  });
});
