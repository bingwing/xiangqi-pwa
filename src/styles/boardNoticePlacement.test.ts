import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../App.css', import.meta.url), 'utf8');

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[^}]*)\\}`));
  return match?.groups?.body ?? '';
}

describe('board notice placement', () => {
  it('keeps move notices outside the board play area', () => {
    const boardShellRule = cssRule('.board-shell');
    const noticeRule = cssRule('.board-notice');
    const selectionTipRule = cssRule('.board-selection-tip');

    expect(boardShellRule).toContain('grid-template-rows: auto auto minmax(0, 1fr)');
    expect(boardShellRule).toContain('transform: translateY(-3svh)');
    expect(noticeRule).not.toContain('position: absolute');
    expect(noticeRule).not.toContain('transform: translateX(-50%)');
    expect(noticeRule).toContain('position: relative');
    expect(noticeRule).toContain('min-height: 36px');
    expect(selectionTipRule).toContain('min-height: 24px');
    expect(selectionTipRule).toContain('background: rgba(255, 244, 217, 0.42)');
  });
});
