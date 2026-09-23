import React, { useState } from 'react';
import { Layers, RefreshCw, Check, ArrowLeft, Trophy } from 'lucide-react';
import { RouteType } from '../types';
import { generatePaletteMatchRound, PaletteMatchRound } from '../utils/gameEngines';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { PageHeader } from '../components/common/PageHeader';
import { KromaButton } from '../components/common/KromaButton';

interface PaletteMatchGamePageProps {
  onNavigate: (route: RouteType) => void;
}

export const PaletteMatchGamePage: React.FC<PaletteMatchGamePageProps> = ({ onNavigate }) => {
  const [round, setRound] = useState<PaletteMatchRound>(generatePaletteMatchRound);
  const [currentOrder, setCurrentOrder] = useState<string[]>(() => round.scrambledColors);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const handleSwap = (idx: number) => {
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else {
      // Swap elements
      const next = [...currentOrder];
      const temp = next[selectedIdx];
      next[selectedIdx] = next[idx];
      next[idx] = temp;
      setCurrentOrder(next);
      setSelectedIdx(null);

      // Check if matches target order
      const isMatch = next.every((c, i) => c === round.targetColors[i]);
      if (isMatch) {
        setSolved(true);
      }
    }
  };

  const handleRestart = () => {
    const nextRound = generatePaletteMatchRound();
    setRound(nextRound);
    setCurrentOrder(nextRound.scrambledColors);
    setSelectedIdx(null);
    setSolved(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title="Palette Match — Color Order &amp; Harmony Game"
        description="Arrange scrambled color swatches into their intended harmonic progression."
        canonicalPath="/play/palette-match"
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Play', to: { path: 'play' } },
          { label: 'Palette Match', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Harmonic sequence puzzle"
        title="Palette Match: Harmonic Alignment"
        description="Click two swatches to swap their positions into correct harmonic alignment."
        actions={
          <KromaButton
            variant="outline"
            size="sm"
            iconLeft={<RefreshCw size={13} />}
            onClick={handleRestart}
          >
            New Palette
          </KromaButton>
        }
      />

      <div className="p-4 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg flex flex-col gap-4">
        <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase font-semibold">
          Target System: {round.targetPaletteTitle}
        </span>

        {/* Target Preview Clue (Blurred or faint) */}
        <div className="h-8 rounded-xs overflow-hidden flex opacity-40">
          {round.targetColors.map((c, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>

        {/* Interactive Swatches Bar */}
        <div className="h-32 rounded-md overflow-hidden flex border border-[var(--border-subtle)] shadow-xl">
          {currentOrder.map((hex, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSwap(idx)}
                className={`flex-1 flex flex-col justify-end p-2 transition-all cursor-pointer ${
                  isSelected ? 'ring-4 ring-white z-10 scale-105' : 'hover:opacity-90'
                }`}
                style={{ backgroundColor: hex }}
              >
                <span className="font-mono text-xs font-bold text-white drop-shadow-md truncate">
                  {hex}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {solved && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-center flex flex-col items-center gap-3">
          <Trophy size={32} className="text-emerald-400" />
          <h2 className="text-xl font-bold text-emerald-400">
            Harmonic Balance Achieved!
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            You reconstructed <strong>{round.targetPaletteTitle}</strong> perfectly.
          </p>
          <KromaButton onClick={handleRestart} variant="filled" size="sm">
            Next Challenge
          </KromaButton>
        </div>
      )}
    </div>
  );
};
