# Color Linez

A complete browser puzzle built with React, TypeScript and Vite. No account, backend, external media, fonts or API keys are required. The game engine is independent of React so the rules can be reused in a future mobile or desktop client.

## Develop

Use Node.js 24 (see `.nvmrc`; minimum 22.12).

```sh
npm install
npm run dev
```

For a reproducible install from this checkout, use `npm ci`. Vite listens on all interfaces; its default port is 5173.

```sh
npm test            # deterministic engine tests
npm run test:watch  # interactive test runner
npm run build      # strict TypeScript check and production assets
npm run preview    # serve the production build
```

Deploy the generated `dist/` directory to a static web host. The current deployment assumes a domain root; configure Vite's `base` for a subdirectory deployment.

## How to play

Select a ball and then an empty destination. Balls travel horizontally and vertically through empty cells using a shortest BFS path. Connect five or more identical colors horizontally, vertically or diagonally to remove them. A matching move does not add balls; other moves add the three preview colors, then resolve any new lines. If fewer than three spaces are available, only those spaces are filled. Game over is evaluated after resolving all matches.

- Start with five random balls on a 9 × 9 board and seven colors.
- Default points per line: **5 → 10, 6 → 12, 7 → 18, 8 → 28, 9 → 42**.
- Each maximal qualifying line scores independently. A crossing of two five-ball lines scores 20 points and removes nine distinct balls. All matching lines clear simultaneously.
- `move(game, from, to, scoringTable)` accepts an alternative score table. Unspecified lengths use two points per ball.
- One-step undo restores the board, score, moves, preview and PRNG state, including after game over. Replaying the same move after undo produces the same result. The personal best is never reduced by undo.
- New game asks for confirmation when a game is in progress. It resets all gameplay state and retains preferences and personal best.

Use a mouse or touch, or focus the board and navigate with arrow keys. Enter or Space selects a ball or destination. Home and End navigate within a row. Dialogs support Escape and retain native keyboard focus containment.

## Settings and accessibility

Sound is enabled for new players and starts after a user gesture. Local Web Audio synthesis provides a selection tap, movement glide, spawning pops, matching chime, blocked-move cue and game-over melody. Enabling sound plays a short confirmation; muting stops active effects and remains saved across reloads. Previously saved mute preferences are preserved. The settings dialog controls sound, animation and dark/light appearance. The operating system's reduced-motion preference overrides enabled animations. Movement is locked during turn animations to keep state consistent. Balls use clean glossy colors without symbols, cells retain accessible color labels, and turn results are announced through a live region.

Preferences and personal best are stored locally under `linez.settings` and `linez.best`. Storage or audio failures do not prevent play. The current board is intentionally session-only; refreshing starts a new game.

## Architecture

- `src/engine/`: pure rules, BFS, line detection, configurable scoring and seeded Mulberry32 randomness. The seed is carried in each immutable game snapshot.
- `src/hooks/useGame.ts`: UI selection and animation sequencing around an atomic engine turn; one-step undo and reset.
- `src/audio/soundEffects.ts`: distinct synthesized effects with pitch sweeps and volume envelopes.
- `src/hooks/usePreferences.ts`, `useAudio.ts`: guarded local persistence, reduced-motion preference and synthesized effects.
- `src/components/`: accessible board, balls, icons and native modal dialogs.
- `src/styles/global.css`: responsive dark/light layout and reduced-motion-aware animations.
- `src/tests/engine.test.ts`: pathfinding, invalid movement, all line directions, intersections, scoring, spawn limits, spawn matches, game over, deterministic replay and undo.

The layout supports desktop, tablet and mobile browsers. A future native wrapper can reuse the React client with Capacitor or Tauri; no native packaging is included in this browser release.
