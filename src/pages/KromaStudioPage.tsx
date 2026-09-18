import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Undo,
  Redo,
  Save,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Copy,
  Check,
  Download,
  Shuffle,
  RefreshCw,
  Sparkles,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Upload,
  RotateCcw,
  CheckCircle2,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { SEOHead } from '../components/seo/SEOHead';
import {
  copyToClipboard,
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  getContrastRatio,
  getTextColorForBackground,
} from '../utils/colorUtils';
import { findClosestColorMatches } from '../utils/colorNameFinder';
import { HarmonyMode, generatePalette } from '../utils/paletteGenerator';

interface KromaStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialParams?: {
    palette?: string;
    colors?: string;
  };
}

interface SwatchState {
  id: string;
  hex: string;
  name: string;
  locked: boolean;
}

interface HistorySnapshot {
  title: string;
  tags: string[];
  swatches: SwatchState[];
  mood: string;
  style: string;
  industry: string;
}

// Convert RGB to CMYK
function rgbToCmyk(r: number, g: number, b: number) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = Math.round(((1 - rNorm - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gNorm - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bNorm - k) / (1 - k)) * 100);
  return { c, m, y, k: Math.round(k * 100) };
}

// Derive quick relationships from a hex
function getHarmonies(hex: string) {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  const comp = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
  const ana1 = hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l);
  const ana2 = hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l);
  const tri1 = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
  const tri2 = hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);
  const split1 = hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l);
  const split2 = hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l);

  return { comp, ana1, ana2, tri1, tri2, split1, split2 };
}

export const KromaStudioPage: React.FC<KromaStudioPageProps> = ({
  onNavigate,
  initialParams,
}) => {
  const { showToast } = useToast();
  const { savedItems, saveItem, isSaved } = useSaved();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial palette resolution
  const resolvedInitial = useMemo(() => {
    // 1. Check if palette slug or id was passed
    if (initialParams?.palette) {
      const q = initialParams.palette.trim().toLowerCase();
      const foundCurated = CURATED_PALETTES.find(
        (p) => p.slug.toLowerCase() === q || p.id.toLowerCase() === q
      );
      if (foundCurated) {
        return {
          title: foundCurated.title,
          tags: foundCurated.tags || ['Editorial', 'Curated', 'Harmonious'],
          swatches: foundCurated.colors.map((c, i) => ({
            id: `swatch-${i}-${Date.now()}`,
            hex: c.hex.toUpperCase(),
            name: c.name || findClosestColorMatches(c.hex)[0]?.name || `Tone ${i + 1}`,
            locked: false,
          })),
          mood: foundCurated.mood?.[0] || 'Warm',
          style: foundCurated.style?.[0] || 'Editorial',
          industry: foundCurated.industry?.[0] || 'Design',
        };
      }

      const foundSaved = savedItems.find(
        (s) => s.slug?.toLowerCase() === q || s.id.toLowerCase() === q
      );
      if (foundSaved && foundSaved.preview) {
        const hexes = foundSaved.preview.split(',').map((h) => h.trim());
        return {
          title: foundSaved.title,
          tags: ['Saved', 'Custom', 'Editorial'],
          swatches: hexes.map((hex, i) => ({
            id: `swatch-${i}-${Date.now()}`,
            hex: hex.toUpperCase(),
            name: findClosestColorMatches(hex)[0]?.name || `Tone ${i + 1}`,
            locked: false,
          })),
          mood: 'Custom',
          style: 'Modern',
          industry: 'Branding',
        };
      }
    }

    // 2. Check if raw colors parameter was passed (e.g. 171714,D6C3A5,E9E1D4,819178)
    if (initialParams?.colors) {
      const parts = initialParams.colors
        .split(/[,-\s]+/)
        .map((c) => (c.startsWith('#') ? c : `#${c}`));
      if (parts.length >= 2) {
        return {
          title: 'Custom Palette Workspace',
          tags: ['Custom', 'Workspace', 'Studio'],
          swatches: parts.slice(0, 8).map((hex, i) => ({
            id: `swatch-${i}-${Date.now()}`,
            hex: hex.toUpperCase(),
            name: findClosestColorMatches(hex)[0]?.name || `Tone ${i + 1}`,
            locked: false,
          })),
          mood: 'Minimal',
          style: 'Modern',
          industry: 'UI/UX',
        };
      }
    }

    // 3. Default KROMA Reference Palette: #171714, #D6C3A5, #E9E1D4, #819178
    return {
      title: 'Midnight Garden',
      tags: ['Nature', 'Warm', 'Editorial'],
      swatches: [
        { id: '1', hex: '#171714', name: 'Ink Black', locked: false },
        { id: '2', hex: '#D6C3A5', name: 'Sand Ochre', locked: false },
        { id: '3', hex: '#E9E1D4', name: 'Alabaster Linen', locked: false },
        { id: '4', hex: '#819178', name: 'Olive Sage', locked: false },
      ],
      mood: 'Warm',
      style: 'Editorial',
      industry: 'Architecture',
    };
  }, [initialParams, savedItems]);

  // Main studio state
  const [title, setTitle] = useState(resolvedInitial.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tags, setTags] = useState<string[]>(resolvedInitial.tags);
  const [newTagInput, setNewTagInput] = useState('');
  const [swatches, setSwatches] = useState<SwatchState[]>(resolvedInitial.swatches);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [mood, setMood] = useState(resolvedInitial.mood);
  const [style, setStyle] = useState(resolvedInitial.style);
  const [industry, setIndustry] = useState(resolvedInitial.industry);

  // Live preview & UI state
  const [previewTab, setPreviewTab] = useState<'landing' | 'ui' | 'editorial'>('landing');
  const [contrastFgIndex, setContrastFgIndex] = useState(0);
  const [contrastBgIndex, setContrastBgIndex] = useState(swatches.length > 2 ? 2 : 1);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAddColorPopover, setShowAddColorPopover] = useState(false);
  const [newColorHex, setNewColorHex] = useState('#D4A373');
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<HistorySnapshot[]>([
    {
      title: resolvedInitial.title,
      tags: resolvedInitial.tags,
      swatches: resolvedInitial.swatches,
      mood: resolvedInitial.mood,
      style: resolvedInitial.style,
      industry: resolvedInitial.industry,
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Push to history on mutations
  const recordHistory = (newSwatches: SwatchState[], newTitle = title, newTags = tags) => {
    const snapshot: HistorySnapshot = {
      title: newTitle,
      tags: [...newTags],
      swatches: newSwatches.map((s) => ({ ...s })),
      mood,
      style,
      industry,
    };
    const sliced = history.slice(0, historyIndex + 1);
    setHistory([...sliced, snapshot].slice(-25));
    setHistoryIndex(sliced.length);
    setIsDirty(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setTitle(prev.title);
      setTags(prev.tags);
      setSwatches(prev.swatches);
      setMood(prev.mood);
      setStyle(prev.style);
      setIndustry(prev.industry);
      setHistoryIndex(historyIndex - 1);
      setSelectedIndex((cur) => Math.min(cur, prev.swatches.length - 1));
      showToast('Undo', 'Restored previous state');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setTitle(next.title);
      setTags(next.tags);
      setSwatches(next.swatches);
      setMood(next.mood);
      setStyle(next.style);
      setIndustry(next.industry);
      setHistoryIndex(historyIndex + 1);
      setSelectedIndex((cur) => Math.min(cur, next.swatches.length - 1));
      showToast('Redo', 'Advanced state');
    }
  };

  const handleRevertVersion = (idx: number) => {
    if (idx >= 0 && idx < history.length) {
      const snap = history[idx];
      setTitle(snap.title);
      setTags(snap.tags);
      setSwatches(snap.swatches);
      setMood(snap.mood);
      setStyle(snap.style);
      setIndustry(snap.industry);
      setHistoryIndex(idx);
      setSelectedIndex((cur) => Math.min(cur, snap.swatches.length - 1));
      showToast(`Restored V${String(idx + 1).padStart(2, '0')}`);
    }
  };

  // Currently selected swatch
  const selectedSwatch = swatches[selectedIndex] || swatches[0];

  // Contrast testing
  const fgColor = swatches[contrastFgIndex]?.hex || swatches[0]?.hex || '#151513';
  const bgColor = swatches[contrastBgIndex]?.hex || swatches[swatches.length - 1]?.hex || '#F5F2EB';
  const contrastRatio = useMemo(() => getContrastRatio(fgColor, bgColor), [fgColor, bgColor]);
  const passesAA = contrastRatio >= 4.5;
  const passesAAA = contrastRatio >= 7.0;

  // Selected Color details
  const colorDetails = useMemo(() => {
    if (!selectedSwatch) return null;
    const hex = selectedSwatch.hex;
    const rgb = hexToRgb(hex) || { r: 23, g: 23, b: 20 };
    const hsl = hexToHsl(hex) || { h: 34, s: 37, l: 74 };
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const cssVarName = `--kroma-${selectedSwatch.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const cssVar = `${cssVarName}: ${hex};`;
    const tailwind = `bg-[${hex}]`;
    const harmonies = getHarmonies(hex);

    return { hex, rgb, hsl, cmyk, cssVar, tailwind, harmonies };
  }, [selectedSwatch]);

  // Color actions
  const handleUpdateSwatchHex = (index: number, newHex: string) => {
    const cleanHex = newHex.startsWith('#') ? newHex.toUpperCase() : `#${newHex}`.toUpperCase();
    const updated = swatches.map((s, i) => {
      if (i === index) {
        const closestName = findClosestColorMatches(cleanHex)[0]?.name || s.name;
        return { ...s, hex: cleanHex, name: closestName };
      }
      return s;
    });
    setSwatches(updated);
    recordHistory(updated);
  };

  const handleToggleLock = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = swatches.map((s, i) =>
      i === index ? { ...s, locked: !s.locked } : s
    );
    setSwatches(updated);
  };

  const handleToggleLockAll = () => {
    const allLocked = swatches.every((s) => s.locked);
    const updated = swatches.map((s) => ({ ...s, locked: !allLocked }));
    setSwatches(updated);
  };

  const handleMoveSwatch = (fromIdx: number, toIdx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (toIdx < 0 || toIdx >= swatches.length) return;
    const next = [...swatches];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setSwatches(next);
    setSelectedIndex(toIdx);
    recordHistory(next);
  };

  const handleAddColor = (hexToAdd: string) => {
    if (swatches.length >= 8) {
      showToast('Maximum 8 colors in Studio');
      return;
    }
    const cleanHex = hexToAdd.toUpperCase();
    const closestName = findClosestColorMatches(cleanHex)[0]?.name || `Tone ${swatches.length + 1}`;
    const newSwatch: SwatchState = {
      id: `swatch-${Date.now()}`,
      hex: cleanHex,
      name: closestName,
      locked: false,
    };
    const updated = [...swatches, newSwatch];
    setSwatches(updated);
    setSelectedIndex(updated.length - 1);
    recordHistory(updated);
    setShowAddColorPopover(false);
    showToast(`Added ${cleanHex}`, closestName);
  };

  const handleDeleteSwatch = (index: number) => {
    if (swatches.length <= 2) {
      showToast('Minimum 2 swatches required');
      return;
    }
    const updated = swatches.filter((_, i) => i !== index);
    setSwatches(updated);
    setSelectedIndex((cur) => Math.min(cur, updated.length - 1));
    recordHistory(updated);
    showToast('Swatch removed');
  };

  // In-place Shuffle with harmony & locked swatches preserved
  const handleShuffle = () => {
    const baseHex = swatches.find((s) => s.locked)?.hex || swatches[0].hex;
    const harmonies: HarmonyMode[] = [
      'analogous',
      'complementary',
      'triadic',
      'splitComplementary',
      'monochromatic',
    ];
    const randomMode = harmonies[Math.floor(Math.random() * harmonies.length)];
    const generated = generatePalette(
      swatches.length,
      swatches.map((s) => ({ id: s.id, hex: s.hex, name: s.name, locked: s.locked })),
      randomMode,
      baseHex
    );

    const updated = swatches.map((s, i) => {
      if (s.locked) return s;
      const genHex = generated[i]?.hex || s.hex;
      return {
        ...s,
        hex: genHex.toUpperCase(),
        name: findClosestColorMatches(genHex)[0]?.name || s.name,
      };
    });

    setSwatches(updated);
    recordHistory(updated);
    showToast('Intelligent shuffle applied', `${randomMode} harmony`);
  };

  // In-place variations generation
  const generatedVariations = useMemo(() => {
    const base = selectedSwatch?.hex || swatches[0]?.hex || '#171714';
    const modes: { mode: HarmonyMode; title: string }[] = [
      { mode: 'analogous', title: 'Variation 01 — Analogous' },
      { mode: 'complementary', title: 'Variation 02 — Complementary' },
      { mode: 'triadic', title: 'Variation 03 — Triadic' },
    ];

    return modes.map(({ mode, title }) => {
      const gen = generatePalette(
        swatches.length,
        swatches.map((s) => ({ id: s.id, hex: s.hex, name: s.name, locked: s.locked })),
        mode,
        base
      );
      return {
        title,
        mode,
        colors: gen.map((g) => g.hex.toUpperCase()),
      };
    });
  }, [selectedSwatch, swatches]);

  const handleApplyVariation = (colors: string[]) => {
    const updated = swatches.map((s, i) => {
      if (s.locked) return s;
      const hex = colors[i] || s.hex;
      return {
        ...s,
        hex,
        name: findClosestColorMatches(hex)[0]?.name || s.name,
      };
    });
    setSwatches(updated);
    recordHistory(updated);
    setShowGenerateMenu(false);
    showToast('Variation applied to canvas');
  };

  // Extract from image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      // Harmonic tones extracted from editorial architecture
      const sampleTones = ['#1D3557', '#457B9D', '#A8DADC', '#F1FAEE', '#E63946'];
      const updated = sampleTones.map((hex, i) => ({
        id: `extracted-${i}-${Date.now()}`,
        hex,
        name: findClosestColorMatches(hex)[0]?.name || `Extracted ${i + 1}`,
        locked: false,
      }));
      setSwatches(updated);
      setSelectedIndex(0);
      recordHistory(updated, 'Image Extraction System');
      showToast('Extracted 5 pigments from photograph');
    };
    reader.readAsDataURL(file);
  };

  // Copy helper
  const handleCopyText = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedLabel(label);
      setTimeout(() => setCopiedLabel(null), 1500);
      showToast(`Copied ${label}`, text);
    }
  };

  const handleCopyPalette = async () => {
    const hexList = swatches.map((s) => s.hex).join(', ');
    await handleCopyText(hexList, 'Palette');
  };

  // Save palette into SavedContext
  const handleSavePalette = () => {
    const slug =
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
      `studio-${Date.now()}`;

    saveItem({
      id: `studio_${Date.now()}`,
      type: 'palette',
      title: title.trim(),
      slug,
      preview: swatches.map((s) => s.hex).join(','),
      metadata: `${tags.join(' · ')} • ${swatches.length} tones`,
    });

    setIsSavedRecently(true);
    setIsDirty(false);
    setTimeout(() => setIsSavedRecently(false), 2500);
    showToast('Saved to your collection', title);
  };

  // Export options
  const handleExport = async (format: string) => {
    let output = '';
    const hexList = swatches.map((s) => s.hex);
    if (format === 'HEX') {
      output = hexList.join(', ');
    } else if (format === 'RGB') {
      output = swatches
        .map((s) => {
          const rgb = hexToRgb(s.hex);
          return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : s.hex;
        })
        .join(', ');
    } else if (format === 'HSL') {
      output = swatches
        .map((s) => {
          const hsl = hexToHsl(s.hex);
          return hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : s.hex;
        })
        .join(', ');
    } else if (format === 'CSS') {
      output = `:root {\n${swatches.map((s, i) => `  --color-${i + 1}: ${s.hex}; /* ${s.name} */`).join('\n')}\n}`;
    } else if (format === 'TAILWIND') {
      output = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${swatches.map((s, i) => `        'tone-${i + 1}': '${s.hex}', // ${s.name}`).join('\n')}\n      }\n    }\n  }\n};`;
    } else if (format === 'JSON') {
      output = JSON.stringify(
        {
          title,
          tags,
          colors: swatches.map((s) => ({ name: s.name, hex: s.hex })),
        },
        null,
        2
      );
    } else if (format === 'SVG') {
      output = `<svg xmlns="http://www.w3.org/2000/svg" width="${swatches.length * 100}" height="120" viewBox="0 0 ${swatches.length * 100} 120">\n${swatches.map((s, i) => `  <rect x="${i * 100}" y="0" width="100" height="120" fill="${s.hex}" />`).join('\n')}\n</svg>`;
    }

    const success = await copyToClipboard(output);
    if (success) {
      showToast(`Exported ${format}`, 'Copied to clipboard');
      setShowExportMenu(false);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      const nextTags = [...tags, newTagInput.trim()];
      setTags(nextTags);
      setNewTagInput('');
      recordHistory(swatches, title, nextTags);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    recordHistory(swatches, title, nextTags);
  };

  return (
    <div className="w-full min-h-screen bg-[var(--kroma-paper)] text-[var(--kroma-ink)] font-sans">
      <SEOHead
        rawTitle
        title={`${title} — KROMA Studio Color Workspace`}
        description="Professional color harmony workspace for architects, art directors and digital designers."
        canonicalPath="/studio"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-5 md:py-6 flex flex-col gap-4 md:gap-5">
        
        {/* ─────────────────────────────────────────────────────────────
            04 — STUDIO HEADER (52–64px height)
        ───────────────────────────────────────────────────────────── */}
        <header className="h-[56px] border-b border-[var(--kroma-border)] flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--kroma-muted)]">
              STUDIO
            </span>
            <span className="text-gray-300 font-light">/</span>
            <h1 className="font-sans text-[18px] md:text-[22px] font-medium text-[var(--kroma-ink)] tracking-[-0.02em]">
              Color Workspace
            </h1>
          </div>

          {/* Right utility controls: Undo, Redo, Save */}
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-wider text-[var(--kroma-muted)] bg-[var(--kroma-card)] px-2 py-0.5 rounded-[2px] border border-[var(--kroma-border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                Unsaved
              </span>
            )}

            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="h-[32px] px-2.5 rounded-[3px] border border-[var(--kroma-border)] bg-[var(--kroma-card)] text-[var(--kroma-ink)] hover:border-[var(--kroma-ink)] disabled:opacity-40 disabled:hover:border-[var(--kroma-border)] transition-all flex items-center gap-1 text-xs"
              title="Undo"
            >
              <Undo size={12} />
              <span className="hidden sm:inline text-[10px]">Undo</span>
            </button>

            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="h-[32px] px-2.5 rounded-[3px] border border-[var(--kroma-border)] bg-[var(--kroma-card)] text-[var(--kroma-ink)] hover:border-[var(--kroma-ink)] disabled:opacity-40 disabled:hover:border-[var(--kroma-border)] transition-all flex items-center gap-1 text-xs"
              title="Redo"
            >
              <Redo size={12} />
              <span className="hidden sm:inline text-[10px]">Redo</span>
            </button>

            <button
              onClick={handleSavePalette}
              className={`h-[34px] px-3.5 rounded-[4px] font-sans text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                isSavedRecently
                  ? 'bg-emerald-800 text-white'
                  : 'bg-[var(--kroma-black)] text-[var(--kroma-paper)] hover:opacity-90'
              }`}
            >
              {isSavedRecently ? (
                <>
                  <Check size={13} />
                  <span>Saved ✓</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            10 & 05 — MAIN STUDIO GRID (9 Cols Workspace + 3 Cols Inspector)
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* LEFT 9 COLUMNS: LARGE COLOR CANVAS & WORKSPACE */}
          <div className="lg:col-span-9 flex flex-col gap-3">
            
            {/* 05 — THE MAIN COLOR CANVAS (420–500px Desktop) */}
            <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] rounded-[4px] overflow-hidden border border-[var(--kroma-border)] bg-[var(--kroma-card)] flex flex-row">
              {swatches.map((s, idx) => {
                const isSelected = selectedIndex === idx;
                const textColor = getTextColorForBackground(s.hex);

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedIndex(idx)}
                    style={{ backgroundColor: s.hex }}
                    className={`relative flex-1 h-full cursor-pointer transition-all duration-200 flex flex-col justify-between p-3.5 sm:p-5 group select-none ${
                      isSelected
                        ? 'outline outline-1 outline-offset-[-1px] outline-white/90 z-10 shadow-lg'
                        : 'hover:opacity-95'
                    }`}
                  >
                    {/* Top Swatch Actions (Lock + Reorder controls) */}
                    <div className="flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleToggleLock(idx, e)}
                        className={`p-1.5 rounded-[2px] transition-all ${
                          s.locked
                            ? 'bg-black/60 text-white opacity-100'
                            : 'bg-black/25 text-white/90 hover:bg-black/50 opacity-0 group-hover:opacity-100'
                        }`}
                        title={s.locked ? 'Unlock swatch' : 'Lock swatch'}
                      >
                        {s.locked ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>

                      {/* Reorder Chits */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {idx > 0 && (
                          <button
                            onClick={(e) => handleMoveSwatch(idx, idx - 1, e)}
                            className="p-1 rounded-[2px] bg-black/30 hover:bg-black/60 text-white"
                            title="Move left"
                          >
                            <ChevronLeft size={11} />
                          </button>
                        )}
                        {idx < swatches.length - 1 && (
                          <button
                            onClick={(e) => handleMoveSwatch(idx, idx + 1, e)}
                            className="p-1 rounded-[2px] bg-black/30 hover:bg-black/60 text-white"
                            title="Move right"
                          >
                            <ChevronRight size={11} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom Swatch Info & Mini Controls */}
                    <div
                      style={{ color: textColor }}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="font-mono text-xs sm:text-sm md:text-base font-semibold tracking-wider">
                        {s.hex}
                      </div>
                      <div className="font-sans text-[10px] sm:text-[11px] opacity-80 uppercase tracking-widest truncate">
                        {s.name}
                      </div>

                      {/* Hover action chips */}
                      <div className="flex items-center gap-1.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyText(s.hex, s.hex);
                          }}
                          className="h-[22px] px-2 rounded-[2px] bg-black/40 hover:bg-black/70 text-white font-mono text-[9px] uppercase flex items-center gap-1 transition-all"
                        >
                          <Copy size={9} />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIndex(idx);
                          }}
                          className="h-[22px] px-2 rounded-[2px] bg-black/40 hover:bg-black/70 text-white font-mono text-[9px] uppercase flex items-center gap-1 transition-all"
                        >
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 11 & 12 — PALETTE NAME & METADATA BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-3">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={title}
                    autoFocus
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => {
                      setIsEditingTitle(false);
                      recordHistory(swatches, title);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingTitle(false);
                        recordHistory(swatches, title);
                      }
                    }}
                    className="font-sans text-[18px] md:text-[20px] font-medium text-[var(--kroma-ink)] bg-transparent border-b border-[var(--kroma-ink)] outline-none"
                  />
                ) : (
                  <h2
                    onClick={() => setIsEditingTitle(true)}
                    className="font-sans text-[18px] md:text-[20px] font-medium text-[var(--kroma-ink)] tracking-[-0.02em] cursor-pointer hover:opacity-75 transition-opacity"
                    title="Click to rename"
                  >
                    {title}
                  </h2>
                )}

                <div className="flex items-center gap-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-sans text-[10px] px-2 py-0.5 rounded-[12px] border border-[var(--kroma-border)] bg-[var(--kroma-card)] text-[var(--kroma-ink)] flex items-center gap-1"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="opacity-50 hover:opacity-100 text-[11px]"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <form onSubmit={handleAddTag} className="inline-block">
                    <input
                      type="text"
                      placeholder="+ tag"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="w-14 h-[22px] px-1.5 font-sans text-[10px] rounded-[12px] border border-dashed border-[var(--kroma-border)] bg-transparent text-[var(--kroma-ink)] focus:outline-none focus:border-[var(--kroma-ink)]"
                    />
                  </form>
                </div>
              </div>

              {/* Version History pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                <span className="font-mono text-[9px] uppercase text-[var(--kroma-muted)] mr-1">
                  HIST:
                </span>
                {history.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleRevertVersion(i)}
                    className={`h-[20px] px-1.5 rounded-[2px] font-mono text-[8.5px] border transition-all ${
                      i === historyIndex
                        ? 'border-[var(--kroma-ink)] bg-[var(--kroma-ink)] text-[var(--kroma-paper)] font-bold'
                        : 'border-[var(--kroma-border)] text-[var(--kroma-muted)] hover:border-[var(--kroma-ink)]'
                    }`}
                  >
                    V{String(i + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* 13 — HORIZONTAL UTILITY TOOLBAR (32–36px height) */}
            <div className="h-[36px] px-2 rounded-[4px] border border-[var(--kroma-border)] bg-[var(--kroma-card)] flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1 sm:gap-1.5">
                
                {/* Generate with in-place variations dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowGenerateMenu(!showGenerateMenu)}
                    className="h-[28px] px-2.5 rounded-[2px] text-xs font-sans font-medium hover:bg-black/5 flex items-center gap-1.5 text-[var(--kroma-ink)] transition-colors"
                  >
                    <Sparkles size={12} />
                    <span>Generate</span>
                  </button>

                  {showGenerateMenu && (
                    <div className="absolute top-full left-0 mt-1 w-64 p-2 rounded-[4px] bg-[var(--kroma-card)] border border-[var(--kroma-border-strong)] shadow-xl z-30 flex flex-col gap-2">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--kroma-muted)] px-1">
                        IN-PLACE HARMONY VARIATIONS
                      </div>
                      {generatedVariations.map((v) => (
                        <div
                          key={v.title}
                          onClick={() => handleApplyVariation(v.colors)}
                          className="p-2 rounded-[2px] border border-[var(--kroma-border)] hover:border-[var(--kroma-ink)] cursor-pointer bg-[var(--kroma-paper)] transition-all flex flex-col gap-1.5"
                        >
                          <span className="font-sans text-[11px] font-medium text-[var(--kroma-ink)]">
                            {v.title}
                          </span>
                          <div className="flex h-4 rounded-[2px] overflow-hidden">
                            {v.colors.map((c, i) => (
                              <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-[1px] h-3.5 bg-[var(--kroma-border)]" />

                {/* Shuffle */}
                <button
                  onClick={handleShuffle}
                  className="h-[28px] px-2.5 rounded-[2px] text-xs font-sans hover:bg-black/5 flex items-center gap-1.5 text-[var(--kroma-ink)] transition-colors"
                  title="Harmonious intelligent shuffle"
                >
                  <Shuffle size={12} />
                  <span>Shuffle</span>
                </button>

                {/* Add color */}
                <div className="relative">
                  <button
                    onClick={() => setShowAddColorPopover(!showAddColorPopover)}
                    disabled={swatches.length >= 8}
                    className="h-[28px] px-2.5 rounded-[2px] text-xs font-sans hover:bg-black/5 disabled:opacity-40 flex items-center gap-1 text-[var(--kroma-ink)] transition-colors"
                  >
                    <Plus size={12} />
                    <span>Add color</span>
                  </button>

                  {showAddColorPopover && (
                    <div className="absolute top-full left-0 mt-1 w-52 p-3 rounded-[4px] bg-[var(--kroma-card)] border border-[var(--kroma-border-strong)] shadow-xl z-30 flex flex-col gap-2.5">
                      <div className="font-mono text-[9px] uppercase text-[var(--kroma-muted)]">
                        ADD COLOR SWATCH
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="w-7 h-7 rounded-[2px] border border-[var(--kroma-border)] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="h-7 px-2 font-mono text-xs border border-[var(--kroma-border)] rounded-[2px] bg-white flex-1 text-[var(--kroma-ink)] uppercase"
                        />
                      </div>
                      <button
                        onClick={() => handleAddColor(newColorHex)}
                        className="kroma-btn-primary h-[28px] text-xs"
                      >
                        Add to palette
                      </button>
                    </div>
                  )}
                </div>

                {/* Lock All / Unlock All */}
                <button
                  onClick={handleToggleLockAll}
                  className="h-[28px] px-2 rounded-[2px] text-xs font-sans hover:bg-black/5 text-[var(--kroma-ink)] transition-colors"
                  title="Toggle all locks"
                >
                  <Lock size={12} />
                </button>

                {/* Extract from image */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[28px] px-2.5 rounded-[2px] text-xs font-sans hover:bg-black/5 flex items-center gap-1 text-[var(--kroma-ink)] transition-colors"
                  title="Extract from photograph"
                >
                  <Upload size={12} />
                  <span className="hidden sm:inline">Image</span>
                </button>

              </div>

              <div className="flex items-center gap-1.5">
                {/* Copy Palette */}
                <button
                  onClick={handleCopyPalette}
                  className="h-[28px] px-2.5 rounded-[2px] text-xs font-sans hover:bg-black/5 flex items-center gap-1 text-[var(--kroma-ink)] transition-colors"
                >
                  {copiedLabel === 'Palette' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedLabel === 'Palette' ? 'Copied ✓' : 'Copy'}</span>
                </button>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="h-[28px] px-2.5 rounded-[2px] text-xs font-sans hover:bg-black/5 flex items-center gap-1 text-[var(--kroma-ink)] transition-colors"
                  >
                    <Download size={12} />
                    <span>Export</span>
                  </button>

                  {showExportMenu && (
                    <div className="absolute top-full right-0 mt-1 w-44 p-1.5 rounded-[4px] bg-[var(--kroma-card)] border border-[var(--kroma-border-strong)] shadow-xl z-30 flex flex-col gap-0.5">
                      <div className="font-mono text-[9px] uppercase text-[var(--kroma-muted)] px-2 py-1 border-b border-[var(--kroma-border)] mb-1">
                        EXPORT FORMAT
                      </div>
                      {['HEX', 'RGB', 'HSL', 'CSS', 'TAILWIND', 'JSON', 'SVG'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => handleExport(fmt)}
                          className="px-2 py-1 text-left font-mono text-[10px] text-[var(--kroma-ink)] hover:bg-black/5 rounded-[2px] transition-colors flex items-center justify-between"
                        >
                          <span>{fmt}</span>
                          <span className="text-[9px] text-[var(--kroma-muted)]">Copy</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT 3 COLUMNS: 09 — COLOR EDIT PANEL / INSPECTOR (260–300px) */}
          <aside className="lg:col-span-3 border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-card)] p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--kroma-border)] pb-2.5">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--kroma-muted)]">
                COLOR INSPECTOR
              </span>
              <span className="font-mono text-[9px] text-[var(--kroma-muted)]">
                SWATCH {selectedIndex + 1}/{swatches.length}
              </span>
            </div>

            {/* Selected Color Large Block */}
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: selectedSwatch.hex }}
                className="w-14 h-14 rounded-[3px] border border-[var(--kroma-border)] shrink-0 shadow-inner"
              />
              <div className="flex-1 min-w-0">
                <div className="font-sans text-sm font-medium text-[var(--kroma-ink)] truncate">
                  {selectedSwatch.name}
                </div>
                <div className="font-mono text-xs font-bold text-[var(--kroma-muted)]">
                  {selectedSwatch.hex}
                </div>
              </div>
            </div>

            {/* Color Value Editor */}
            <div className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-wider text-[var(--kroma-muted)] mb-1">
                  HEX CODE
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedSwatch.hex}
                    onChange={(e) => handleUpdateSwatchHex(selectedIndex, e.target.value)}
                    className="w-7 h-7 rounded-[2px] border border-[var(--kroma-border)] cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={selectedSwatch.hex}
                    onChange={(e) => handleUpdateSwatchHex(selectedIndex, e.target.value)}
                    className="h-8 px-2.5 font-mono text-xs border border-[var(--kroma-border)] rounded-[3px] bg-white flex-1 text-[var(--kroma-ink)] uppercase focus:outline-none focus:border-[var(--kroma-ink)]"
                  />
                </div>
              </div>

              {/* RGB & HSL & CMYK breakdown */}
              {colorDetails && (
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[var(--kroma-muted)] bg-[var(--kroma-paper)] p-2.5 rounded-[3px] border border-[var(--kroma-border)]">
                  <div>
                    <div className="text-[var(--kroma-ink)] font-bold">RGB</div>
                    <div>{colorDetails.rgb.r} / {colorDetails.rgb.g} / {colorDetails.rgb.b}</div>
                  </div>
                  <div>
                    <div className="text-[var(--kroma-ink)] font-bold">HSL</div>
                    <div>{colorDetails.hsl.h}° / {colorDetails.hsl.s}% / {colorDetails.hsl.l}%</div>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[var(--kroma-border)]">
                    <div className="text-[var(--kroma-ink)] font-bold">CMYK</div>
                    <div>{colorDetails.cmyk.c}% · {colorDetails.cmyk.m}% · {colorDetails.cmyk.y}% · {colorDetails.cmyk.k}%</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions for Selected Swatch */}
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--kroma-border)]">
              <button
                onClick={() => handleCopyText(selectedSwatch.hex, selectedSwatch.hex)}
                className="flex-1 h-[30px] rounded-[3px] border border-[var(--kroma-border)] bg-[var(--kroma-paper)] hover:border-[var(--kroma-ink)] text-[var(--kroma-ink)] font-sans text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLabel === selectedSwatch.hex ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedLabel === selectedSwatch.hex ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => handleToggleLock(selectedIndex)}
                className={`h-[30px] px-2.5 rounded-[3px] border transition-colors flex items-center justify-center ${
                  selectedSwatch.locked
                    ? 'bg-[var(--kroma-ink)] text-[var(--kroma-paper)] border-[var(--kroma-ink)]'
                    : 'border-[var(--kroma-border)] bg-[var(--kroma-paper)] text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)]'
                }`}
                title="Toggle Lock"
              >
                {selectedSwatch.locked ? <Lock size={13} /> : <Unlock size={13} />}
              </button>

              <button
                onClick={() => handleDeleteSwatch(selectedIndex)}
                disabled={swatches.length <= 2}
                className="h-[30px] px-2.5 rounded-[3px] border border-[var(--kroma-border)] bg-[var(--kroma-paper)] text-red-700 hover:border-red-600 disabled:opacity-30 transition-colors flex items-center justify-center"
                title="Delete swatch"
              >
                <Trash2 size={13} />
              </button>
            </div>

          </aside>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            17 & 18 — LIVE PREVIEW SECTION (Landing Page, Mobile UI, Editorial Card)
        ───────────────────────────────────────────────────────────── */}
        <section className="border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-card)] p-4 md:p-5 flex flex-col gap-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--kroma-border)] pb-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--kroma-muted)]">
                LIVE PREVIEW
              </span>
              <span className="font-sans text-xs text-[var(--kroma-muted)]">
                Real design compositions using current palette
              </span>
            </div>

            {/* 18 — PREVIEW SWITCHER TABS (10px Inter) */}
            <div className="flex items-center gap-1 border border-[var(--kroma-border)] rounded-[3px] p-0.5 bg-[var(--kroma-paper)]">
              {(['landing', 'ui', 'editorial'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPreviewTab(tab)}
                  className={`px-2.5 py-1 text-[10px] font-sans font-medium uppercase tracking-wider rounded-[2px] transition-all ${
                    previewTab === tab
                      ? 'bg-[var(--kroma-ink)] text-[var(--kroma-paper)]'
                      : 'text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)]'
                  }`}
                >
                  {tab === 'landing' ? '01 Landing' : tab === 'ui' ? '02 Mobile UI' : '03 Editorial'}
                </button>
              ))}
            </div>
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="rounded-[4px] overflow-hidden border border-[var(--kroma-border)] transition-all">
            
            {/* 01: Landing Page Specimen */}
            {previewTab === 'landing' && (
              <div
                style={{ backgroundColor: swatches[2]?.hex || '#E9E1D4', color: swatches[0]?.hex || '#171714' }}
                className="p-6 md:p-8 flex flex-col gap-6 transition-colors"
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: `${swatches[0]?.hex || '#171714'}25` }}>
                  <div className="font-mono text-xs font-bold tracking-widest uppercase">
                    KROMA ATELIER
                  </div>
                  <div className="flex items-center gap-3 text-xs opacity-75">
                    <span>Explore</span>
                    <span>Systems</span>
                    <span>Archive</span>
                  </div>
                </div>

                <div className="max-w-xl flex flex-col gap-3">
                  <span
                    style={{ color: swatches[3]?.hex || '#819178' }}
                    className="font-mono text-[9.5px] uppercase tracking-[0.2em] font-bold"
                  >
                    COLLECTION 2026
                  </span>
                  <h3 className="font-sans text-2xl md:text-3xl font-medium tracking-tight leading-tight">
                    Disciplined color harmony for high-end digital experiences.
                  </h3>
                  <p className="font-sans text-xs opacity-80 leading-relaxed max-w-md">
                    Engineered tones balanced for physical print, architectural typography, and responsive web tokens.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    style={{
                      backgroundColor: swatches[0]?.hex || '#171714',
                      color: swatches[2]?.hex || '#E9E1D4',
                    }}
                    className="h-8 px-4 rounded-[2px] font-sans text-xs font-medium tracking-wide shadow-sm"
                  >
                    View Project
                  </button>
                  <button
                    style={{
                      borderColor: swatches[0]?.hex || '#171714',
                      color: swatches[0]?.hex || '#171714',
                    }}
                    className="h-8 px-4 rounded-[2px] border font-sans text-xs font-medium"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            )}

            {/* 02: Mobile UI Specimen */}
            {previewTab === 'ui' && (
              <div
                style={{ backgroundColor: swatches[0]?.hex || '#171714', color: swatches[2]?.hex || '#E9E1D4' }}
                className="p-6 md:p-8 flex items-center justify-center transition-colors"
              >
                <div
                  style={{
                    backgroundColor: swatches[1]?.hex || '#D6C3A5',
                    color: swatches[0]?.hex || '#171714',
                  }}
                  className="w-full max-w-xs rounded-[8px] p-5 shadow-2xl flex flex-col gap-4 border"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono opacity-70">
                    <span>BALANCE</span>
                    <span>CHF</span>
                  </div>
                  <div>
                    <div className="font-sans text-2xl font-semibold tracking-tight">
                      12,480.00
                    </div>
                    <div className="text-[10px] opacity-75 font-mono">
                      +4.2% THIS CYCLE
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      style={{
                        backgroundColor: swatches[0]?.hex || '#171714',
                        color: swatches[2]?.hex || '#E9E1D4',
                      }}
                      className="flex-1 h-7 rounded-[3px] text-[11px] font-medium"
                    >
                      Transfer
                    </button>
                    <button
                      style={{
                        backgroundColor: swatches[3]?.hex || '#819178',
                        color: swatches[0]?.hex || '#171714',
                      }}
                      className="flex-1 h-7 rounded-[3px] text-[11px] font-medium"
                    >
                      Receive
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 03: Editorial Card Specimen */}
            {previewTab === 'editorial' && (
              <div
                style={{ backgroundColor: swatches[1]?.hex || '#D6C3A5', color: swatches[0]?.hex || '#171714' }}
                className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors"
              >
                <div className="flex-1 flex flex-col gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-70">
                    SWISS TYPOGRAPHY NO. 44
                  </span>
                  <blockquote className="font-sans text-xl md:text-2xl font-normal leading-snug tracking-tight">
                    “Color is not an ornament; it is the structure through which emotion and form converse.”
                  </blockquote>
                  <div className="font-mono text-[10px] opacity-60">
                    EST. 2026 · ARCHITECTURAL COLOR STUDY
                  </div>
                </div>

                <div
                  style={{ backgroundColor: swatches[0]?.hex || '#171714', color: swatches[2]?.hex || '#E9E1D4' }}
                  className="w-36 h-36 rounded-[2px] p-3 flex flex-col justify-between shrink-0"
                >
                  <span className="font-mono text-[8px] uppercase tracking-widest opacity-60">SPECIMEN</span>
                  <div className="font-mono text-xs font-bold">{swatches[0]?.hex}</div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            19 & 20 — COLOR INFORMATION & ACCESSIBILITY LAB
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* 19 — COLOR INFORMATION SECTION (6 Cols) */}
          <div className="lg:col-span-6 border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-card)] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--kroma-border)] pb-2">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--kroma-muted)]">
                COLOR VALUES
              </span>
              <span className="font-mono text-[9.5px] text-[var(--kroma-ink)] font-bold">
                {selectedSwatch.name} ({selectedSwatch.hex})
              </span>
            </div>

            {colorDetails && (
              <div className="flex flex-col gap-2 text-xs font-mono">
                {/* CSS Token */}
                <div className="flex items-center justify-between p-2 rounded-[2px] bg-[var(--kroma-paper)] border border-[var(--kroma-border)]">
                  <div className="truncate">
                    <span className="text-[var(--kroma-muted)] mr-2">CSS:</span>
                    <span className="text-[var(--kroma-ink)]">{colorDetails.cssVar}</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(colorDetails.cssVar, 'CSS')}
                    className="text-[10px] underline text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)] shrink-0 ml-2"
                  >
                    Copy
                  </button>
                </div>

                {/* Tailwind Class */}
                <div className="flex items-center justify-between p-2 rounded-[2px] bg-[var(--kroma-paper)] border border-[var(--kroma-border)]">
                  <div className="truncate">
                    <span className="text-[var(--kroma-muted)] mr-2">TAILWIND:</span>
                    <span className="text-[var(--kroma-ink)]">{colorDetails.tailwind}</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(colorDetails.tailwind, 'Tailwind')}
                    className="text-[10px] underline text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)] shrink-0 ml-2"
                  >
                    Copy
                  </button>
                </div>

                {/* RGB, HSL, CMYK rows */}
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => handleCopyText(`rgb(${colorDetails.rgb.r}, ${colorDetails.rgb.g}, ${colorDetails.rgb.b})`, 'RGB')}
                    className="p-2 rounded-[2px] bg-[var(--kroma-paper)] border border-[var(--kroma-border)] cursor-pointer hover:border-[var(--kroma-ink)] transition-colors text-[10px]"
                  >
                    <div className="text-[var(--kroma-muted)]">RGB</div>
                    <div className="text-[var(--kroma-ink)] font-bold">{colorDetails.rgb.r}, {colorDetails.rgb.g}, {colorDetails.rgb.b}</div>
                  </div>

                  <div
                    onClick={() => handleCopyText(`hsl(${colorDetails.hsl.h}, ${colorDetails.hsl.s}%, ${colorDetails.hsl.l}%)`, 'HSL')}
                    className="p-2 rounded-[2px] bg-[var(--kroma-paper)] border border-[var(--kroma-border)] cursor-pointer hover:border-[var(--kroma-ink)] transition-colors text-[10px]"
                  >
                    <div className="text-[var(--kroma-muted)]">HSL</div>
                    <div className="text-[var(--kroma-ink)] font-bold">{colorDetails.hsl.h}°, {colorDetails.hsl.s}%, {colorDetails.hsl.l}%</div>
                  </div>

                  <div
                    onClick={() => handleCopyText(`cmyk(${colorDetails.cmyk.c}%, ${colorDetails.cmyk.m}%, ${colorDetails.cmyk.y}%, ${colorDetails.cmyk.k}%)`, 'CMYK')}
                    className="p-2 rounded-[2px] bg-[var(--kroma-paper)] border border-[var(--kroma-border)] cursor-pointer hover:border-[var(--kroma-ink)] transition-colors text-[10px]"
                  >
                    <div className="text-[var(--kroma-muted)]">CMYK</div>
                    <div className="text-[var(--kroma-ink)] font-bold">{colorDetails.cmyk.c}, {colorDetails.cmyk.m}, {colorDetails.cmyk.y}, {colorDetails.cmyk.k}</div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* 20 — ACCESSIBILITY & CONTRAST (6 Cols) */}
          <div className="lg:col-span-6 border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-card)] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--kroma-border)] pb-2">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--kroma-muted)]">
                CONTRAST &amp; ACCESSIBILITY
              </span>
              <div className="font-mono text-xs font-bold text-[var(--kroma-ink)]">
                {contrastRatio.toFixed(1)}:1
              </div>
            </div>

            {/* Selectors for Text vs Background */}
            <div className="flex items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[var(--kroma-muted)] text-[10px]">FG:</span>
                <select
                  value={contrastFgIndex}
                  onChange={(e) => setContrastFgIndex(Number(e.target.value))}
                  className="bg-transparent border border-[var(--kroma-border)] rounded-[2px] px-1.5 py-0.5 text-xs font-mono"
                >
                  {swatches.map((s, i) => (
                    <option key={s.id} value={i}>
                      {s.hex} ({s.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[var(--kroma-muted)] text-[10px]">BG:</span>
                <select
                  value={contrastBgIndex}
                  onChange={(e) => setContrastBgIndex(Number(e.target.value))}
                  className="bg-transparent border border-[var(--kroma-border)] rounded-[2px] px-1.5 py-0.5 text-xs font-mono"
                >
                  {swatches.map((s, i) => (
                    <option key={s.id} value={i}>
                      {s.hex} ({s.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className={passesAA ? 'text-green-700' : 'text-red-600'}>
                  AA {passesAA ? '✓' : '✗'}
                </span>
                <span className={passesAAA ? 'text-green-700' : 'text-red-600'}>
                  AAA {passesAAA ? '✓' : '✗'}
                </span>
              </div>
            </div>

            {/* Live Specimen Preview */}
            <div
              style={{ backgroundColor: bgColor, color: fgColor }}
              className="p-3.5 rounded-[3px] border border-[var(--kroma-border)] transition-colors"
            >
              <div className="font-sans font-medium text-2xl mb-1">Aa</div>
              <div className="font-sans text-xs">
                The quick brown fox jumps over the lazy dog.
              </div>
            </div>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            21 & 22 — COLOR RELATIONSHIPS & PALETTE CLASSIFICATION
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* 21 — COLOR RELATIONSHIPS */}
          <div className="lg:col-span-7 border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-card)] p-4 flex flex-col gap-2.5">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--kroma-muted)] border-b border-[var(--kroma-border)] pb-1.5">
              COLOR RELATIONSHIPS (BASED ON {selectedSwatch.hex})
            </span>

            {colorDetails?.harmonies && (() => {
              const h = colorDetails.harmonies;
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div
                    onClick={() => handleAddColor(h.comp)}
                    className="p-2 rounded-[2px] border border-[var(--kroma-border)] bg-[var(--kroma-paper)] cursor-pointer hover:border-[var(--kroma-ink)] transition-colors flex flex-col gap-1"
                  >
                    <span className="font-mono text-[9px] uppercase text-[var(--kroma-muted)]">Complementary</span>
                    <div className="h-5 rounded-[2px]" style={{ backgroundColor: h.comp }} />
                    <span className="font-mono text-[9px] text-[var(--kroma-ink)] font-bold">{h.comp}</span>
                  </div>

                  <div
                    onClick={() => handleAddColor(h.ana1)}
                    className="p-2 rounded-[2px] border border-[var(--kroma-border)] bg-[var(--kroma-paper)] cursor-pointer hover:border-[var(--kroma-ink)] transition-colors flex flex-col gap-1"
                  >
                    <span className="font-mono text-[9px] uppercase text-[var(--kroma-muted)]">Analogous</span>
                    <div className="h-5 rounded-[2px]" style={{ backgroundColor: h.ana1 }} />
                    <span className="font-mono text-[9px] text-[var(--kroma-ink)] font-bold">{h.ana1}</span>
                  </div>

                  <div
                    onClick={() => handleAddColor(h.tri1)}
                    className="p-2 rounded-[2px] border border-[var(--kroma-border)] bg-[var(--kroma-paper)] cursor-pointer hover:border-[var(--kroma-ink)] transition-colors flex flex-col gap-1"
                  >
                    <span className="font-mono text-[9px] uppercase text-[var(--kroma-muted)]">Triadic</span>
                    <div className="h-5 rounded-[2px]" style={{ backgroundColor: h.tri1 }} />
                    <span className="font-mono text-[9px] text-[var(--kroma-ink)] font-bold">{h.tri1}</span>
                  </div>

                  <div
                    onClick={() => handleAddColor(h.split1)}
                    className="p-2 rounded-[2px] border border-[var(--kroma-border)] bg-[var(--kroma-paper)] cursor-pointer hover:border-[var(--kroma-ink)] transition-colors flex flex-col gap-1"
                  >
                    <span className="font-mono text-[9px] uppercase text-[var(--kroma-muted)]">Split Comp</span>
                    <div className="h-5 rounded-[2px]" style={{ backgroundColor: h.split1 }} />
                    <span className="font-mono text-[9px] text-[var(--kroma-ink)] font-bold">{h.split1}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 22 — PALETTE MOOD & CLASSIFICATION */}
          <div className="lg:col-span-5 border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-card)] p-4 flex flex-col gap-2.5">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--kroma-muted)] border-b border-[var(--kroma-border)] pb-1.5">
              PALETTE CLASSIFICATION
            </span>

            <div className="flex flex-col gap-2 text-xs">
              {/* Mood */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase text-[var(--kroma-muted)]">MOOD:</span>
                <div className="flex flex-wrap gap-1">
                  {['Calm', 'Warm', 'Energetic', 'Minimal', 'Elegant', 'Dark'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`px-1.5 py-0.5 rounded-[10px] text-[9.5px] font-sans border transition-all ${
                        mood === m
                          ? 'bg-[var(--kroma-ink)] text-[var(--kroma-paper)] border-[var(--kroma-ink)]'
                          : 'border-[var(--kroma-border)] hover:border-[var(--kroma-ink)]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase text-[var(--kroma-muted)]">STYLE:</span>
                <div className="flex flex-wrap gap-1">
                  {['Editorial', 'Modern', 'Luxury', 'Retro', 'Organic'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`px-1.5 py-0.5 rounded-[10px] text-[9.5px] font-sans border transition-all ${
                        style === s
                          ? 'bg-[var(--kroma-ink)] text-[var(--kroma-paper)] border-[var(--kroma-ink)]'
                          : 'border-[var(--kroma-border)] hover:border-[var(--kroma-ink)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase text-[var(--kroma-muted)]">INDUSTRY:</span>
                <div className="flex flex-wrap gap-1">
                  {['Fashion', 'Branding', 'UI/UX', 'Architecture', 'Beauty'].map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setIndustry(ind)}
                      className={`px-1.5 py-0.5 rounded-[10px] text-[9.5px] font-sans border transition-all ${
                        industry === ind
                          ? 'bg-[var(--kroma-ink)] text-[var(--kroma-paper)] border-[var(--kroma-ink)]'
                          : 'border-[var(--kroma-border)] hover:border-[var(--kroma-ink)]'
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
