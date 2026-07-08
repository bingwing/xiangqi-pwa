import { cloneBoard, getPieceAt, positionKey } from './setup';
import { getGameOutcome, getLegalMovesForPiece, oppositeSide } from './rules';
import type { GameState, Move, Position } from './types';

const PIECE_NAMES = {
  general: '帅',
  advisor: '仕',
  elephant: '相',
  horse: '马',
  rook: '车',
  cannon: '炮',
  soldier: '兵',
} as const;

export function applyMove(state: GameState, input: Pick<Move, 'from' | 'to'>): GameState {
  const legalMove = getLegalMovesForPiece(state, input.from).find((move) => samePosition(move.to, input.to));

  if (!legalMove) {
    throw new Error('illegal move');
  }

  const previousBoard = cloneBoard(state.board);
  const board = cloneBoard(state.board);
  const fromKey = positionKey(input.from);
  const toKey = positionKey(input.to);

  delete board[fromKey];
  board[toKey] = { ...legalMove.piece };

  const nextState: GameState = {
    board,
    turn: oppositeSide(state.turn),
    history: [
      ...state.history,
      {
        move: legalMove,
        previousBoard,
        previousTurn: state.turn,
      },
    ],
    outcome: { status: 'playing' },
  };

  return {
    ...nextState,
    outcome: getGameOutcome(nextState),
  };
}

export function undoLastTurn(state: GameState): GameState {
  if (state.history.length === 0) {
    return state;
  }

  const stepsToUndo = Math.min(2, state.history.length);
  const restoreRecord = state.history[state.history.length - stepsToUndo];
  const history = state.history.slice(0, state.history.length - stepsToUndo);
  const restored: GameState = {
    board: cloneBoard(restoreRecord.previousBoard),
    turn: restoreRecord.previousTurn,
    history,
    outcome: { status: 'playing' },
  };

  return {
    ...restored,
    outcome: getGameOutcome(restored),
  };
}

export function getMoveLabel(state: GameState, move: Pick<Move, 'from' | 'to'>): string {
  const piece = getPieceAt(state.board, move.from);

  if (!piece) {
    return '未知走法';
  }

  const sideName = piece.side === 'red' ? '红' : '黑';
  const lane = piece.side === 'red' ? move.from.file + 1 : 9 - move.from.file;
  const direction = getDirectionLabel(piece.side, move.from, move.to);
  const distance =
    move.from.file === move.to.file ? Math.abs(move.from.rank - move.to.rank) : Math.abs(move.from.file - move.to.file);

  return `${sideName}${PIECE_NAMES[piece.kind]} ${lane}路${direction}${distance}`;
}

function getDirectionLabel(side: 'red' | 'black', from: Position, to: Position): string {
  if (from.rank === to.rank) {
    return '平';
  }

  const forward = side === 'red' ? to.rank < from.rank : to.rank > from.rank;
  return forward ? '进' : '退';
}

function samePosition(a: Position, b: Position): boolean {
  return a.file === b.file && a.rank === b.rank;
}
