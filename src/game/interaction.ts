import type { Move, Position, Side } from './types';
import { positionKey } from './setup';

export function getSelectionHintText(moves: Move[]): string {
  if (moves.length === 0) {
    return '已选中，可以换一枚棋。';
  }

  return '已选中，点棋盘落子。';
}

export function getSelectionStatusText(moves: Move[]): string {
  if (moves.length === 0) {
    return '这枚棋暂时没有安全走法，可以换一枚棋。';
  }

  const captureCount = moves.filter((move) => move.captured).length;

  if (captureCount > 0) {
    return `可走 ${moves.length} 步，其中 ${captureCount} 步可以吃子。`;
  }

  return `可走 ${moves.length} 步。`;
}

export function shouldNudgeSelection(
  selected: Position | undefined,
  clickedPieceSide: Side | undefined,
  playerSide: Side,
): boolean {
  return Boolean(selected && clickedPieceSide !== playerSide);
}

export function getSelectionNudgeKey(position: Position, attempt: number): string {
  return `${positionKey(position)}:${attempt}`;
}

export function getNextSelection(
  current: Position | undefined,
  clicked: Position,
  clickedPieceSide: Side | undefined,
  playerSide: Side,
): Position | undefined {
  if (clickedPieceSide !== playerSide) {
    return current;
  }

  if (current && current.file === clicked.file && current.rank === clicked.rank) {
    return undefined;
  }

  return clicked;
}
