import React from 'react';
import {
  ArrowUpRight,
  Sparkles,
  Layers,
  Wand2,
  Bookmark,
  Plus,
} from 'lucide-react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';

interface CreateStudioGatewayPageProps {
  onNavigate: (route: RouteType) => void;
}

export const CreateStudioGatewayPage: React.FC<CreateStudioGatewayPageProps> = ({ onNavigate }) => {
  const { palettes, colors } = useLibraryData();
  const { savedItems } = useSaved();
  const { showToast } = useToast();

  const recentPalette = palettes[0] || {
    id: 'studio-default',
    title: 'Chromatic Spectrum System',
    category: 'Studio Default',
    slug: 'chromatic-spectrum',
    colors: [
      { name: 'Pure Red', hex: '#FF3B30' },
      { name: 'Warm Amber', hex: '#FF9500' },
      { name: 'Lemon Sun', hex: '#FFD60A' },
      { name: 'Emerald', hex: '#34C759' },
      { name: 'Cyan Azure', hex: '#00AEEF' },
    ],
  };

  const favoriteColors = colors.slice(0, 8);

  const handleCopyHex = async (hex: string, name: string) => {
    const ok = await copyToClipboard(hex);
    if (ok) {
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  return (
    <div className="kroma-page">
      <SEOHead
        title="The Studio — Your Color Workspace | KROMA"
        description="A high-end creative suite. Ramps studio, mesh gradients, antigravity physics, and generative pattern engines in one unified workspace."
        canonicalPath="/create"
      />

      {/* Top Editorial Hero */}
      <header className="kroma-hero">
        <div className="kroma-label">THE STUDIO</div>
        <h1 className="kroma-headline">YOUR COLOR WORKSPACE.</h1>
        <p className="kroma-lead">
          A high-end creative suite. Everything in reach: parametric ramps, generative mesh fields, kinetic particles, and vector pattern systems.
        </p>
      </header>

      {/* Module 1: Recent Palette (Oversized Strip) */}
      <section className="mb-14">
        <div className="flex items-baseline justify-between mb-3">
          <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
            MODULE 01 / RECENT PALETTE
          </div>
          <button
            onClick={() => onNavigate({ path: 'palette-generator' })}
            className="text-xs font-sans font-semibold tracking-wider uppercase text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            NEW SYSTEM ↗
          </button>
        </div>

        <div
          className="kroma-palette-strip"
          onClick={() => onNavigate({ path: 'palette-detail', slug: recentPalette.slug })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onNavigate({ path: 'palette-detail', slug: recentPalette.slug });
          }}
        >
          <div className="kroma-palette-strip__colors">
            {recentPalette.colors.map((c, i) => (
              <div
                key={i}
                className="kroma-palette-strip__color-bar"
                style={{ backgroundColor: c.hex }}
                title={`${c.name} (${c.hex})`}
              />
            ))}
            <span className="kroma-palette-strip__hover-cta">
              <span>OPEN IN WORKSPACE</span>
              <ArrowUpRight size={13} />
            </span>
          </div>

          <div className="kroma-palette-strip__meta flex items-center justify-between">
            <div>
              <div className="kroma-palette-strip__num">
                LATEST SYSTEM · {recentPalette.category?.toUpperCase() || 'STUDIO'}
              </div>
              <div className="kroma-palette-strip__title">
                {recentPalette.title}
              </div>
            </div>
            <div className="font-mono text-xs text-neutral-400">
              {recentPalette.colors.length} TONAL SPECIMENS
            </div>
          </div>
        </div>
      </section>

      {/* Module 3: Generative Doorways (Large Visual Cards with Live Previews) */}
      <section className="mb-14">
        <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-4">
          MODULE 02 / GENERATIVE INSTRUMENTS
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Doorway 1: Ramps Studio */}
          <div
            className="bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm p-5 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between group"
            onClick={() => onNavigate({ path: 'ramps' })}
          >
            <div>
              {/* Live Visual Preview */}
              <div className="h-32 rounded-sm overflow-hidden mb-4 flex flex-col justify-between p-2 border border-black/5 shadow-inner" style={{ background: 'linear-gradient(to right, #00AEEF, #7B2CBF, #FF3B30)' }}>
                <span className="self-end font-mono text-[9px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-xs">
                  RAMP
                </span>
                <div className="flex gap-1">
                  {['#00AEEF', '#5642D8', '#7B2CBF', '#C82E6E', '#FF3B30'].map((h, i) => (
                    <div key={i} className="flex-1 h-3 rounded-xs border border-white/20" style={{ backgroundColor: h }} />
                  ))}
                </div>
              </div>

              <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                SYSTEM SCALES
              </div>
              <h3 className="font-sans text-lg font-bold text-neutral-900 dark:text-white uppercase flex items-center justify-between">
                <span>RAMPS STUDIO</span>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="font-sans text-xs text-neutral-500 mt-1 leading-relaxed">
                Generate perceptually stepped UI scales and WCAG contrast ramps.
              </p>
            </div>
          </div>

          {/* Doorway 2: Mesh Gradient */}
          <div
            className="bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm p-5 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between group"
            onClick={() => onNavigate({ path: 'mesh' })}
          >
            <div>
              {/* Live Mesh Gradient Preview */}
              <div
                className="h-32 rounded-sm overflow-hidden mb-4 p-2 border border-black/5 shadow-inner flex justify-end items-start"
                style={{
                  background: 'radial-gradient(at 0% 0%, #FF3B30 0px, transparent 50%), radial-gradient(at 100% 0%, #00AEEF 0px, transparent 50%), radial-gradient(at 100% 100%, #FFD60A 0px, transparent 50%), radial-gradient(at 0% 100%, #7B2CBF 0px, transparent 50%), #171717',
                }}
              >
                <span className="font-mono text-[9px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-xs">
                  MESH
                </span>
              </div>

              <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                COMPLEX BLENDS
              </div>
              <h3 className="font-sans text-lg font-bold text-neutral-900 dark:text-white uppercase flex items-center justify-between">
                <span>MESH GRADIENT</span>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="font-sans text-xs text-neutral-500 mt-1 leading-relaxed">
                Sculpt fluid multi-point gradient canvases and export CSS.
              </p>
            </div>
          </div>

          {/* Doorway 3: Antigravity */}
          <div
            className="bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm p-5 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between group"
            onClick={() => onNavigate({ path: 'antigravity' })}
          >
            <div>
              {/* Live Particle Preview */}
              <div
                className="h-32 rounded-sm overflow-hidden mb-4 p-3 bg-[#111216] border border-black/5 shadow-inner relative flex justify-end items-start"
              >
                <span className="font-mono text-[9px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-xs z-10">
                  PHYSICS
                </span>
                <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-[#FF3B30] blur-xs animate-bounce" />
                  <div className="w-10 h-10 rounded-full bg-[#00AEEF] blur-xs animate-pulse" />
                  <div className="w-6 h-6 rounded-full bg-[#FFD60A] blur-xs" />
                </div>
              </div>

              <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                KINETIC CANVAS
              </div>
              <h3 className="font-sans text-lg font-bold text-neutral-900 dark:text-white uppercase flex items-center justify-between">
                <span>ANTIGRAVITY</span>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="font-sans text-xs text-neutral-500 mt-1 leading-relaxed">
                Floating chromatic particles interacting with mouse forces.
              </p>
            </div>
          </div>

          {/* Doorway 4: Pattern Studio */}
          <div
            className="bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm p-5 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between group"
            onClick={() => onNavigate({ path: 'pattern-studio' })}
          >
            <div>
              {/* Live Pattern Texture Preview */}
              <div
                className="h-32 rounded-sm overflow-hidden mb-4 p-2 border border-black/5 shadow-inner flex justify-end items-start"
                style={{
                  backgroundColor: '#1E2028',
                  backgroundImage: 'radial-gradient(#34C759 1.5px, transparent 1.5px), radial-gradient(#FF9500 1.5px, #1E2028 1.5px)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 8px 8px',
                }}
              >
                <span className="font-mono text-[9px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-xs">
                  PATTERN
                </span>
              </div>

              <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                SURFACE TEXTURES
              </div>
              <h3 className="font-sans text-lg font-bold text-neutral-900 dark:text-white uppercase flex items-center justify-between">
                <span>PATTERN STUDIO</span>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="font-sans text-xs text-neutral-500 mt-1 leading-relaxed">
                Generate repeating vector SVG patterns and geometric textures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Module 2: Color Tiles (Quick Access) */}
      <section className="mb-14">
        <div className="flex items-baseline justify-between mb-4">
          <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
            MODULE 03 / QUICK SPECIMEN TILES
          </div>
          <button
            onClick={() => onNavigate({ path: 'colors' })}
            className="text-xs font-sans font-semibold tracking-wider uppercase text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            VIEW DRAWER ↗
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {favoriteColors.map((color) => (
            <div
              key={color.id}
              onClick={() => handleCopyHex(color.hex, color.name)}
              className="group bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm p-3 cursor-pointer hover:border-neutral-400 transition-all flex flex-col justify-between"
            >
              <div
                className="h-16 rounded-xs mb-2 shadow-inner group-hover:scale-105 transition-transform"
                style={{ backgroundColor: color.hex }}
              />
              <div className="font-sans text-xs font-bold text-neutral-900 dark:text-white truncate">
                {color.name}
              </div>
              <div className="font-mono text-[10px] text-neutral-400">
                {color.hex}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Module 4: Saved Inspiration */}
      <section className="mb-16">
        <div className="flex items-baseline justify-between mb-4">
          <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
            MODULE 04 / SAVED INSPIRATION ({savedItems.length})
          </div>
          <button
            onClick={() => onNavigate({ path: 'saved' })}
            className="text-xs font-sans font-semibold tracking-wider uppercase text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            OPEN ARCHIVE ↗
          </button>
        </div>

        {savedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {savedItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate({ path: 'saved' })}
                className="p-3 bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm cursor-pointer hover:border-neutral-400 transition-all flex flex-col"
              >
                <div
                  className="h-14 rounded-xs mb-2 shadow-inner"
                  style={{
                    background: item.preview.includes(',') ? undefined : item.preview,
                    backgroundColor: item.preview.includes(',') ? item.preview.split(',')[0] : undefined,
                  }}
                />
                <span className="font-sans text-xs font-bold truncate text-neutral-900 dark:text-white">
                  {item.title}
                </span>
                <span className="font-mono text-[10px] text-neutral-400 uppercase">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm">
            <p className="font-sans text-xs text-neutral-500 mb-3">
              No saved items in your inspiration queue yet.
            </p>
            <button
              onClick={() => onNavigate({ path: 'palettes' })}
              className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white transition-colors"
            >
              BROWSE PALETTES ↗
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
