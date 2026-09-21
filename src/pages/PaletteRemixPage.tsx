import React, { useState, useMemo } from 'react';
import { Wand2, RotateCcw, Save, Copy, ArrowLeft, Sliders, Check, Sparkles, Code, GitFork } from 'lucide-react';
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
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NotFoundPage } from './NotFoundPage';
import { Link } from '../components/common/Link';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { PalettePreviewModes } from '../components/PalettePreviewModes';

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

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAdjustments(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAdjustments(history[historyIndex + 1]);
    }
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
    <div className="detail-container w-full max-w-7xl mx-auto flex flex-col gap-8">
      <SEOHead
        title={`Remix: ${originalPalette.title} — Palette Studio`}
        description={`Interactive remix workspace for ${originalPalette.title}. Fine-tune hues, saturation, temperature, and lightness.`}
        canonicalPath={`/palettes/${originalPalette.slug}/remix`}
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Palettes', to: { path: 'palettes' } },
          { label: originalPalette.title, to: { path: 'palette-detail', slug: originalPalette.slug } },
          { label: 'Remix Studio', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Remix studio · Lineage engine"
        title={`Remixing: ${originalPalette.title}`}
        description={`Interactive remix workspace for ${originalPalette.title}. Fine-tune hues, saturation, temperature, and lightness.`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<RotateCcw size={13} />}
              onClick={handleReset}
              title="Reset to original parameters"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Save size={14} />}
              onClick={handleSaveRemix}
            >
              Save Remix
            </Button>
          </div>
        }
      />

      {/* Before / After Live Comparison Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="p-4 rounded-md bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] flex flex-col gap-2">
          <span className="font-mono text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            ORIGINAL SPECIMEN ({originalPalette.title})
          </span>
          <div className="h-20 rounded-xs overflow-hidden flex border border-[var(--border-subtle)]">
            {originalPalette.colors.map((c, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} title={`${c.name} (${c.hex})`} />
            ))}
          </div>
        </div>

        {/* Remixed */}
        <div className="p-4 rounded-md bg-[var(--bg-surface-1)] border border-[var(--border-medium)] flex flex-col gap-2 ring-1 ring-[var(--accent-gold)]/40">
          <span className="font-mono text-[10px] font-bold text-[var(--accent-gold)] uppercase tracking-wider">
            ACTIVE REMIX INTERPRETATION
          </span>
          <div className="h-20 rounded-xs overflow-hidden flex border border-[var(--border-subtle)]">
            {remixedColors.map((c, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end p-1" style={{ backgroundColor: c.hex }}>
                <span className="font-mono text-[9px] font-bold text-white drop-shadow-md truncate">
                  {c.hex}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* One-Click Presets */}
      <section className="flex flex-col gap-2.5">
        <span className="font-mono text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
          One-Click Harmonics &amp; Tone Presets
        </span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'lighter', label: 'Lighter' },
              { key: 'darker', label: 'Darker' },
              { key: 'warmer', label: 'Warmer' },
              { key: 'cooler', label: 'Cooler' },
              { key: 'vibrant', label: 'More Saturated' },
              { key: 'muted', label: 'Muted Matte' },
              { key: 'high-contrast', label: 'High Contrast' },
              { key: 'soft-contrast', label: 'Soft Contrast' },
              { key: 'invert', label: 'Invert Hues' },
            ] as const
          ).map((p) => (
            <Button
              key={p.key}
              variant="secondary"
              size="sm"
              onClick={() => handleApplyPreset(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Sliders Precision Controls */}
      <section className="p-5 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col gap-5">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Precision Parametric Calibration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hue Shift */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Hue Shift</span>
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
              className="w-full accent-[var(--color-primary)]"
            />
          </div>

          {/* Saturation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Saturation Multiplier</span>
              <span className="font-bold text-[var(--text-primary)]">{adjustments.saturationMultiplier}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={Math.round(adjustments.saturationMultiplier * 100)}
              onChange={(e) =>
                updateAdjustments({
                  ...adjustments,
                  saturationMultiplier: parseFloat((parseInt(e.target.value) / 100).toFixed(2)),
                })
              }
              className="w-full accent-[var(--color-primary)]"
            />
          </div>

          {/* Lightness */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Lightness Offset</span>
              <span className="font-bold text-[var(--text-primary)]">{adjustments.lightnessShift}%</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              value={adjustments.lightnessShift}
              onChange={(e) =>
                updateAdjustments({ ...adjustments, lightnessShift: parseInt(e.target.value) })
              }
              className="w-full accent-[var(--color-primary)]"
            />
          </div>

          {/* Contrast */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Contrast Curve</span>
              <span className="font-bold text-[var(--text-primary)]">{adjustments.contrastMultiplier}x</span>
            </div>
            <input
              type="range"
              min="50"
              max="180"
              value={Math.round(adjustments.contrastMultiplier * 100)}
              onChange={(e) =>
                updateAdjustments({
                  ...adjustments,
                  contrastMultiplier: parseFloat((parseInt(e.target.value) / 100).toFixed(2)),
                })
              }
              className="w-full accent-[var(--color-primary)]"
            />
          </div>

          {/* Temperature */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Temperature (Cool ↔ Warm)</span>
              <span className="font-bold text-[var(--text-primary)]">
                {adjustments.temperatureShift > 0
                  ? `+${adjustments.temperatureShift} (Warm)`
                  : adjustments.temperatureShift < 0
                  ? `${adjustments.temperatureShift} (Cool)`
                  : '0 (Neutral)'}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={adjustments.temperatureShift}
              onChange={(e) =>
                updateAdjustments({ ...adjustments, temperatureShift: parseInt(e.target.value) })
              }
              className="w-full accent-[var(--color-primary)]"
            />
          </div>
        </div>
      </section>

      {/* Live UI Proof with Remixed Colors */}
      <PalettePreviewModes palette={remixedPaletteObject} />
    </div>
  );
};
