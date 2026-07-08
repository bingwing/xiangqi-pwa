import { describe, expect, it } from 'vitest';

import { createInitialState, getPieceAt } from './setup';

describe('createInitialState', () => {
  it('creates a full Xiangqi starting board with red to move first', () => {
    const state = createInitialState();
    const pieces = Object.values(state.board);

    expect(pieces).toHaveLength(32);
    expect(pieces.filter((piece) => piece.side === 'red')).toHaveLength(16);
    expect(pieces.filter((piece) => piece.side === 'black')).toHaveLength(16);
    expect(state.turn).toBe('red');
    expect(state.history).toEqual([]);
  });

  it('places generals, rooks, cannons and soldiers on their standard points', () => {
    const state = createInitialState();

    expect(getPieceAt(state.board, { file: 4, rank: 9 })).toMatchObject({
      side: 'red',
      kind: 'general',
    });
    expect(getPieceAt(state.board, { file: 4, rank: 0 })).toMatchObject({
      side: 'black',
      kind: 'general',
    });
    expect(getPieceAt(state.board, { file: 0, rank: 9 })).toMatchObject({
      side: 'red',
      kind: 'rook',
    });
    expect(getPieceAt(state.board, { file: 8, rank: 0 })).toMatchObject({
      side: 'black',
      kind: 'rook',
    });
    expect(getPieceAt(state.board, { file: 1, rank: 7 })).toMatchObject({
      side: 'red',
      kind: 'cannon',
    });
    expect(getPieceAt(state.board, { file: 7, rank: 2 })).toMatchObject({
      side: 'black',
      kind: 'cannon',
    });
    expect(getPieceAt(state.board, { file: 0, rank: 6 })).toMatchObject({
      side: 'red',
      kind: 'soldier',
    });
    expect(getPieceAt(state.board, { file: 8, rank: 3 })).toMatchObject({
      side: 'black',
      kind: 'soldier',
    });
  });
});
