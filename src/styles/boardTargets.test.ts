import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../App.css', import.meta.url), 'utf8');

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[^}]*)\\}`));
  return match?.groups?.body ?? '';
}

describe('board target marker styles', () => {
  it('keeps normal legal move markers visually quiet', () => {
    const targetRule = cssRule('.board-point.target');
    const dotRule = cssRule('.target-dot');
    const dotBeforeRule = cssRule('.target-dot::before');
    const dotAfterRule = cssRule('.target-dot::after');

    expect(targetRule).toContain('background: transparent');
    expect(targetRule).not.toContain('inset 0 0 0');
    expect(dotRule).toContain('width: 7px');
    expect(dotRule).toContain('height: 7px');
    expect(dotRule).toContain('opacity: 0.24');
    expect(dotRule).toContain('background: rgba(43, 26, 18, 0.26)');
    expect(dotBeforeRule).toBe('');
    expect(dotAfterRule).toBe('');
  });

  it('keeps capture targets visible without making every legal move loud', () => {
    const captureRule = cssRule('.board-point.capture-target');

    expect(captureRule).toContain('outline-color: rgba(125, 29, 23, 0.28)');
    expect(captureRule).toContain('0 0 0 3px rgba(255, 211, 122, 0.18)');
  });
});
