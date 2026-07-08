import { getAllLegalMoves, stateAfterMove } from './rules';
import type { Difficulty, GameState, Move, PieceKind, Side } from './types';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '入门',
  normal: '初级',
  advanced: '进阶',
};

const PIECE_VALUES: Record<PieceKind, number> = {
  general: 10000,
  rook: 900,
  cannon: 450,
  horse: 400,
  elephant: 200,
  advisor: 200,
  soldier: 100,
};

export function chooseAiMove(state: GameState, difficulty: Difficulty): Move | undefined {
  return chooseMove(state, state.turn, difficulty);
}

export function chooseHintMove(state: GameState, difficulty: Difficulty): Move | undefined {
  return chooseMove(state, state.turn, difficulty);
}

function chooseMove(state: GameState, side: Side, difficulty: Difficulty): Move | undefined {
  const moves = getAllLegalMoves(state, side);

  if (moves.length === 0) {
    return undefined;
  }

  if (difficulty === 'beginner') {
    return chooseBeginnerMove(state, side, moves);
  }

  return chooseSearchMove(state, side, moves, difficulty === 'advanced' ? 2 : 1);
}

function chooseBeginnerMove(state: GameState, side: Side, moves: Move[]): Move {
  const ranked = moves
    .map((move, index) => ({
      move,
      score: scoreMove(state, move, side) + beginnerNoise(index),
    }))
    .sort((a, b) => b.score - a.score);

  const poolSize = Math.min(4, ranked.length);
  return ranked[poolSize - 1]?.move ?? ranked[0].move;
}

function chooseSearchMove(state: GameState, side: Side, moves: Move[], depth: number): Move {
  const orderedMoves = moves
    .map((move) => ({
      move,
      score: scoreMove(state, move, side),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.move);
  const searchMoves = depth > 1 ? orderedMoves.slice(0, 14) : orderedMoves;

  return searchMoves
    .map((move) => ({
      move,
      score: minimax(safeApplyMove(state, move), depth - 1, side, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
    }))
    .sort((a, b) => b.score - a.score)[0].move;
}

function minimax(state: GameState, maximizingSide: Side, depth: number, alpha: number, beta: number): number;
function minimax(state: GameState, depth: number, maximizingSide: Side, alpha: number, beta: number): number;
function minimax(
  state: GameState,
  depthOrSide: number | Side,
  sideOrDepth: Side | number,
  alpha: number,
  beta: number,
): number {
  const depth = typeof depthOrSide === 'number' ? depthOrSide : (sideOrDepth as number);
  const maximizingSide = typeof depthOrSide === 'number' ? (sideOrDepth as Side) : depthOrSide;

  if (depth <= 0) {
    return evaluateState(state, maximizingSide);
  }

  const moves = getAllLegalMoves(state, state.turn);

  if (moves.length === 0) {
    return state.turn === maximizingSide ? -100000 : 100000;
  }

  if (state.turn === maximizingSide) {
    let best = Number.NEGATIVE_INFINITY;
    let nextAlpha = alpha;

    for (const move of orderSearchMoves(state, moves, state.turn)) {
      best = Math.max(best, minimax(safeApplyMove(state, move), depth - 1, maximizingSide, nextAlpha, beta));
      nextAlpha = Math.max(nextAlpha, best);
      if (beta <= nextAlpha) {
        break;
      }
    }

    return best;
  }

  let best = Number.POSITIVE_INFINITY;
  let nextBeta = beta;

  for (const move of orderSearchMoves(state, moves, state.turn)) {
    best = Math.min(best, minimax(safeApplyMove(state, move), depth - 1, maximizingSide, alpha, nextBeta));
    nextBeta = Math.min(nextBeta, best);
    if (nextBeta <= alpha) {
      break;
    }
  }

  return best;
}

function scoreMove(state: GameState, move: Move, side: Side): number {
  const captureScore = move.captured ? PIECE_VALUES[move.captured.kind] * 10 : 0;
  return captureScore + evaluateState(safeApplyMove(state, move), side);
}

function evaluateState(state: GameState, side: Side): number {
  if (state.outcome.status === 'finished') {
    return state.outcome.winner === side ? 100000 : -100000;
  }

  let score = 0;

  for (const [key, piece] of Object.entries(state.board)) {
    const [, rankValue] = key.split(',').map(Number);
    const sign = piece.side === side ? 1 : -1;
    score += sign * (PIECE_VALUES[piece.kind] + positionalBonus(piece.kind, piece.side, rankValue));
  }

  return score;
}

function positionalBonus(kind: PieceKind, side: Side, rank: number): number {
  if (kind !== 'soldier') {
    return 0;
  }

  const crossedRiver = side === 'red' ? rank <= 4 : rank >= 5;
  return crossedRiver ? 40 : 0;
}

function safeApplyMove(state: GameState, move: Move): GameState {
  return stateAfterMove(state, move);
}

function orderSearchMoves(state: GameState, moves: Move[], side: Side): Move[] {
  return moves
    .map((move) => ({
      move,
      score: scoreMove(state, move, side),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((entry) => entry.move);
}

function beginnerNoise(index: number): number {
  return ((index * 37) % 97) - 48;
}
