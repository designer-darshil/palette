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

type MoodMode = 'energetic' | 'calm' | 'dark' | 'vivid';

export const MobilePaletteGeneratorPage: React.FC<MobilePaletteGeneratorProps> = ({
  initialColorsQuery,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved } = useSaved();
  const { addPalette } = useLibraryData();

  // Palette Configuration State
  const [colorCount, setColorCount] = useState<number>(5);
  const [harmony, setHarmony] = useState<HarmonyMode>('curated');
  const [mood, setMood] = useState<MoodMode>('vivid');
  const [baseColor, setBaseColor] = useState<string>('');

  // Palette Colors State
  const [colors, setColors] = useState<GeneratorColor[]>(() => {
    if (initialColorsQuery) {
      const delimiter = initialColorsQuery.includes(',') ? ',' : '-';
      const hexList = initialColorsQuery
        .split(delimiter)
        .map((h) => h.trim())
        .filter((h) => h.length >= 3 && h.length <= 7)
        .map((h) => (h.startsWith('#') ? h : `#${h}`));

      if (hexList.length >= 2 && hexList.length <= 12) {
        return hexList.map((hex, i) => ({
          id: `init-${i}-${Date.now()}`,
          hex: hex.toUpperCase(),
          name: findClosestColorName(hex),
          locked: false,
        }));
      }
    }
    return generatePalette(5, [], 'curated');
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

  // Generate action with smooth chromatic transition (no spinner)
  const handleGenerate = useCallback(() => {
    let modeToUse = harmony;
    if (mood === 'calm' && harmony === 'curated') modeToUse = 'analogous';
    if (mood === 'energetic' && harmony === 'curated') modeToUse = 'triadic';
    if (mood === 'dark' && harmony === 'curated') modeToUse = 'monochromatic';

    const newColors = generatePalette(colorCount, colors, modeToUse, baseColor || undefined);
    setColors(newColors);
    pushToHistory(newColors);
  }, [colorCount, colors, harmony, mood, baseColor, historyIndex, history]);

  // Keyboard shortcut (Spacebar to generate)
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

  // Save Palette
  const handleSavePalette = () => {
    const title = `${colors[0].name} & ${colors[1]?.name || 'Gamut'} Laboratory`;
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
      metadata: `${colors.length} Colors • ${harmony.toUpperCase()} System`,
    });

    addPalette({
      id: paletteId,
      slug: canonicalSlug,
      title,
      category: 'Curated Generation',
      description: `Generated dynamic ${harmony} balance system with ${colors.length} chromatic steps.`,
      colors: colors.map((c, i) => ({
        name: c.name,
        hex: c.hex,
        role: i === 0 ? 'Background Anchor' : i === 1 ? 'Primary Dominant' : i === 2 ? 'Accent Focus' : 'Surface / Highlight',
      })),
      tags: ['generator', harmony, mood],
    });

    showToast('Saved palette to studio collection', title);
  };

  const currentSlug = `gen-pal-${colors.map((c) => c.hex.replace('#', '').toLowerCase()).join('-')}`;
  const isCurrentSaved = isSaved(currentSlug);

  const webAppSchema = generateWebApplicationSchema({
    name: 'KROMA Generative Color Laboratory',
    applicationCategory: 'DesignApplication',
    url: '/palette-generator',
    description: 'Real-time chromatic engine with spacebar generation, harmonic modes, and instant token export.',
  });

  return (
    <div className="w-full bg-[#171717] text-white min-h-[88vh] flex flex-col justify-between py-6 px-4 sm:px-8">
      <SEOHead
        title="Color Generator — Make Something Unexpected | KROMA"
        description="A generative color instrument. Instant chromatic transitions, tactile lock controls, and harmonic algorithms."
        canonicalPath="/palette-generator"
        jsonLd={webAppSchema}
      />

      {/* Top: Large Display */}
      <div className="max-w-7xl mx-auto w-full pt-4 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10">
        <div>
          <div className="text-[11.5px] font-sans font-semibold tracking-widest text-[#9E9E9E] uppercase mb-2">
            LIVE COLOR LABORATORY
          </div>
          <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white uppercase leading-[0.9]">
            MAKE SOMETHING UNEXPECTED.
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="font-mono text-xs text-neutral-400">
              STARTING SEED: <strong className="text-white">{baseColor || colors[0]?.hex || 'RANDOM'}</strong>
            </span>
            {baseColor && (
              <button
                onClick={() => setBaseColor('')}
                className="text-[10px] font-mono uppercase text-neutral-500 hover:text-white underline"
              >
                CLEAR SEED
              </button>
            )}
          </div>
        </div>

        {/* Large Interactive Button: [ GENERATE ↻ ] */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            className="font-sans text-sm sm:text-base font-bold tracking-wider uppercase px-8 py-4 bg-white text-[#171717] rounded-sm hover:bg-neutral-200 active:scale-95 transition-all duration-150 flex items-center gap-3 shadow-lg cursor-pointer"
            title="Press Spacebar to Generate"
          >
            <RefreshCw size={16} />
            <span>GENERATE ↻</span>
          </button>
          <span className="hidden sm:inline font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
            (OR SPACEBAR)
          </span>
        </div>
      </div>

      {/* The Palette Display: 5 Large Color Blocks filling the canvas */}
      <div
        className="max-w-7xl mx-auto w-full my-8 flex-1 min-h-[360px] sm:min-h-[460px] flex flex-col sm:flex-row rounded-sm overflow-hidden border border-white/10 shadow-2xl"
        role="region"
        aria-label="Generative Color Canvas"
      >
        {colors.map((color, idx) => {
          const textColor = getTextColorForBackground(color.hex);
          const isCopied = copiedHex === color.hex;

          return (
            <div
              key={color.id || idx}
              style={{
                backgroundColor: color.hex,
                transition: 'background-color 300ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="flex-1 relative flex flex-col justify-between p-4 sm:p-6 cursor-pointer group select-none min-h-[70px] sm:min-h-0"
              onClick={() => handleCopySingle(color.hex, color.name)}
              title="Click to copy HEX"
            >
              {/* Lock Button at Top */}
              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => toggleLock(idx, e)}
                  className="p-2 rounded-xs bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-colors"
                  title={color.locked ? 'Unlock swatch' : 'Lock swatch'}
                  aria-label={color.locked ? 'Unlock swatch' : 'Lock swatch'}
                >
                  {color.locked ? <Lock size={15} className="text-amber-300" /> : <Unlock size={15} className="opacity-60 group-hover:opacity-100" />}
                </button>

                <span
                  className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs bg-black/30 text-white backdrop-blur-md"
                >
                  0{idx + 1}
                </span>
              </div>

              {/* Hover / Active Details */}
              <div className="flex flex-col gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white uppercase tracking-wider">
                  <span>{color.hex}</span>
                  {isCopied ? (
                    <span className="text-emerald-400 text-[10px]">COPIED!</span>
                  ) : (
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="font-sans text-sm font-bold text-white tracking-tight truncate">
                  {color.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimal Controls Bar: HARMONY · MOOD · COUNT · ACTIONS */}
      <div className="max-w-7xl mx-auto w-full pt-6 border-t border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* Harmony Filter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">HARMONY:</span>
            <div className="flex items-center gap-1">
              {(['curated', 'complementary', 'analogous', 'triadic', 'splitComplementary'] as HarmonyMode[]).map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    setHarmony(h);
                    handleGenerate();
                  }}
                  className={`font-sans text-xs font-semibold uppercase px-2.5 py-1 rounded-xs transition-colors ${
                    harmony === h ? 'bg-white text-[#171717]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {h === 'splitComplementary' ? 'SPLIT' : h.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Filter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">MOOD:</span>
            <div className="flex items-center gap-1">
              {(['energetic', 'calm', 'dark', 'vivid'] as MoodMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMood(m);
                    handleGenerate();
                  }}
                  className={`font-sans text-xs font-semibold uppercase px-2.5 py-1 rounded-xs transition-colors ${
                    mood === m ? 'bg-white text-[#171717]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Count Filter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">COUNT:</span>
            <div className="flex items-center gap-1">
              {[3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => {
                    setColorCount(cnt);
                    const newPal = generatePalette(cnt, colors, harmony, baseColor || undefined);
                    setColors(newPal);
                    pushToHistory(newPal);
                  }}
                  className={`font-sans text-xs font-semibold uppercase px-2.5 py-1 rounded-xs transition-colors ${
                    colorCount === cnt ? 'bg-white text-[#171717]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls: SAVE · EXPORT · UNDO · REDO */}
        <div className="flex items-center gap-3 self-end lg:self-auto">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Redo"
          >
            <RotateCw size={16} />
          </button>
          <button
            onClick={() => setExportOpen(true)}
            className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-2 border border-neutral-700 hover:border-white text-white rounded-xs transition-colors flex items-center gap-1.5"
          >
            <Code size={13} />
            <span>EXPORT</span>
          </button>
          <button
            onClick={handleSavePalette}
            className={`font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs border transition-colors flex items-center gap-1.5 ${
              isCurrentSaved
                ? 'bg-white text-[#171717] border-white'
                : 'border-neutral-700 hover:border-white text-white'
            }`}
          >
            <Bookmark size={13} fill={isCurrentSaved ? 'currentColor' : 'none'} />
            <span>{isCurrentSaved ? 'SAVED' : 'SAVE'}</span>
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setExportOpen(false)}>
          <div className="bg-[#1C1E24] border border-white/10 rounded-sm w-full max-w-lg p-6 flex flex-col gap-4 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-sans text-lg font-bold uppercase tracking-tight">EXPORT PALETTE TOKENS</h3>
              <button onClick={() => setExportOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2">
              {(['css', 'hex', 'tailwind', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`font-mono text-xs font-bold uppercase px-3 py-1.5 rounded-xs transition-colors ${
                    exportFormat === fmt ? 'bg-white text-[#171717]' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <textarea
              readOnly
              rows={8}
              value={formatPaletteExport(colors, exportFormat)}
              className="w-full bg-[#111216] border border-neutral-800 rounded-xs p-3 font-mono text-xs text-neutral-200 select-all"
            />

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={async () => {
                  await copyToClipboard(window.location.href);
                  showToast('Palette URL copied to clipboard', 'Share link ready');
                }}
                className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2.5 border border-neutral-700 hover:border-white text-white rounded-xs transition-colors flex items-center gap-1.5"
              >
                <Share2 size={13} />
                <span>SHARE URL</span>
              </button>

              <button
                onClick={async () => {
                  const code = formatPaletteExport(colors, exportFormat);
                  const ok = await copyToClipboard(code);
                  if (ok) {
                    showToast(`Copied ${exportFormat.toUpperCase()} tokens`, 'Tokens copied');
                    setExportOpen(false);
                  }
                }}
                className="font-sans text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-white text-[#171717] hover:bg-neutral-200 rounded-xs transition-colors flex items-center gap-1.5"
              >
                <Copy size={13} />
                <span>COPY CODE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
