import React, { useMemo } from 'react';
import { Calendar, Wand2, Copy, Bookmark, Share2, Layers, Sparkles, ArrowRight } from 'lucide-react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { getPaletteOfTheDay } from '../utils/dailyEngine';
import { copyToClipboard } from '../utils/colorUtils';
import { findSimilarPalettes } from '../utils/similarityEngine';
import { PaletteCard } from '../components/PaletteCard';
import { PalettePreviewModes } from '../components/PalettePreviewModes';
import { AccessibilityMatrix } from '../components/AccessibilityMatrix';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../components/common/Link';

interface PaletteOfTheDayPageProps {
  onNavigate: (route: RouteType) => void;
}

export const PaletteOfTheDayPage: React.FC<PaletteOfTheDayPageProps> = ({ onNavigate }) => {
  const { palettes } = useLibraryData();
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();

  const { palette, dateString } = useMemo(() => getPaletteOfTheDay(new Date(), palettes), [palettes]);
  const saved = isSaved(palette.id);

  const similarPalettes = useMemo(() => findSimilarPalettes(palette, palettes, 4), [palette, palettes]);

  const handleCopyTokens = async () => {
    const code = palette.colors.map((c) => `${c.name}: ${c.hex}`).join('\n');
    const success = await copyToClipboard(code);
    if (success) {
      showToast('Copied Palette Colors', palette.title);
    }
  };

  const handleToggleSave = () => {
    saveItem({
      id: palette.id,
      type: 'palette',
      title: palette.title,
      slug: palette.slug,
      preview: palette.colors.map((c) => c.hex).join(','),
      metadata: `${palette.category} • ${palette.colors.length} swatches`,
    });
    showToast(saved ? 'Removed from saved' : 'Saved palette system', palette.title);
  };

  return (
    <div className="detail-container w-full max-w-7xl mx-auto flex flex-col gap-8">
      <SEOHead
        title={`Palette of the Day: ${palette.title} — ${dateString}`}
        description={`Today's curated color system: ${palette.title}. ${palette.description}`}
        canonicalPath="/palette-of-the-day"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'Palette of the Day', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-[var(--accent-gold)]" />
            <span className="page-category-label">DAILY SYSTEM SPECIMEN • {dateString.toUpperCase()}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
            {palette.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
            {palette.description}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={{ path: 'palette-remix', slug: palette.slug }}
            onNavigate={onNavigate}
            className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5"
          >
            <Wand2 size={14} />
            <span>Remix Palette</span>
          </Link>
          <button
            onClick={handleToggleSave}
            className="btn-secondary text-xs px-3.5 py-2.5 flex items-center gap-1.5"
          >
            <Bookmark size={14} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : 'currentColor'} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Palette Hero Swatch Banner */}
      <div className="h-44 sm:h-60 rounded-md overflow-hidden flex border border-[var(--border-subtle)] shadow-xl">
        {palette.colors.map((c, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col justify-between p-3.5 sm:p-5 cursor-pointer transition-all hover:flex-[1.2]"
            style={{ backgroundColor: c.hex }}
            onClick={async () => {
              await copyToClipboard(c.hex);
              showToast(`Copied ${c.hex}`, c.name, c.hex);
            }}
          >
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs w-fit bg-black/25 text-white">
              0{i + 1}
            </span>
            <div className="text-white drop-shadow-md">
              <div className="font-mono text-xs sm:text-sm font-bold">{c.hex}</div>
              <div className="text-[11px] truncate font-medium opacity-90">{c.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* UI Previews */}
      <PalettePreviewModes palette={palette} />

      {/* Accessibility Matrix */}
      <AccessibilityMatrix colors={palette.colors} />

      {/* Similar Palettes */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Similar Harmonic Systems in Catalog
        </h2>
        <div className="specimen-grid-palettes">
          {similarPalettes.map(({ palette: sp }) => (
            <PaletteCard key={sp.id} palette={sp} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
