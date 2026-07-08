import type { Difficulty } from './types';

export type BoardNotice =
  | { kind: 'red-turn' }
  | { kind: 'ai-thinking' }
  | {
      kind: 'ai-moved';
      moveLabel: string;
    }
  | {
      kind: 'hint';
      moveLabel: string;
    }
  | { kind: 'undo-red-turn' };

export function getBoardNoticeText(notice: BoardNotice | undefined): string | undefined {
  if (!notice) {
    return undefined;
  }

  if (notice.kind === 'ai-thinking') {
    return '黑方思考中...';
  }

  if (notice.kind === 'ai-moved') {
    return `黑方走了：${notice.moveLabel}`;
  }

  if (notice.kind === 'hint') {
    return `提示：${notice.moveLabel}`;
  }

  if (notice.kind === 'undo-red-turn') {
    return '已悔棋，红方重新走。';
  }

  return '轮到红方，点一枚棋子。';
}

export function getAiThinkingDelay(difficulty: Difficulty): number {
  if (difficulty === 'advanced') {
    return 1500;
  }

  return 1200;
}
