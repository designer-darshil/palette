import React from 'react';
import { Gamepad2, Sparkles, Target, Eye, Layers, ArrowRight } from 'lucide-react';
import { RouteType } from '../types';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../components/common/Link';

interface PlayHubPageProps {
  onNavigate: (route: RouteType) => void;
}

export const PlayHubPage: React.FC<PlayHubPageProps> = ({ onNavigate }) => {
  return (
    <div className="catalog-container w-full max-w-7xl mx-auto flex flex-col gap-8">
      <SEOHead
        title="Play &amp; Color Games — Hexle, Odd One Out &amp; Palette Match"
        description="Sharpen your chromatic perception and color theory acuity with interactive designer games."
        canonicalPath="/play"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Play', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 size={16} className="text-[var(--color-primary)]" />
            <span className="page-category-label">Sensory Calibration Games</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Color Play &amp; Sensory Calibration
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Test and refine your perceptual acuity for RGB channels, subtle Delta-E differences, and harmonic balance.
          </p>
        </div>
      </div>

      {/* Game Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Game 1: Hexle */}
        <div className="p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-lg flex flex-col justify-between gap-6 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Target size={24} />
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-[var(--accent-gold)] tracking-wider block mb-1">
              DAILY COLOR PUZZLE
            </span>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Hexle
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Guess the 6-character hexadecimal color value. Receive directional channel feedback for Red, Green, and Blue.
            </p>
          </div>

          <Link
            to={{ path: 'play-hexle' }}
            onNavigate={onNavigate}
            className="btn-primary text-xs px-4 py-2.5 flex items-center justify-between"
          >
            <span>Play Hexle</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Game 2: Odd One Out */}
        <div className="p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-lg flex flex-col justify-between gap-6 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Eye size={24} />
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
              PERCEPTUAL ACUITY
            </span>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Odd One Out
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Spot the color swatch that differs by minute Delta-E lightness or saturation deltas before time runs out.
            </p>
          </div>

          <Link
            to={{ path: 'play-odd-one-out' }}
            onNavigate={onNavigate}
            className="btn-primary text-xs px-4 py-2.5 flex items-center justify-between"
          >
            <span>Play Odd One Out</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Game 3: Palette Match */}
        <div className="p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-lg flex flex-col justify-between gap-6 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-md bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
              <Layers size={24} />
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-pink-400 tracking-wider block mb-1">
              HARMONIC ORDER
            </span>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Palette Match
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Arrange scrambled color swatches into their optimal harmonic progression and role hierarchy.
            </p>
          </div>

          <Link
            to={{ path: 'play-palette-match' }}
            onNavigate={onNavigate}
            className="btn-primary text-xs px-4 py-2.5 flex items-center justify-between"
          >
            <span>Play Palette Match</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
