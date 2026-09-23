import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  Sparkles,
  Lock,
  Unlock,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Plus,
  Search,
} from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard, hexToRgb, hexToHsl } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { generatePalette, findClosestColorName } from '../utils/paletteGenerator';
import { KromaButton } from '../components/common/KromaButton';

interface CreateStudioGatewayPageProps {
  onNavigate: (route: RouteType) => void;
}

export const CreateStudioGatewayPage: React.FC<CreateStudioGatewayPageProps> = ({ onNavigate }) => {
  const { palettes, colors, addPalette } = useLibraryData();
  const { savedItems, saveItem, isSaved } = useSaved();
  const { showToast } = useToast();

  // Search filter state inside studio
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Studio Palette Creator Canvas State
  const [creatorColors, setCreatorColors] = useState([
    { hex: '#171717', name: 'Ink Obsidian', locked: false },
    { hex: '#FF3B30', name: 'Radical Vermilion', locked: false },
    { hex: '#FF9500', name: 'Amber Glow', locked: false },
    { hex: '#FFD60A', name: 'Solar Yellow', locked: false },
    { hex: '#00AEEF', name: 'Electric Cyan', locked: false },
  ]);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(1);
  const [creatorTitle, setCreatorTitle] = useState('STUDIO STUDY 01');

  // Interactive Palette Randomizer
  const handleRandomizeCreator = () => {
    const fresh = generatePalette(creatorColors.length, [], 'curated');
    setCreatorColors((prev) =>
      prev.map((c, idx) => (c.locked ? c : { hex: fresh[idx].hex, name: fresh[idx].name, locked: false }))
    );
    showToast('Randomized unlocked studio colors');
  };

  const handleToggleLock = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCreatorColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c))
    );
  };

  const handleSaveCanvasPalette = () => {
    const slug = creatorTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'studio-study';
    const newPalette: PaletteItem = {
      id: `studio-${Date.now()}`,
      title: creatorTitle,
      slug,
      category: 'Studio Study',
      description: 'Created on the Kroma Studio Canvas.',
      likes: 1,
      createdAt: new Date().toISOString(),
      tags: ['studio', 'canvas'],
      creator: {
        name: 'You',
        username: 'studio',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
      colors: creatorColors.map((c) => ({
        hex: c.hex,
        name: c.name,
      })),
    };
    addPalette(newPalette);
    saveItem({
      id: newPalette.id,
      type: 'palette',
      title: newPalette.title,
      slug: newPalette.slug,
      preview: newPalette.colors.map((c) => c.hex).join(','),
      metadata: 'Created in Studio Canvas',
    });
    showToast('Saved to your Studio Archive', creatorTitle);
  };

  const handleCopyHex = async (hex: string, name: string) => {
    const ok = await copyToClipboard(hex);
    if (ok) {
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  // Recent work (Palettes from library)
  const recentPalettes = useMemo(() => palettes.slice(0, 4), [palettes]);

  // Selected Color details
  const activeColor = creatorColors[selectedColorIndex] || creatorColors[0];
  const activeRgb = hexToRgb(activeColor.hex);
  const activeHsl = hexToHsl(activeColor.hex);

  // Search filtered results
  const filteredPalettes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return palettes.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.colors.some((c) => c.hex.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    );
  }, [searchQuery, palettes]);

  const filteredColors = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return colors.filter(
      (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
    );
  }, [searchQuery, colors]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pb-16 md:pb-24 box-border">
      <SEOHead
        title="The Studio — Digital Color Workspace | KROMA"
        description="A quiet place to explore, create and collect color. Parametric ramps, generative studies, kinetic physics, and custom color compositions."
        canonicalPath="/create"
      />

      {/* ── 08: STUDIO INTRO ────────────────────────────────────── */}
      <header className="mb-16">
        <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-4 block">THE STUDIO</span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-normal leading-[1.05] tracking-tight text-text-primary uppercase m-0 mb-5">
          MAKE<br />
          SOMETHING<br />
          COLORFUL.
        </h1>
        <p className="font-sans text-base leading-relaxed text-text-secondary max-w-[680px] m-0">
          A quiet place to explore, create and collect color.
        </p>
      </header>

      {/* ── 09: PRIMARY STUDIO ACTIONS ──────────────────────────── */}
      <section className="mb-20">
        <div className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-3 block">WORKSPACE ACTIONS</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Action 1: Create Palette */}
          <div
            className="group/tool bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] overflow-hidden flex flex-col justify-between min-h-[230px] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] select-none"
            onClick={() => {
              const el = document.getElementById('studio-canvas-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
          >
            <div className="w-full h-[110px] flex overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06]">
              {['#FF3B30', '#FF9500', '#FFD60A', '#171717'].map((hex, i) => (
                <div key={i} className="flex-1 h-full transition-[flex] duration-200 group-hover/tool:hover:flex-[1.25]" style={{ backgroundColor: hex }} />
              ))}
            </div>
            <div className="p-5 flex flex-col justify-between flex-1">
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#707070] dark:text-[#909090] mb-2">CANVAS STAGE</div>
              <div className="font-sans text-[17px] font-bold leading-tight text-[#171717] dark:text-white tracking-tight flex items-center justify-between">
                <span>CREATE PALETTE</span>
                <ArrowUpRight size={14} className="transition-transform group-hover/tool:translate-x-0.5 group-hover/tool:-translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* Action 2: Generate */}
          <div
            className="group/tool bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] overflow-hidden flex flex-col justify-between min-h-[230px] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] select-none"
            onClick={() => onNavigate({ path: 'palette-generator' })}
            role="button"
            tabIndex={0}
          >
            <div className="w-full h-[110px] flex overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06]">
              {['#00AEEF', '#7B2CBF', '#FF3B30'].map((hex, i) => (
                <div key={i} className="flex-1 h-full transition-[flex] duration-200 group-hover/tool:hover:flex-[1.25]" style={{ backgroundColor: hex }} />
              ))}
            </div>
            <div className="p-5 flex flex-col justify-between flex-1">
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#707070] dark:text-[#909090] mb-2">LABORATORY</div>
              <div className="font-sans text-[17px] font-bold leading-tight text-[#171717] dark:text-white tracking-tight flex items-center justify-between">
                <span>GENERATE</span>
                <ArrowUpRight size={14} className="transition-transform group-hover/tool:translate-x-0.5 group-hover/tool:-translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* Action 3: Image to Palette */}
          <div
            className="group/tool bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] overflow-hidden flex flex-col justify-between min-h-[230px] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] select-none"
            onClick={() => onNavigate({ path: 'extract-from-image' })}
            role="button"
            tabIndex={0}
          >
            <div className="w-full h-[110px] flex items-center justify-center overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06]" style={{ background: 'linear-gradient(135deg, #171717 0%, #34C759 50%, #00AEEF 100%)' }}>
              <div className="w-7 h-7 rounded-full border border-white bg-white/25 backdrop-blur-xs flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <div className="p-5 flex flex-col justify-between flex-1">
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#707070] dark:text-[#909090] mb-2">CHROMATIC EXTRACTION</div>
              <div className="font-sans text-[17px] font-bold leading-tight text-[#171717] dark:text-white tracking-tight flex items-center justify-between">
                <span>IMAGE → PALETTE</span>
                <ArrowUpRight size={14} className="transition-transform group-hover/tool:translate-x-0.5 group-hover/tool:-translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* Action 4: Explore Colors */}
          <div
            className="group/tool bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] overflow-hidden flex flex-col justify-between min-h-[230px] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] select-none"
            onClick={() => onNavigate({ path: 'colors' })}
            role="button"
            tabIndex={0}
          >
            <div className="w-full h-[110px] flex overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06]">
              {['#FF3B30', '#34C759', '#00AEEF', '#7B2CBF', '#FFD60A'].map((hex, i) => (
                <div key={i} className="flex-1 h-full transition-[flex] duration-200 group-hover/tool:hover:flex-[1.25]" style={{ backgroundColor: hex }} />
              ))}
            </div>
            <div className="p-5 flex flex-col justify-between flex-1">
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#707070] dark:text-[#909090] mb-2">SWATCH ARCHIVE</div>
              <div className="font-sans text-[17px] font-bold leading-tight text-[#171717] dark:text-white tracking-tight flex items-center justify-between">
                <span>EXPLORE COLORS</span>
                <ArrowUpRight size={14} className="transition-transform group-hover/tool:translate-x-0.5 group-hover/tool:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12 & 13: STUDIO PALETTE CREATOR (Creative Canvas) ───── */}
      <section id="studio-canvas-section" className="mb-24">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-4">
          <div>
            <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-4 block">PALETTE CREATOR</span>
            <input
              type="text"
              value={creatorTitle}
              onChange={(e) => setCreatorTitle(e.target.value)}
              className="bg-transparent font-sans text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--text-primary)] outline-none transition-colors"
              title="Click to rename palette"
            />
          </div>
          <div className="flex items-center gap-3">
            <KromaButton
              variant="outline"
              onClick={handleRandomizeCreator}
              iconLeft={<RefreshCw size={13} />}
              title="Randomize unlocked swatches"
            >
              RANDOMIZE
            </KromaButton>
            <KromaButton
              variant="filled"
              onClick={handleSaveCanvasPalette}
              iconRight={<ArrowUpRight size={14} />}
            >
              SAVE TO STUDIO
            </KromaButton>
          </div>
        </div>

        {/* The Dominant Color Canvas */}
        <div className="flex flex-col md:flex-row w-full h-auto min-h-[480px] md:min-h-0 md:h-[380px] rounded overflow-hidden border border-[var(--border-subtle)]">
          {creatorColors.map((color, index) => {
            const isSelected = selectedColorIndex === index;
            return (
              <div
                key={index}
                onClick={() => setSelectedColorIndex(index)}
                className={`relative flex flex-col justify-end p-6 box-border transition-all duration-300 cursor-pointer ${isSelected ? 'flex-[1.2]' : 'flex-1'}`}
                style={{ backgroundColor: color.hex }}
              >
                {/* Top controls: Lock & Number */}
                <div className="flex items-center justify-between text-white drop-shadow-md">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
                    0{index + 1}
                  </span>
                  <KromaButton
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleToggleLock(index, e)}
                    className="p-1 h-6 w-6 rounded-xs bg-black/30 hover:bg-black/60"
                    title={color.locked ? 'Unlock swatch' : 'Lock swatch'}
                    aria-label={color.locked ? 'Unlock swatch' : 'Lock swatch'}
                    iconLeft={color.locked ? <Lock size={12} /> : <Unlock size={12} className="opacity-60" />}
                  />
                </div>

                {/* Bottom info: Name, Hex, Click to copy */}
                <div
                  className="flex flex-col gap-1 text-white drop-shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyHex(color.hex, color.name);
                  }}
                >
                  <span className="font-sans text-sm sm:text-base font-bold truncate">
                    {color.name}
                  </span>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span>{color.hex}</span>
                    <span className="text-[10px] opacity-75">Click to copy</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inline Color Inspector & Precision Adjuster */}
        <div className="mt-4 p-4 border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-8 h-8 rounded-xs border border-[var(--border-subtle)]"
              style={{ backgroundColor: activeColor.hex }}
            />
            <div className="flex flex-col">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {activeColor.name}
              </span>
              <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                HEX: {activeColor.hex} · RGB: {activeRgb ? `${activeRgb.r}, ${activeRgb.g}, ${activeRgb.b}` : '—'} · HSL: {activeHsl ? `${activeHsl.h}°, ${activeHsl.s}%, ${activeHsl.l}%` : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <KromaButton
              variant="outline"
              size="sm"
              onClick={() => handleCopyHex(activeColor.hex, activeColor.name)}
              iconLeft={<Copy size={12} />}
            >
              COPY HEX
            </KromaButton>
            <input
              type="color"
              value={activeColor.hex}
              onChange={(e) => {
                const newHex = e.target.value.toUpperCase();
                setCreatorColors((prev) =>
                  prev.map((c, i) => (i === selectedColorIndex ? { ...c, hex: newHex, name: findClosestColorName(newHex) } : c))
                );
              }}
              className="w-8 h-8 cursor-pointer rounded-xs border border-[var(--border-subtle)] bg-transparent p-0"
              title="Choose custom color"
            />
          </div>
        </div>
      </section>

      {/* ── 10: RECENT WORK (Visual Archive) ────────────────────── */}
      <section className="mb-24">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-4 block">VISUAL ARCHIVE</span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
              RECENT WORK
            </h2>
          </div>
          <KromaButton
            variant="ghost"
            size="sm"
            onClick={() => onNavigate({ path: 'palettes' })}
            iconRight={<ArrowUpRight size={13} />}
            className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-secondary hover:text-text-primary !p-0 !min-h-0"
          >
            VIEW ALL PALETTES
          </KromaButton>
        </div>

        <div className="flex flex-col gap-2">
          {recentPalettes.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 sm:px-5 bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] select-none hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] group"
              onClick={() => onNavigate({ path: 'palette-detail', slug: p.slug })}
              role="button"
              tabIndex={0}
            >
              <div className="flex w-[140px] h-7 rounded-[2px] overflow-hidden border border-black/10 dark:border-white/10">
                {p.colors.map((c, i) => (
                  <div
                    key={i}
                    className="flex-1 h-full"
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (${c.hex})`}
                  />
                ))}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-sm font-bold text-[#171717] dark:text-white uppercase tracking-tight">
                  {p.title}
                </span>
                <span className="font-mono text-xs text-[#707070] dark:text-[#909090] uppercase">
                  {p.colors.length} COLORS
                </span>
              </div>
              <ArrowUpRight size={14} className="text-[#707070] dark:text-[#909090] group-hover:text-[#171717] dark:group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          ))}
        </div>
      </section>

      {/* ── 11: COLOR EXPERIMENTS (Editorial Studies) ───────────── */}
      <section className="mb-24">
        <div className="flex items-baseline justify-between mb-6">
          <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-4 block">LAB STUDIES</span>
          <h2 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
            COLOR EXPERIMENTS
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          {/* Experiment Brick 1: Asymmetrical Composition */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] p-6 sm:p-7 flex flex-col justify-between min-h-[280px] box-border lg:col-span-7 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]">
            <div className="flex items-baseline justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] dark:text-[#909090]">
                EXP 01 / ANOMALOUS RATIO
              </span>
              <span className="font-mono text-[10px] text-[#707070] dark:text-[#909090]">
                OKLCH COMPLEMENTARY
              </span>
            </div>
            <div className="h-28 flex rounded-[2px] overflow-hidden mb-3 border border-black/10 dark:border-white/10">
              <div className="w-[50%] h-full flex flex-col justify-end p-2 text-white font-mono text-[10px]" style={{ backgroundColor: '#171717' }}>
                DOMINANT 50%
              </div>
              <div className="w-[25%] h-full flex flex-col justify-end p-2 text-white font-mono text-[10px]" style={{ backgroundColor: '#FF3B30' }}>
                SUB 25%
              </div>
              <div className="w-[15%] h-full flex flex-col justify-end p-2 text-black font-mono text-[10px]" style={{ backgroundColor: '#FFD60A' }}>
                15%
              </div>
              <div className="w-[10%] h-full flex flex-col justify-end p-2 text-white font-mono text-[10px]" style={{ backgroundColor: '#00AEEF' }}>
                10%
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[#171717] dark:text-white uppercase">
                Obsidian · Vermilion · Solar · Cyan
              </span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => onNavigate({ path: 'palette-generator', colors: '171717-FF3B30-FFD60A-00AEEF' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white p-0 h-auto"
                iconRight={<ArrowUpRight size={12} />}
              >
                <span>STUDY</span>
              </KromaButton>
            </div>
          </div>

          {/* Experiment Brick 2: Overlapping Physical Swatches */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] p-6 sm:p-7 flex flex-col justify-between min-h-[280px] box-border lg:col-span-5 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] dark:text-[#909090]">
                EXP 02 / DEPTH STACK
              </span>
              <span className="font-mono text-[10px] text-[#707070] dark:text-[#909090]">
                CHROMATIC LAYERING
              </span>
            </div>
            <div className="relative w-full h-[120px] mb-2">
              <div
                className="absolute rounded-[3px] shadow-sm transition-all duration-200 hover:z-10 w-28 h-20 top-2 left-2"
                style={{ backgroundColor: '#7B2CBF' }}
                title="Deep Violet (#7B2CBF)"
              />
              <div
                className="absolute rounded-[3px] shadow-sm transition-all duration-200 hover:z-10 w-28 h-20 top-5 left-16"
                style={{ backgroundColor: '#00AEEF' }}
                title="Electric Cyan (#00AEEF)"
              />
              <div
                className="absolute rounded-[3px] shadow-sm transition-all duration-200 hover:z-10 w-28 h-20 top-8 left-32"
                style={{ backgroundColor: '#34C759' }}
                title="Emerald Light (#34C759)"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[#171717] dark:text-white uppercase">
                Violet · Azure · Emerald
              </span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => onNavigate({ path: 'mesh' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white p-0 h-auto"
                iconRight={<ArrowUpRight size={12} />}
              >
                <span>MESH</span>
              </KromaButton>
            </div>
          </div>

          {/* Experiment Brick 3: High Contrast Minimal Pairing */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] p-6 sm:p-7 flex flex-col justify-between min-h-[280px] box-border lg:col-span-6 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] dark:text-[#909090]">
              EXP 03 / KINETIC TENSION
            </span>
            <div className="h-24 flex items-center justify-center p-2 rounded-[2px] my-2" style={{ backgroundColor: '#0E0F12' }}>
              <div className="w-10 h-10 rounded-full animate-pulse" style={{ backgroundColor: '#FFD60A' }} />
              <div className="w-8 h-8 rounded-full -ml-3" style={{ backgroundColor: '#FF3B30' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[#171717] dark:text-white uppercase">
                Springs Studio
              </span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => onNavigate({ path: 'springs' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white p-0 h-auto"
                iconRight={<ArrowUpRight size={12} />}
              >
                <span>BOUNCE</span>
              </KromaButton>
            </div>
          </div>

          {/* Experiment Brick 4: Vector Pattern Study */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] p-6 sm:p-7 flex flex-col justify-between min-h-[280px] box-border lg:col-span-6 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] dark:text-[#909090]">
              EXP 04 / GEOMETRIC REPEAT
            </span>
            <div
              className="h-24 rounded-[2px] my-2 border border-black/10 dark:border-white/10"
              style={{
                backgroundColor: '#171717',
                backgroundImage: 'radial-gradient(#34C759 2px, transparent 2px), radial-gradient(#FF9500 2px, #171717 2px)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 8px 8px',
              }}
            />
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[#171717] dark:text-white uppercase">
                Surface Grid
              </span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => onNavigate({ path: 'pattern-studio' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white p-0 h-auto"
                iconRight={<ArrowUpRight size={12} />}
              >
                <span>VECTOR</span>
              </KromaButton>
            </div>
          </div>

          {/* Experiment Brick 5: Semantic Ramps */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] p-6 sm:p-7 flex flex-col justify-between min-h-[280px] box-border lg:col-span-6 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] dark:text-[#909090]">
              EXP 05 / WCAG STEPPING
            </span>
            <div className="h-24 flex flex-col justify-center gap-1 my-2">
              <div className="flex gap-1 h-5">
                {['#E0F2FE', '#7DD3FC', '#0284C7', '#0369A1'].map((hex, i) => (
                  <div key={i} className="flex-1 rounded-[1px]" style={{ backgroundColor: hex }} />
                ))}
              </div>
              <div className="flex gap-1 h-5">
                {['#FEE2E2', '#FCA5A5', '#DC2626', '#991B1B'].map((hex, i) => (
                  <div key={i} className="flex-1 rounded-[1px]" style={{ backgroundColor: hex }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[#171717] dark:text-white uppercase">
                System Tokens
              </span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => onNavigate({ path: 'ramps' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white p-0 h-auto"
                iconRight={<ArrowUpRight size={12} />}
              >
                <span>RAMPS</span>
              </KromaButton>
            </div>
          </div>

          {/* Experiment Brick 6: Atmospheric Weather Color */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] p-6 sm:p-7 flex flex-col justify-between min-h-[280px] box-border lg:col-span-6 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] dark:text-[#909090]">
              EXP 06 / SOLAR HORIZON
            </span>
            <div className="h-24 rounded-[2px] my-2 overflow-hidden flex flex-col justify-between p-2.5" style={{ background: 'linear-gradient(180deg, #1D3557 0%, #457B9D 45%, #E07A5F 80%, #F4A261 100%)' }}>
              <div className="flex items-center justify-between text-[10px] font-mono text-white/90">
                <span>RAYLEIGH SCATTER</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
              </div>
              <div className="h-2 rounded-[1px] flex overflow-hidden">
                {['#1D3557', '#457B9D', '#A8DADC', '#E07A5F', '#F4A261'].map((c, i) => (
                  <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[#171717] dark:text-white uppercase">
                Weather Color
              </span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => onNavigate({ path: 'live' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white p-0 h-auto"
                iconRight={<ArrowUpRight size={12} />}
              >
                <span>OBSERVE</span>
              </KromaButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── 22: SEARCH INSIDE STUDIO ────────────────────────────── */}
      <section className="mb-24">
        <div className="mb-4">
          <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-4 block">DISCOVERY INDEX</span>
          <h2 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
            SEARCH YOUR COLORS
          </h2>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by color name, HEX code (#FF3B30), or mood..."
            className="w-full bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--text-primary)] py-3 pl-8 pr-4 font-sans text-base sm:text-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none transition-colors"
          />
          <Search size={18} className="absolute left-0 top-4 text-[var(--text-secondary)]" />
        </div>

        {searchQuery.trim() && (
          <div className="flex flex-col gap-6">
            {filteredPalettes.length > 0 && (
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-3 block">
                  PALETTES ({filteredPalettes.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredPalettes.slice(0, 6).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onNavigate({ path: 'palette-detail', slug: p.slug })}
                      className="p-3 border border-[var(--border-subtle)] hover:border-[var(--text-primary)] cursor-pointer transition-colors"
                    >
                      <div className="h-14 flex rounded-xs overflow-hidden mb-2">
                        {p.colors.map((c, i) => (
                          <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
                        ))}
                      </div>
                      <span className="font-sans text-xs font-bold uppercase text-[var(--text-primary)]">
                        {p.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredColors.length > 0 && (
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-3 block">
                  SPECIMENS ({filteredColors.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredColors.slice(0, 12).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleCopyHex(c.hex, c.name)}
                      className="p-2 border border-[var(--border-subtle)] hover:border-[var(--text-primary)] cursor-pointer transition-colors"
                    >
                      <div className="h-12 rounded-xs mb-1.5" style={{ backgroundColor: c.hex }} />
                      <div className="font-sans text-[11px] font-bold uppercase truncate text-[var(--text-primary)]">
                        {c.name}
                      </div>
                      <div className="font-mono text-[10px] text-[var(--text-secondary)]">
                        {c.hex}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredPalettes.length === 0 && filteredColors.length === 0 && (
              <div className="py-20 px-8 text-center border border-dashed border-border-subtle rounded flex flex-col items-center justify-center gap-4">
                <div className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-text-secondary">NO MATCHING CHROMATIC DATA.</div>
                <div className="font-sans text-sm text-text-tertiary max-w-[420px] leading-relaxed">
                  Try searching for a different tone, like Vermilion, Cobalt, Amber, or #FF3B30.
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
