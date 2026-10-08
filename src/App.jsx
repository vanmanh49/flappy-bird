import { useEffect, useRef, useState } from 'react';
import Hud from './Hud.jsx';
import { H, W } from './game.js';
import { useGame } from './useGame.js';

export default function App() {
  const stage = useRef(null);
  const canvas = useRef(null);
  const [s, setS] = useState(1); // CSS px per playfield px
  const [hud, flap] = useGame(canvas);

  useEffect(() => {
    const el = stage.current;
    const fit = new ResizeObserver(() => setS(Math.min(el.clientWidth / W, el.clientHeight / H)));
    fit.observe(el);
    return () => fit.disconnect();
  }, []);

  const px = s * (window.devicePixelRatio || 1); // canvas buffer px per playfield px

  return (
    <main className="app" style={{ '--s': s, '--w': `${W * s}px` }}>
      <header className="bar">
        <h1>Flappy Bird</h1>
        <p className="best">
          Best <output>{hud.best}</output>
        </p>
      </header>
      <div className="stage" ref={stage} onPointerDown={(e) => e.button === 0 && flap()}>
        <div className="field">
          <canvas
            ref={canvas}
            width={Math.round(W * px)}
            height={Math.round(H * px)}
            role="img"
            aria-label="Flappy Bird playfield"
          />
          <Hud {...hud} />
        </div>
      </div>
      <p className="hint">Space, click or tap to flap</p>
    </main>
  );
}
