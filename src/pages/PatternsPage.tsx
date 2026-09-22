import React, { useState, useMemo } from 'react';
import { Sliders, Search, X, ArrowUpRight, Grid, Sparkles, Layers } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PATTERNS } from '../data/patterns';
import { PatternCard } from '../components/PatternCard';
import { SEOHead } from '../components/seo/SEOHead';
import { generatePatternSvg } from '../utils/patternEngine';
import { Link } from '../components/common/Link';
import { KromaCard } from '../components/common/KromaCard';
import { KromaButton } from '../components/common/KromaButton';

interface PatternsPageProps {
  onNavigate: (route: RouteType) => void;
}

const PATTERN_TYPES = ['all', 'dots', 'grid', 'stripes', 'waves', 'geometry', 'shapes'] as const;

export const PatternsPage: React.FC<PatternsPageProps> = ({ onNavigate }) => {
  const [activeType, setActiveType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered patterns based on active type and search query
  const filteredPatterns = useMemo(() => {
    let result = CURATED_PATTERNS;

    if (activeType !== 'all') {
      result = result.filter((p) => p.type === activeType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.type.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeType, searchQuery]);

  // Featured pattern (first pattern by default, or active filter match)
  const featuredPattern = useMemo(() => {
    return filteredPatterns[0] || CURATED_PATTERNS[0];
  }, [filteredPatterns]);

  // Archive items (excluding featured when showing all and no search query)
  const archiveItems = useMemo(() => {
    if (activeType === 'all' && !searchQuery.trim() && filteredPatterns.length > 1) {
      return filteredPatterns.slice(1);
    }
    return filteredPatterns;
  }, [filteredPatterns, activeType, searchQuery]);

  // Render SVG preview for the large featured canvas
  const featuredSvg = useMemo(() => {
    if (!featuredPattern) return '';
    return generatePatternSvg(
      {
        type: featuredPattern.type,
        palette: featuredPattern.palette,
        scale: featuredPattern.scale,
        density: featuredPattern.density,
        rotation: featuredPattern.rotation,
        strokeWidth: featuredPattern.strokeWidth,
        opacity: featuredPattern.opacity,
      },
      960,
      480
    );
  }, [featuredPattern]);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10 sm:gap-12 pb-20 px-4 sm:px-6">
      <SEOHead
        title="Pattern Archive | Generative Vector Surfaces & Textures | Kroma"
        description="Explore curated generative vector surfaces, geometric tessellations, and mathematical textures created inside Kroma. Export SVG, CSS, and inspect live parameters."
        canonicalPath="/patterns"
        keywords={['pattern archive', 'vector patterns', 'generative surfaces', 'geometric textures', 'svg pattern library']}
      />

      {/* ─── 01. EDITORIAL HEADER & INTRO ─────────────────────────── */}
      <header className="flex flex-col gap-4 pt-2">
        {/* Editorial Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[11px] text-[#707070] uppercase tracking-wider">
          <Link to={{ path: 'home' }} onNavigate={onNavigate} className="hover:text-[#171717] dark:hover:text-white transition-colors">
            HOME
          </Link>
          <span>/</span>
          <span className="text-[#171717] dark:text-white font-semibold">PATTERNS</span>
        </nav>

        {/* Compact Editorial Intro with Studio Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#707070] flex items-center gap-2">
              <span>06</span>
              <span>•</span>
              <span>DIGITAL PATTERN ARCHIVE</span>
            </span>
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
              Pattern Archive
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#707070] dark:text-[#A0A0A0] max-w-xl leading-relaxed m-0 mt-1">
              Generative surfaces, geometric tessellations, and tactile textures synthesized from calibrated color systems.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <KromaButton
              variant="filled"
              size="sm"
              to={{ path: 'pattern-studio' }}
              onNavigate={onNavigate}
              iconLeft={<Sliders size={13} />}
            >
              Launch Studio
            </KromaButton>
          </div>
        </div>
      </header>

      {/* ─── 02. FEATURED PATTERN SPECIMEN ────────────────────────── */}
      {!searchQuery.trim() && activeType === 'all' && featuredPattern && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.12em] uppercase text-[#707070]">
              FEATURED ARCHIVE SPECIMEN
            </span>
            <span className="font-mono text-[10.5px] text-[#707070] uppercase">
              SPECIMEN 01 / {CURATED_PATTERNS.length}
            </span>
          </div>

          <KromaCard
            variant="featured"
            className="group/featured cursor-pointer overflow-hidden"
            onClick={() => onNavigate({ path: 'pattern-detail', slug: featuredPattern.slug })}
          >
            {/* Immersive Large Artboard Canvas */}
            <div className="w-full h-72 sm:h-96 md:h-[420px] relative overflow-hidden select-none border-b border-black/[0.08] dark:border-white/[0.08]">
              <div
                className="w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/featured:scale-[1.03] motion-reduce:transform-none"
                dangerouslySetInnerHTML={{ __html: featuredSvg }}
              />

              <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase px-2.5 py-1 rounded-[2px] bg-black/75 text-white backdrop-blur-xs tracking-wider">
                  {featuredPattern.type}
                </span>
              </div>
            </div>

            {/* Specimen Editorial Context Footer */}
            <div className="p-4 sm:p-6 bg-[#F8F8F8] dark:bg-[#141518] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#707070]">
                  {featuredPattern.category} · {featuredPattern.scale}PX GRID · {featuredPattern.density}% DENSITY
                </div>
                <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white m-0 truncate">
                  {featuredPattern.title}
                </h2>
                <p className="font-sans text-xs text-[#707070] dark:text-[#A0A0A0] max-w-2xl leading-relaxed m-0 mt-0.5 line-clamp-1">
                  {featuredPattern.description}
                </p>
              </div>

              {/* Color Swatch Dots & CTA */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5" title="Palette Swatches">
                  {featuredPattern.palette.map((hex, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-[2px] border border-black/15 shadow-2xs"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>

                <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#171717] dark:text-white group-hover/featured:text-[#00AEEF] transition-colors">
                  <span>Inspect Specimen</span>
                  <ArrowUpRight size={13} className="group-hover/featured:translate-x-0.5 group-hover/featured:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </KromaCard>
        </section>
      )}

      {/* ─── 03. ARCHIVE NAVIGATION & SEARCH CONTROLS ─────────────── */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Quiet Editorial Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707070]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH ARCHIVE..."
            className="w-full pl-9 pr-8 py-2 bg-transparent border-b border-black/20 dark:border-white/20 focus:border-[#171717] dark:focus:border-white text-xs font-mono text-[#171717] dark:text-white placeholder-[#707070] outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#171717] dark:hover:text-white p-1 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {PATTERN_TYPES.map((type) => {
            const count =
              type === 'all'
                ? CURATED_PATTERNS.length
                : CURATED_PATTERNS.filter((p) => p.type === type).length;
            const isActive = activeType === type;

            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 rounded-[3px] font-mono text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]'
                    : 'bg-black/[0.04] dark:bg-white/[0.05] text-[#707070] hover:text-[#171717] dark:hover:text-white'
                }`}
              >
                <span>{type}</span>
                <span className={`text-[9px] opacity-70`}>{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── 04. RHYTHMIC PATTERN ARCHIVE GRID ────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2">
          <span className="font-mono text-[11px] text-[#707070] uppercase">
            DISPLAYING {archiveItems.length} OF {CURATED_PATTERNS.length} SPECIMENS
          </span>
          {searchQuery && (
            <span className="font-mono text-[11px] text-[#00AEEF]">
              FILTERED BY &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {archiveItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archiveItems.map((pattern, index) => {
              // Create subtle editorial variation: Alternate taller previews for visual rhythm
              const isTaller = index % 5 === 0 || index % 5 === 3;
              return (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  onNavigate={onNavigate}
                  heightClass={isTaller ? 'h-56 sm:h-64' : 'h-44 sm:h-48'}
                />
              );
            })}
          </div>
        ) : (
          /* ─── 05. INTENTIONAL EDITORIAL EMPTY STATE ─────────────── */
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] bg-[#F8F8F8] dark:bg-[#141518]">
            <span className="font-mono text-xs tracking-wider uppercase text-[#707070]">
              NO SPECIMENS LOCATED
            </span>
            <p className="font-sans text-sm text-[#707070] max-w-sm m-0">
              No vector surfaces match the filter &ldquo;{searchQuery || activeType}&rdquo;.
            </p>
            <KromaButton
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveType('all');
                setSearchQuery('');
              }}
              className="mt-2"
            >
              Reset Archive Filters
            </KromaButton>
          </div>
        )}
      </section>
    </div>
  );
};
