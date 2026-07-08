import { Lightbulb, RotateCcw, Settings2, Sparkles, Undo2 } from 'lucide-react';

import { DIFFICULTY_LABELS } from '../game/ai';
import type { Difficulty } from '../game/types';

interface ControlsProps {
  difficulty: Difficulty;
  teaching: boolean;
  canUndo: boolean;
  thinking: boolean;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onTeachingChange: (enabled: boolean) => void;
  onNewGame: () => void;
  onUndo: () => void;
  onHint: () => void;
}

export function Controls({
  difficulty,
  teaching,
  canUndo,
  thinking,
  onDifficultyChange,
  onTeachingChange,
  onNewGame,
  onUndo,
  onHint,
}: ControlsProps) {
  return (
    <section className="control-panel" aria-label="游戏控制">
      <label className="field-label">
        <Settings2 aria-hidden="true" size={18} />
        难度
        <select
          value={difficulty}
          disabled={thinking}
          onChange={(event) => onDifficultyChange(event.target.value as Difficulty)}
        >
          {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <button className="toggle-row" type="button" aria-pressed={teaching} onClick={() => onTeachingChange(!teaching)}>
        <Sparkles aria-hidden="true" size={18} />
        教学提示
        <span className={teaching ? 'switch on' : 'switch'} />
      </button>

      <div className="button-row">
        <button type="button" onClick={onNewGame} disabled={thinking}>
          <RotateCcw aria-hidden="true" size={18} />
          新局
        </button>
        <button className="secondary-action" type="button" onClick={onUndo} disabled={!canUndo || thinking}>
          <Undo2 aria-hidden="true" size={18} />
          悔棋
        </button>
        <button type="button" onClick={onHint} disabled={thinking}>
          <Lightbulb aria-hidden="true" size={18} />
          提示
        </button>
      </div>
    </section>
  );
}
