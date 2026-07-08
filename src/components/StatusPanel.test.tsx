import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { StatusPanel } from './StatusPanel';
import { createInitialState } from '../game/setup';

describe('StatusPanel', () => {
  it('shows a clear action cue and board state summary', () => {
    const html = renderToStaticMarkup(
      <StatusPanel
        state={createInitialState()}
        difficulty="beginner"
        teaching
        thinking={false}
        message="红方先走。"
      />,
    );

    expect(html).toContain('class="action-strip red"');
    expect(html).toContain('下一步');
    expect(html).toContain('红方走棋');
    expect(html).toContain('class="state-pill"');
    expect(html).toContain('对局进行中');
  });

  it('uses the action cue for AI thinking state', () => {
    const state = createInitialState();
    state.turn = 'black';

    const html = renderToStaticMarkup(
      <StatusPanel
        state={state}
        difficulty="beginner"
        teaching={false}
        thinking
        message="黑方想一想..."
      />,
    );

    expect(html).toContain('class="action-strip black thinking"');
    expect(html).toContain('AI 思考中');
  });
});
