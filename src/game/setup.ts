import type { BoardState, GameState, Piece, PieceKind, Position, PositionKey, Side } from './types';

export const BOARD_FILES = 9;
export const BOARD_RANKS = 10;

export function positionKey(pos: Position): PositionKey {
  return `${pos.file},${pos.rank}`;
}

export function parsePositionKey(key: PositionKey): Position {
  const [file, rank] = key.split(',').map(Number);
  return { file, rank };
}

export function getPieceAt(board: BoardState, pos: Position): Piece | undefined {
  return board[positionKey(pos)];
}

export function isInsideBoard(pos: Position): boolean {
  return pos.file >= 0 && pos.file < BOARD_FILES && pos.rank >= 0 && pos.rank < BOARD_RANKS;
}

export function cloneBoard(board: BoardState): BoardState {
  return Object.fromEntries(Object.entries(board).map(([key, piece]) => [key, { ...piece }])) as BoardState;
}

export function createInitialState(): GameState {
  return {
    board: createInitialBoard(),
    turn: 'red',
    history: [],
    outcome: { status: 'playing' },
  };
}

function createInitialBoard(): BoardState {
  const board: BoardState = {};

  placeBackRank(board, 'black', 0);
  placeBackRank(board, 'red', 9);
  place(board, 'black', 'cannon', 1, 2);
  place(board, 'black', 'cannon', 7, 2);
  place(board, 'red', 'cannon', 1, 7);
  place(board, 'red', 'cannon', 7, 7);

  for (const file of [0, 2, 4, 6, 8]) {
    place(board, 'black', 'soldier', file, 3);
    place(board, 'red', 'soldier', file, 6);
  }

  return board;
}

function placeBackRank(board: BoardState, side: Side, rank: number) {
  const order: PieceKind[] = [
    'rook',
    'horse',
    'elephant',
    'advisor',
    'general',
    'advisor',
    'elephant',
    'horse',
    'rook',
  ];

  order.forEach((kind, file) => place(board, side, kind, file, rank));
}

function place(board: BoardState, side: Side, kind: PieceKind, file: number, rank: number) {
  board[positionKey({ file, rank })] = {
    id: `${side}-${kind}-${file}-${rank}`,
    side,
    kind,
  };
}
