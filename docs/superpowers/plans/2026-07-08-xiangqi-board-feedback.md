# Xiangqi Board Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add on-board feedback so children can see AI thinking and AI move results without reading the side panel.

**Architecture:** Keep game rules and AI untouched. Add a pure helper for board notice text, thread notice state through `App.tsx`, render it in `Board.tsx`, and style it in `App.css`.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, plain CSS.

---

## Task 1: Board Notice Helper

**Files:**
- Create: `src/game/boardNotice.ts`
- Create: `src/game/boardNotice.test.ts`

- [ ] Add tests for AI thinking notice, AI move notice, and no notice.
- [ ] Implement `getBoardNoticeText`.
- [ ] Run `npm test -- --run src/game/boardNotice.test.ts`.

## Task 2: App Notice State

**Files:**
- Modify: `src/App.tsx`

- [ ] Add `boardNotice` state.
- [ ] Show thinking notice when AI starts thinking.
- [ ] Replace it with AI move notice after AI moves.
- [ ] Clear notice on new game, undo, player selection, player move, and hint.

## Task 3: Board Notice Rendering

**Files:**
- Modify: `src/components/Board.tsx`
- Modify: `src/App.css`

- [ ] Add `notice?: string` prop to `Board`.
- [ ] Render `.board-notice` inside `.board-grid`.
- [ ] Style notice as a non-interactive overlay with stable dimensions.

## Task 4: Verification

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Browser verify on current preview URL:
  - Red move triggers on-board thinking notice.
  - AI move leaves route/highlights and board notice.
  - iPad portrait and landscape have no horizontal overflow.
