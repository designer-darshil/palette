import React from 'react';
import { Target, Eye, Layers, ArrowRight } from 'lucide-react';
import { RouteType } from '../types';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { SpecimenCardBase } from '../components/common/SpecimenCardBase';
import { Button } from '../components/common/Button';

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

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Play', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Sensory calibration games"
        title="Color Play & Sensory Calibration"
        description="Test and refine your perceptual acuity for RGB channels, subtle Delta-E differences, and harmonic balance."
      />

      {/* Game Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Game 1: Hexle */}
        <SpecimenCardBase
          className="p-6 flex flex-col justify-between gap-6"
          onClick={() => onNavigate({ path: 'play-hexle' })}
        >
          <div>
            <div className="w-12 h-12 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Target size={24} />
            </div>
            <span className="font-sans text-[11px] font-semibold text-[var(--accent-gold)] block mb-1">
              Daily color puzzle
            </span>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Hexle
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Guess the 6-character hexadecimal color value. Receive directional channel feedback for Red, Green, and Blue.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            iconRight={<ArrowRight size={14} />}
            onClick={() => onNavigate({ path: 'play-hexle' })}
            className="w-full justify-between"
          >
            Play Hexle
          </Button>
        </SpecimenCardBase>

        {/* Game 2: Odd One Out */}
        <SpecimenCardBase
          className="p-6 flex flex-col justify-between gap-6"
          onClick={() => onNavigate({ path: 'play-odd-one-out' })}
        >
          <div>
            <div className="w-12 h-12 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Eye size={24} />
            </div>
            <span className="font-sans text-[11px] font-semibold text-emerald-400 block mb-1">
              Perceptual acuity
            </span>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Odd One Out
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Spot the color swatch that differs by minute Delta-E lightness or saturation deltas before time runs out.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            iconRight={<ArrowRight size={14} />}
            onClick={() => onNavigate({ path: 'play-odd-one-out' })}
            className="w-full justify-between"
          >
            Play Odd One Out
          </Button>
        </SpecimenCardBase>

        {/* Game 3: Palette Match */}
        <SpecimenCardBase
          className="p-6 flex flex-col justify-between gap-6"
          onClick={() => onNavigate({ path: 'play-palette-match' })}
        >
          <div>
            <div className="w-12 h-12 rounded-md bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
              <Layers size={24} />
            </div>
            <span className="font-sans text-[11px] font-semibold text-pink-400 block mb-1">
              Harmonic order
            </span>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Palette Match
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Arrange scrambled color swatches into their optimal harmonic progression and role hierarchy.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            iconRight={<ArrowRight size={14} />}
            onClick={() => onNavigate({ path: 'play-palette-match' })}
            className="w-full justify-between"
          >
            Play Palette Match
          </Button>
        </SpecimenCardBase>
      </div>
    </div>
  );
};
