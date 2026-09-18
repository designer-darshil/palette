import React, { useState, useEffect } from 'react';
import { Eye, RefreshCw, Trophy, Flame } from 'lucide-react';
import { RouteType } from '../types';
import { generateOddOneOutRound, OddOneOutRound } from '../utils/gameEngines';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface OddOneOutGamePageProps {
  onNavigate: (route: RouteType) => void;
}

export const OddOneOutGamePage: React.FC<OddOneOutGamePageProps> = ({ onNavigate }) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState<OddOneOutRound>(() => generateOddOneOutRound(1));
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('kroma_oddoneout_highscore') || '0');
    } catch {
      return 0;
    }
  });

  const handleTileClick = (index: number) => {
    if (index === round.oddIndex) {
      // Correct
      const nextLevel = level + 1;
      const nextScore = score + 10 * level;
      setLevel(nextLevel);
      setScore(nextScore);
      if (nextScore > highScore) {
        setHighScore(nextScore);
        try {
          localStorage.setItem('kroma_oddoneout_highscore', String(nextScore));
        } catch {}
      }
      setRound(generateOddOneOutRound(nextLevel));
    } else {
      // Wrong click
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setLevel(1);
    setScore(0);
    setGameOver(false);
    setRound(generateOddOneOutRound(1));
  };

  const gridCols = round.gridSize === 9 ? 'grid-cols-3' : round.gridSize === 16 ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <div className="detail-container w-full max-w-xl mx-auto flex flex-col gap-6">
      <SEOHead
        title="Odd One Out — Perceptual Color Acuity Game"
        description="Spot the subtly altered color tile in the grid before your streak ends. Test your optical acuity."
        canonicalPath="/play/odd-one-out"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Play', to: { path: 'play' } },
          { label: 'Odd One Out', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Header & Score Bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Odd One Out
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Level {level} • ΔE ~ {round.difficultyDelta}%
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Flame size={14} />
            <span>Score: {score}</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
            <Trophy size={14} />
            <span>Best: {highScore}</span>
          </div>
        </div>
      </div>

      {/* Game Grid */}
      {!gameOver ? (
        <div className={`grid ${gridCols} gap-2.5 p-4 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg aspect-square`}>
          {Array.from({ length: round.gridSize }).map((_, idx) => {
            const isOdd = idx === round.oddIndex;
            const color = isOdd ? round.oddColor : round.baseColor;
            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                className="w-full h-full rounded-sm transition-transform active:scale-95 shadow-inner"
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-8 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-md text-center flex flex-col items-center gap-4">
          <Trophy size={36} className="text-amber-400" />
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Game Over!
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            You reached <strong>Level {level}</strong> with a final score of <strong>{score}</strong>.
          </p>
          <button onClick={handleRestart} className="btn-primary text-xs px-6 py-2.5">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
