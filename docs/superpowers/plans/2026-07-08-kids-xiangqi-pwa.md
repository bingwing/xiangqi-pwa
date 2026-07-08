# Kids Xiangqi PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static offline-capable iPad PWA for children to play Xiangqi against a local AI with three difficulty levels.

**Architecture:** A React + TypeScript Vite app owns UI, state, PWA caching, and local persistence. A small internal Xiangqi engine owns board representation, legal move generation, check/checkmate detection, move application, undo history, and AI move selection. Tests focus on game rules, AI legality, and persistence fallbacks.

**Tech Stack:** React 18, TypeScript, Vite 5, Vitest 1, vite-plugin-pwa 0.21, lucide-react, plain CSS.

## Global Constraints

- Build as an independent project directory at `/Users/bingwang/src/github.com/bingwing/kids-xiangqi-pwa`.
- First version is local human-vs-AI only; no backend, account, LAN deployment, online play, leaderboard, opening book, or puzzle mode.
- The app must be deployable as static HTTPS assets and usable offline after PWA installation.
- Player defaults to red and moves first; AI plays black.
- Three difficulty levels are required: 入门, 初级, 进阶.
- Teaching hints must be enabled by default and user-toggleable.
- AI and hint moves must always come from legal moves.
- Use TDD for rules, AI, engine history, and storage modules.
- Keep UI iPad friendly: first screen is the playable board, no marketing landing page.

---

## File Structure

- `package.json`: npm scripts and dependencies.
- `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`: TypeScript and Vite/PWA config.
- `index.html`: app shell.
- `public/manifest.webmanifest`: PWA metadata.
- `public/icons/*.svg`: install icons generated from simple vector assets.
- `src/main.tsx`: React bootstrap.
- `src/App.tsx`: top-level game orchestration.
- `src/App.css`: responsive iPad-first layout and theme.
- `src/game/types.ts`: domain types.
- `src/game/setup.ts`: initial board creation.
- `src/game/rules.ts`: legal moves and game status.
- `src/game/engine.ts`: applying moves, undo, summaries.
- `src/game/ai.ts`: difficulty configs and AI selection.
- `src/storage/preferences.ts`: localStorage persistence.
- `src/components/Board.tsx`: board rendering and move interaction.
- `src/components/Controls.tsx`: controls.
- `src/components/StatusPanel.tsx`: status and teaching hints.
- `src/game/*.test.ts`, `src/storage/*.test.ts`: Vitest coverage.

## Task 1: Project Scaffold And Tooling

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`

**Interfaces:**
- Produces npm scripts: `npm run dev`, `npm test`, `npm run build`, `npm run preview`.

- [ ] Initialize package metadata and install dependencies.
- [ ] Add Vite, React, TypeScript, Vitest and PWA configuration.
- [ ] Verify `npm install` succeeds.
- [ ] Verify baseline `npm test -- --run` runs with no tests.

## Task 2: Domain Types And Initial Board

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/setup.ts`
- Test: `src/game/setup.test.ts`

**Interfaces:**
- Produces `createInitialState(): GameState`.
- Produces board helpers `positionKey(pos: Position): PositionKey`, `getPieceAt(board: BoardState, pos: Position): Piece | undefined`.

- [ ] Write failing tests for initial board piece counts and key starting positions.
- [ ] Implement domain types and initial board.
- [ ] Run `npm test -- --run src/game/setup.test.ts` and verify pass.

## Task 3: Legal Move Generation

**Files:**
- Create: `src/game/rules.ts`
- Test: `src/game/rules.test.ts`

**Interfaces:**
- Consumes `GameState`, `BoardState`, `Position`, `Move`, `Piece`.
- Produces `getPseudoLegalMovesForPiece(state, from): Move[]`.
- Produces `getLegalMovesForPiece(state, from): Move[]`.
- Produces `getAllLegalMoves(state, side): Move[]`.
- Produces `isInCheck(state, side): boolean`.
- Produces `getGameOutcome(state): GameOutcome`.

- [ ] Write failing tests for rook, horse, cannon, soldier, advisor, elephant and general moves.
- [ ] Write failing tests for horse leg, elephant eye, cannon screen, river crossing, palace limit and flying general.
- [ ] Write failing tests that a side cannot leave its own general in check.
- [ ] Implement move generation and check filtering.
- [ ] Run `npm test -- --run src/game/rules.test.ts`.

## Task 4: Engine State Transitions And Undo

**Files:**
- Create: `src/game/engine.ts`
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes legal moves from `rules.ts`.
- Produces `applyMove(state, move): GameState`.
- Produces `undoLastTurn(state): GameState`.
- Produces `getMoveLabel(state, move): string`.

- [ ] Write failing tests for applying legal moves, rejecting illegal moves, turn switching and captures.
- [ ] Write failing tests for undoing one player move plus one AI move.
- [ ] Implement transition and undo logic.
- [ ] Run `npm test -- --run src/game/engine.test.ts`.

## Task 5: AI Difficulty And Hint Selection

**Files:**
- Create: `src/game/ai.ts`
- Test: `src/game/ai.test.ts`

**Interfaces:**
- Consumes `getAllLegalMoves` and `applyMove`.
- Produces `chooseAiMove(state, difficulty): Move | undefined`.
- Produces `chooseHintMove(state, difficulty): Move | undefined`.
- Produces `DIFFICULTY_LABELS`.

- [ ] Write failing tests that each difficulty returns a legal move from initial state.
- [ ] Write failing tests that AI captures an exposed high-value piece in non-beginner modes.
- [ ] Implement evaluation, beginner randomization, shallow search and alpha-beta search.
- [ ] Run `npm test -- --run src/game/ai.test.ts`.

## Task 6: Persistence

**Files:**
- Create: `src/storage/preferences.ts`
- Test: `src/storage/preferences.test.ts`

**Interfaces:**
- Produces `loadPreferences(storage): PersistedPreferences`.
- Produces `savePreferences(storage, prefs): void`.
- Produces `loadSavedState(storage): GameState | undefined`.
- Produces `saveState(storage, state): void`.

- [ ] Write failing tests for defaults, successful round trip and malformed JSON fallback.
- [ ] Implement localStorage-safe persistence.
- [ ] Run `npm test -- --run src/storage/preferences.test.ts`.

## Task 7: UI Components

**Files:**
- Create: `src/components/Board.tsx`
- Create: `src/components/Controls.tsx`
- Create: `src/components/StatusPanel.tsx`
- Create: `src/App.tsx`
- Create: `src/App.css`

**Interfaces:**
- Consumes engine, rules, AI and storage modules.
- Produces a playable local game with board clicks, AI response, undo, hints, new game, difficulty selector and teaching toggle.

- [ ] Implement board rendering with stable 9x10 responsive geometry.
- [ ] Implement controls and status panel.
- [ ] Wire player move, AI move, undo, hint and persistence flows.
- [ ] Run `npm run build` and resolve TypeScript errors.

## Task 8: PWA Assets And Offline Verification

**Files:**
- Create: `public/icons/icon.svg`
- Create: `public/icons/maskable-icon.svg`
- Modify: `public/manifest.webmanifest`
- Modify: `vite.config.ts`
- Modify: `README.md`

**Interfaces:**
- Produces static `dist/` deployable to HTTPS static hosting.

- [ ] Add manifest metadata and icons.
- [ ] Configure service worker runtime/static caching with vite-plugin-pwa.
- [ ] Document local dev, build, preview, static hosting and iPad install flow.
- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Run local preview and verify in browser at iPad-sized viewport.
