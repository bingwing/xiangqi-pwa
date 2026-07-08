import type { Difficulty, GameState } from '../game/types';

const PREFERENCES_KEY = 'kids-xiangqi:preferences';
const STATE_KEY = 'kids-xiangqi:state';

export interface PersistedPreferences {
  difficulty: Difficulty;
  teaching: boolean;
}

const DEFAULT_PREFERENCES: PersistedPreferences = {
  difficulty: 'beginner',
  teaching: true,
};

export function loadPreferences(storage = getBrowserStorage()): PersistedPreferences {
  if (!storage) {
    return DEFAULT_PREFERENCES;
  }

  const parsed = readJson(storage, PREFERENCES_KEY);

  if (!isPersistedPreferences(parsed)) {
    return DEFAULT_PREFERENCES;
  }

  return {
    difficulty: parsed.difficulty,
    teaching: parsed.teaching,
  };
}

export function savePreferences(storage: Storage | undefined = getBrowserStorage(), prefs: PersistedPreferences): void {
  if (!storage) {
    return;
  }

  storage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
}

export function loadSavedState(storage = getBrowserStorage()): GameState | undefined {
  if (!storage) {
    return undefined;
  }

  const parsed = readJson(storage, STATE_KEY);
  return isGameState(parsed) ? parsed : undefined;
}

export function saveState(storage: Storage | undefined = getBrowserStorage(), state: GameState): void {
  if (!storage) {
    return;
  }

  storage.setItem(STATE_KEY, JSON.stringify(state));
}

function getBrowserStorage(): Storage | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}

function readJson(storage: Storage, key: string): unknown {
  const raw = storage.getItem(key);

  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

function isPersistedPreferences(value: unknown): value is PersistedPreferences {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as PersistedPreferences;
  return ['beginner', 'normal', 'advanced'].includes(candidate.difficulty) && typeof candidate.teaching === 'boolean';
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as GameState;
  return (
    candidate.board !== null &&
    typeof candidate.board === 'object' &&
    (candidate.turn === 'red' || candidate.turn === 'black') &&
    Array.isArray(candidate.history) &&
    Boolean(candidate.outcome)
  );
}
