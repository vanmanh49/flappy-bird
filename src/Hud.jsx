export default function Hud({ phase, score, best, newBest }) {
  if (phase === 'play') {
    return (
      <div className="hud">
        <p className="score">{score}</p>
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <div className="hud">
        <p className="title">Get ready</p>
        <p className="prompt">Tap or press Space</p>
      </div>
    );
  }

  return (
    <div className="hud">
      <p className="title">Game over</p>
      <dl className="panel">
        <div>
          <dt>Score</dt>
          <dd>{score}</dd>
        </div>
        <div>
          <dt>{newBest ? 'New best' : 'Best'}</dt>
          <dd>{best}</dd>
        </div>
      </dl>
      <p className="prompt late">Tap or press Space</p>
    </div>
  );
}
