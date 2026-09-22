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
            className="bg-surface-1 border border-border-subtle rounded p-6 flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-150 select-none hover:-translate-y-0.5 hover:border-text-primary hover:shadow-md group"
            onClick={() => {
              const el = document.getElementById('studio-canvas-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
          >
            <div>
              <div className="w-full h-[90px] rounded-xs mb-5 overflow-hidden relative">
                {['#FF3B30', '#FF9500', '#FFD60A', '#171717'].map((hex, i) => (
                  <div key={i} className="flex-1 h-full" style={{ backgroundColor: hex }} />
                ))}
              </div>
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-text-secondary mb-2">CANVAS STAGE</div>
            </div>
            <div className="font-sans text-lg font-semibold leading-tight text-text-primary tracking-tight">
              <span>CREATE PALETTE</span>
              <ArrowUpRight size={15} />
            </div>
          </div>

          {/* Action 2: Generate */}
          <div
            className="bg-surface-1 border border-border-subtle rounded p-6 flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-150 select-none hover:-translate-y-0.5 hover:border-text-primary hover:shadow-md group"
            onClick={() => onNavigate({ path: 'palette-generator' })}
            role="button"
            tabIndex={0}
          >
            <div>
              <div className="w-full h-[90px] rounded-xs mb-5 overflow-hidden relative">
                {['#00AEEF', '#7B2CBF', '#FF3B30'].map((hex, i) => (
                  <div key={i} className="flex-1 h-full" style={{ backgroundColor: hex }} />
                ))}
              </div>
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-text-secondary mb-2">LABORATORY</div>
            </div>
            <div className="font-sans text-lg font-semibold leading-tight text-text-primary tracking-tight">
              <span>GENERATE ↻</span>
              <ArrowUpRight size={15} />
            </div>
          </div>

          {/* Action 3: Image to Palette */}
          <div
            className="bg-surface-1 border border-border-subtle rounded p-6 flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-150 select-none hover:-translate-y-0.5 hover:border-text-primary hover:shadow-md group"
            onClick={() => onNavigate({ path: 'extract-from-image' })}
            role="button"
            tabIndex={0}
          >
            <div>
              <div className="w-full h-[90px] rounded-xs mb-5 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #171717 0%, #34C759 50%, #00AEEF 100%)' }}>
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border border-white bg-white/20" />
                </div>
              </div>
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-text-secondary mb-2">CHROMATIC EXTRACTION</div>
            </div>
            <div className="font-sans text-lg font-semibold leading-tight text-text-primary tracking-tight">
              <span>IMAGE → PALETTE</span>
              <ArrowUpRight size={15} />
            </div>
          </div>

          {/* Action 4: Explore Colors */}
          <div
            className="bg-surface-1 border border-border-subtle rounded p-6 flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-150 select-none hover:-translate-y-0.5 hover:border-text-primary hover:shadow-md group"
            onClick={() => onNavigate({ path: 'colors' })}
            role="button"
            tabIndex={0}
          >
            <div>
              <div className="w-full h-[90px] rounded-xs mb-5 overflow-hidden relative">
                {['#FF3B30', '#34C759', '#00AEEF', '#7B2CBF', '#FFD60A'].map((hex, i) => (
                  <div key={i} className="flex-1 h-full" style={{ backgroundColor: hex }} />
                ))}
              </div>
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-text-secondary mb-2">SWATCH ARCHIVE</div>
            </div>
            <div className="font-sans text-lg font-semibold leading-tight text-text-primary tracking-tight">
              <span>EXPLORE COLORS</span>
              <ArrowUpRight size={15} />
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
            <button
              onClick={handleRandomizeCreator}
              className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase px-6 py-3 bg-surface-1 text-text-primary border border-border-subtle rounded cursor-pointer inline-flex items-center gap-2 transition-all duration-150 select-none hover:border-text-primary hover:-translate-y-0.5"
              title="Randomize unlocked swatches"
            >
              <RefreshCw size={13} />
              <span>RANDOMIZE ↻</span>
            </button>
            <button
              onClick={handleSaveCanvasPalette}
              className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase px-6 py-3 bg-text-primary text-canvas border border-text-primary rounded cursor-pointer inline-flex items-center gap-2 transition-all duration-150 select-none hover:opacity-90 hover:-translate-y-0.5"
            >
              <span>SAVE TO STUDIO ↗</span>
            </button>
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
                  <button
                    onClick={(e) => handleToggleLock(index, e)}
                    className="p-1 rounded-xs bg-black/30 hover:bg-black/60 transition-colors"
                    title={color.locked ? 'Unlock swatch' : 'Lock swatch'}
                  >
                    {color.locked ? <Lock size={12} /> : <Unlock size={12} className="opacity-60" />}
                  </button>
                </div>

                {/* Bottom info: Name, Hex, Click to copy */}
                <div
                  className="flex flex-col gap-1 text-white drop-shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyHex(color.hex, color.name);
                  }}
                  title="Click to copy HEX"
                >
                  <span className="font-sans text-xs font-semibold uppercase tracking-wider truncate">
                    {color.name}
                  </span>
                  <span className="font-mono text-sm font-bold flex items-center justify-between">
                    <span>{color.hex}</span>
                    <span className="text-[10px] opacity-0 hover:opacity-100 uppercase tracking-wider">
                      COPY
                    </span>
                  </span>
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
            <button
              onClick={() => handleCopyHex(activeColor.hex, activeColor.name)}
              className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase px-6 py-3 bg-surface-1 text-text-primary border border-border-subtle rounded cursor-pointer inline-flex items-center gap-2 transition-all duration-150 select-none hover:border-text-primary hover:-translate-y-0.5"
            >
              <Copy size={12} />
              <span>COPY HEX</span>
            </button>
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
          <button
            onClick={() => onNavigate({ path: 'palettes' })}
            className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-secondary bg-transparent border-0 cursor-pointer inline-flex items-center gap-1.5 p-0 transition-colors duration-150 hover:text-text-primary"
          >
            <span>VIEW ALL PALETTES</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="flex flex-col">
          {recentPalettes.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 sm:px-5 bg-surface-1 border border-border-subtle rounded cursor-pointer transition-all duration-150 select-none hover:border-text-primary hover:translate-x-0.5 group"
              onClick={() => onNavigate({ path: 'palette-detail', slug: p.slug })}
              role="button"
              tabIndex={0}
            >
              <div className="flex w-[140px] h-7 rounded-xs overflow-hidden">
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
                <div>
                  <span className="font-sans text-sm font-semibold text-text-primary mr-3">{p.title}</span>
                  <span className="font-mono text-[10px] text-text-secondary uppercase">{p.colors.length} COLORS</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] uppercase tracking-wider transition-colors">
                  <span>OPEN</span>
                  <ArrowUpRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 11: COLOR EXPERIMENTS (Working Wall) ────────────────── */}
      <section className="mb-24">
        <div className="mb-6">
          <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-4 block">DESIGNER'S WALL</span>
          <h2 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
            COLOR EXPERIMENTS
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          {/* Experiment Brick 1: Asymmetrical Composition */}
          <div className="bg-surface-1 border border-border-subtle rounded p-6 sm:p-8 flex flex-col justify-between min-h-[280px] box-border lg:col-span-7">
            <div className="flex items-baseline justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                EXP 01 / ANOMALOUS RATIO
              </span>
              <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                OKLCH COMPLEMENTARY
              </span>
            </div>
            <div className="h-28 flex rounded-xs overflow-hidden mb-3">
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
              <span className="font-sans text-xs font-semibold text-[var(--text-primary)] uppercase">
                Obsidian · Vermilion · Solar · Cyan
              </span>
              <button
                onClick={() => onNavigate({ path: 'palette-generator', colors: '171717-FF3B30-FFD60A-00AEEF' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-secondary bg-transparent border-0 cursor-pointer inline-flex items-center gap-1.5 p-0 transition-colors duration-150 hover:text-text-primary"
              >
                <span>STUDY ↗</span>
              </button>
            </div>
          </div>

          {/* Experiment Brick 2: Overlapping Physical Swatches */}
          <div className="bg-surface-1 border border-border-subtle rounded p-6 sm:p-8 flex flex-col justify-between min-h-[280px] box-border lg:col-span-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                EXP 02 / DEPTH STACK
              </span>
              <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                CHROMATIC LAYERING
              </span>
            </div>
            <div className="relative w-full h-[120px] mb-2">
              <div
                className="absolute rounded shadow-md transition-all duration-200 hover:-translate-y-1 hover:z-10 w-28 h-20 top-2 left-2"
                style={{ backgroundColor: '#7B2CBF' }}
                title="Deep Violet (#7B2CBF)"
              />
              <div
                className="absolute rounded shadow-md transition-all duration-200 hover:-translate-y-1 hover:z-10 w-28 h-20 top-5 left-16"
                style={{ backgroundColor: '#00AEEF' }}
                title="Electric Cyan (#00AEEF)"
              />
              <div
                className="absolute rounded shadow-md transition-all duration-200 hover:-translate-y-1 hover:z-10 w-28 h-20 top-8 left-32"
                style={{ backgroundColor: '#34C759' }}
                title="Emerald Light (#34C759)"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[var(--text-primary)] uppercase">
                Violet · Azure · Emerald
              </span>
              <button
                onClick={() => onNavigate({ path: 'mesh' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-secondary bg-transparent border-0 cursor-pointer inline-flex items-center gap-1.5 p-0 transition-colors duration-150 hover:text-text-primary"
              >
                <span>MESH ↗</span>
              </button>
            </div>
          </div>

          {/* Experiment Brick 3: High Contrast Minimal Pairing */}
          <div className="bg-surface-1 border border-border-subtle rounded p-6 sm:p-8 flex flex-col justify-between min-h-[280px] box-border lg:col-span-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
              EXP 03 / KINETIC TENSION
            </span>
            <div className="h-24 flex items-center justify-center p-2 rounded-xs my-2" style={{ backgroundColor: '#0E0F12' }}>
              <div className="w-10 h-10 rounded-full animate-pulse" style={{ backgroundColor: '#FFD60A' }} />
              <div className="w-8 h-8 rounded-full -ml-3" style={{ backgroundColor: '#FF3B30' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[var(--text-primary)] uppercase">
                Physics Specimen
              </span>
              <button
                onClick={() => onNavigate({ path: 'antigravity' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-secondary bg-transparent border-0 cursor-pointer inline-flex items-center gap-1.5 p-0 transition-colors duration-150 hover:text-text-primary"
              >
                <span>TEST ↗</span>
              </button>
            </div>
          </div>

          {/* Experiment Brick 4: Vector Pattern Study */}
          <div className="bg-surface-1 border border-border-subtle rounded p-6 sm:p-8 flex flex-col justify-between min-h-[280px] box-border lg:col-span-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
              EXP 04 / GEOMETRIC REPEAT
            </span>
            <div
              className="h-24 rounded-xs my-2"
              style={{
                backgroundColor: '#171717',
                backgroundImage: 'radial-gradient(#34C759 2px, transparent 2px), radial-gradient(#FF9500 2px, #171717 2px)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 8px 8px',
              }}
            />
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[var(--text-primary)] uppercase">
                Surface Grid
              </span>
              <button
                onClick={() => onNavigate({ path: 'pattern-studio' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-secondary bg-transparent border-0 cursor-pointer inline-flex items-center gap-1.5 p-0 transition-colors duration-150 hover:text-text-primary"
              >
                <span>VECTOR ↗</span>
              </button>
            </div>
          </div>

          {/* Experiment Brick 5: Semantic Ramps */}
          <div className="bg-surface-1 border border-border-subtle rounded p-6 sm:p-8 flex flex-col justify-between min-h-[280px] box-border lg:col-span-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
              EXP 05 / WCAG STEPPING
            </span>
            <div className="h-24 flex flex-col justify-center gap-1 my-2">
              <div className="flex gap-1 h-5">
                {['#E0F2FE', '#7DD3FC', '#0284C7', '#0369A1'].map((hex, i) => (
                  <div key={i} className="flex-1 rounded-xs" style={{ backgroundColor: hex }} />
                ))}
              </div>
              <div className="flex gap-1 h-5">
                {['#FEE2E2', '#FCA5A5', '#DC2626', '#991B1B'].map((hex, i) => (
                  <div key={i} className="flex-1 rounded-xs" style={{ backgroundColor: hex }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-[var(--text-primary)] uppercase">
                System Tokens
              </span>
              <button
                onClick={() => onNavigate({ path: 'ramps' })}
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-secondary bg-transparent border-0 cursor-pointer inline-flex items-center gap-1.5 p-0 transition-colors duration-150 hover:text-text-primary"
              >
                <span>RAMPS ↗</span>
              </button>
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
