import { describe, expect, it } from 'vitest';

import { getAiThinkingDelay, getBoardNoticeText } from './boardNotice';

describe('getBoardNoticeText', () => {
  it('shows a short notice while AI is thinking', () => {
    expect(getBoardNoticeText({ kind: 'ai-thinking' })).toBe('黑方思考中...');
  });

  it('shows whose turn it is when red can move', () => {
    expect(getBoardNoticeText({ kind: 'red-turn' })).toBe('轮到红方，点一枚棋子。');
  });

  it('shows the AI move label after black moves', () => {
    expect(getBoardNoticeText({ kind: 'ai-moved', moveLabel: '黑车 1路进1' })).toBe('黑方走了：黑车 1路进1');
  });

  it('shows the suggested move on the board', () => {
    expect(getBoardNoticeText({ kind: 'hint', moveLabel: '红兵 1路进1' })).toBe('提示：红兵 1路进1');
  });

  it('shows a red turn notice after undo', () => {
    expect(getBoardNoticeText({ kind: 'undo-red-turn' })).toBe('已悔棋，红方重新走。');
  });

  it('returns undefined when there is no board notice', () => {
    expect(getBoardNoticeText(undefined)).toBeUndefined();
  });
});

describe('getAiThinkingDelay', () => {
  it('keeps beginner and normal AI thinking visible long enough for children', () => {
    expect(getAiThinkingDelay('beginner')).toBeGreaterThanOrEqual(1100);
    expect(getAiThinkingDelay('normal')).toBeGreaterThanOrEqual(1100);
  });

  it('gives advanced AI a slightly longer thinking cue', () => {
    expect(getAiThinkingDelay('advanced')).toBeGreaterThan(getAiThinkingDelay('normal'));
  });
});
