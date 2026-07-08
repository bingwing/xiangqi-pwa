import { describe, expect, it } from 'vitest';

import { createInitialState } from '../game/setup';
import { loadPreferences, loadSavedState, savePreferences, saveState } from './preferences';

describe('preferences storage', () => {
  it('returns child-friendly defaults when storage is empty', () => {
    const storage = new MemoryStorage();

    expect(loadPreferences(storage)).toEqual({
      difficulty: 'beginner',
      teaching: true,
    });
    expect(loadSavedState(storage)).toBeUndefined();
  });

  it('round trips preferences and game state', () => {
    const storage = new MemoryStorage();
    const state = createInitialState();

    savePreferences(storage, {
      difficulty: 'advanced',
      teaching: false,
    });
    saveState(storage, state);

    expect(loadPreferences(storage)).toEqual({
      difficulty: 'advanced',
      teaching: false,
    });
    expect(loadSavedState(storage)).toEqual(state);
  });

  it('falls back safely when JSON is malformed or shape is wrong', () => {
    const storage = new MemoryStorage();
    storage.setItem('kids-xiangqi:preferences', '{bad-json');
    storage.setItem('kids-xiangqi:state', JSON.stringify({ board: null }));

    expect(loadPreferences(storage)).toEqual({
      difficulty: 'beginner',
      teaching: true,
    });
    expect(loadSavedState(storage)).toBeUndefined();
  });

  it('ignores stale challenge fields from older experimental builds', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      'kids-xiangqi:preferences',
      JSON.stringify({ challengeId: 'give-check', difficulty: 'normal', teaching: false }),
    );

    expect(loadPreferences(storage)).toEqual({
      difficulty: 'normal',
      teaching: false,
    });
  });
});

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}
