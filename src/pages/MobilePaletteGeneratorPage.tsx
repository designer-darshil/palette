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
import { KromaButton } from '../components/common/KromaButton';

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
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-8 pb-24 text-[var(--text-primary)]">
      <SEOHead
        title="Palette Generator — Color Laboratory | KROMA"
        description="A generative color instrument. Generate, observe, adjust, and export dynamic color systems built around harmonic relationships."
        canonicalPath="/palette-generator"
        jsonLd={webAppSchema}
      />

      {/* ── 1. Minimal Editorial Breadcrumb ─────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-sans text-[11.5px] font-medium tracking-wider uppercase mb-6">
        <KromaButton
          variant="ghost"
          size="sm"
          onClick={() => onNavigate({ path: 'home' })}
          className="text-kroma-muted hover:text-kroma-text dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit h-auto"
        >
          HOME
        </KromaButton>
        <span className="text-black/25 dark:text-white/25 font-light">/</span>
        <KromaButton
          variant="ghost"
          size="sm"
          onClick={() => onNavigate({ path: 'create' })}
          className="text-kroma-muted hover:text-kroma-text dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit h-auto"
        >
          STUDIO
        </KromaButton>
        <span className="text-black/25 dark:text-white/25 font-light">/</span>
        <span className="text-kroma-text dark:text-white font-semibold">PALETTE GENERATOR</span>
      </nav>

      {/* ── 2. Compact Editorial Intro ─────────────────────────── */}
      <header className="mb-8 flex flex-col gap-2">
        <div className="font-mono text-[11px] font-semibold tracking-widest uppercase text-kroma-muted dark:text-[#8E8E93] flex items-center gap-2 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-xs bg-[#BFA3F0]" />
          <span>COLOR LABORATORY</span>
          <span className="text-[var(--text-tertiary)]">•</span>
          <span>{colorCount} COLORS</span>
          <span className="text-[var(--text-tertiary)]">•</span>
          <span>{harmony.toUpperCase()}</span>
        </div>

        <h1 className="font-sans font-medium text-[clamp(36px,6vw,84px)] leading-[0.9] tracking-[-0.05em] text-kroma-text dark:text-white uppercase select-none my-0">
          MAKE A COLOR SYSTEM.
        </h1>

        <p className="font-sans text-[clamp(15px,1.4vw,18px)] leading-relaxed text-kroma-muted dark:text-[#8E8E93] max-w-[580px] mb-2 tracking-tight">
          Generate, refine and save palettes built around color relationships.
        </p>
      </header>

      {/* ── 3. Main Palette Canvas (Hero) ───────────────────────── */}
      <section className="w-full mb-8" aria-label="Live Palette Canvas">
        <div
          className="w-full h-[460px] sm:h-[520px] rounded-sm overflow-hidden flex flex-col sm:flex-row border border-black/[0.08] dark:border-white/10 shadow-xs transition-transform duration-150"
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
                className="flex-1 flex flex-col justify-between p-4 sm:p-6 cursor-pointer transition-all duration-200 relative group hover:flex-[1.35]"
                style={{
                  backgroundColor: color.hex,
                  color: textColor,
                  outline: isSelected ? '2px solid rgba(0,0,0,0.4)' : 'none',
                  outlineOffset: '-2px',
                }}
                title="Click to inspect & copy HEX"
              >
                {/* Column Header: Index & Lock Button */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold opacity-80 select-none">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <KromaButton
                    variant="ghost"
                    size="icon"
                    onClick={(e) => toggleLock(idx, e)}
                    className={`p-1.5 rounded-xs bg-black/20 hover:bg-black/35 backdrop-blur-xs text-white border border-white/20 cursor-pointer transition-all active:scale-95 h-auto w-auto min-h-0 ${
                      color.locked ? 'bg-black/50! border-white/40!' : ''
                    }`}
                    aria-label={color.locked ? `Unlock ${color.hex}` : `Lock ${color.hex}`}
                    title={color.locked ? 'Unlock swatch' : 'Lock swatch'}
                  >
                    {color.locked ? <Lock size={13} /> : <Unlock size={13} className="opacity-70" />}
                  </KromaButton>
                </div>

                {/* Column Footer: Color Name, HEX, and Copy Indicator */}
                <div className="flex flex-col gap-1 select-none">
                  <div
                    className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider truncate"
                    style={{
                      textShadow: isWhiteText
                        ? '0 1px 3px rgba(0,0,0,0.5)'
                        : '0 1px 2px rgba(255,255,255,0.4)',
                    }}
                  >
                    {color.name}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono text-xs sm:text-sm font-bold tracking-wider"
                      style={{
                        textShadow: isWhiteText
                          ? '0 1px 3px rgba(0,0,0,0.5)'
                          : '0 1px 2px rgba(255,255,255,0.4)',
                      }}
                    >
                      {color.hex}
                    </span>

                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-black/25 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity ${
                        copiedHex === color.hex ? 'opacity-100 bg-[#34C759]! border-[#34C759]!' : ''
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
      <div className="flex items-center justify-between gap-4 flex-wrap mb-12 p-3 bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Primary Action Button */}
          <KromaButton
            variant="filled"
            size="md"
            onClick={handleGenerate}
            iconLeft={<RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />}
            className="rounded-xs px-5 py-2 font-sans text-xs font-bold tracking-wider uppercase active:scale-98"
            title="Press Spacebar to Generate"
          >
            GENERATE
          </KromaButton>

          <span className="font-mono text-[11px] text-kroma-muted dark:text-[#8E8E93] hidden md:inline">
            (SPACEBAR)
          </span>

          {/* Randomize Button */}
          <KromaButton
            variant="outline"
            size="sm"
            onClick={handleRandomize}
            iconLeft={<Sparkles size={13} />}
            className="rounded-xs px-3 py-1.5 font-sans text-xs font-semibold tracking-wider"
            title="Generate random anchor palette"
          >
            RANDOMIZE
          </KromaButton>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Undo / Redo */}
          <KromaButton
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xs font-sans text-xs"
            aria-label="Undo palette state"
            title="Undo"
          >
            <RotateCcw size={13} />
          </KromaButton>

          <KromaButton
            variant="outline"
            size="icon"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xs font-sans text-xs"
            aria-label="Redo palette state"
            title="Redo"
          >
            <RotateCw size={13} />
          </KromaButton>

          {/* Save Palette */}
          <KromaButton
            variant="outline"
            size="sm"
            onClick={handleSavePalette}
            iconLeft={<Bookmark size={13} />}
            className="rounded-xs px-3 py-1.5 font-sans text-xs font-semibold tracking-wider"
            title="Save to Studio Library"
          >
            {isCurrentSaved ? 'SAVED' : 'SAVE PALETTE'}
          </KromaButton>

          {/* Export */}
          <KromaButton
            variant="outline"
            size="sm"
            onClick={() => setExportOpen(true)}
            iconLeft={<Code size={13} />}
            className="rounded-xs px-3 py-1.5 font-sans text-xs font-semibold tracking-wider"
            title="Export Palette Code"
          >
            EXPORT
          </KromaButton>
        </div>
      </div>

      {/* ── 5. Generation Control Instruments ───────────────────── */}
      <section className="mb-12" aria-label="Generation Controls">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Control 1: Base Color */}
          <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between font-mono text-[10.5px] font-bold uppercase border-b border-black/[0.06] dark:border-white/[0.06] pb-2 text-kroma-muted dark:text-[#8E8E93]">
              <span className="tracking-wider">BASE COLOR</span>
              <span className="text-kroma-text dark:text-white font-bold">SEED</span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xs border border-black/15 flex-shrink-0 relative overflow-hidden"
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
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Click to pick base color"
                />
              </div>

              <div className="flex flex-col">
                <span className="font-mono text-sm font-bold text-kroma-text dark:text-white">{baseColor}</span>
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
          <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between font-mono text-[10.5px] font-bold uppercase border-b border-black/[0.06] dark:border-white/[0.06] pb-2 text-kroma-muted dark:text-[#8E8E93]">
              <span className="tracking-wider">HARMONY SYSTEM</span>
              <span className="text-kroma-text dark:text-white font-bold">{harmony.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
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
                <KromaButton
                  key={h.id}
                  variant={harmony === h.id ? 'filled' : 'outline'}
                  size="sm"
                  onClick={() => handleHarmonyChange(h.id)}
                  className={`p-2 font-mono text-[11px] uppercase rounded-xs border transition-colors cursor-pointer flex items-center justify-between w-full h-auto ${
                    harmony === h.id
                      ? 'border-kroma-text dark:border-white font-bold bg-black/[0.06] dark:bg-white/[0.1] text-kroma-text dark:text-white'
                      : 'border-black/10 dark:border-white/10 text-kroma-muted hover:text-kroma-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium truncate">{h.label}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: h.dots }).map((_, i) => (
                        <span key={i} className="w-1 h-1 rounded-full bg-current opacity-60" />
                      ))}
                    </div>
                  </div>
                </KromaButton>
              ))}
            </div>
          </div>

          {/* Control 3: Colors Count & Contrast Intelligence */}
          <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between font-mono text-[10.5px] font-bold uppercase border-b border-black/[0.06] dark:border-white/[0.06] pb-2 text-kroma-muted dark:text-[#8E8E93]">
              <span className="tracking-wider">PALETTE SIZE</span>
              <span className="text-kroma-text dark:text-white font-bold">{colorCount} STEPS</span>
            </div>

            <div className="flex gap-1.5">
              {[3, 4, 5, 6, 7].map((count) => (
                <KromaButton
                  key={count}
                  variant={colorCount === count ? 'filled' : 'outline'}
                  size="sm"
                  onClick={() => handleCountChange(count)}
                  className={`flex-1 py-1.5 font-mono text-xs uppercase border rounded-xs transition-colors cursor-pointer h-auto ${
                    colorCount === count
                      ? 'border-kroma-text! dark:border-white! font-bold! bg-kroma-text! text-white! dark:bg-white! dark:text-kroma-text!'
                      : 'border-black/15 dark:border-white/15 text-kroma-muted hover:text-kroma-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {count}
                </KromaButton>
              ))}
            </div>

            {/* Accessibility Intelligence Summary */}
            <div className="flex items-center justify-between p-2 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] mt-2">
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
      <section className="mb-12" aria-label="Palette Variations">
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-kroma-text dark:text-white uppercase my-0">EXPLORE VARIATIONS</h2>
            <p className="font-sans text-sm text-kroma-muted dark:text-[#8E8E93] max-w-[560px] my-1">
              Alternative harmonic compositions derived from the current chromatic seed.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
            6 DERIVATIONS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {variations.map((v, i) => (
            <div
              key={i}
              onClick={() => applyVariation(v.palette)}
              className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm p-2 cursor-pointer hover:border-black/25 dark:hover:border-white/25 transition-all flex flex-col gap-2"
              title={`Apply ${v.label} variation`}
            >
              <div className="flex h-10 rounded-xs overflow-hidden border border-black/10 dark:border-white/10">
                {v.palette.map((c, ci) => (
                  <div
                    key={ci}
                    className="flex-1 h-full"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <div className="font-mono text-[10px] font-bold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider text-center">{v.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Color Refinement & Detailed Specs ─────────────────── */}
      <section className="mb-12" aria-label="Color Refinement">
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-kroma-text dark:text-white uppercase my-0">COLOR REFINEMENT</h2>
            <p className="font-sans text-sm text-kroma-muted dark:text-[#8E8E93] max-w-[560px] my-1">
              Active specimen inspection with RGB, OKLCH, and photometric analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm flex-wrap gap-4">
          <div
            className="w-12 h-12 rounded-xs border border-black/15 flex-shrink-0"
            style={{ backgroundColor: activeColor.hex }}
          />

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] font-bold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider">NAME</span>
              <span className="font-mono text-xs font-bold text-kroma-text dark:text-white truncate">{activeColor.name}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] font-bold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider">HEX</span>
              <span className="font-mono text-xs font-bold text-kroma-text dark:text-white">{activeColor.hex}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] font-bold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider">RGB</span>
              <span className="font-mono text-xs font-bold text-kroma-text dark:text-white">
                {activeRgb ? `${activeRgb.r}, ${activeRgb.g}, ${activeRgb.b}` : '—'}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] font-bold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider">OKLCH</span>
              <span className="font-mono text-xs font-bold text-kroma-text dark:text-white truncate">{activeOklch}</span>
            </div>
          </div>

          <KromaButton
            variant="outline"
            size="sm"
            onClick={() => handleCopySingle(activeColor.hex, activeColor.name)}
            iconLeft={<Copy size={12} />}
            className="rounded-xs px-3 py-1.5 font-sans text-xs font-semibold tracking-wider text-kroma-text dark:text-white"
          >
            {copiedHex === activeColor.hex ? 'COPIED' : 'COPY SPEC'}
          </KromaButton>
        </div>
      </section>

      {/* ── 8. Export Modal ─────────────────────────────────────── */}
      {exportOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setExportOpen(false)}
        >
          <div
            className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm p-6 w-full max-w-lg flex flex-col gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                EXPORT SYSTEM TOKENS
              </span>
              <KromaButton
                variant="ghost"
                size="icon"
                onClick={() => setExportOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer h-auto w-auto min-h-0"
                aria-label="Close export modal"
              >
                <X size={16} />
              </KromaButton>
            </div>

            <div className="flex gap-2">
              {(['css', 'tailwind', 'json', 'hex'] as const).map((fmt) => (
                <KromaButton
                  key={fmt}
                  variant={exportFormat === fmt ? 'filled' : 'outline'}
                  size="sm"
                  onClick={() => setExportFormat(fmt)}
                  className={`flex-1 py-1.5 font-mono text-xs uppercase border rounded-xs transition-colors cursor-pointer h-auto ${
                    exportFormat === fmt
                      ? 'border-kroma-text! dark:border-white! font-bold! bg-kroma-text! text-white! dark:bg-white! dark:text-kroma-text!'
                      : 'border-black/15 dark:border-white/15 text-kroma-muted hover:text-kroma-text dark:hover:text-white'
                  }`}
                >
                  {fmt}
                </KromaButton>
              ))}
            </div>

            <pre className="p-4 bg-black/20 border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)] rounded-xs overflow-x-auto max-h-56">
              {formatPaletteExport(colors, exportFormat)}
            </pre>

            <KromaButton
              variant="filled"
              size="md"
              onClick={async () => {
                const code = formatPaletteExport(colors, exportFormat);
                await copyToClipboard(code);
                showToast(`Copied ${exportFormat.toUpperCase()} tokens`);
                setExportOpen(false);
              }}
              iconLeft={<Copy size={13} />}
              className="rounded-xs px-5 py-2.5 font-sans text-xs font-bold tracking-wider uppercase w-full"
            >
              COPY CODE
            </KromaButton>
          </div>
        </div>
      )}
    </div>
  );
};
