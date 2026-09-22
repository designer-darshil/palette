import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Lock,
  Unlock,
  Copy,
  Check,
  Bookmark,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Code,
  X,
  Sliders,
  Sparkles,
  Layers,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { RouteType } from '../types';
import {
  GeneratorColor,
  HarmonyMode,
  generatePalette,
  findClosestColorName,
  formatPaletteExport,
} from '../utils/paletteGenerator';
import {
  copyToClipboard,
  getTextColorForBackground,
  hexToRgb,
  hexToHsl,
  hexToOklch,
  getContrastRatio,
  getLuminance,
} from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebApplicationSchema } from '../utils/schemaGenerator';

interface MobilePaletteGeneratorProps {
  initialColorsQuery?: string;
  onNavigate: (route: RouteType) => void;
}

export const MobilePaletteGeneratorPage: React.FC<MobilePaletteGeneratorProps> = ({
  initialColorsQuery,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved } = useSaved();
  const { addPalette } = useLibraryData();

  // Generator Configuration State
  const [colorCount, setColorCount] = useState<number>(5);
  const [harmony, setHarmony] = useState<HarmonyMode>('curated');
  const [baseColor, setBaseColor] = useState<string>('#00AEEF');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);

  // Palette Colors State
  const [colors, setColors] = useState<GeneratorColor[]>(() => {
    if (initialColorsQuery) {
      const delimiter = initialColorsQuery.includes(',') ? ',' : '-';
      const hexList = initialColorsQuery
        .split(delimiter)
        .map((h) => h.trim())
        .filter((h) => h.length >= 3 && h.length <= 7)
        .map((h) => (h.startsWith('#') ? h : `#${h}`));

      if (hexList.length >= 2 && hexList.length <= 8) {
        return hexList.map((hex, i) => ({
          id: `init-${i}-${Date.now()}`,
          hex: hex.toUpperCase(),
          name: findClosestColorName(hex),
          locked: false,
        }));
      }
    }
    return generatePalette(5, [], 'curated', '#00AEEF');
  });

  // History for Undo / Redo
  const [history, setHistory] = useState<GeneratorColor[][]>([colors]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modals & Feedback
  const [exportOpen, setExportOpen] = useState<boolean>(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'hex' | 'css' | 'tailwind' | 'json'>('css');

  const pushToHistory = (newColors: GeneratorColor[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newColors);
    if (nextHistory.length > 20) nextHistory.shift();
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  // Sync URL query state
  useEffect(() => {
    const hexList = colors.map((c) => c.hex.replace('#', '')).join(',');
    const newUrl = `/palette-generator?colors=${hexList}`;
    if (window.location.search !== `?colors=${hexList}`) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [colors]);

  // Primary Generate Action
  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const newColors = generatePalette(colorCount, colors, harmony, baseColor || undefined);
      setColors(newColors);
      pushToHistory(newColors);
      setIsGenerating(false);
    }, 120);
  }, [colorCount, colors, harmony, baseColor, historyIndex, history]);

  // Randomize Action (picks fresh seed and generates)
  const handleRandomize = useCallback(() => {
    setIsGenerating(true);
    const randomHex = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()}`;
    setBaseColor(randomHex);
    setTimeout(() => {
      const newColors = generatePalette(colorCount, colors, harmony, randomHex);
      setColors(newColors);
      pushToHistory(newColors);
      setIsGenerating(false);
    }, 120);
  }, [colorCount, colors, harmony, historyIndex, history]);

  // Spacebar keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !exportOpen) {
        const activeTag = (document.activeElement as HTMLElement)?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, exportOpen]);

  // Lock toggle for individual color column
  const toggleLock = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setColors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], locked: !next[index].locked };
      return next;
    });
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setColors(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setColors(next);
    }
  };

  // Copy Single HEX
  const handleCopySingle = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1200);
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  // Color Count Change Handler
  const handleCountChange = (count: number) => {
    setColorCount(count);
    const newColors = generatePalette(count, colors, harmony, baseColor);
    setColors(newColors);
    pushToHistory(newColors);
    if (selectedColorIdx >= count) {
      setSelectedColorIdx(count - 1);
    }
  };

  // Harmony Mode Change Handler
  const handleHarmonyChange = (mode: HarmonyMode) => {
    setHarmony(mode);
    const newColors = generatePalette(colorCount, colors, mode, baseColor);
    setColors(newColors);
    pushToHistory(newColors);
  };

  // Save Palette
  const handleSavePalette = () => {
    const title = `${colors[0]?.name || 'Studio'} & ${colors[1]?.name || 'Gamut'}`;
    const hexHash = colors.map((c) => c.hex.replace('#', '').toLowerCase()).join('-');
    const canonicalSlug = `gen-pal-${hexHash}`;
    const paletteId = canonicalSlug;
    const preview = colors.map((c) => c.hex).join(',');

    saveItem({
      id: paletteId,
      type: 'palette',
      title,
      slug: canonicalSlug,
      preview,
      metadata: `${colors.length} Colors • ${harmony.toUpperCase()}`,
    });

    addPalette({
      id: paletteId,
      slug: canonicalSlug,
      title,
      category: 'Studio Generator',
      description: `Generated dynamic ${harmony} color system with ${colors.length} chromatic steps.`,
      colors: colors.map((c, i) => ({
        name: c.name,
        hex: c.hex,
        role:
          i === 0
            ? 'Background Anchor'
            : i === 1
            ? 'Primary Dominant'
            : i === 2
            ? 'Accent Focus'
            : 'Surface / Highlight',
      })),
      tags: ['generator', harmony],
    });

    showToast('Saved palette to studio library', title);
  };

  const currentSlug = `gen-pal-${colors.map((c) => c.hex.replace('#', '').toLowerCase()).join('-')}`;
  const isCurrentSaved = isSaved(currentSlug);

  // Active Selected Color
  const activeColor = colors[selectedColorIdx] || colors[0] || { hex: '#00AEEF', name: 'Blue', locked: false, id: '1' };
  const activeRgb = hexToRgb(activeColor.hex);
  const activeHsl = hexToHsl(activeColor.hex);
  const activeOklch = hexToOklch(activeColor.hex);

  // Contrast Intelligence Calculation
  const paletteContrast = useMemo(() => {
    if (colors.length < 2) return { ratio: 21, label: 'AAA READY', isPass: true };
    const sorted = [...colors].sort((a, b) => {
      const rgbA = hexToRgb(a.hex) || { r: 0, g: 0, b: 0 };
      const rgbB = hexToRgb(b.hex) || { r: 0, g: 0, b: 0 };
      return getLuminance(rgbA.r, rgbA.g, rgbA.b) - getLuminance(rgbB.r, rgbB.g, rgbB.b);
    });
    const darkest = sorted[0]?.hex || '#000000';
    const lightest = sorted[sorted.length - 1]?.hex || '#FFFFFF';
    const ratio = getContrastRatio(darkest, lightest);
    let label = 'NEEDS ADJUSTMENT';
    let isPass = false;
    if (ratio >= 7.0) {
      label = 'AAA READY';
      isPass = true;
    } else if (ratio >= 4.5) {
      label = 'AA READY';
      isPass = true;
    }
    return { ratio, label, isPass };
  }, [colors]);

  // Palette Variations (6 authentic algorithmic variations)
  const variations = useMemo(() => {
    const seed = baseColor || colors[0]?.hex || '#00AEEF';
    const modes: { label: string; mode: HarmonyMode }[] = [
      { label: 'Curated', mode: 'curated' },
      { label: 'Analogous', mode: 'analogous' },
      { label: 'Complementary', mode: 'complementary' },
      { label: 'Triadic', mode: 'triadic' },
      { label: 'Split-Comp', mode: 'splitComplementary' },
      { label: 'Monochromatic', mode: 'monochromatic' },
    ];

    return modes.map((m) => ({
      label: m.label,
      mode: m.mode,
      palette: generatePalette(colorCount, [], m.mode, seed),
    }));
  }, [baseColor, colors, colorCount]);

  const applyVariation = (varColors: GeneratorColor[]) => {
    setColors(varColors);
    pushToHistory(varColors);
    showToast('Applied palette variation');
  };

  const webAppSchema = generateWebApplicationSchema({
    name: 'KROMA Palette Generator',
    applicationCategory: 'DesignApplication',
    url: '/palette-generator',
    description: 'A color-first creative instrument for generating harmonic color systems with spacebar generation, tactile locks, and token export.',
  });

  return (
    <div className="generator-page">
      <SEOHead
        title="Palette Generator — Color Laboratory | KROMA"
        description="A generative color instrument. Generate, observe, adjust, and export dynamic color systems built around harmonic relationships."
        canonicalPath="/palette-generator"
        jsonLd={webAppSchema}
      />

      {/* ── 1. Minimal Editorial Breadcrumb ─────────────────────── */}
      <nav aria-label="Breadcrumb" className="generator-breadcrumb">
        <button
          onClick={() => onNavigate({ path: 'home' })}
          className="generator-breadcrumb__link"
        >
          HOME
        </button>
        <span className="generator-breadcrumb__separator">/</span>
        <button
          onClick={() => onNavigate({ path: 'create' })}
          className="generator-breadcrumb__link"
        >
          STUDIO
        </button>
        <span className="generator-breadcrumb__separator">/</span>
        <span className="generator-breadcrumb__current">PALETTE GENERATOR</span>
      </nav>

      {/* ── 2. Compact Editorial Intro ─────────────────────────── */}
      <header className="generator-intro">
        <div className="generator-intro__eyebrow">
          <span className="generator-intro__eyebrow-dot" />
          <span>COLOR LABORATORY</span>
          <span className="text-[var(--text-tertiary)]">•</span>
          <span>{colorCount} COLORS</span>
          <span className="text-[var(--text-tertiary)]">•</span>
          <span>{harmony.toUpperCase()}</span>
        </div>

        <h1 className="generator-intro__title">
          MAKE A COLOR SYSTEM.
        </h1>

        <p className="generator-intro__lead">
          Generate, refine and save palettes built around color relationships.
        </p>
      </header>

      {/* ── 3. Main Palette Canvas (Hero) ───────────────────────── */}
      <section className="generator-canvas-wrapper" aria-label="Live Palette Canvas">
        <div
          className="generator-canvas"
          style={{
            opacity: isGenerating ? 0.75 : 1,
            transform: isGenerating ? 'scale(0.998)' : 'scale(1)',
          }}
        >
          {colors.map((color, idx) => {
            const isSelected = selectedColorIdx === idx;
            const textColor = getTextColorForBackground(color.hex);
            const isWhiteText = textColor === '#FFFFFF';

            return (
              <div
                key={color.id || idx}
                onClick={() => {
                  setSelectedColorIdx(idx);
                  handleCopySingle(color.hex, color.name);
                }}
                className="generator-color-column"
                style={{
                  backgroundColor: color.hex,
                  color: textColor,
                  outline: isSelected ? '2px solid rgba(0,0,0,0.4)' : 'none',
                  outlineOffset: '-2px',
                }}
                title="Click to inspect & copy HEX"
              >
                {/* Column Header: Index & Lock Button */}
                <div className="generator-column-header">
                  <span className="generator-column-num">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <button
                    onClick={(e) => toggleLock(idx, e)}
                    className={`generator-lock-btn ${color.locked ? 'generator-lock-btn--active' : ''}`}
                    aria-label={color.locked ? `Unlock ${color.hex}` : `Lock ${color.hex}`}
                    title={color.locked ? 'Unlock swatch' : 'Lock swatch'}
                  >
                    {color.locked ? <Lock size={13} /> : <Unlock size={13} className="opacity-70" />}
                  </button>
                </div>

                {/* Column Footer: Color Name, HEX, and Copy Indicator */}
                <div className="generator-column-footer">
                  <div
                    className="generator-column-name"
                    style={{
                      textShadow: isWhiteText
                        ? '0 1px 3px rgba(0,0,0,0.5)'
                        : '0 1px 2px rgba(255,255,255,0.4)',
                    }}
                  >
                    {color.name}
                  </div>

                  <div className="generator-column-hex-row">
                    <span
                      className="generator-column-hex"
                      style={{
                        textShadow: isWhiteText
                          ? '0 1px 3px rgba(0,0,0,0.5)'
                          : '0 1px 2px rgba(255,255,255,0.4)',
                      }}
                    >
                      {color.hex}
                    </span>

                    <span
                      className={`generator-column-copy-badge ${
                        copiedHex === color.hex ? 'generator-column-copy-badge--copied' : ''
                      }`}
                    >
                      {copiedHex === color.hex ? 'COPIED' : 'COPY'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Generation Toolbar (Actions) ─────────────────────── */}
      <div className="generator-toolbar">
        <div className="generator-toolbar-left">
          {/* Primary Action Button */}
          <button
            onClick={handleGenerate}
            className="generator-primary-btn"
            title="Press Spacebar to Generate"
          >
            <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
            <span>GENERATE</span>
          </button>

          <span className="generator-shortcut-hint">
            (SPACEBAR)
          </span>

          {/* Randomize Button */}
          <button
            onClick={handleRandomize}
            className="generator-btn-subtle"
            title="Generate random anchor palette"
          >
            <Sparkles size={13} />
            <span>RANDOMIZE</span>
          </button>
        </div>

        <div className="generator-toolbar-right">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="generator-btn-subtle p-2"
            aria-label="Undo palette state"
            title="Undo"
          >
            <RotateCcw size={13} />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="generator-btn-subtle p-2"
            aria-label="Redo palette state"
            title="Redo"
          >
            <RotateCw size={13} />
          </button>

          {/* Save Palette */}
          <button
            onClick={handleSavePalette}
            className="generator-btn-subtle"
            title="Save to Studio Library"
          >
            <Bookmark size={13} />
            <span>{isCurrentSaved ? 'SAVED' : 'SAVE PALETTE'}</span>
          </button>

          {/* Export */}
          <button
            onClick={() => setExportOpen(true)}
            className="generator-btn-subtle"
            title="Export Palette Code"
          >
            <Code size={13} />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* ── 5. Generation Control Instruments ───────────────────── */}
      <section className="generator-controls-section" aria-label="Generation Controls">
        <div className="generator-controls-grid">
          {/* Control 1: Base Color */}
          <div className="generator-instrument">
            <div className="generator-instrument__header">
              <span className="generator-instrument__label">BASE COLOR</span>
              <span className="generator-instrument__value">SEED</span>
            </div>

            <div className="generator-base-color-box">
              <div
                className="generator-base-color-preview"
                style={{ backgroundColor: baseColor }}
              >
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => {
                    const hex = e.target.value.toUpperCase();
                    setBaseColor(hex);
                    const newPal = generatePalette(colorCount, colors, harmony, hex);
                    setColors(newPal);
                    pushToHistory(newPal);
                  }}
                  className="generator-base-color-input"
                  title="Click to pick base color"
                />
              </div>

              <div className="generator-base-color-text">
                <span className="generator-base-color-hex">{baseColor}</span>
                <span className="text-[10.5px] font-sans text-[var(--text-tertiary)] uppercase tracking-wider">
                  {findClosestColorName(baseColor)}
                </span>
              </div>
            </div>

            <p className="text-[11.5px] text-[var(--text-secondary)] m-0 leading-relaxed">
              Acts as chromatic anchor for harmonic distributions.
            </p>
          </div>

          {/* Control 2: Color Harmony */}
          <div className="generator-instrument">
            <div className="generator-instrument__header">
              <span className="generator-instrument__label">HARMONY SYSTEM</span>
              <span className="generator-instrument__value">{harmony.toUpperCase()}</span>
            </div>

            <div className="generator-harmony-grid">
              {(
                [
                  { id: 'curated', label: 'Curated', dots: 5 },
                  { id: 'analogous', label: 'Analogous', dots: 4 },
                  { id: 'complementary', label: 'Complementary', dots: 2 },
                  { id: 'triadic', label: 'Triadic', dots: 3 },
                  { id: 'splitComplementary', label: 'Split-Comp', dots: 3 },
                  { id: 'monochromatic', label: 'Monochrome', dots: 5 },
                ] as { id: HarmonyMode; label: string; dots: number }[]
              ).map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleHarmonyChange(h.id)}
                  className={`generator-harmony-btn ${
                    harmony === h.id ? 'generator-harmony-btn--active' : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="generator-harmony-name">{h.label}</span>
                    <div className="generator-harmony-dots">
                      {Array.from({ length: h.dots }).map((_, i) => (
                        <span key={i} className="generator-harmony-dot" />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Control 3: Colors Count & Contrast Intelligence */}
          <div className="generator-instrument">
            <div className="generator-instrument__header">
              <span className="generator-instrument__label">PALETTE SIZE</span>
              <span className="generator-instrument__value">{colorCount} STEPS</span>
            </div>

            <div className="generator-count-row">
              {[3, 4, 5, 6, 7].map((count) => (
                <button
                  key={count}
                  onClick={() => handleCountChange(count)}
                  className={`generator-count-btn ${
                    colorCount === count ? 'generator-count-btn--active' : ''
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            {/* Accessibility Intelligence Summary */}
            <div className="generator-contrast-status mt-2">
              <div className="flex items-center gap-2">
                {paletteContrast.isPass ? (
                  <CheckCircle2 size={13} className="text-[#34C759]" />
                ) : (
                  <AlertCircle size={13} className="text-[#FF9500]" />
                )}
                <span className="font-mono text-[11px] font-bold text-[var(--text-primary)]">
                  {paletteContrast.label}
                </span>
              </div>
              <span className="font-mono text-[10.5px] text-[var(--text-secondary)]">
                {paletteContrast.ratio}:1 MAX
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Palette Variations ("EXPLORE VARIATIONS") ─────────── */}
      <section className="generator-variations-section" aria-label="Palette Variations">
        <div className="generator-section-header">
          <div>
            <h2 className="generator-section-title">EXPLORE VARIATIONS</h2>
            <p className="generator-section-desc">
              Alternative harmonic compositions derived from the current chromatic seed.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
            6 DERIVATIONS
          </span>
        </div>

        <div className="generator-variations-grid">
          {variations.map((v, i) => (
            <div
              key={i}
              onClick={() => applyVariation(v.palette)}
              className="generator-variation-card"
              title={`Apply ${v.label} variation`}
            >
              <div className="generator-variation-strip">
                {v.palette.map((c, ci) => (
                  <div
                    key={ci}
                    className="generator-variation-bar"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <div className="generator-variation-label">{v.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Color Refinement & Detailed Specs ─────────────────── */}
      <section className="generator-details-section" aria-label="Color Refinement">
        <div className="generator-section-header">
          <div>
            <h2 className="generator-section-title">COLOR REFINEMENT</h2>
            <p className="generator-section-desc">
              Active specimen inspection with RGB, OKLCH, and photometric analysis.
            </p>
          </div>
        </div>

        <div className="generator-details-box">
          <div
            className="generator-detail-swatch"
            style={{ backgroundColor: activeColor.hex }}
          />

          <div className="generator-detail-specs">
            <div className="generator-spec-item">
              <span className="generator-spec-label">NAME</span>
              <span className="generator-spec-val truncate">{activeColor.name}</span>
            </div>

            <div className="generator-spec-item">
              <span className="generator-spec-label">HEX</span>
              <span className="generator-spec-val">{activeColor.hex}</span>
            </div>

            <div className="generator-spec-item">
              <span className="generator-spec-label">RGB</span>
              <span className="generator-spec-val">
                {activeRgb ? `${activeRgb.r}, ${activeRgb.g}, ${activeRgb.b}` : '—'}
              </span>
            </div>

            <div className="generator-spec-item">
              <span className="generator-spec-label">OKLCH</span>
              <span className="generator-spec-val truncate">{activeOklch}</span>
            </div>
          </div>

          <button
            onClick={() => handleCopySingle(activeColor.hex, activeColor.name)}
            className="generator-btn-subtle text-xs"
          >
            <Copy size={12} />
            <span>{copiedHex === activeColor.hex ? 'COPIED' : 'COPY SPEC'}</span>
          </button>
        </div>
      </section>

      {/* ── 8. Export Modal ─────────────────────────────────────── */}
      {exportOpen && (
        <div
          className="generator-modal-backdrop"
          onClick={() => setExportOpen(false)}
        >
          <div
            className="generator-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                EXPORT SYSTEM TOKENS
              </span>
              <button
                onClick={() => setExportOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
                aria-label="Close export modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="generator-modal-tabs">
              {(['css', 'tailwind', 'json', 'hex'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`generator-modal-tab ${
                    exportFormat === fmt ? 'generator-modal-tab--active' : ''
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <pre className="p-4 bg-black/20 border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)] rounded-xs overflow-x-auto max-h-56">
              {formatPaletteExport(colors, exportFormat)}
            </pre>

            <button
              onClick={async () => {
                const code = formatPaletteExport(colors, exportFormat);
                await copyToClipboard(code);
                showToast(`Copied ${exportFormat.toUpperCase()} tokens`);
                setExportOpen(false);
              }}
              className="generator-primary-btn w-full justify-center"
            >
              <Copy size={13} />
              <span>COPY CODE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
