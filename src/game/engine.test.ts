import { describe, expect, it } from 'vitest';

import { applyMove, getMoveLabel, undoLastTurn } from './engine';
import { createInitialState, getPieceAt } from './setup';

describe('applyMove', () => {
  it('applies a legal move, captures the target and switches turns', () => {
    const state = createInitialState();
    const moved = applyMove(state, {
      from: { file: 0, rank: 6 },
      to: { file: 0, rank: 5 },
    });

    expect(getPieceAt(moved.board, { file: 0, rank: 6 })).toBeUndefined();
    expect(getPieceAt(moved.board, { file: 0, rank: 5 })).toMatchObject({
      side: 'red',
      kind: 'soldier',
    });
    expect(moved.turn).toBe('black');
    expect(moved.history).toHaveLength(1);
    expect(moved.outcome).toEqual({ status: 'playing' });
  });

  it('rejects illegal moves without changing state', () => {
    const state = createInitialState();

    expect(() =>
      applyMove(state, {
        from: { file: 0, rank: 6 },
        to: { file: 0, rank: 4 },
      }),
    ).toThrow('illegal move');
    expect(state.turn).toBe('red');
    expect(state.history).toEqual([]);
  });
});

describe('undoLastTurn', () => {
  it('undoes the latest player move and AI response when both exist', () => {
    const initial = createInitialState();
    const afterRed = applyMove(initial, {
      from: { file: 0, rank: 6 },
      to: { file: 0, rank: 5 },
    });
    const afterBlack = applyMove(afterRed, {
      from: { file: 0, rank: 3 },
      to: { file: 0, rank: 4 },
    });

    const undone = undoLastTurn(afterBlack);

    expect(undone.board).toEqual(initial.board);
    expect(undone.turn).toBe('red');
    expect(undone.history).toEqual([]);
  });

  it('undoes one move when only the player has moved', () => {
    const initial = createInitialState();
    const afterRed = applyMove(initial, {
      from: { file: 0, rank: 6 },
      to: { file: 0, rank: 5 },
    });

    const undone = undoLastTurn(afterRed);

    expect(undone.board).toEqual(initial.board);
    expect(undone.turn).toBe('red');
    expect(undone.history).toEqual([]);
  });
});

describe('getMoveLabel', () => {
  it('returns a short Chinese move label for UI hints', () => {
    const state = createInitialState();

    expect(
      getMoveLabel(state, {
        from: { file: 0, rank: 6 },
        to: { file: 0, rank: 5 },
      }),
    ).toBe('红兵 1路进1');
  });
});
