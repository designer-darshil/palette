import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  Unlock,
  Copy,
  Check,
  Share2,
  Bookmark,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Code,
  X,
  ArrowUpRight,
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

type MoodMode = 'vivid' | 'calm' | 'dark' | 'energetic';
type ContrastMode = 'AA' | 'AAA';

export const MobilePaletteGeneratorPage: React.FC<MobilePaletteGeneratorProps> = ({
  initialColorsQuery,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved } = useSaved();
  const { addPalette } = useLibraryData();

  // Generator Configuration
  const [colorCount, setColorCount] = useState<number>(5);
  const [mood, setMood] = useState<MoodMode>('vivid');
  const [contrast, setContrast] = useState<ContrastMode>('AA');
  const [baseColor, setBaseColor] = useState<string>('#171717');
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
    return generatePalette(5, [], 'curated', '#171717');
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

  // Generate action with smooth 500ms chromatic transition
  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    let modeToUse: HarmonyMode = 'curated';
    if (mood === 'calm') modeToUse = 'analogous';
    if (mood === 'energetic') modeToUse = 'triadic';
    if (mood === 'dark') modeToUse = 'monochromatic';

    setTimeout(() => {
      const newColors = generatePalette(colorCount, colors, modeToUse, baseColor || undefined);
      setColors(newColors);
      pushToHistory(newColors);
      setIsGenerating(false);
    }, 150);
  }, [colorCount, colors, mood, baseColor, historyIndex, history]);

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

  // Lock toggle
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
      setTimeout(() => setCopiedHex(null), 1400);
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  // Save Palette to Studio
  const handleSavePalette = () => {
    const title = `${colors[0]?.name || 'Studio'} & ${colors[1]?.name || 'Gamut'} Laboratory`;
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
      metadata: `${colors.length} Colors • ${mood.toUpperCase()} Mood`,
    });

    addPalette({
      id: paletteId,
      slug: canonicalSlug,
      title,
      category: 'Studio Generator',
      description: `Generated dynamic ${mood} balance system with ${colors.length} chromatic steps.`,
      colors: colors.map((c, i) => ({
        name: c.name,
        hex: c.hex,
        role: i === 0 ? 'Background Anchor' : i === 1 ? 'Primary Dominant' : i === 2 ? 'Accent Focus' : 'Surface / Highlight',
      })),
      tags: ['generator', mood, contrast],
    });

    showToast('Saved palette to studio collection', title);
  };

  const currentSlug = `gen-pal-${colors.map((c) => c.hex.replace('#', '').toLowerCase()).join('-')}`;
  const isCurrentSaved = isSaved(currentSlug);

  const activeColor = colors[selectedColorIdx] || colors[0];
  const activeRgb = hexToRgb(activeColor?.hex || '#171717');
  const activeHsl = hexToHsl(activeColor?.hex || '#171717');

  const webAppSchema = generateWebApplicationSchema({
    name: 'KROMA Generative Color Laboratory',
    applicationCategory: 'DesignApplication',
    url: '/palette-generator',
    description: 'Real-time chromatic engine with spacebar generation, harmonic modes, and instant token export.',
  });

  return (
    <div className="studio-page">
      <SEOHead
        title="Generator — Studio Laboratory | KROMA"
        description="A generative color laboratory. Smooth chromatic transitions, tactile lock controls, and harmonic algorithms."
        canonicalPath="/palette-generator"
        jsonLd={webAppSchema}
      />

      {/* ── Editorial Breadcrumb ────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
          <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => onNavigate({ path: 'create' })}>STUDIO</span>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold">GENERATOR</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors"
            title="Undo"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors"
            title="Redo"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={() => setExportOpen(true)}
            className="studio-btn-secondary py-1.5 px-3 text-[11px]"
          >
            <Code size={12} />
            <span>EXPORT</span>
          </button>
          <button
            onClick={handleSavePalette}
            className="studio-btn-primary py-1.5 px-3 text-[11px]"
          >
            <Bookmark size={12} />
            <span>{isCurrentSaved ? 'SAVED' : 'SAVE'}</span>
          </button>
        </div>
      </div>

      {/* ── Studio Laboratory Canvas ────────────────────────────── */}
      <div className="studio-lab-stage">
        {/* Section A: START WITH (Large starting color) */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="studio-label">START WITH</span>
            <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
              BASE SEED: {baseColor}
            </span>
          </div>

          <div
            className="studio-start-color-block border border-[var(--border-subtle)] cursor-pointer"
            style={{ backgroundColor: baseColor }}
            onClick={() => handleCopySingle(baseColor, 'Base Seed')}
            title="Click to copy base seed HEX"
          >
            <div className="flex items-center justify-between w-full text-white drop-shadow-md">
              <span className="font-mono text-sm font-bold tracking-widest">{baseColor}</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value.toUpperCase())}
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-xs border border-white/40 cursor-pointer bg-transparent"
                  title="Choose starting color"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section B: GENERATED (Large proportional study) */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="studio-label">GENERATED</span>
            <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
              {colors.length} CHROMATIC SPECIMENS
            </span>
          </div>

          <div
            className={`studio-palette-canvas border border-[var(--border-subtle)] ${isGenerating ? 'opacity-70 scale-[0.995]' : 'opacity-100 scale-100'} transition-all duration-500 ease-out`}
          >
            {colors.map((color, idx) => {
              const isSelected = selectedColorIdx === idx;
              return (
                <div
                  key={color.id || idx}
                  onClick={() => {
                    setSelectedColorIdx(idx);
                    handleCopySingle(color.hex, color.name);
                  }}
                  className={`studio-canvas-column ${isSelected ? 'selected' : ''}`}
                  style={{
                    backgroundColor: color.hex,
                    transition: 'background-color 500ms cubic-bezier(0.22, 1, 0.36, 1), flex 300ms ease',
                  }}
                  title="Click to select & copy HEX"
                >
                  <div className="flex items-center justify-between text-white drop-shadow-md">
                    <span className="font-mono text-[11px] font-bold">0{idx + 1}</span>
                    <button
                      onClick={(e) => toggleLock(idx, e)}
                      className="p-1 rounded-xs bg-black/30 hover:bg-black/60 transition-colors"
                      title={color.locked ? 'Unlock swatch' : 'Lock swatch'}
                    >
                      {color.locked ? <Lock size={13} /> : <Unlock size={13} className="opacity-60" />}
                    </button>
                  </div>

                  <div className="text-white drop-shadow-md flex flex-col gap-0.5">
                    <span className="font-sans text-xs font-semibold uppercase tracking-wider truncate">
                      {color.name}
                    </span>
                    <span className="font-mono text-sm font-bold flex items-center justify-between">
                      <span>{color.hex}</span>
                      <span className="text-[10px] font-mono opacity-0 hover:opacity-100 uppercase tracking-wider">
                        {copiedHex === color.hex ? 'COPIED' : 'COPY'}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section C: CONTROLS & GENERATE ↻ */}
        <div className="p-4 border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Control: Mood */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
                MOOD:
              </span>
              <div className="flex gap-1">
                {(['vivid', 'calm', 'dark', 'energetic'] as MoodMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-xs border transition-colors ${
                      mood === m
                        ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold'
                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Control: Contrast */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
                CONTRAST:
              </span>
              <div className="flex gap-1">
                {(['AA', 'AAA'] as ContrastMode[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setContrast(c)}
                    className={`px-2 py-1 text-[11px] font-mono uppercase tracking-wider rounded-xs border transition-colors ${
                      contrast === c
                        ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold'
                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Control: Colors Count */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
                COLORS:
              </span>
              <div className="flex gap-1">
                {[3, 4, 5, 6].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setColorCount(count);
                      setColors(generatePalette(count, colors, 'curated', baseColor));
                    }}
                    className={`w-7 h-7 flex items-center justify-center text-[11px] font-mono rounded-xs border transition-colors ${
                      colorCount === count
                        ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold'
                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GENERATE ↻ Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              className="studio-btn-primary px-8 py-3 text-sm font-bold flex items-center gap-3"
              title="Press Spacebar to Generate"
            >
              <RefreshCw size={15} className={isGenerating ? 'animate-spin' : ''} />
              <span>GENERATE ↻</span>
            </button>
            <span className="hidden lg:inline font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">
              (SPACEBAR)
            </span>
          </div>
        </div>

        {/* Section D: Active Color Detailed Readout */}
        <div className="p-4 border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xs border border-[var(--border-subtle)]"
              style={{ backgroundColor: activeColor.hex }}
            />
            <div>
              <div className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {activeColor.name}
              </div>
              <div className="font-mono text-[11px] text-[var(--text-secondary)]">
                HEX: {activeColor.hex} · RGB: {activeRgb ? `${activeRgb.r}, ${activeRgb.g}, ${activeRgb.b}` : '—'} · HSL: {activeHsl ? `${activeHsl.h}°, ${activeHsl.s}%, ${activeHsl.l}%` : '—'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopySingle(activeColor.hex, activeColor.name)}
              className="studio-btn-secondary text-xs"
            >
              <Copy size={12} />
              <span>COPY HEX</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Export Modal ───────────────────────────────────────── */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] max-w-lg w-full p-6 rounded-xs flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <span className="studio-label mb-0">EXPORT CODE</span>
              <button
                onClick={() => setExportOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-2">
              {(['css', 'tailwind', 'json', 'hex'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-xs border ${
                    exportFormat === fmt
                      ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold'
                      : 'border-transparent text-[var(--text-secondary)]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <pre className="p-4 bg-black/30 border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)] rounded-xs overflow-x-auto max-h-56">
              {formatPaletteExport(colors, exportFormat)}
            </pre>

            <button
              onClick={async () => {
                const code = formatPaletteExport(colors, exportFormat);
                await copyToClipboard(code);
                showToast(`Copied ${exportFormat.toUpperCase()} to clipboard`);
                setExportOpen(false);
              }}
              className="studio-btn-primary w-full"
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
