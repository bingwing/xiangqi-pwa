import {
  BOARD_FILES,
  BOARD_RANKS,
  cloneBoard,
  getPieceAt,
  isInsideBoard,
  parsePositionKey,
  positionKey,
} from './setup';
import type { BoardState, GameOutcome, GameState, Move, Piece, Position, Side } from './types';

const ORTHOGONAL_DIRECTIONS: Position[] = [
  { file: 0, rank: 1 },
  { file: 0, rank: -1 },
  { file: -1, rank: 0 },
  { file: 1, rank: 0 },
];

const HORSE_STEPS = [
  { move: { file: -2, rank: -1 }, leg: { file: -1, rank: 0 } },
  { move: { file: -2, rank: 1 }, leg: { file: -1, rank: 0 } },
  { move: { file: -1, rank: -2 }, leg: { file: 0, rank: -1 } },
  { move: { file: -1, rank: 2 }, leg: { file: 0, rank: 1 } },
  { move: { file: 1, rank: -2 }, leg: { file: 0, rank: -1 } },
  { move: { file: 1, rank: 2 }, leg: { file: 0, rank: 1 } },
  { move: { file: 2, rank: -1 }, leg: { file: 1, rank: 0 } },
  { move: { file: 2, rank: 1 }, leg: { file: 1, rank: 0 } },
];

const ELEPHANT_STEPS = [
  { move: { file: -2, rank: -2 }, eye: { file: -1, rank: -1 } },
  { move: { file: -2, rank: 2 }, eye: { file: -1, rank: 1 } },
  { move: { file: 2, rank: -2 }, eye: { file: 1, rank: -1 } },
  { move: { file: 2, rank: 2 }, eye: { file: 1, rank: 1 } },
];

export function getPseudoLegalMovesForPiece(state: GameState, from: Position): Move[] {
  const piece = getPieceAt(state.board, from);

  if (!piece) {
    return [];
  }

  switch (piece.kind) {
    case 'rook':
      return getRookMoves(state.board, from, piece);
    case 'horse':
      return getHorseMoves(state.board, from, piece);
    case 'cannon':
      return getCannonMoves(state.board, from, piece);
    case 'elephant':
      return getElephantMoves(state.board, from, piece);
    case 'advisor':
      return getAdvisorMoves(state.board, from, piece);
    case 'general':
      return getGeneralMoves(state.board, from, piece);
    case 'soldier':
      return getSoldierMoves(state.board, from, piece);
  }
}

export function getLegalMovesForPiece(state: GameState, from: Position): Move[] {
  const piece = getPieceAt(state.board, from);

  if (!piece) {
    return [];
  }

  return getPseudoLegalMovesForPiece(state, from).filter((move) => {
    const nextState = stateAfterMove(state, move);
    return !isInCheck(nextState, piece.side);
  });
}

export function getAllLegalMoves(state: GameState, side: Side): Move[] {
  return Object.entries(state.board).flatMap(([key, piece]) => {
    if (piece.side !== side) {
      return [];
    }

    return getLegalMovesForPiece(state, parsePositionKey(key as `${number},${number}`));
  });
}

export function isInCheck(state: GameState, side: Side): boolean {
  const general = findGeneral(state.board, side);

  if (!general) {
    return true;
  }

  return isFlyingGeneralCheck(state.board, side, general) || isAttackedBySide(state, general, oppositeSide(side));
}

export function getGameOutcome(state: GameState): GameOutcome {
  const redGeneral = findGeneral(state.board, 'red');
  const blackGeneral = findGeneral(state.board, 'black');

  if (!redGeneral) {
    return { status: 'finished', winner: 'black', reason: 'generalCaptured' };
  }

  if (!blackGeneral) {
    return { status: 'finished', winner: 'red', reason: 'generalCaptured' };
  }

  const side = state.turn;
  const inCheck = isInCheck(state, side);
  const legalMoves = getAllLegalMoves(state, side);

  if (legalMoves.length === 0) {
    return {
      status: 'finished',
      winner: oppositeSide(side),
      reason: inCheck ? 'checkmate' : 'stalemate',
    };
  }

  if (inCheck) {
    return { status: 'check', sideInCheck: side };
  }

  return { status: 'playing' };
}

export function oppositeSide(side: Side): Side {
  return side === 'red' ? 'black' : 'red';
}

export function stateAfterMove(state: GameState, move: Move): GameState {
  const board = cloneBoard(state.board);
  const fromKey = positionKey(move.from);
  const toKey = positionKey(move.to);

  delete board[fromKey];
  board[toKey] = { ...move.piece };

  return {
    ...state,
    board,
    turn: oppositeSide(state.turn),
  };
}

function getRookMoves(board: BoardState, from: Position, piece: Piece): Move[] {
  return getSlidingMoves(board, from, piece, false);
}

function getCannonMoves(board: BoardState, from: Position, piece: Piece): Move[] {
  return getSlidingMoves(board, from, piece, true);
}

function getSlidingMoves(board: BoardState, from: Position, piece: Piece, cannon: boolean): Move[] {
  const moves: Move[] = [];

  for (const direction of ORTHOGONAL_DIRECTIONS) {
    let pos = addPosition(from, direction);
    let screenSeen = false;

    while (isInsideBoard(pos)) {
      const target = getPieceAt(board, pos);

      if (!cannon) {
        if (!target) {
          moves.push(createMove(from, pos, piece));
        } else {
          if (target.side !== piece.side) {
            moves.push(createMove(from, pos, piece, target));
          }
          break;
        }
      } else if (!screenSeen) {
        if (!target) {
          moves.push(createMove(from, pos, piece));
        } else {
          screenSeen = true;
        }
      } else if (target) {
        if (target.side !== piece.side) {
          moves.push(createMove(from, pos, piece, target));
        }
        break;
      }

      pos = addPosition(pos, direction);
    }
  }

  return moves;
}

function getHorseMoves(board: BoardState, from: Position, piece: Piece): Move[] {
  return HORSE_STEPS.flatMap(({ move, leg }) => {
    if (getPieceAt(board, addPosition(from, leg))) {
      return [];
    }

    return createStepMove(board, from, addPosition(from, move), piece);
  });
}

function getElephantMoves(board: BoardState, from: Position, piece: Piece): Move[] {
  return ELEPHANT_STEPS.flatMap(({ move, eye }) => {
    const to = addPosition(from, move);

    if (getPieceAt(board, addPosition(from, eye)) || !isOnOwnSideOfRiver(piece.side, to.rank)) {
      return [];
    }

    return createStepMove(board, from, to, piece);
  });
}

function getAdvisorMoves(board: BoardState, from: Position, piece: Piece): Move[] {
  return [
    { file: -1, rank: -1 },
    { file: -1, rank: 1 },
    { file: 1, rank: -1 },
    { file: 1, rank: 1 },
  ].flatMap((step) => {
    const to = addPosition(from, step);
    return isInPalace(piece.side, to) ? createStepMove(board, from, to, piece) : [];
  });
}

function getGeneralMoves(board: BoardState, from: Position, piece: Piece): Move[] {
  return ORTHOGONAL_DIRECTIONS.flatMap((step) => {
    const to = addPosition(from, step);
    return isInPalace(piece.side, to) ? createStepMove(board, from, to, piece) : [];
  });
}

function getSoldierMoves(board: BoardState, from: Position, piece: Piece): Move[] {
  const forward = piece.side === 'red' ? -1 : 1;
  const steps: Position[] = [{ file: 0, rank: forward }];

  if (hasCrossedRiver(piece.side, from.rank)) {
    steps.push({ file: -1, rank: 0 }, { file: 1, rank: 0 });
  }

  return steps.flatMap((step) => createStepMove(board, from, addPosition(from, step), piece));
}

function createStepMove(board: BoardState, from: Position, to: Position, piece: Piece): Move[] {
  if (!isInsideBoard(to)) {
    return [];
  }

  const target = getPieceAt(board, to);

  if (target?.side === piece.side) {
    return [];
  }

  return [createMove(from, to, piece, target)];
}

function createMove(from: Position, to: Position, piece: Piece, captured?: Piece): Move {
  return {
    from: { ...from },
    to: { ...to },
    piece,
    captured,
  };
}

function addPosition(a: Position, b: Position): Position {
  return {
    file: a.file + b.file,
    rank: a.rank + b.rank,
  };
}

function isInPalace(side: Side, pos: Position): boolean {
  const ranks = side === 'red' ? [7, 8, 9] : [0, 1, 2];
  return pos.file >= 3 && pos.file <= 5 && ranks.includes(pos.rank);
}

function isOnOwnSideOfRiver(side: Side, rank: number): boolean {
  return side === 'red' ? rank >= 5 : rank <= 4;
}

function hasCrossedRiver(side: Side, rank: number): boolean {
  return side === 'red' ? rank <= 4 : rank >= 5;
}

function findGeneral(board: BoardState, side: Side): Position | undefined {
  for (const [key, piece] of Object.entries(board)) {
    if (piece.side === side && piece.kind === 'general') {
      return parsePositionKey(key as `${number},${number}`);
    }
  }

  return undefined;
}

function isFlyingGeneralCheck(board: BoardState, side: Side, ownGeneral: Position): boolean {
  const enemyGeneral = findGeneral(board, oppositeSide(side));

  if (!enemyGeneral || enemyGeneral.file !== ownGeneral.file) {
    return false;
  }

  const start = Math.min(ownGeneral.rank, enemyGeneral.rank) + 1;
  const end = Math.max(ownGeneral.rank, enemyGeneral.rank);

  for (let rank = start; rank < end; rank += 1) {
    if (getPieceAt(board, { file: ownGeneral.file, rank })) {
      return false;
    }
  }

  return true;
}

function isAttackedBySide(state: GameState, target: Position, attacker: Side): boolean {
  for (const [key, piece] of Object.entries(state.board)) {
    if (piece.side !== attacker) {
      continue;
    }

    const from = parsePositionKey(key as `${number},${number}`);
    if (attacksSquare(state.board, from, piece, target)) {
      return true;
    }
  }

  return false;
}

function attacksSquare(board: BoardState, from: Position, piece: Piece, target: Position): boolean {
  switch (piece.kind) {
    case 'rook':
      return attacksLikeRook(board, from, target);
    case 'cannon':
      return attacksLikeCannon(board, from, target);
    case 'horse':
      return getHorseMoves(board, from, piece).some((move) => samePosition(move.to, target));
    case 'elephant':
      return getElephantMoves(board, from, piece).some((move) => samePosition(move.to, target));
    case 'advisor':
      return getAdvisorMoves(board, from, piece).some((move) => samePosition(move.to, target));
    case 'soldier':
      return getSoldierMoves(board, from, piece).some((move) => samePosition(move.to, target));
    case 'general':
      return getGeneralMoves(board, from, piece).some((move) => samePosition(move.to, target));
  }
}

function attacksLikeRook(board: BoardState, from: Position, target: Position): boolean {
  if (from.file !== target.file && from.rank !== target.rank) {
    return false;
  }

  return countPiecesBetween(board, from, target) === 0;
}

function attacksLikeCannon(board: BoardState, from: Position, target: Position): boolean {
  if (from.file !== target.file && from.rank !== target.rank) {
    return false;
  }

  return countPiecesBetween(board, from, target) === 1;
}

function countPiecesBetween(board: BoardState, from: Position, target: Position): number {
  if (samePosition(from, target)) {
    return 0;
  }

  const fileStep = Math.sign(target.file - from.file);
  const rankStep = Math.sign(target.rank - from.rank);
  let count = 0;
  let pos = {
    file: from.file + fileStep,
    rank: from.rank + rankStep,
  };

  while (!samePosition(pos, target)) {
    if (pos.file < 0 || pos.file >= BOARD_FILES || pos.rank < 0 || pos.rank >= BOARD_RANKS) {
      break;
    }

    if (getPieceAt(board, pos)) {
      count += 1;
    }

    pos = {
      file: pos.file + fileStep,
      rank: pos.rank + rankStep,
    };
  }

  return count;
}

function samePosition(a: Position, b: Position): boolean {
  return a.file === b.file && a.rank === b.rank;
}
