import { describe, expect, it } from 'vitest';

import { chooseAiMove, chooseHintMove, DIFFICULTY_LABELS } from './ai';
import { applyMove } from './engine';
import { getAllLegalMoves } from './rules';
import { createInitialState, positionKey } from './setup';
import type { BoardState, GameState, Piece, PieceKind, Position, Side } from './types';

describe('chooseAiMove', () => {
  it('returns legal moves for all difficulty levels from the initial board', () => {
    const state = createInitialState();

    for (const difficulty of ['beginner', 'normal', 'advanced'] as const) {
      const blackToMove: GameState = { ...state, turn: 'black' };
      const move = chooseAiMove(blackToMove, difficulty);
      const legalMoveKeys = getAllLegalMoves(blackToMove, 'black').map(moveKey);

      expect(move).toBeDefined();
      expect(legalMoveKeys).toContain(moveKey(move!));
    }
  });

  it('prefers capturing an exposed high-value piece in normal and advanced modes', () => {
    const state = stateWith(
      [
        piece('red', 'general', 4, 9),
        piece('black', 'general', 4, 0),
        piece('black', 'rook', 0, 0),
        piece('black', 'soldier', 4, 5),
        piece('red', 'rook', 0, 5),
      ],
      'black',
    );

    expect(chooseAiMove(state, 'normal')).toMatchObject({
      from: { file: 0, rank: 0 },
      to: { file: 0, rank: 5 },
    });
    expect(chooseAiMove(state, 'advanced')).toMatchObject({
      from: { file: 0, rank: 0 },
      to: { file: 0, rank: 5 },
    });
  });

  it('never returns a move that applyMove rejects', () => {
    const state: GameState = { ...createInitialState(), turn: 'black' };

    for (const difficulty of ['beginner', 'normal', 'advanced'] as const) {
      const move = chooseAiMove(state, difficulty);

      expect(() => applyMove(state, move!)).not.toThrow();
    }
  });

  it('can answer every legal red opening move without throwing', () => {
    const initial = createInitialState();
    const redOpenings = getAllLegalMoves(initial, 'red');

    expect(redOpenings.length).toBeGreaterThan(0);

    for (const redMove of redOpenings) {
      const afterRed = applyMove(initial, redMove);

      for (const difficulty of ['beginner', 'normal', 'advanced'] as const) {
        const aiMove = chooseAiMove(afterRed, difficulty);

        expect(aiMove, `${difficulty} after ${moveKey(redMove)}`).toBeDefined();
        expect(() => applyMove(afterRed, aiMove!)).not.toThrow();
      }
    }
  });
});

describe('chooseHintMove', () => {
  it('returns a legal hint move for the current player', () => {
    const state = createInitialState();
    const move = chooseHintMove(state, 'beginner');
    const legalMoveKeys = getAllLegalMoves(state, 'red').map(moveKey);

    expect(move).toBeDefined();
    expect(legalMoveKeys).toContain(moveKey(move!));
  });

  it('exposes stable Chinese labels for difficulty controls', () => {
    expect(DIFFICULTY_LABELS).toEqual({
      beginner: '入门',
      normal: '初级',
      advanced: '进阶',
    });
  });
});

function moveKey(move: { from: Position; to: Position }) {
  return `${positionKey(move.from)}>${positionKey(move.to)}`;
}

function piece(side: Side, kind: PieceKind, file: number, rank: number): [Position, Piece] {
  return [
    { file, rank },
    {
      id: `${side}-${kind}-${file}-${rank}`,
      side,
      kind,
    },
  ];
}

function stateWith(pieces: Array<[Position, Piece]>, turn: Side): GameState {
  const board: BoardState = {};

  for (const [position, pieceOnBoard] of pieces) {
    board[positionKey(position)] = pieceOnBoard;
  }

  return {
    board,
    turn,
    history: [],
    outcome: { status: 'playing' },
  };
}
