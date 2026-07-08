import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Board } from './Board';
import { createInitialState, positionKey } from '../game/setup';
import type { BoardState } from '../game/types';

describe('Board', () => {
  it('renders a precise SVG board with palace rice grids and river breaks', () => {
    const state = createInitialState();
    const html = renderToStaticMarkup(
      <Board
        board={state.board}
        legalTargets={[]}
        disabled={false}
        onPointClick={vi.fn()}
      />,
    );

    expect(html).toContain('<svg class="board-lines"');
    expect(html).toContain('viewBox="0 0 8 9"');
    expect(html).toContain('class="board-line palace-line black-palace"');
    expect(html).toContain('class="board-line palace-line red-palace"');
    expect(html).toContain('class="board-line palace-line black-palace" x1="3" y1="0" x2="5" y2="2"');
    expect(html).toContain('class="board-line palace-line black-palace" x1="5" y1="0" x2="3" y2="2"');
    expect(html).toContain('class="board-line palace-line red-palace" x1="3" y1="7" x2="5" y2="9"');
    expect(html).toContain('class="board-line palace-line red-palace" x1="5" y1="7" x2="3" y2="9"');
    expect(html).toContain('class="board-line vertical top" x1="0" y1="0" x2="0" y2="4"');
    expect(html).toContain('class="board-line vertical bottom" x1="0" y1="5" x2="0" y2="9"');
    expect(html).toContain('<text class="river-label river-left"');
    expect(html).toContain('<text class="river-label river-right"');
  });

  it('renders traditional cannon and soldier point markers', () => {
    const state = createInitialState();
    const html = renderToStaticMarkup(
      <Board
        board={state.board}
        legalTargets={[]}
        disabled={false}
        onPointClick={vi.fn()}
      />,
    );

    expect(html).toContain('class="board-marker"');
    expect(html).toContain('data-marker="1-2"');
    expect(html).toContain('data-marker="0-3"');
    expect(html).toContain('data-marker="8-6"');
  });

  it('marks capturable legal targets without using a loud target dot', () => {
    const board: BoardState = {
      [positionKey({ file: 0, rank: 6 })]: { id: 'red-soldier', side: 'red', kind: 'soldier' },
      [positionKey({ file: 0, rank: 5 })]: { id: 'black-soldier', side: 'black', kind: 'soldier' },
    };
    const html = renderToStaticMarkup(
      <Board
        board={board}
        selected={{ file: 0, rank: 6 }}
        legalTargets={[{ file: 0, rank: 5 }]}
        disabled={false}
        onPointClick={vi.fn()}
      />,
    );

    expect(html).toContain('class="board-point piece black target capture-target"');
    expect(html).not.toContain('target-dot');
  });

  it('shows only quiet selected piece guidance above the board', () => {
    const state = createInitialState();
    const html = renderToStaticMarkup(
      <Board
        board={state.board}
        selected={{ file: 0, rank: 6 }}
        legalTargets={[{ file: 0, rank: 5 }]}
        selectionText="已选中，点棋盘落子。"
        disabled={false}
        onPointClick={vi.fn()}
      />,
    );

    expect(html).toContain('class="board-selection-tip"');
    expect(html).toContain('已选中，点棋盘落子。');
    expect(html).not.toContain('这枚棋有');
  });

  it('keeps the selection guidance row reserved so the board does not jump', () => {
    const state = createInitialState();
    const html = renderToStaticMarkup(
      <Board
        board={state.board}
        legalTargets={[]}
        disabled={false}
        onPointClick={vi.fn()}
      />,
    );

    expect(html).toContain('class="board-selection-tip board-selection-tip-empty"');
    expect(html).toContain('aria-hidden="true"');
  });
});
