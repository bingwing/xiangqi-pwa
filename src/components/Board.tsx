import type { CSSProperties } from 'react';

import { positionKey } from '../game/setup';
import type { BoardState, Move, Piece, Position, PositionKey } from '../game/types';

const FILES = Array.from({ length: 9 }, (_, file) => file);
const RANKS = Array.from({ length: 10 }, (_, rank) => rank);
const MARKER_POSITIONS: Position[] = [
  { file: 1, rank: 2 },
  { file: 7, rank: 2 },
  { file: 0, rank: 3 },
  { file: 2, rank: 3 },
  { file: 4, rank: 3 },
  { file: 6, rank: 3 },
  { file: 8, rank: 3 },
  { file: 1, rank: 7 },
  { file: 7, rank: 7 },
  { file: 0, rank: 6 },
  { file: 2, rank: 6 },
  { file: 4, rank: 6 },
  { file: 6, rank: 6 },
  { file: 8, rank: 6 },
];

const PIECE_TEXT = {
  red: {
    general: '帅',
    advisor: '仕',
    elephant: '相',
    horse: '马',
    rook: '车',
    cannon: '炮',
    soldier: '兵',
  },
  black: {
    general: '将',
    advisor: '士',
    elephant: '象',
    horse: '马',
    rook: '车',
    cannon: '炮',
    soldier: '卒',
  },
} as const;

interface BoardProps {
  board: BoardState;
  legalTargets: Position[];
  selected?: Position;
  hint?: Move;
  lastMove?: Move;
  nudgeKey?: string;
  moveAnimation?: MoveAnimation;
  notice?: string;
  selectionText?: string;
  disabled: boolean;
  onPointClick: (position: Position) => void;
}

export interface MoveAnimation {
  id: number;
  move: Move;
  piece: Piece;
  emphasis: 'player' | 'ai';
}

export function Board({
  board,
  legalTargets,
  selected,
  hint,
  lastMove,
  nudgeKey,
  moveAnimation,
  notice,
  selectionText,
  disabled,
  onPointClick,
}: BoardProps) {
  const targetKeys = new Set(legalTargets.map(positionKey));
  const selectedKey = selected ? positionKey(selected) : undefined;
  const hintFrom = hint ? positionKey(hint.from) : undefined;
  const hintTo = hint ? positionKey(hint.to) : undefined;
  const lastMoveFrom = lastMove ? positionKey(lastMove.from) : undefined;
  const lastMoveTo = lastMove ? positionKey(lastMove.to) : undefined;

  return (
    <section className="board-shell" aria-label="象棋棋盘">
      {notice ? <div className="board-notice">{notice}</div> : <div className="board-notice board-notice-empty" aria-hidden="true" />}
      {selectionText ? (
        <div className="board-selection-tip">{selectionText}</div>
      ) : (
        <div className="board-selection-tip board-selection-tip-empty" aria-hidden="true" />
      )}
      <div className="board-grid">
        <div className="board-play-area">
          <svg className="board-lines" viewBox="0 0 8 9" preserveAspectRatio="none" focusable="false" aria-hidden="true">
            {RANKS.map((rank) => (
              <line key={`h-${rank}`} className="board-line horizontal" x1="0" y1={rank} x2="8" y2={rank} />
            ))}
            {FILES.map((file) => (
              <line key={`v-top-${file}`} className="board-line vertical top" x1={file} y1="0" x2={file} y2="4" />
            ))}
            {FILES.map((file) => (
              <line key={`v-bottom-${file}`} className="board-line vertical bottom" x1={file} y1="5" x2={file} y2="9" />
            ))}
            <line className="board-line palace-line black-palace" x1="3" y1="0" x2="5" y2="2" />
            <line className="board-line palace-line black-palace" x1="5" y1="0" x2="3" y2="2" />
            <line className="board-line palace-line red-palace" x1="3" y1="7" x2="5" y2="9" />
            <line className="board-line palace-line red-palace" x1="5" y1="7" x2="3" y2="9" />
            <text className="river-label river-left" x="1.7" y="4.64">楚河</text>
            <text className="river-label river-right" x="6.3" y="4.64">汉界</text>
            {MARKER_POSITIONS.map((position) => (
              <g
                key={`marker-${position.file}-${position.rank}`}
                className="board-marker"
                data-marker={`${position.file}-${position.rank}`}
              >
                {markerSegments(position).map((segment, index) => (
                  <path key={index} d={segment} />
                ))}
              </g>
            ))}
          </svg>
          {lastMove ? (
            <svg
              className={`last-move-guide ${lastMove.piece.side}`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              focusable="false"
              aria-hidden="true"
            >
              <line
                x1={pointPercent(lastMove.from.file, 8)}
                y1={pointPercent(lastMove.from.rank, 9)}
                x2={pointPercent(lastMove.to.file, 8)}
                y2={pointPercent(lastMove.to.rank, 9)}
              />
              <circle cx={pointPercent(lastMove.from.file, 8)} cy={pointPercent(lastMove.from.rank, 9)} r="1.8" />
              <circle className="last-move-end" cx={pointPercent(lastMove.to.file, 8)} cy={pointPercent(lastMove.to.rank, 9)} r="2.4" />
            </svg>
          ) : null}
          {RANKS.flatMap((rank) =>
            FILES.map((file) => {
              const position = { file, rank };
              const key = positionKey(position);
              const piece = board[key as PositionKey];
              const isTarget = targetKeys.has(key);
              const isCaptureTarget = Boolean(isTarget && piece && piece.side !== 'red');
              const isSelected = selectedKey === key;
              const isNudging = Boolean(nudgeKey && nudgeKey.startsWith(`${key}:`));
              const isHint = hintFrom === key || hintTo === key;
              const isLastMoveFrom = lastMoveFrom === key;
              const isLastMoveTo = lastMoveTo === key;

              return (
                <button
                  key={key}
                  className={[
                    'board-point',
                    piece ? `piece ${piece.side}` : '',
                    isTarget ? 'target' : '',
                    isCaptureTarget ? 'capture-target' : '',
                    isSelected ? 'selected' : '',
                    isNudging ? 'selection-nudge' : '',
                    isHint ? 'hint' : '',
                    isLastMoveFrom || isLastMoveTo ? 'last-move' : '',
                    isLastMoveFrom ? 'last-from' : '',
                    isLastMoveTo ? 'last-to' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    left: `${pointPercent(file, 8)}%`,
                    top: `${pointPercent(rank, 9)}%`,
                  }}
                  type="button"
                  disabled={disabled}
                  data-side={piece?.side}
                  aria-label={piece ? `${piece.side === 'red' ? '红' : '黑'}${PIECE_TEXT[piece.side][piece.kind]}` : '空位'}
                  onClick={() => onPointClick(position)}
                >
                  {piece ? <span className="piece-label">{PIECE_TEXT[piece.side][piece.kind]}</span> : isTarget ? <span className="target-dot" /> : null}
                </button>
              );
            }),
          )}
          {moveAnimation ? (
            <div
              key={moveAnimation.id}
              className={`move-animation ${moveAnimation.emphasis}`}
              style={animationStyle(moveAnimation.move)}
              aria-hidden="true"
            >
              <svg className="move-trail" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
                <line
                  x1={pointPercent(moveAnimation.move.from.file, 8)}
                  y1={pointPercent(moveAnimation.move.from.rank, 9)}
                  x2={pointPercent(moveAnimation.move.to.file, 8)}
                  y2={pointPercent(moveAnimation.move.to.rank, 9)}
                />
              </svg>
              <span className={`moving-piece ${moveAnimation.piece.side}`}>
                <span className="piece-label">{PIECE_TEXT[moveAnimation.piece.side][moveAnimation.piece.kind]}</span>
              </span>
              <span className="move-origin-pulse" />
              <span className="move-destination-pulse" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function pointPercent(value: number, max: number): number {
  return (value / max) * 100;
}

function markerSegments(position: Position): string[] {
  const size = 0.18;
  const gap = 0.08;
  const segments: string[] = [];
  const addCorner = (xSign: -1 | 1, ySign: -1 | 1) => {
    const x = position.file + xSign * gap;
    const y = position.rank + ySign * gap;
    segments.push(`M ${x} ${y + ySign * size} L ${x} ${y} L ${x + xSign * size} ${y}`);
  };

  if (position.file > 0) {
    addCorner(-1, -1);
    addCorner(-1, 1);
  }

  if (position.file < 8) {
    addCorner(1, -1);
    addCorner(1, 1);
  }

  return segments;
}

function animationStyle(move: Move): CSSProperties {
  return {
    '--from-x': `${pointPercent(move.from.file, 8)}%`,
    '--from-y': `${pointPercent(move.from.rank, 9)}%`,
    '--to-x': `${pointPercent(move.to.file, 8)}%`,
    '--to-y': `${pointPercent(move.to.rank, 9)}%`,
  } as CSSProperties;
}
