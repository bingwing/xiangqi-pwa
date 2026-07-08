# Xiangqi Interaction Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make move feedback and board interaction feel clear enough for children, especially showing where the AI moved from and to.

**Architecture:** Keep game rules and AI unchanged. Add lightweight UI state in `App.tsx`, board animation props in `Board.tsx`, focused CSS animation in `App.css`, and a tiny pure interaction helper with tests for selection behavior.

**Tech Stack:** React 18, TypeScript, Vite 5, Vitest 1, plain CSS.

## Global Constraints

- Do not call any external AI or backend service.
- Do not change Xiangqi move legality rules.
- Preserve click-to-select/click-to-move as the primary iPad interaction.
- AI move animation must visibly indicate both origin and destination.
- Keep the first screen playable; no landing or tutorial screen.

---

## Task 1: Selection Interaction Helper

**Files:**
- Create: `src/game/interaction.ts`
- Test: `src/game/interaction.test.ts`

**Interfaces:**
- Produces `getNextSelection(current, clicked, clickedPieceSide, playerSide): Position | undefined`.

- [ ] Add tests for select, cancel same piece, switch own piece, keep selection on target/empty click.
- [ ] Implement helper.
- [ ] Run `npm test -- --run src/game/interaction.test.ts`.

## Task 2: App Interaction State

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes `getNextSelection`.
- Produces `moveAnimation` prop for `Board`.

- [ ] Use helper in `handlePointClick`.
- [ ] Add `moveAnimation` state and trigger it after player and AI moves.
- [ ] Update user messages to short action-oriented text.

## Task 3: Board Move Animation

**Files:**
- Modify: `src/components/Board.tsx`
- Modify: `src/App.css`

**Interfaces:**
- `Board` accepts `moveAnimation?: MoveAnimation`.

- [ ] Add board coordinate CSS variables for pieces and animation overlay.
- [ ] Render animated ghost piece and move trail for the latest move.
- [ ] Make AI animation more visually prominent than normal last-move highlight.
- [ ] Keep existing hint, selected and legal target states readable.

## Task 4: Verification

**Files:**
- Modify: `README.md` if usage notes need updating.

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Run local preview on a clean port and verify a red move followed by an AI move shows an origin-to-destination animation.
- [ ] Verify iPad portrait and landscape dimensions for no horizontal overflow.
