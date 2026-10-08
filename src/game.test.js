import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DT, GAP, flap, hits, newGame, step } from './game.js';

test('circle/rect collision', () => {
  assert.ok(hits(0, 0, 5, 3, -1, 10, 2));
  assert.ok(!hits(0, 0, 5, 6, -1, 10, 2));
});

test('a run scores through the gaps and ends when the bird drops', (t) => {
  t.mock.method(Math, 'random', () => 0.5); // every gap at the same height
  const g = newGame(0);
  flap(g);
  // autopilot: flap whenever the bird sinks below the middle of the gap
  for (let i = 0; i < 20 / DT && g.phase === 'play'; i++) {
    if (g.y > g.pipes[0].top + GAP / 2 + 22 && g.vy >= 0) flap(g);
    step(g, DT);
  }
  assert.equal(g.phase, 'play');
  assert.equal(g.score, 13); // first pipe passes at 2.8s, then one every 1.33s

  for (let i = 0; i < 5 / DT && g.phase === 'play'; i++) step(g, DT);
  assert.equal(g.phase, 'dead');
  assert.equal(g.best, g.score);
  assert.ok(g.newBest);

  flap(g); // still inside the restart lockout
  assert.equal(g.phase, 'dead');
});

test('flying into a pipe ends the run', (t) => {
  t.mock.method(Math, 'random', () => 0.5);
  const g = newGame(0);
  for (let i = 0; i < 5 / DT && g.phase !== 'dead'; i++) {
    flap(g); // pinned to the ceiling, above the gap
    step(g, DT);
  }
  assert.equal(g.phase, 'dead');
  assert.equal(g.score, 0);
});
