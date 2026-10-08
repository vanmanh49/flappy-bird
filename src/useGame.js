import { useEffect, useRef, useState } from 'react';
import { draw, readColors } from './draw.js';
import { DT, flap, newGame, step } from './game.js';

const BEST_KEY = 'flappy-best';

function readBest() {
  try {
    return +localStorage.getItem(BEST_KEY) || 0;
  } catch {
    return 0;
  }
}

const snapshot = (g) => ({ phase: g.phase, score: g.score, best: g.best, newBest: g.newBest });

// Runs the game on the canvas. The game lives in a ref and mutates every frame;
// `hud` is a state mirror that updates only when what the HUD shows has changed.
export function useGame(canvasRef) {
  const game = useRef(null);
  if (game.current === null) game.current = newGame(readBest());
  const [hud, setHud] = useState(() => snapshot(game.current));

  useEffect(() => {
    const g = game.current;
    const ctx = canvasRef.current.getContext('2d');
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dark = matchMedia('(prefers-color-scheme: dark)');
    const colors = readColors();
    const onTheme = () => readColors(colors);
    dark.addEventListener('change', onTheme);

    const onKey = (e) => {
      if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
      e.preventDefault();
      if (!e.repeat) flap(g);
    };
    addEventListener('keydown', onKey);

    let raf;
    let prev = performance.now();
    let acc = 0;
    let shown = g.phase + g.score;
    const frame = (now) => {
      acc += Math.min((now - prev) / 1000, 0.1);
      prev = now;
      while (acc >= DT) {
        step(g, DT, calm);
        acc -= DT;
      }
      draw(ctx, g, colors);
      const key = g.phase + g.score;
      if (key !== shown) {
        shown = key;
        setHud(snapshot(g));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('keydown', onKey);
      dark.removeEventListener('change', onTheme);
    };
  }, [canvasRef]);

  useEffect(() => {
    try {
      localStorage.setItem(BEST_KEY, hud.best);
    } catch {}
  }, [hud.best]);

  return [hud, () => flap(game.current)];
}
