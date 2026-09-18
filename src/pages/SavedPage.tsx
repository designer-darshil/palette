import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, ArrowRight } from 'lucide-react';
import { RouteType } from '../types';
import { useSaved } from '../context/SavedContext';
import { CURATED_PALETTES } from '../data/palettes';
import { PaletteCard } from '../components/PaletteCard';
import { SEOHead } from '../components/seo/SEOHead';

interface SavedPageProps {
  onNavigate: (route: RouteType) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({ onNavigate }) => {
  const { savedItems, removeItem, clearAll } = useSaved();
  const [activeTab, setActiveTab] = useState<'palettes' | 'collections'>('palettes');

  // Hardcoded reference collections for design showcase
  const defaultCollections = [
    {
      id: 'col-editorial',
      slug: 'editorial',
      title: 'Editorial',
      count: 12,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      swatches: ['#121212', '#686258', '#C7B8A3', '#E9E2D5'],
    },
    {
      id: 'col-luxury',
      slug: 'luxury',
      title: 'Luxury',
      count: 8,
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      swatches: ['#101010', '#8C8773', '#CFC8B8', '#EFEAE0'],
    },
    {
      id: 'col-website',
      slug: 'website-projects',
      title: 'Website Projects',
      count: 15,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      swatches: ['#1E3024', '#3A5648', '#88A168', '#D7E0D3'],
    },
    {
      id: 'col-brand',
      slug: 'brand-inspiration',
      title: 'Brand Inspiration',
      count: 9,
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      swatches: ['#3A2F24', '#7A6B5B', '#C9B8A7', '#EDE4D9'],
    },
  ];

  // Map saved items to full PaletteItem objects where possible
  const savedPalettes = savedItems
    .map((item) => {
      const match = CURATED_PALETTES.find((p) => p.id === item.id || p.slug === item.slug);
      if (match) return match;
      if (item.preview) {
        return {
          id: item.id,
          slug: item.slug || item.id,
          title: item.title,
          category: 'custom',
          description: item.metadata || 'Custom user palette',
          colors: item.preview.split(',').map((hex, i) => ({
            name: `Tone ${i + 1}`,
            hex: hex.trim(),
          })),
          tags: ['Custom', 'Saved'],
        };
      }
      return null;
    })
    .filter(Boolean) as any[];

  return (
    <div className="w-full min-h-screen bg-[var(--kroma-paper)] text-[var(--kroma-ink)] py-5 md:py-6">
      <SEOHead
        rawTitle
        title="Saved Palettes & Collections — KROMA"
        description="Your curated archive of saved color palettes and custom project collections."
        canonicalPath="/saved"
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* Header with Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3.5 pb-2.5 border-b border-[var(--kroma-border)]">
          <div>
            <h1 className="font-mono text-sm md:text-base uppercase tracking-[0.2em] font-semibold text-[var(--kroma-ink)]">
              SAVED
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {savedPalettes.length > 0 && activeTab === 'palettes' && (
              <button
                onClick={clearAll}
                className="kroma-btn-secondary text-xs h-[30px] text-red-700"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => onNavigate({ path: 'studio' })}
              className="kroma-btn-secondary text-xs h-[30px]"
            >
              <span>Studio</span>
            </button>
            <button
              onClick={() => onNavigate({ path: 'create' })}
              className="kroma-btn-secondary text-xs h-[30px]"
            >
              <Plus size={13} />
              <span>New collection</span>
            </button>
          </div>
        </div>

        {/* Tab Controls (Palettes vs Collections) */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setActiveTab('palettes')}
            className={`font-mono text-[11px] uppercase tracking-wider pb-1 border-b-2 transition-all ${
              activeTab === 'palettes'
                ? 'border-[var(--kroma-ink)] text-[var(--kroma-ink)] font-bold'
                : 'border-transparent text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)]'
            }`}
          >
            Palettes ({savedPalettes.length})
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`font-mono text-[11px] uppercase tracking-wider pb-1 border-b-2 transition-all ${
              activeTab === 'collections'
                ? 'border-[var(--kroma-ink)] text-[var(--kroma-ink)] font-bold'
                : 'border-transparent text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)]'
            }`}
          >
            Collections ({defaultCollections.length})
          </button>
        </div>

        {/* Tab 1: Saved Palettes */}
        {activeTab === 'palettes' && (
          <div>
            {savedPalettes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {savedPalettes.map((palette) => (
                  <PaletteCard
                    key={palette.id}
                    palette={palette}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-card)]">
                <Bookmark size={24} strokeWidth={1.5} className="mx-auto text-[var(--kroma-muted)] mb-3" />
                <h3 className="font-sans text-xl md:text-2xl font-medium text-[var(--kroma-ink)] mb-2">
                  No saved palettes yet
                </h3>
                <p className="font-sans text-xs text-[var(--kroma-muted)] max-w-sm mx-auto mb-6">
                  Click the heart icon on any palette card to bookmark colors to your workspace.
                </p>
                <button
                  onClick={() => onNavigate({ path: 'explore' })}
                  className="kroma-btn-primary"
                >
                  Explore color archive
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Collections Grid */}
        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {defaultCollections.map((col) => (
              <div
                key={col.id}
                onClick={() => onNavigate({ path: 'collection-detail', slug: col.slug })}
                className="group relative h-[260px] rounded-[4px] overflow-hidden border border-[var(--kroma-border)] cursor-pointer bg-[#0D0D0C] flex flex-col justify-between p-4 text-white"
              >
                <img
                  src={col.image}
                  alt={col.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="relative z-10 flex justify-between items-start font-mono text-[9px] uppercase tracking-widest text-white/70">
                  <span>COLLECTION</span>
                  <span>{col.count} PALETTES</span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-sans text-xl md:text-2xl font-medium text-white tracking-[-0.02em] mb-2">
                    {col.title}
                  </h3>
                  <div className="flex h-4 w-28 rounded-[2px] overflow-hidden">
                    {col.swatches.map((hex, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
