import React, { useState, useEffect } from 'react';
import { Shuffle, Palette, Sparkles, Wand2, Bookmark, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { RouteType, PaletteItem, ColorItem, GradientItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { PaletteCard } from '../components/PaletteCard';
import { ColorCard } from '../components/ColorCard';
import { GradientCard } from '../components/GradientCard';
import { copyToClipboard } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../components/common/Link';

interface RandomDiscoveryPageProps {
  onNavigate: (route: RouteType) => void;
}

export const RandomDiscoveryPage: React.FC<RandomDiscoveryPageProps> = ({ onNavigate }) => {
  const { palettes, colors, gradients } = useLibraryData();
  const { showToast } = useToast();

  const [randomPalette, setRandomPalette] = useState<PaletteItem | null>(null);
  const [randomColor, setRandomColor] = useState<ColorItem | null>(null);
  const [randomGradient, setRandomGradient] = useState<GradientItem | null>(null);

  const rollNewBatch = () => {
    if (palettes.length > 0) {
      setRandomPalette(palettes[Math.floor(Math.random() * palettes.length)]);
    }
    if (colors.length > 0) {
      setRandomColor(colors[Math.floor(Math.random() * colors.length)]);
    }
    if (gradients.length > 0) {
      setRandomGradient(gradients[Math.floor(Math.random() * gradients.length)]);
    }
  };

  useEffect(() => {
    rollNewBatch();
  }, [palettes, colors, gradients]);

  return (
    <div className="catalog-container w-full max-w-7xl mx-auto flex flex-col gap-8">
      <SEOHead
        title="Random Color &amp; Palette Discovery Generator"
        description="Serendipitous color exploration. Discover randomly selected chromatic systems, master colors, and gradient specimens."
        canonicalPath="/random"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'Random Discovery', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shuffle size={16} className="text-pink-400" />
            <span className="page-category-label">Serendipitous Exploration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Random Specimen Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Break creative blocks by exploring unpredicted color relationships and unexpected palettes.
          </p>
        </div>

        <button
          onClick={rollNewBatch}
          className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>Roll New Specimens</span>
        </button>
      </div>

      {/* Triad of Random Specimens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Random Palette Section */}
        {randomPalette && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[var(--accent-gold)] uppercase">
                Random Palette System
              </span>
              <Link
                to={{ path: 'palette-remix', slug: randomPalette.slug }}
                onNavigate={onNavigate}
                className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono"
              >
                <Wand2 size={12} />
                <span>Remix</span>
              </Link>
            </div>
            <PaletteCard palette={randomPalette} onNavigate={onNavigate} />
          </div>
        )}

        {/* Random Color Section */}
        {randomColor && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[var(--accent-gold)] uppercase">
                Random Master Color
              </span>
              <Link
                to={{ path: 'color-relationships', slug: randomColor.slug }}
                onNavigate={onNavigate}
                className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono"
              >
                <Sparkles size={12} />
                <span>Relationships</span>
              </Link>
            </div>
            <ColorCard color={randomColor} onNavigate={onNavigate} />
          </div>
        )}

        {/* Random Gradient Section */}
        {randomGradient && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[var(--accent-gold)] uppercase">
                Random CSS Gradient
              </span>
              <Link
                to={{ path: 'mesh' }}
                onNavigate={onNavigate}
                className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono"
              >
                <Layers size={12} />
                <span>Mesh Studio</span>
              </Link>
            </div>
            <GradientCard gradient={randomGradient} onNavigate={onNavigate} />
          </div>
        )}
      </div>
    </div>
  );
};
