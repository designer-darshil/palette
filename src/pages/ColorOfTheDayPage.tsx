import React, { useMemo } from 'react';
import { Calendar, Copy, Sparkles, ExternalLink, ArrowRight, Share2, Bookmark } from 'lucide-react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { getColorOfTheDay } from '../utils/dailyEngine';
import { copyToClipboard, getColorAccessibility, getColorTemperature } from '../utils/colorUtils';
import { findSimilarColors, findSimilarPalettes } from '../utils/similarityEngine';
import { PaletteCard } from '../components/PaletteCard';
import { ColorCard } from '../components/ColorCard';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Link } from '../components/common/Link';

interface ColorOfTheDayPageProps {
  onNavigate: (route: RouteType) => void;
}

export const ColorOfTheDayPage: React.FC<ColorOfTheDayPageProps> = ({ onNavigate }) => {
  const { colors, palettes } = useLibraryData();
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();

  const { color, dateString } = useMemo(() => getColorOfTheDay(new Date(), colors), [colors]);
  const saved = isSaved(color.id);
  const access = useMemo(() => getColorAccessibility(color.hex), [color.hex]);
  const temp = useMemo(() => getColorTemperature(color.hex), [color.hex]);

  const similarColors = useMemo(() => findSimilarColors(color.hex, colors, 4), [color.hex, colors]);
  const featuringPalettes = useMemo(() => {
    return palettes
      .filter((p) => p.colors.some((c) => c.hex.toLowerCase() === color.hex.toLowerCase()))
      .slice(0, 4);
  }, [palettes, color.hex]);

  const handleCopyHex = async () => {
    const success = await copyToClipboard(color.hex);
    if (success) {
      showToast(`Copied ${color.hex}`, color.name, color.hex);
    }
  };

  const handleToggleSave = () => {
    saveItem({
      id: color.id,
      type: 'color',
      title: color.name,
      slug: color.slug,
      preview: color.hex,
      metadata: `${color.family} • ${color.oklch}`,
    });
    showToast(saved ? 'Removed from saved' : 'Saved color specimen', color.name);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
      <SEOHead
        title={`Color of the Day: ${color.name} (${color.hex}) — ${dateString}`}
        description={`Today's curated master color specimen: ${color.name} (${color.hex}). Calibrated ${color.family} pigment tone with OKLCH coordinates ${color.oklch}.`}
        canonicalPath="/color-of-the-day"
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'Color of the Day', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel={`Daily curation · ${dateString}`}
        title={color.name}
        description={color.description}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Copy size={14} />}
              onClick={handleCopyHex}
            >
              Copy {color.hex}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Bookmark size={14} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : 'currentColor'} />}
              onClick={handleToggleSave}
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        }
      />

      {/* Hero Swatch Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <button
          type="button"
          className="lg:col-span-7 h-64 sm:h-80 rounded-md border border-[var(--border-subtle)] p-6 flex flex-col justify-between shadow-xl cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          style={{ backgroundColor: color.hex, color: access.bestTextColor }}
          onClick={handleCopyHex}
          aria-label={`Copy color ${color.name} (${color.hex})`}
        >
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-xs w-fit bg-black/20 text-white backdrop-blur-xs">
            MASTER SPECIMEN
          </span>

          <div>
            <div className="font-mono text-2xl sm:text-3xl font-black">{color.hex}</div>
            <div className="font-mono text-sm opacity-90">{color.oklch} • {color.rgb}</div>
          </div>
        </button>

        {/* Technical Diagnostics */}
        <div className="lg:col-span-5 p-5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
              Specimen Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded-xs bg-[var(--bg-surface-2)]">
                <span className="text-xs text-[var(--text-tertiary)] block">WCAG Contrast White</span>
                <span className="font-bold text-[var(--text-primary)]">{access.contrastWithWhite}:1</span>
              </div>
              <div className="p-2.5 rounded-xs bg-[var(--bg-surface-2)]">
                <span className="text-xs text-[var(--text-tertiary)] block">WCAG Contrast Black</span>
                <span className="font-bold text-[var(--text-primary)]">{access.contrastWithBlack}:1</span>
              </div>
              <div className="p-2.5 rounded-xs bg-[var(--bg-surface-2)]">
                <span className="text-xs text-[var(--text-tertiary)] block">Temperature</span>
                <span className="font-bold text-[var(--text-primary)]">{temp.classification} ({temp.kelvin}K)</span>
              </div>
              <div className="p-2.5 rounded-xs bg-[var(--bg-surface-2)]">
                <span className="text-xs text-[var(--text-tertiary)] block">Color Family</span>
                <span className="font-bold text-[var(--text-primary)]">{color.family}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Link
              to={{ path: 'color-relationships', slug: color.slug }}
              onNavigate={onNavigate}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 flex-1 justify-center"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Relationship Map</span>
            </Link>
            <Link
              to={{ path: 'color-detail', slug: color.slug }}
              onNavigate={onNavigate}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 flex-1 justify-center"
            >
              <span>Full Specimen</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Featuring Palettes */}
      {featuringPalettes.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Palettes Utilizing Today's Color
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4 sm:gap-6">
            {featuringPalettes.map((p) => (
              <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Similar Colors */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Adjacent Pigments &amp; Similar Gamuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 sm:gap-5">
          {similarColors.map(({ color: sc }) => (
            <ColorCard key={sc.id} color={sc} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
