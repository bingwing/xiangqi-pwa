export type Side = 'red' | 'black';

export type PieceKind = 'general' | 'advisor' | 'elephant' | 'horse' | 'rook' | 'cannon' | 'soldier';

export type Difficulty = 'beginner' | 'normal' | 'advanced';

export type GameOutcome =
  | { status: 'playing' }
  | { status: 'check'; sideInCheck: Side }
  | { status: 'finished'; winner: Side; reason: 'checkmate' | 'generalCaptured' | 'stalemate' };

export interface Position {
  file: number;
  rank: number;
}

export type PositionKey = `${number},${number}`;

export interface Piece {
  id: string;
  side: Side;
  kind: PieceKind;
}

export type BoardState = Record<PositionKey, Piece>;

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
}

export interface MoveRecord {
  move: Move;
  previousBoard: BoardState;
  previousTurn: Side;
}

export interface GameState {
  board: BoardState;
  turn: Side;
  history: MoveRecord[];
  outcome: GameOutcome;
}
