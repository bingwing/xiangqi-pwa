import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../App.css', import.meta.url), 'utf8');

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[^}]*)\\}`));
  return match?.groups?.body ?? '';
}

describe('comfortable board interactions', () => {
  it('keeps selection visible without a dominant blue ring', () => {
    const selectedRule = cssRule('.board-point.selected');

    expect(selectedRule).toContain('outline: 3px solid rgba(0, 103, 192, 0.38)');
    expect(selectedRule).not.toContain('outline: 7px solid #0067c0');
    expect(selectedRule).toContain('transform: translate(-50%, -51%) scale(1.02)');
  });

  it('defines a short nudge animation for invalid taps', () => {
    const nudgeRule = cssRule('.board-point.selection-nudge');

    expect(nudgeRule).toContain('animation: selection-nudge 420ms ease-out');
    expect(css).toContain('@keyframes selection-nudge');
  });

  it('makes AI movement easy to read without relying on board-covering text', () => {
    const aiPieceRule = cssRule('.move-animation.ai .moving-piece');
    const aiTrailRule = cssRule('.move-animation.ai .move-trail line');
    const aiPulseRule =
      css.match(
        /\.move-animation\.ai \.move-origin-pulse,\s*\.move-animation\.ai \.move-destination-pulse\s*\{(?<body>[^}]*)\}/,
      )?.groups?.body ?? '';

    expect(aiPieceRule).toContain('animation-duration: 2200ms');
    expect(aiPieceRule).toContain('0 0 0 22px rgba(0, 103, 192, 0.28)');
    expect(aiTrailRule).toContain('stroke-width: 3.8');
    expect(aiPulseRule).toContain('border-width: 8px');
  });
});
