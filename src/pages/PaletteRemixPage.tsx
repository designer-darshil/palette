import React, { useState, useMemo } from 'react';
import { RotateCcw, Bookmark, ArrowUpRight, Copy } from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import {
  RemixAdjustments,
  DEFAULT_REMIX_ADJUSTMENTS,
  applyRemixAdjustments,
  applyRemixPreset,
  createRemixedPalette,
  RemixPreset,
} from '../utils/remixEngine';
import { copyToClipboard } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { NotFoundPage } from './NotFoundPage';
import { KromaButton } from '../components/common/KromaButton';

interface PaletteRemixPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const PaletteRemixPage: React.FC<PaletteRemixPageProps> = ({ slug, onNavigate }) => {
  const { palettes, addPalette } = useLibraryData();
  const { saveItem } = useSaved();
  const { showToast } = useToast();

  const originalPalette = useMemo(() => {
    const clean = slug.toLowerCase();
    return palettes.find((p) => p.slug.toLowerCase() === clean || p.id.toLowerCase() === clean);
  }, [slug, palettes]);

  const [adjustments, setAdjustments] = useState<RemixAdjustments>(DEFAULT_REMIX_ADJUSTMENTS);
  const [history, setHistory] = useState<RemixAdjustments[]>([DEFAULT_REMIX_ADJUSTMENTS]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [customTitle, setCustomTitle] = useState('');

  if (!originalPalette) {
    return <NotFoundPage requestedUrl={`/palettes/${slug}/remix`} onNavigate={onNavigate} />;
  }

  const updateAdjustments = (newAdj: RemixAdjustments) => {
    setAdjustments(newAdj);
    const updatedHistory = [...history.slice(0, historyIndex + 1), newAdj];
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const handleReset = () => {
    updateAdjustments(DEFAULT_REMIX_ADJUSTMENTS);
    showToast('Reset to original parameters', originalPalette.title);
  };

  const handleApplyPreset = (preset: RemixPreset) => {
    const newAdj = applyRemixPreset(adjustments, preset);
    updateAdjustments(newAdj);
    showToast(`Applied preset: ${preset.toUpperCase()}`, originalPalette.title);
  };

  const remixedColors = useMemo(() => {
    return applyRemixAdjustments(originalPalette.colors, adjustments);
  }, [originalPalette, adjustments]);

  const handleSaveRemix = () => {
    const title = customTitle.trim() || `${originalPalette.title} (Remix)`;
    const newPalette = createRemixedPalette(originalPalette, remixedColors, title);
    addPalette(newPalette);
    saveItem({
      id: newPalette.id,
      type: 'palette',
      title: newPalette.title,
      slug: newPalette.slug,
      preview: newPalette.colors.map((c) => c.hex).join('-'),
      metadata: `${newPalette.colors.length} colours • Remixed Studio Specimen`,
    });
    showToast('Saved remixed palette to library', newPalette.title);
    onNavigate({ path: 'palette-detail', slug: newPalette.slug });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pb-16 md:pb-24 box-border">
      <SEOHead
        title={`Remix ${originalPalette.title} — Parametric Color Synthesis | KROMA`}
        description={`Sculpt hue, saturation, temperature, and luminance curves of ${originalPalette.title}.`}
        canonicalPath={`/palettes/${originalPalette.slug}/remix`}
      />

      {/* Editorial Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
          <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => onNavigate({ path: 'create' })}>STUDIO</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => onNavigate({ path: 'palettes' })}>PALETTES</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-[var(--text-primary)] truncate max-w-xs" onClick={() => onNavigate({ path: 'palette-detail', slug: originalPalette.slug })}>
            {originalPalette.title}
          </span>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold">REMIX</span>
        </div>

        <div className="flex items-center gap-3">
          <KromaButton
            variant="outline"
            size="sm"
            iconLeft={<RotateCcw size={12} />}
            onClick={handleReset}
            title="Reset to original parameters"
          >
            RESET
          </KromaButton>
          <KromaButton
            variant="filled"
            size="sm"
            iconLeft={<Bookmark size={12} />}
            onClick={handleSaveRemix}
          >
            SAVE REMIX
          </KromaButton>
        </div>
      </div>

      {/* Header */}
      <header className="mb-12">
        <span className="font-mono text-xs font-medium tracking-[0.12em] uppercase text-text-secondary block mb-4">PARAMETRIC CALIBRATION</span>
        <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight text-text-primary uppercase m-0 mb-5">
          REMIX:<br />
          {originalPalette.title}
        </h1>
        <p className="font-sans text-base leading-relaxed text-text-secondary max-w-[680px] m-0">
          Sculpt hue offsets, saturation intensity, temperature warmth, and luminance contrast across the entire chromatic lineage.
        </p>
      </header>

      {/* Comparative Color Strips */}
      <section className="mb-14 flex flex-col gap-6">
        <div>
          <div className="flex items-center justify-between font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            <span>ORIGINAL SPECIMEN</span>
            <span>{originalPalette.colors.length} COLORS</span>
          </div>
          <div className="h-20 flex rounded-xs overflow-hidden border border-[var(--border-subtle)]">
            {originalPalette.colors.map((c, i) => (
              <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }} title={`${c.name} (${c.hex})`} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between font-mono text-xs text-[var(--text-primary)] uppercase tracking-wider mb-2 font-bold">
            <span>ACTIVE REMIX CALIBRATION</span>
            <span>LIVE PREVIEW</span>
          </div>
          <div className="h-28 flex rounded-xs overflow-hidden border border-[var(--text-primary)]">
            {remixedColors.map((c, i) => (
              <div
                key={i}
                className="flex-1 h-full flex flex-col justify-end p-2 text-white font-mono text-xs font-bold drop-shadow-md"
                style={{ backgroundColor: c.hex }}
              >
                <span className="truncate">{c.name}</span>
                <span>{c.hex}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Harmonic Presets */}
      <section className="mb-12">
        <span className="studio-label mb-3 block">ONE-CLICK HARMONICS</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'lighter', label: 'LIGHTER' },
              { key: 'darker', label: 'DARKER' },
              { key: 'warmer', label: 'WARMER' },
              { key: 'cooler', label: 'COOLER' },
              { key: 'vibrant', label: 'SATURATED' },
              { key: 'muted', label: 'MUTED MATTE' },
              { key: 'high-contrast', label: 'HIGH CONTRAST' },
              { key: 'soft-contrast', label: 'SOFT CONTRAST' },
              { key: 'invert', label: 'INVERT HUES' },
            ] as const
          ).map((p) => (
            <KromaButton
              key={p.key}
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset(p.key)}
              className="text-xs font-mono uppercase tracking-wider rounded-xs h-auto min-h-0"
            >
              {p.label}
            </KromaButton>
          ))}
        </div>
      </section>

      {/* Sliders Precision Controls */}
      <section className="p-6 border border-[var(--border-subtle)] rounded-xs mb-16">
        <span className="studio-label mb-6 block">PRECISION PARAMETRIC CALIBRATION</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Hue Shift */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)] uppercase">HUE SHIFT</span>
              <span className="font-bold text-[var(--text-primary)]">{adjustments.hueShift}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={adjustments.hueShift}
              onChange={(e) =>
                updateAdjustments({ ...adjustments, hueShift: parseInt(e.target.value) })
              }
              className="w-full accent-[var(--text-primary)]"
            />
          </div>

          {/* Saturation */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)] uppercase">SATURATION</span>
              <span className="font-bold text-[var(--text-primary)]">{adjustments.saturationMultiplier}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={Math.round(adjustments.saturationMultiplier * 100)}
              onChange={(e) =>
                updateAdjustments({ ...adjustments, saturationMultiplier: parseInt(e.target.value) / 100 })
              }
              className="w-full accent-[var(--text-primary)]"
            />
          </div>

          {/* Lightness */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)] uppercase">LIGHTNESS</span>
              <span className="font-bold text-[var(--text-primary)]">{adjustments.lightnessShift > 0 ? `+${adjustments.lightnessShift}` : adjustments.lightnessShift}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={adjustments.lightnessShift}
              onChange={(e) =>
                updateAdjustments({ ...adjustments, lightnessShift: parseInt(e.target.value) })
              }
              className="w-full accent-[var(--text-primary)]"
            />
          </div>

          {/* Temperature */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)] uppercase">TEMPERATURE</span>
              <span className="font-bold text-[var(--text-primary)]">{adjustments.temperatureShift > 0 ? `+${adjustments.temperatureShift}` : adjustments.temperatureShift}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={adjustments.temperatureShift}
              onChange={(e) =>
                updateAdjustments({ ...adjustments, temperatureShift: parseInt(e.target.value) })
              }
              className="w-full accent-[var(--text-primary)]"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
