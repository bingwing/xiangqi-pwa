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
    expect(gridRule).toContain('border: 7px solid #5b2d16');
    expect(gridRule).toContain('repeating-linear-gradient(90deg');
    expect(gridRule).toContain('inset 0 0 0 10px rgba(255, 226, 167, 0.48)');
    expect(gridRule).toContain('inset 0 0 0 18px rgba(88, 43, 20, 0.92)');
    expect(playAreaRule).toContain('inset: var(--board-padding)');
    expect(playAreaRule).toContain('aspect-ratio: 8 / 9');
    expect(playAreaRule).toContain('container-type: inline-size');
    expect(playAreaRule).toContain('margin: auto');
    expect(linesRule).toContain('inset: 0');
    expect(linesRule).toContain('overflow: visible');
    expect(boardLineRule).toContain('stroke: #2a170f');
    expect(boardLineRule).toContain('stroke-width: 2.2px');
    expect(boardLineRule).toContain('vector-effect: non-scaling-stroke');
    expect(boardLineRule).toContain('shape-rendering: crispEdges');
    expect(palaceRule).toContain('stroke-width: 2.8px');
    expect(riverRule).toContain('font-family: "STKaiti", "Kaiti SC"');
  });

  it('draws traditional cannon and soldier point markers on the board', () => {
    const markerRule = cssRule('.board-marker');

    expect(css).toContain('.board-marker');
    expect(markerRule).toContain('stroke-width: 0.08');
    expect(markerRule).toContain('stroke: #2a170f');
  });
});
