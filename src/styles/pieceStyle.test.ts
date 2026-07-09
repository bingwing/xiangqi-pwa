import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../App.css', import.meta.url), 'utf8');

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[^}]*)\\}`));
  return match?.groups?.body ?? '';
}

describe('piece visual styles', () => {
  it('uses a clean carved body without decorative corner badges', () => {
    const pieceRule = cssRule('.board-point.piece');
    const ringRule = cssRule('.board-point.piece::before');
    const badgeRule = cssRule('.board-point.piece::after');
    const redBadgeRule = cssRule('.board-point.red::after');
    const blackBadgeRule = cssRule('.board-point.black::after');

    expect(pieceRule).toContain('overflow: hidden');
    expect(pieceRule).toContain('border: 3px solid #7b4a24');
    expect(pieceRule).toContain('radial-gradient(circle at 50% 38%');
    expect(pieceRule).toContain('inset 0 5px 9px');
    expect(pieceRule).toContain('inset 0 -10px 13px');
    expect(pieceRule).toContain('0 8px 10px');
    expect(ringRule).toBe('');
    expect(badgeRule).toBe('');
    expect(redBadgeRule).toBe('');
    expect(blackBadgeRule).toBe('');
  });

  it('keeps piece labels readable above the carved body', () => {
    const pointRule = cssRule('.board-point');
    const pieceRule = cssRule('.board-point.piece');
    const labelRule = cssRule('.piece-label');
    const redRule = cssRule('.board-point.red');
    const blackRule = cssRule('.board-point.black');
    const movingPieceRule = cssRule('.moving-piece');
    const movingRedRule = cssRule('.moving-piece.red');
    const movingBlackRule = cssRule('.moving-piece.black');

    expect(pointRule).toContain('width: min(clamp(46px, 9.8vw, 78px), 12.6cqw)');
    expect(pointRule).toContain('height: min(clamp(46px, 9.8vw, 78px), 12.6cqw)');
    expect(pointRule).toContain('font-size: min(clamp(2rem, 4.6vw, 3.15rem), 8.4cqw)');
    expect(pointRule).toContain('font-weight: 950');
    expect(pieceRule).not.toContain('-webkit-text-stroke');
    expect(pieceRule).not.toContain('text-shadow:');
    expect(labelRule).toContain('position: absolute');
    expect(labelRule).toContain('inset: 0');
    expect(labelRule).toContain('display: grid');
    expect(labelRule).toContain('place-items: center');
    expect(labelRule).toContain('z-index: 1');
    expect(labelRule).toContain('font-family: "STKaiti"');
    expect(labelRule).toContain('font-weight: 1000');
    expect(labelRule).toContain('transform: translateY(0.04em)');
    expect(labelRule).toContain('text-shadow: 0 1px 0 rgba(255, 244, 210, 0.55)');
    expect(redRule).toContain('color: #b32218');
    expect(blackRule).toContain('color: #1f1712');
    expect(movingPieceRule).toContain('width: min(clamp(50px, 10.4vw, 82px), 13cqw)');
    expect(movingPieceRule).toContain('height: min(clamp(50px, 10.4vw, 82px), 13cqw)');
    expect(movingPieceRule).toContain('font-size: min(clamp(1.9rem, 4.4vw, 3rem), 8.1cqw)');
    expect(movingPieceRule).toContain('font-weight: 950');
    expect(movingPieceRule).not.toContain('-webkit-text-stroke');
    expect(movingPieceRule).toContain('font-family: "STKaiti"');
    expect(movingRedRule).toContain('color: #b32218');
    expect(movingBlackRule).toContain('color: #1f1712');
  });
});
