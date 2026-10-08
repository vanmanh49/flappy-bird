# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: Vite dev server, http://localhost:5173 by default
- `npm run build`: production build into `dist/`
- `npm run preview`: serve the built `dist/`
- `npm test`: game-rule tests on Node's built-in runner (`node --test`); there is no test framework
- One test by name: `node --test --test-name-pattern="flying into a pipe"`
- One test file: `node --test src/game.test.js`

JavaScript and JSX, ES modules, React 19, Vite 8. No linter or type checker is configured.

## Architecture

A Flappy Bird clone. The canvas draws the world and React draws the HUD on top of it. The split that matters is which side owns what:

- `src/game.js` holds the rules as plain functions (`newGame`, `flap`, `step`, `hits`) over one mutable state object. It imports no React and touches no DOM, which is why its tests run under plain Node. Physics advance in fixed `DT` steps, and every coordinate is a logical playfield pixel (`W` x `H`, 360 x 540), independent of screen size.
- `src/draw.js` paints a game state onto a 2D context. It hard-codes no colours: `readColors()` reads the CSS custom properties defined in `src/styles.css`, so the light theme is day and the dark theme is night.
- `src/useGame.js` is the bridge. It keeps the game object in a ref, mutates it every animation frame, and mirrors only `{ phase, score, best, newBest }` into React state, and only when phase or score changes. Per-frame values must stay out of React state. It also owns keyboard input and best-score persistence (`localStorage` key `flappy-best`).
- `src/App.jsx` owns layout and scaling. A ResizeObserver computes `s` (CSS px per playfield px) and exposes it as `--s` and `--w`; `styles.css` derives `--u` (one playfield px) from it, so HUD positions and font sizes are written in the same logical coordinates as the canvas.
- `src/Hud.jsx` renders the score, "Get ready" and game-over panel as DOM, one branch per `phase` (`ready`, `play`, `dead`).

## Values that must change together

- A new canvas colour needs a token in both `:root` blocks of `styles.css` and a key in `COLORS` in `draw.js`.
- `RESTART_LOCK` in `game.js` (500 ms) and the `.prompt.late` animation duration in `styles.css` must stay equal.
- `game.test.js` pins `Math.random` to 0.5 and asserts an exact score of 13, which follows from `SPEED`, `SPACING` and the first pipe's start position in `game.js`. Changing those constants means updating that assertion.
