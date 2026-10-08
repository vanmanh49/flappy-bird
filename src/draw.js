import { BIRD_X, GAP, GROUND, H, PIPE_W, R, W } from './game.js';

// CSS tokens the canvas paints with (styles.css), as camelCase keys
const COLORS = ['skyTop', 'skyBottom', 'orb', 'cloud', 'hill', 'pipe', 'pipeLight', 'pipeDark', 'ground',
  'groundDark', 'grass', 'bird', 'wing', 'beak', 'eye', 'outline'];

export function readColors(into = {}) {
  const css = getComputedStyle(document.documentElement);
  for (const k of COLORS) {
    into[k] = css.getPropertyValue('--' + k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())).trim();
  }
  return into;
}

export function draw(ctx, g, c) {
  const k = ctx.canvas.width / W;
  ctx.setTransform(k, 0, 0, k, 0, 0);

  const circle = (x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
  };
  const pipe = (x, y, len, capAtBottom) => {
    ctx.fillStyle = c.pipe;
    ctx.fillRect(x, y, PIPE_W, len);
    ctx.fillStyle = c.pipeLight;
    ctx.fillRect(x + 6, y, 8, len);
    ctx.fillStyle = c.pipeDark;
    ctx.fillRect(x + PIPE_W - 10, y, 10, len);
    const cy = capAtBottom ? y + len - 22 : y;
    ctx.fillRect(x - 4, cy, PIPE_W + 8, 22);
    ctx.fillStyle = c.pipe;
    ctx.fillRect(x - 1, cy + 3, PIPE_W + 2, 16);
    ctx.fillStyle = c.pipeLight;
    ctx.fillRect(x + 5, cy + 3, 8, 16);
  };

  // sky, sun or moon
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, c.skyTop);
  sky.addColorStop(1, c.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND);
  ctx.fillStyle = c.orb;
  circle(285, 92, 26);

  // clouds and hills drift slower than the pipes
  ctx.fillStyle = c.cloud;
  for (const [bx, by] of [[40, 90], [190, 200], [330, 135]]) {
    const x = (((bx - g.scroll * 0.15) % (W + 120)) + W + 120) % (W + 120) - 80;
    circle(x, by, 16);
    circle(x + 20, by - 9, 21);
    circle(x + 44, by, 16);
    ctx.fillRect(x, by, 44, 16);
  }
  ctx.fillStyle = c.hill;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  for (let x = 0; x <= W; x += 6) {
    const u = x + g.scroll * 0.3;
    ctx.lineTo(x, GROUND - 42 - 18 * Math.sin(u / 45) - 7 * Math.sin(u / 17));
  }
  ctx.lineTo(W, GROUND);
  ctx.fill();

  for (const p of g.pipes) {
    pipe(p.x, 0, p.top, true);
    pipe(p.x, p.top + GAP, GROUND - p.top - GAP, false);
  }

  // ground
  ctx.fillStyle = c.ground;
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = c.grass;
  ctx.fillRect(0, GROUND, W, 12);
  ctx.fillStyle = c.groundDark;
  ctx.fillRect(0, GROUND + 12, W, 3);
  ctx.globalAlpha = 0.35;
  for (let x = -(g.scroll % 24) - 8; x < W; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x + 8, GROUND);
    ctx.lineTo(x + 18, GROUND);
    ctx.lineTo(x + 10, GROUND + 12);
    ctx.lineTo(x, GROUND + 12);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // bird, tilted by its vertical speed
  ctx.save();
  ctx.translate(BIRD_X, g.y);
  ctx.rotate(Math.max(-0.5, Math.min(1.4, g.vy / 500)));
  ctx.strokeStyle = c.outline;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.fillStyle = c.bird;
  ctx.beginPath();
  ctx.ellipse(0, 0, R + 3, R, 0, 0, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = c.wing;
  ctx.beginPath();
  ctx.ellipse(-5, 2 + (g.phase === 'dead' ? 0 : Math.sin(g.t * 22) * 3), 8, 5, 0, 0, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = c.beak;
  ctx.beginPath();
  ctx.moveTo(12, -2);
  ctx.lineTo(23, 2);
  ctx.lineTo(12, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = c.eye;
  circle(7, -5, 5);
  ctx.stroke();
  ctx.fillStyle = c.outline;
  circle(8.5, -5, 2);
  ctx.restore();
}
