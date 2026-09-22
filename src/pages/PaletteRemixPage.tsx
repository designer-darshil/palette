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
  };

  const handleApplyPreset = (preset: RemixPreset) => {
    const next = applyRemixPreset(adjustments, preset);
    updateAdjustments(next);
    showToast(`Applied "${preset.replace('-', ' ')}" variation`);
  };

  const remixedColors = useMemo(() => {
    return applyRemixAdjustments(originalPalette.colors, adjustments);
  }, [originalPalette.colors, adjustments]);

  const remixedPaletteObject: PaletteItem = useMemo(() => {
    return createRemixedPalette(originalPalette, remixedColors, customTitle || undefined);
  }, [originalPalette, remixedColors, customTitle]);

  const handleSaveRemix = () => {
    addPalette(remixedPaletteObject);
    saveItem({
      id: remixedPaletteObject.id,
      type: 'palette',
      title: remixedPaletteObject.title,
      slug: remixedPaletteObject.slug,
      preview: remixedColors.map((c) => c.hex).join(','),
      metadata: `Remixed from ${originalPalette.title}`,
    });
    showToast('Saved Remixed Palette System', remixedPaletteObject.title);
    onNavigate({ path: 'palette-detail', slug: remixedPaletteObject.slug });
  };

  return (
    <div className="studio-page">
      <SEOHead
        title={`Remix: ${originalPalette.title} — Calibration Studio | KROMA`}
        description={`Interactive remix workspace for ${originalPalette.title}. Fine-tune hues, saturation, temperature, and lightness.`}
        canonicalPath={`/palettes/${originalPalette.slug}/remix`}
      />

      {/* Editorial Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
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
          <button
            onClick={handleReset}
            className="studio-btn-secondary py-1.5 px-3 text-[11px]"
            title="Reset to original parameters"
          >
            <RotateCcw size={12} />
            <span>RESET</span>
          </button>
          <button
            onClick={handleSaveRemix}
            className="studio-btn-primary py-1.5 px-3.5 text-[11px]"
          >
            <Bookmark size={12} />
            <span>SAVE REMIX ↗</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="mb-12">
        <span className="studio-label">PARAMETRIC CALIBRATION</span>
        <h1 className="studio-headline">
          REMIX:<br />
          {originalPalette.title}
        </h1>
        <p className="studio-subhead">
          Sculpt hue offsets, saturation intensity, temperature warmth, and luminance contrast across the entire chromatic lineage.
        </p>
      </header>

      {/* Comparative Color Strips */}
      <section className="mb-14 flex flex-col gap-6">
        <div>
          <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider mb-2">
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
          <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-primary)] uppercase tracking-wider mb-2 font-bold">
            <span>ACTIVE REMIX CALIBRATION</span>
            <span>LIVE PREVIEW</span>
          </div>
          <div className="h-28 flex rounded-xs overflow-hidden border border-[var(--text-primary)]">
            {remixedColors.map((c, i) => (
              <div
                key={i}
                className="flex-1 h-full flex flex-col justify-end p-2 text-white font-mono text-[11px] font-bold drop-shadow-md"
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
            <button
              key={p.key}
              onClick={() => handleApplyPreset(p.key)}
              className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--text-primary)] text-xs font-mono uppercase tracking-wider text-[var(--text-primary)] rounded-xs transition-colors"
            >
              {p.label}
            </button>
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
