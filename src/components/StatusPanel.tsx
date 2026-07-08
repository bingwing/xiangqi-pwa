import { getMoveLabel } from '../game/engine';
import type { Difficulty, GameOutcome, GameState, Move, Side } from '../game/types';

interface StatusPanelProps {
  state: GameState;
  difficulty: Difficulty;
  teaching: boolean;
  thinking: boolean;
  message: string;
  hint?: Move;
}

export function StatusPanel({ state, difficulty, teaching, thinking, message, hint }: StatusPanelProps) {
  const actionText = thinking ? 'AI 思考中' : turnText(state.turn);
  const actionClass = ['action-strip', state.turn, thinking ? 'thinking' : ''].filter(Boolean).join(' ');

  return (
    <section className="status-panel" aria-live="polite">
      <div className={actionClass}>
        <div>
          <span className="action-label">下一步</span>
          <strong>{actionText}</strong>
        </div>
        <span className="state-pill">{outcomeText(state.outcome)}</span>
      </div>
      <p className="status-message">{message}</p>
      {teaching ? <p className="teaching-message">{teachingText(difficulty, state, hint)}</p> : null}
    </section>
  );
}

function turnText(side: Side) {
  return side === 'red' ? '红方走棋' : '黑方走棋';
}

function outcomeText(outcome: GameOutcome) {
  if (outcome.status === 'playing') {
    return '对局进行中';
  }

  if (outcome.status === 'check') {
    return `${outcome.sideInCheck === 'red' ? '红方' : '黑方'}被将军`;
  }

  return `${outcome.winner === 'red' ? '红方' : '黑方'}获胜`;
}

function teachingText(difficulty: Difficulty, state: GameState, hint?: Move) {
  if (state.outcome.status === 'finished') {
    return '这一局结束了，可以新开一局再练一次。';
  }

  if (hint) {
    return `可以考虑：${getMoveLabel(state, hint)}。`;
  }

  if (difficulty === 'beginner') {
    return '点自己的棋子，会看到它能走到哪里。';
  }

  if (difficulty === 'normal') {
    return '先看有没有被攻击的棋，再找机会吃对方高价值棋子。';
  }

  return '进阶难度会多看一步，走棋前先想对方下一步可能怎么反击。';
}
