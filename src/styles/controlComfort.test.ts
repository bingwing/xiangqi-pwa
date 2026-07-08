import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../App.css', import.meta.url), 'utf8');

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[^}]*)\\}`));
  return match?.groups?.body ?? '';
}

describe('control comfort styles', () => {
  it('makes the status panel scannable and the controls easier to tap', () => {
    const actionStripRule = cssRule('.action-strip');
    const actionLabelRule = cssRule('.action-label');
    const statePillRule = cssRule('.state-pill');
    const messageRule = cssRule('.status-message');
    const buttonRule = cssRule('.button-row button');
    const secondaryButtonRule = cssRule('.button-row button.secondary-action');
    const tabletMedia = css.match(/@media \(max-width: 860px\) \{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? '';

    expect(actionStripRule).toContain('grid-template-columns: 1fr auto');
    expect(actionStripRule).toContain('min-height: 58px');
    expect(actionStripRule).toContain('border-radius: 8px');
    expect(actionLabelRule).toContain('font-size: 0.78rem');
    expect(statePillRule).toContain('white-space: nowrap');
    expect(messageRule).toContain('margin: 12px 0 8px');
    expect(css).toMatch(/\.control-panel\s*\{[^}]*display: grid;[^}]*gap: 12px;[^}]*\}/);
    expect(buttonRule).toContain('min-height: 52px');
    expect(buttonRule).toContain('grid-template-columns: 1fr');
    expect(secondaryButtonRule).toContain('background: #a86f66');
    expect(tabletMedia).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(tabletMedia).not.toContain('order: -1');
  });
});
