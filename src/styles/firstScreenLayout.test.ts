import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../App.css', import.meta.url), 'utf8');

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[^}]*)\\}`));
  return match?.groups?.body ?? '';
}

describe('first screen layout', () => {
  it('keeps the full board visible with compact header spacing', () => {
    const shellRule = cssRule('.app-shell');
    const gameAreaRule = cssRule('.game-area');
    const headerRule = cssRule('.app-header');
    const eyebrowRule = cssRule('.eyebrow');
    const headingRule = cssRule('h1');
    const boardGridRule = cssRule('.board-grid');

    expect(shellRule).toContain('height: 100svh');
    expect(shellRule).toContain('overflow: hidden');
    expect(gameAreaRule).toContain('grid-template-rows: auto minmax(0, 1fr)');
    expect(headerRule).toContain('padding: 0 0 8px');
    expect(eyebrowRule).toContain('white-space: nowrap');
    expect(headingRule).toContain('font-size: clamp(1.7rem, 4.2vw, 3.05rem)');
    expect(headingRule).toContain('white-space: nowrap');
    expect(boardGridRule).toContain('width: min(100%, 68svh, 760px)');
  });

  it('keeps mobile piece sizing tied to the board grid instead of viewport-only sizing', () => {
    const tabletMedia = css.match(/@media \(max-width: 860px\) \{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? '';
    const mobileMedia = css.match(/@media \(max-width: 560px\) \{(?<body>[\s\S]*)\n\}/)?.groups?.body ?? '';

    expect(mobileMedia).not.toContain('width: clamp(34px, 9.8vw, 52px)');
    expect(mobileMedia).not.toContain('height: clamp(34px, 9.8vw, 52px)');
    expect(mobileMedia).not.toContain('font-size: clamp(1rem, 4.1vw, 1.58rem)');
    expect(tabletMedia).toContain('height: auto');
    expect(tabletMedia).toContain('overflow: visible');
    expect(tabletMedia).toContain('width: min(100%, 52svh, 620px)');
    expect(tabletMedia).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(mobileMedia).toContain('--board-padding: clamp(18px, 4.4vw, 32px)');
  });
});
