import { describe, expect, it } from 'vitest';

import { createInitialState, positionKey } from './setup';
import {
  getAllLegalMoves,
  getGameOutcome,
  getLegalMovesForPiece,
  getPseudoLegalMovesForPiece,
  isInCheck,
} from './rules';
import type { BoardState, GameState, Piece, PieceKind, Position, Side } from './types';

describe('piece movement rules', () => {
  it('moves rook in straight lines until blocked and can capture the first enemy', () => {
    const state = stateWith([
      piece('red', 'general', 4, 9),
      piece('black', 'general', 4, 0),
      piece('red', 'rook', 4, 5),
      piece('red', 'soldier', 4, 7),
      piece('black', 'soldier', 4, 2),
    ]);

    expect(targets(getPseudoLegalMovesForPiece(state, { file: 4, rank: 5 }))).toEqual([
      '4,6',
      '4,4',
      '4,3',
      '4,2',
      '3,5',
      '2,5',
      '1,5',
      '0,5',
      '5,5',
      '6,5',
      '7,5',
      '8,5',
    ]);
  });

  it('blocks horse moves when the horse leg is occupied', () => {
    const state = stateWith([
      piece('red', 'general', 4, 9),
      piece('black', 'general', 4, 0),
      piece('red', 'horse', 4, 4),
      piece('red', 'soldier', 4, 3),
      piece('black', 'soldier', 5, 6),
    ]);

    expect(targets(getPseudoLegalMovesForPiece(state, { file: 4, rank: 4 }))).toEqual([
      '2,3',
      '2,5',
      '3,6',
      '5,6',
      '6,3',
      '6,5',
    ]);
  });

  it('requires a cannon screen before capture and forbids non-capturing jumps', () => {
    const state = stateWith([
      piece('red', 'general', 4, 9),
      piece('black', 'general', 4, 0),
      piece('red', 'cannon', 4, 6),
      piece('red', 'soldier', 4, 5),
      piece('black', 'soldier', 4, 2),
      piece('black', 'soldier', 1, 6),
    ]);

    expect(targets(getPseudoLegalMovesForPiece(state, { file: 4, rank: 6 }))).toEqual([
      '4,7',
      '4,8',
      '4,2',
      '3,6',
      '2,6',
      '5,6',
      '6,6',
      '7,6',
      '8,6',
    ]);
  });

  it('keeps elephants on their own side and blocks elephant-eye moves', () => {
    const state = stateWith([
      piece('red', 'general', 4, 9),
      piece('black', 'general', 4, 0),
      piece('red', 'elephant', 4, 6),
      piece('red', 'soldier', 3, 7),
      piece('black', 'elephant', 4, 3),
    ]);

    expect(targets(getPseudoLegalMovesForPiece(state, { file: 4, rank: 6 }))).toEqual(['6,8']);
    expect(targets(getPseudoLegalMovesForPiece(state, { file: 4, rank: 3 }))).toEqual(['2,1', '6,1']);
  });

  it('keeps advisors and generals inside the palace', () => {
    const state = stateWith([
      piece('red', 'general', 4, 9),
      piece('black', 'general', 4, 0),
      piece('red', 'advisor', 4, 8),
      piece('black', 'advisor', 4, 1),
    ]);

    expect(targets(getPseudoLegalMovesForPiece(state, { file: 4, rank: 8 }))).toEqual([
      '3,7',
      '3,9',
      '5,7',
      '5,9',
    ]);
    expect(targets(getPseudoLegalMovesForPiece(state, { file: 4, rank: 9 }))).toEqual(['3,9', '5,9']);
    expect(targets(getPseudoLegalMovesForPiece(state, { file: 4, rank: 0 }))).toEqual(['3,0', '5,0']);
  });

  it('lets soldiers move forward before crossing the river and sideways after crossing', () => {
    const beforeRiver = stateWith([
      piece('red', 'general', 4, 9),
      piece('black', 'general', 4, 0),
      piece('red', 'soldier', 4, 6),
      piece('black', 'soldier', 4, 3),
    ]);
    const afterRiver = stateWith([
      piece('red', 'general', 4, 9),
      piece('black', 'general', 4, 0),
      piece('red', 'soldier', 4, 4),
      piece('black', 'soldier', 4, 5),
    ]);

    expect(targets(getPseudoLegalMovesForPiece(beforeRiver, { file: 4, rank: 6 }))).toEqual(['4,5']);
    expect(targets(getPseudoLegalMovesForPiece(beforeRiver, { file: 4, rank: 3 }))).toEqual(['4,4']);
    expect(targets(getPseudoLegalMovesForPiece(afterRiver, { file: 4, rank: 4 }))).toEqual(['4,3', '3,4', '5,4']);
    expect(targets(getPseudoLegalMovesForPiece(afterRiver, { file: 4, rank: 5 }))).toEqual(['4,6', '3,5', '5,5']);
  });
});

describe('legal move filtering and outcomes', () => {
  it('forbids moves that expose the two generals to each other', () => {
    const state = stateWith([
      piece('red', 'general', 4, 9),
      piece('black', 'general', 4, 0),
      piece('red', 'rook', 4, 5),
    ]);

    expect(targets(getLegalMovesForPiece(state, { file: 4, rank: 5 }))).not.toContain('3,5');
    expect(targets(getLegalMovesForPiece(state, { file: 4, rank: 5 }))).toContain('4,0');
  });

  it('detects check from a rook and only returns moves that resolve it', () => {
    const state = stateWith([
      piece('red', 'general', 4, 9),
      piece('black', 'general', 4, 0),
      piece('black', 'rook', 4, 5),
      piece('red', 'rook', 0, 9),
    ]);

    expect(isInCheck(state, 'red')).toBe(true);
    expect(targets(getAllLegalMoves(state, 'red'))).toEqual(['3,9', '5,9']);
    expect(getGameOutcome(state)).toEqual({ status: 'check', sideInCheck: 'red' });
  });

  it('detects checkmate when the checked side has no legal move', () => {
    const state = stateWith([
      piece('red', 'general', 4, 9),
      piece('black', 'general', 4, 0),
      piece('black', 'rook', 4, 8),
      piece('black', 'rook', 3, 8),
      piece('black', 'rook', 5, 8),
    ]);

    expect(isInCheck(state, 'red')).toBe(true);
    expect(getAllLegalMoves(state, 'red')).toEqual([]);
    expect(getGameOutcome(state)).toEqual({
      status: 'finished',
      winner: 'black',
      reason: 'checkmate',
    });
  });

  it('generates legal moves from the initial board without leaving either general missing', () => {
    const state = createInitialState();

    expect(getAllLegalMoves(state, 'red').length).toBeGreaterThan(0);
    expect(getAllLegalMoves(state, 'black').length).toBeGreaterThan(0);
    expect(isInCheck(state, 'red')).toBe(false);
    expect(isInCheck(state, 'black')).toBe(false);
  });
});

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

function stateWith(pieces: Array<[Position, Piece]>, turn: Side = 'red'): GameState {
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

function targets(moves: Array<{ to: Position }>) {
  return moves.map((move) => positionKey(move.to));
}
