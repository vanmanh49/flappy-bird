// Game rules: plain functions over one mutable state object. No React, no DOM.

export const W = 360, H = 540, GROUND = 470; // logical playfield, px
export const BIRD_X = 100, R = 13;
export const PIPE_W = 58, GAP = 140;
export const DT = 1 / 120; // fixed physics step, s

const HIT_R = 11; // hitbox is a little smaller than the drawn bird
const GRAVITY = 1500, FLAP = -430, MAX_FALL = 700, SPEED = 150; // px/s
const SPACING = 200;
const RESTART_LOCK = 500; // ms after a crash before a flap restarts; styles.css delays the prompt to match

const newPipe = (x) => ({ x, top: 50 + Math.random() * (GROUND - GAP - 100), passed: false });

const reset = (g) =>
  Object.assign(g, { phase: 'ready', y: H * 0.42, vy: 0, pipes: [], score: 0, newBest: false });

export const newGame = (best) => reset({ best, t: 0, scroll: 0 });

// circle vs axis-aligned rect
export function hits(cx, cy, r, x, y, w, h) {
  const dx = cx - Math.max(x, Math.min(cx, x + w));
  const dy = cy - Math.max(y, Math.min(cy, y + h));
  return dx * dx + dy * dy < r * r;
}

export function flap(g) {
  if (g.phase === 'dead') {
    if (performance.now() - g.deadAt > RESTART_LOCK) reset(g);
    return;
  }
  if (g.phase === 'ready') {
    g.phase = 'play';
    g.pipes = [newPipe(W + 100)];
  }
  g.vy = FLAP;
}

function die(g) {
  g.phase = 'dead';
  g.deadAt = performance.now();
  if (g.score > g.best) {
    g.best = g.score;
    g.newBest = true;
  }
}

// `calm` (reduced motion) keeps the idle screen still.
export function step(g, dt, calm = false) {
  g.t += dt;
  if (g.phase === 'ready') {
    if (!calm) {
      g.y = H * 0.42 + Math.sin(g.t * 5) * 6;
      g.scroll += SPEED * dt;
    }
    return;
  }

  g.vy = Math.min(g.vy + GRAVITY * dt, MAX_FALL);
  g.y += g.vy * dt;
  if (g.y < R) {
    g.y = R;
    g.vy = 0;
  }

  if (g.phase === 'play') {
    g.scroll += SPEED * dt;
    for (const p of g.pipes) {
      p.x -= SPEED * dt;
      if (!p.passed && p.x + PIPE_W < BIRD_X) {
        p.passed = true;
        g.score++;
      }
    }
    if (g.pipes[0].x < -PIPE_W - 8) g.pipes.shift();
    const last = g.pipes[g.pipes.length - 1];
    if (last.x <= W - SPACING) g.pipes.push(newPipe(last.x + SPACING));

    const hitsPipe = (p) =>
      hits(BIRD_X, g.y, HIT_R, p.x, -H, PIPE_W, H + p.top) ||
      hits(BIRD_X, g.y, HIT_R, p.x, p.top + GAP, PIPE_W, H);
    if (g.y + R >= GROUND || g.pipes.some(hitsPipe)) die(g);
  }

  if (g.y + R >= GROUND) {
    g.y = GROUND - R;
    g.vy = 0;
  }
}
