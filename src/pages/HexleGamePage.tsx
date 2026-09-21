import React, { useState, useMemo } from 'react';
import { Target, RefreshCw, Check, ArrowUp, ArrowDown, HelpCircle, ArrowLeft } from 'lucide-react';
import { RouteType } from '../types';
import { getDailyHexleTarget, evaluateHexleGuess, HexleGuessResult } from '../utils/gameEngines';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../components/common/Link';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';

interface HexleGamePageProps {
  onNavigate: (route: RouteType) => void;
}

export const HexleGamePage: React.FC<HexleGamePageProps> = ({ onNavigate }) => {
  const [target, setTarget] = useState<{ hex: string; name: string }>(getDailyHexleTarget);
  const [inputHex, setInputHex] = useState('');
  const [guesses, setGuesses] = useState<HexleGuessResult[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputHex.replace('#', '').trim();
    if (clean.length !== 6 || !/^[0-9a-f]{6}$/i.test(clean)) return;

    const result = evaluateHexleGuess(target.hex, `#${clean}`);
    const updated = [...guesses, result];
    setGuesses(updated);
    setInputHex('');

    if (result.isCorrect) {
      setGameWon(true);
      setGameOver(true);
    } else if (updated.length >= 6) {
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setTarget(getDailyHexleTarget());
    setGuesses([]);
    setGameWon(false);
    setGameOver(false);
    setInputHex('');
  };

  return (
    <div className="detail-container w-full max-w-3xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title="Hexle — Daily Color Hex Guessing Game"
        description="Guess the 6-character hexadecimal code of today's target specimen with channel-by-channel feedback."
        canonicalPath="/play/hexle"
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Play', to: { path: 'play' } },
          { label: 'Hexle', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Chromatic deduction laboratory"
        title="Hexle: Guess the HEX"
        description="Identify the color's RGB hexadecimal coordinates in 6 attempts or fewer."
        actions={
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<RefreshCw size={13} />}
            onClick={handleRestart}
          >
            New Game
          </Button>
        }
      />

      {/* Mystery Color Box */}
      <div
        className="w-full h-44 rounded-md border border-[var(--border-subtle)] shadow-xl flex items-center justify-center transition-all"
        style={{ backgroundColor: target.hex }}
      >
        <span className="font-mono text-sm font-bold px-3 py-1 rounded-xs bg-black/40 text-white backdrop-blur-xs">
          {gameOver ? `${target.name} (${target.hex})` : 'TARGET SPECIMEN'}
        </span>
      </div>

      {/* Guesses History */}
      <div className="flex flex-col gap-2">
        {guesses.map((g, idx) => (
          <div
            key={idx}
            className="p-3 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xs flex items-center justify-between font-mono text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-xs border border-black/10" style={{ backgroundColor: g.guessHex }} />
              <span className="font-bold text-[var(--text-primary)]">{g.guessHex}</span>
            </div>

            {/* RGB Channel Feedback */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[var(--text-tertiary)]">R:</span>
                {g.rFeedback === 'exact' ? (
                  <span className="text-emerald-400 flex items-center font-bold">✓ MATCH</span>
                ) : g.rFeedback === 'higher' ? (
                  <span className="text-amber-400 flex items-center"><ArrowUp size={12} /> HIGHER</span>
                ) : (
                  <span className="text-blue-400 flex items-center"><ArrowDown size={12} /> LOWER</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[var(--text-tertiary)]">G:</span>
                {g.gFeedback === 'exact' ? (
                  <span className="text-emerald-400 flex items-center font-bold">✓ MATCH</span>
                ) : g.gFeedback === 'higher' ? (
                  <span className="text-amber-400 flex items-center"><ArrowUp size={12} /> HIGHER</span>
                ) : (
                  <span className="text-blue-400 flex items-center"><ArrowDown size={12} /> LOWER</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[var(--text-tertiary)]">B:</span>
                {g.bFeedback === 'exact' ? (
                  <span className="text-emerald-400 flex items-center font-bold">✓ MATCH</span>
                ) : g.bFeedback === 'higher' ? (
                  <span className="text-amber-400 flex items-center"><ArrowUp size={12} /> HIGHER</span>
                ) : (
                  <span className="text-blue-400 flex items-center"><ArrowDown size={12} /> LOWER</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Form or Game Over */}
      {!gameOver ? (
        <form onSubmit={handleGuess} className="flex gap-2">
          <input
            type="text"
            placeholder="#BFA3F0..."
            value={inputHex}
            onChange={(e) => setInputHex(e.target.value)}
            className="flex-1 text-sm font-mono bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xs px-3.5 py-2.5 uppercase"
            maxLength={7}
            autoFocus
          />
          <Button type="submit" variant="primary" size="md">
            Guess ({6 - guesses.length} left)
          </Button>
        </form>
      ) : (
        <div className="p-6 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-md text-center flex flex-col items-center gap-3">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {gameWon ? '🎉 Brilliant Perception!' : 'Game Over'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Target color was <strong>{target.name}</strong> ({target.hex})
          </p>
          <Button onClick={handleRestart} variant="primary" size="sm">
            Play Next Color
          </Button>
        </div>
      )}
    </div>
  );
};
