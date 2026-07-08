import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
  it('keeps the game focused on traditional board controls', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).not.toContain('挑战任务');
    expect(html).not.toContain('先吃一子');
    expect(html).not.toContain('换一个');
    expect(html).toContain('游戏控制');
  });
});
