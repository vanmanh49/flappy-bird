# Flappy Bird

A Flappy Bird clone built with React 19 and Vite 8. The playfield is drawn on a canvas and the HUD (score, "Get ready", game-over panel) is rendered by React on top of it.

## Play

Press **Space** or **Arrow Up**, click, or tap to flap. Fly through the gaps between the pipes; each pipe you pass scores a point. Hitting a pipe or the ground ends the run, and after a short pause the next flap starts a new one.

Your best score is saved in the browser (`localStorage` key `flappy-best`). The game follows your system theme: day in light mode, night in dark mode. With reduced motion enabled, the idle screen stays still.

## Getting started

Requires Node.js and npm.

```sh
npm install
npm run dev       # dev server at http://localhost:5173
```

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                     |
| `npm run build`   | Build for production into `dist/`             |
| `npm run preview` | Serve the built `dist/`                       |
| `npm test`        | Run the game-rule tests with Node's `node --test` |

## Project structure

```
src/
  game.js       Game rules as plain functions (newGame, flap, step, hits); no React, no DOM
  game.test.js  Tests for the rules, run under plain Node
  draw.js       Paints a game state onto the canvas, using colours from CSS custom properties
  useGame.js    React hook: runs the animation loop, handles keyboard input and the best score
  App.jsx       Layout, input on the stage, and scaling the playfield to fit the screen
  Hud.jsx       Score, "Get ready" and game-over panel
  styles.css    Layout, HUD styles and the light/dark colour tokens
  main.jsx      Entry point
```

The game runs on a fixed 360 x 540 logical playfield with physics advanced in fixed time steps, so it plays the same at any screen size or frame rate. See [`CLAUDE.md`](CLAUDE.md) for more on the architecture and the constants that must change together.
