import { useEffect, useMemo, useRef, useState } from 'react';

import { chooseAiMove, chooseHintMove } from './game/ai';
import { getAiThinkingDelay, getBoardNoticeText } from './game/boardNotice';
import { applyMove, getMoveLabel, undoLastTurn } from './game/engine';
import {
  getNextSelection,
  getSelectionHintText,
  getSelectionNudgeKey,
  getSelectionStatusText,
  shouldNudgeSelection,
} from './game/interaction';
import { getLegalMovesForPiece } from './game/rules';
import { createInitialState, getPieceAt } from './game/setup';
import type { Difficulty, GameState, Move, Position } from './game/types';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { StatusPanel } from './components/StatusPanel';
import { loadPreferences, loadSavedState, savePreferences, saveState } from './storage/preferences';

export default function App() {
  const [preferences, setPreferences] = useState(() => loadPreferences());
  const [state, setState] = useState<GameState>(() => loadSavedState() ?? createInitialState());
  const [selected, setSelected] = useState<Position>();
  const [message, setMessage] = useState('红方先走。');
  const [hint, setHint] = useState<Move>();
  const [lastMove, setLastMove] = useState<Move>();
  const [selectionNudgeKey, setSelectionNudgeKey] = useState<string>();
  const [boardNotice, setBoardNotice] = useState(() => getBoardNoticeText({ kind: 'red-turn' }));
  const [moveAnimation, setMoveAnimation] = useState<{
    id: number;
    move: Move;
    piece: Move['piece'];
    emphasis: 'player' | 'ai';
  }>();
  const [thinking, setThinking] = useState(false);
  const animationSequenceRef = useRef(0);
  const animationTimerRef = useRef<number>();
  const nudgeTimerRef = useRef<number>();
  const nudgeSequenceRef = useRef(0);

  const legalMoves = useMemo(() => {
    if (!selected || thinking || state.turn !== 'red') {
      return [];
    }

    return getLegalMovesForPiece(state, selected);
  }, [selected, state, thinking]);
  const legalTargets = useMemo(() => legalMoves.map((move) => move.to), [legalMoves]);
  const selectionText = selected ? getSelectionHintText(legalMoves) : undefined;

  useEffect(() => {
    savePreferences(localStorage, preferences);
  }, [preferences]);

  useEffect(() => {
    saveState(localStorage, state);
  }, [state]);

  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        window.clearTimeout(animationTimerRef.current);
      }
      if (nudgeTimerRef.current) {
        window.clearTimeout(nudgeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (state.turn !== 'black' || state.outcome.status === 'finished') {
      return;
    }

    setThinking(true);
    setMessage('黑方想一想...');
    setBoardNotice(getBoardNoticeText({ kind: 'ai-thinking' }));
    const timer = window.setTimeout(() => {
      try {
        const aiMove = chooseAiMove(state, preferences.difficulty);

        if (!aiMove) {
          setMessage('黑方没有可走的棋。');
          return;
        }

        const nextState = applyMove(state, aiMove);
        setState(nextState);
        setHint(undefined);
        setSelected(undefined);
        setLastMove(aiMove);
        showMoveAnimation(aiMove, 'ai');
        const moveLabel = getMoveLabel(state, aiMove);
        const notice = getBoardNoticeText({ kind: 'ai-moved', moveLabel });
        setBoardNotice(notice);
        setMessage(notice ?? `黑方走了：${moveLabel}`);
      } catch {
        setBoardNotice(undefined);
        setMessage('黑方这一步计算失败，请悔棋或新开一局。');
      } finally {
        setThinking(false);
      }
    }, getAiThinkingDelay(preferences.difficulty));

    return () => window.clearTimeout(timer);
  }, [preferences.difficulty, state]);

  function handlePointClick(position: Position) {
    if (thinking || state.turn !== 'red' || state.outcome.status === 'finished') {
      return;
    }

    const piece = getPieceAt(state.board, position);
    const nextSelection = getNextSelection(selected, position, piece?.side, 'red');

    if (piece?.side === 'red') {
      setSelected(nextSelection);
      setHint(undefined);
      setBoardNotice(undefined);
      setMessage(nextSelection ? getSelectionStatusText(getLegalMovesForPiece(state, nextSelection)) : '已取消选择。');
      return;
    }

    if (!selected) {
      setMessage('先点一枚红方棋子。');
      return;
    }

    try {
      const nextState = applyMove(state, { from: selected, to: position });
      const playerMove = nextState.history[nextState.history.length - 1]?.move;
      setState(nextState);
      setLastMove(playerMove);
      setBoardNotice(undefined);
      if (playerMove) {
        showMoveAnimation(playerMove, 'player');
      }
      setMessage(`红方走了：${getMoveLabel(state, { from: selected, to: position })}`);
      setSelected(undefined);
      setHint(undefined);
    } catch {
      if (shouldNudgeSelection(selected, piece?.side, 'red')) {
        showSelectionNudge(selected);
      }
      setMessage('这一步走不到那里，当前棋子还选着，可以继续点其它落点。');
    }
  }

  function handleDifficultyChange(difficulty: Difficulty) {
    setPreferences((current) => ({ ...current, difficulty }));
    setMessage('难度已切换，当前对局会继续。');
  }

  function handleTeachingChange(teaching: boolean) {
    setPreferences((current) => ({ ...current, teaching }));
  }

  function handleNewGame() {
    setState(createInitialState());
    setSelected(undefined);
    setHint(undefined);
    setLastMove(undefined);
    setMoveAnimation(undefined);
    setSelectionNudgeKey(undefined);
    const notice = getBoardNoticeText({ kind: 'red-turn' });
    setBoardNotice(notice);
    setMessage('新的一局开始，红方先走。');
  }

  function handleUndo() {
    const undone = undoLastTurn(state);
    setState(undone);
    setSelected(undefined);
    setHint(undefined);
    setLastMove(undefined);
    setMoveAnimation(undefined);
    setSelectionNudgeKey(undefined);
    setBoardNotice(getBoardNoticeText({ kind: 'undo-red-turn' }));
    setMessage('已经悔棋，轮到红方重新走。');
  }

  function handleHint() {
    if (thinking || state.outcome.status === 'finished') {
      return;
    }

    const nextHint = chooseHintMove(state, preferences.difficulty);

    if (!nextHint) {
      setMessage('当前没有可提示的走法。');
      return;
    }

    setHint(nextHint);
    setSelected(nextHint.from);
    const moveLabel = getMoveLabel(state, nextHint);
    const notice = getBoardNoticeText({ kind: 'hint', moveLabel });
    setBoardNotice(notice);
    setMessage(notice ?? `提示：${moveLabel}`);
  }

  function showMoveAnimation(move: Move, emphasis: 'player' | 'ai') {
    if (animationTimerRef.current) {
      window.clearTimeout(animationTimerRef.current);
    }

    const id = animationSequenceRef.current + 1;
    animationSequenceRef.current = id;
    setMoveAnimation({
      id,
      move,
      piece: move.piece,
      emphasis,
    });

    const duration = emphasis === 'ai' ? 2100 : 1700;
    animationTimerRef.current = window.setTimeout(() => {
      setMoveAnimation((current) => (current?.id === id ? undefined : current));
      animationTimerRef.current = undefined;
    }, duration);
  }

  function showSelectionNudge(position: Position) {
    if (nudgeTimerRef.current) {
      window.clearTimeout(nudgeTimerRef.current);
    }

    nudgeSequenceRef.current += 1;
    const key = getSelectionNudgeKey(position, nudgeSequenceRef.current);
    setSelectionNudgeKey(key);
    nudgeTimerRef.current = window.setTimeout(() => {
      setSelectionNudgeKey((current) => (current === key ? undefined : current));
      nudgeTimerRef.current = undefined;
    }, 560);
  }

  return (
    <main className="app-shell">
      <section className="game-area">
        <header className="app-header">
          <div>
            <p className="eyebrow">离线可玩的 iPad 象棋</p>
            <h1>小象棋</h1>
          </div>
        </header>

        <Board
          board={state.board}
          selected={selected}
          legalTargets={legalTargets}
          hint={hint}
          lastMove={lastMove}
          nudgeKey={selectionNudgeKey}
          moveAnimation={moveAnimation}
          notice={boardNotice}
          selectionText={selectionText}
          disabled={thinking}
          onPointClick={handlePointClick}
        />
      </section>

      <aside className="side-panel">
        <StatusPanel
          state={state}
          difficulty={preferences.difficulty}
          teaching={preferences.teaching}
          thinking={thinking}
          message={message}
          hint={hint}
        />
        <Controls
          difficulty={preferences.difficulty}
          teaching={preferences.teaching}
          canUndo={state.history.length > 0}
          thinking={thinking}
          onDifficultyChange={handleDifficultyChange}
          onTeachingChange={handleTeachingChange}
          onNewGame={handleNewGame}
          onUndo={handleUndo}
          onHint={handleHint}
        />
      </aside>
    </main>
  );
}
