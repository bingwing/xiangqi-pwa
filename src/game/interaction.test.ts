import { describe, expect, it } from 'vitest';

import { getSelectionHintText, getSelectionStatusText, getNextSelection, getSelectionNudgeKey, shouldNudgeSelection } from './interaction';
import type { Move } from './types';

describe('getNextSelection', () => {
  it('selects an own piece when nothing is selected', () => {
    expect(getNextSelection(undefined, { file: 0, rank: 6 }, 'red', 'red')).toEqual({ file: 0, rank: 6 });
  });

  it('cancels selection when tapping the same own piece again', () => {
    expect(getNextSelection({ file: 0, rank: 6 }, { file: 0, rank: 6 }, 'red', 'red')).toBeUndefined();
  });

  it('switches selection when tapping another own piece', () => {
    expect(getNextSelection({ file: 0, rank: 6 }, { file: 2, rank: 6 }, 'red', 'red')).toEqual({ file: 2, rank: 6 });
  });

  it('keeps current selection when tapping an empty point or enemy piece', () => {
    expect(getNextSelection({ file: 0, rank: 6 }, { file: 0, rank: 5 }, undefined, 'red')).toEqual({
      file: 0,
      rank: 6,
    });
    expect(getNextSelection({ file: 0, rank: 6 }, { file: 0, rank: 3 }, 'black', 'red')).toEqual({
      file: 0,
      rank: 6,
    });
  });
});

describe('getSelectionHintText', () => {
  it('keeps board selection guidance quiet once a piece is selected', () => {
    const moves: Move[] = [
      {
        from: { file: 0, rank: 6 },
        to: { file: 0, rank: 5 },
        piece: { id: 'red-soldier', side: 'red', kind: 'soldier' },
      },
      {
        from: { file: 0, rank: 6 },
        to: { file: 0, rank: 4 },
        piece: { id: 'red-soldier', side: 'red', kind: 'soldier' },
        captured: { id: 'black-soldier', side: 'black', kind: 'soldier' },
      },
    ];

    expect(getSelectionHintText(moves)).toBe('已选中，点棋盘落子。');
  });

  it('keeps illegal move guidance tied to the current selection', () => {
    expect(getSelectionHintText([])).toBe('已选中，可以换一枚棋。');
  });
});

describe('getSelectionStatusText', () => {
  it('uses the status panel for move count details instead of the board', () => {
    const moves: Move[] = [
      {
        from: { file: 0, rank: 6 },
        to: { file: 0, rank: 5 },
        piece: { id: 'red-soldier', side: 'red', kind: 'soldier' },
      },
      {
        from: { file: 0, rank: 6 },
        to: { file: 0, rank: 4 },
        piece: { id: 'red-soldier', side: 'red', kind: 'soldier' },
        captured: { id: 'black-soldier', side: 'black', kind: 'soldier' },
      },
    ];

    expect(getSelectionStatusText(moves)).toBe('可走 2 步，其中 1 步可以吃子。');
  });

  it('tells the child to switch pieces when the selected piece has no legal moves', () => {
    expect(getSelectionStatusText([])).toBe('这枚棋暂时没有安全走法，可以换一枚棋。');
  });
});

describe('shouldNudgeSelection', () => {
  it('nudges only when a selected piece is asked to move to a non-own point', () => {
    const selected = { file: 1, rank: 7 };

    expect(shouldNudgeSelection(selected, undefined, 'red')).toBe(true);
    expect(shouldNudgeSelection(selected, 'black', 'red')).toBe(true);
    expect(shouldNudgeSelection(selected, 'red', 'red')).toBe(false);
    expect(shouldNudgeSelection(undefined, undefined, 'red')).toBe(false);
  });
});

describe('getSelectionNudgeKey', () => {
  it('includes an attempt number so repeated invalid taps restart the feedback animation', () => {
    const selected = { file: 1, rank: 7 };

    expect(getSelectionNudgeKey(selected, 1)).toBe('1,7:1');
    expect(getSelectionNudgeKey(selected, 2)).toBe('1,7:2');
  });
});
