import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../App.css', import.meta.url), 'utf8');

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[^}]*)\\}`));
  return match?.groups?.body ?? '';
}

describe('piece visual styles', () => {
  it('uses layered body shadows without decorative corner badges', () => {
    const pieceRule = cssRule('.board-point.piece');
    const ringRule = cssRule('.board-point.piece::before');
    const badgeRule = cssRule('.board-point.piece::after');
    const redBadgeRule = cssRule('.board-point.red::after');
    const blackBadgeRule = cssRule('.board-point.black::after');

    expect(pieceRule).toContain('radial-gradient(circle at 50% 43%');
    expect(pieceRule).toContain('inset 0 8px 8px');
    expect(pieceRule).toContain('inset 0 -10px 14px');
    expect(pieceRule).toContain('0 10px 14px');
    expect(ringRule).toContain('border: 3px double');
    expect(ringRule).not.toContain('currentColor');
    expect(badgeRule).toBe('');
    expect(redBadgeRule).toBe('');
    expect(blackBadgeRule).toBe('');
  });

  it('uses high-contrast solid piece text for both sides', () => {
    const pointRule = cssRule('.board-point');
    const pieceRule = cssRule('.board-point.piece');
    const redRule = cssRule('.board-point.red');
    const blackRule = cssRule('.board-point.black');
    const movingPieceRule = cssRule('.moving-piece');
    const movingRedRule = cssRule('.moving-piece.red');
    const movingBlackRule = cssRule('.moving-piece.black');

    expect(pointRule).toContain('width: min(clamp(46px, 9.8vw, 78px), 12.6cqw)');
    expect(pointRule).toContain('height: min(clamp(46px, 9.8vw, 78px), 12.6cqw)');
    expect(pointRule).toContain('font-size: min(clamp(2rem, 4.6vw, 3.15rem), 8.4cqw)');
    expect(pointRule).toContain('font-weight: 950');
    expect(pieceRule).toContain('-webkit-text-stroke: 0.45px rgba(255, 246, 220, 0.82)');
    expect(pieceRule).toContain('font-family: "STKaiti", "Kaiti SC"');
    expect(redRule).toContain('color: #9f100c');
    expect(redRule).toContain('text-shadow:');
    expect(redRule).toContain('-1px 0 rgba(255, 246, 220, 0.92)');
    expect(redRule).toContain('1px 0 rgba(255, 246, 220, 0.92)');
    expect(blackRule).toContain('color: #000000');
    expect(blackRule).toContain('text-shadow:');
    expect(blackRule).toContain('-1px 0 rgba(255, 246, 220, 0.96)');
    expect(blackRule).toContain('1px 0 rgba(255, 246, 220, 0.96)');
    expect(movingPieceRule).toContain('width: min(clamp(50px, 10.4vw, 82px), 13cqw)');
    expect(movingPieceRule).toContain('height: min(clamp(50px, 10.4vw, 82px), 13cqw)');
    expect(movingPieceRule).toContain('font-size: min(clamp(1.9rem, 4.4vw, 3rem), 8.1cqw)');
    expect(movingPieceRule).toContain('font-weight: 950');
    expect(movingRedRule).toContain('color: #9f100c');
    expect(movingBlackRule).toContain('color: #000000');
  });
});
