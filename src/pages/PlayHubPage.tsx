import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { RouteType } from '../types';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { KromaCard } from '../components/common/KromaCard';

interface PlayHubPageProps {
  onNavigate: (route: RouteType) => void;
}

export const PlayHubPage: React.FC<PlayHubPageProps> = ({ onNavigate }) => {
  return (
    <div className="catalog-container w-full max-w-7xl mx-auto flex flex-col gap-8 pb-16">
      <SEOHead
        title="Play & Color Games — Hexle, Odd One Out & Palette Match"
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

      {/* Game Selection Cards — Editorial Instrument System */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Game 1: Hexle */}
        <KromaCard
          className="group/game flex flex-col justify-between"
          onClick={() => onNavigate({ path: 'play-hexle' })}
          aria-label="Play Hexle color puzzle"
        >
          {/* Visual Hero: Hexadecimal Chromatic Calibration Matrix */}
          <div className="w-full h-36 bg-[#171717] p-4 flex flex-col justify-between border-b border-black/[0.06] dark:border-white/[0.06] select-none">
            <div className="flex items-center justify-between font-mono text-xs text-white/50 uppercase tracking-wider">
              <span>RGB CHANNEL MATRIX</span>
              <span>G-01</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              {['#FF3B30', '#FF9500', '#FFD60A', '#34C759', '#00AEEF', '#7B2CBF'].map((hex, i) => (
                <div
                  key={i}
                  className="w-9 h-11 rounded-[2px] flex items-center justify-center font-mono text-xs font-bold text-white shadow-xs transition-transform group-hover/game:scale-105"
                  style={{ backgroundColor: hex }}
                >
                  {hex[i + 1] || 'F'}
                </div>
              ))}
            </div>
            <div className="font-mono text-xs text-amber-400/90 text-center tracking-wider">
              INPUT: # _ _ _ _ _ _
            </div>
          </div>

          <div className="p-5 flex flex-col gap-2 flex-1 justify-between bg-[#F8F8F8] dark:bg-[#141518]">
            <div>
              <div className="font-mono text-xs font-semibold text-[var(--accent-gold)] uppercase tracking-wider mb-1">
                DAILY COLOR PUZZLE
              </div>
              <h2 className="font-sans text-xl font-bold text-[#171717] dark:text-white tracking-tight m-0 mb-2">
                Hexle
              </h2>
              <p className="text-xs text-[#707070] dark:text-[#A0A0A0] leading-relaxed m-0">
                Guess the 6-character hexadecimal color value. Receive directional channel feedback for Red, Green, and Blue.
              </p>
            </div>

            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between font-mono text-xs font-semibold text-[#171717] dark:text-white">
              <span>PLAY HEXLE</span>
              <ArrowUpRight size={13} className="transition-transform group-hover/game:translate-x-0.5 group-hover/game:-translate-y-0.5" />
            </div>
          </div>
        </KromaCard>

        {/* Game 2: Odd One Out */}
        <KromaCard
          className="group/game flex flex-col justify-between"
          onClick={() => onNavigate({ path: 'play-odd-one-out' })}
          aria-label="Play Odd One Out perception challenge"
        >
          {/* Visual Hero: Delta-E Acuity Grid */}
          <div className="w-full h-36 bg-[#171717] p-4 flex flex-col justify-between border-b border-black/[0.06] dark:border-white/[0.06] select-none">
            <div className="flex items-center justify-between font-mono text-xs text-white/50 uppercase tracking-wider">
              <span>DELTA-E DIFFERENTIAL</span>
              <span>G-02</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 max-w-[170px] mx-auto">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-[2px] transition-transform group-hover/game:scale-105"
                  style={{
                    backgroundColor: i === 5 ? '#2ECC71' : '#27AE60',
                    boxShadow: i === 5 ? '0 0 0 1px rgba(255,255,255,0.4)' : 'none',
                  }}
                  title={i === 5 ? 'Subtle delta-E outlier' : undefined}
                />
              ))}
            </div>
            <div className="font-mono text-xs text-emerald-400/90 text-center tracking-wider">
              THRESHOLD ΔE &lt; 2.5
            </div>
          </div>

          <div className="p-5 flex flex-col gap-2 flex-1 justify-between bg-[#F8F8F8] dark:bg-[#141518]">
            <div>
              <div className="font-mono text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">
                PERCEPTUAL ACUITY
              </div>
              <h2 className="font-sans text-xl font-bold text-[#171717] dark:text-white tracking-tight m-0 mb-2">
                Odd One Out
              </h2>
              <p className="text-xs text-[#707070] dark:text-[#A0A0A0] leading-relaxed m-0">
                Spot the color swatch that differs by minute Delta-E lightness or saturation deltas before time runs out.
              </p>
            </div>

            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between font-mono text-xs font-semibold text-[#171717] dark:text-white">
              <span>START CHALLENGE</span>
              <ArrowUpRight size={13} className="transition-transform group-hover/game:translate-x-0.5 group-hover/game:-translate-y-0.5" />
            </div>
          </div>
        </KromaCard>

        {/* Game 3: Palette Match */}
        <KromaCard
          className="group/game flex flex-col justify-between"
          onClick={() => onNavigate({ path: 'play-palette-match' })}
          aria-label="Play Palette Match harmonic ordering"
        >
          {/* Visual Hero: Scrambled Chromatic Spectrum Flow */}
          <div className="w-full h-36 bg-[#171717] p-4 flex flex-col justify-between border-b border-black/[0.06] dark:border-white/[0.06] select-none">
            <div className="flex items-center justify-between font-mono text-xs text-white/50 uppercase tracking-wider">
              <span>HARMONIC SEQUENCE</span>
              <span>G-03</span>
            </div>
            <div className="flex h-9 rounded-[2px] overflow-hidden w-full max-w-[220px] mx-auto border border-white/20">
              {['#7B2CBF', '#FF3B30', '#00AEEF', '#FFD60A', '#34C759'].map((hex, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-full transition-[flex] duration-200 group-hover/game:hover:flex-[1.4]"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <div className="font-mono text-xs text-pink-400/90 text-center tracking-wider">
              DRAG &amp; ARRANGE HARMONIES
            </div>
          </div>

          <div className="p-5 flex flex-col gap-2 flex-1 justify-between bg-[#F8F8F8] dark:bg-[#141518]">
            <div>
              <div className="font-mono text-xs font-semibold text-pink-500 uppercase tracking-wider mb-1">
                HARMONIC ORDER
              </div>
              <h2 className="font-sans text-xl font-bold text-[#171717] dark:text-white tracking-tight m-0 mb-2">
                Palette Match
              </h2>
              <p className="text-xs text-[#707070] dark:text-[#A0A0A0] leading-relaxed m-0">
                Arrange scrambled color swatches into their optimal harmonic progression and role hierarchy.
              </p>
            </div>

            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between font-mono text-xs font-semibold text-[#171717] dark:text-white">
              <span>PLAY MATCH</span>
              <ArrowUpRight size={13} className="transition-transform group-hover/game:translate-x-0.5 group-hover/game:-translate-y-0.5" />
            </div>
          </div>
        </KromaCard>
      </div>
    </div>
  );
};
