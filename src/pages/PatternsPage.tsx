import React, { useState, useMemo } from 'react';
import { Search, X, ArrowUpRight, ArrowRight, Sliders, Sparkles, Layers, Eye } from 'lucide-react';
import { RouteType, PatternItem } from '../types';
import { CURATED_PATTERNS } from '../data/patterns';
import { SEOHead } from '../components/seo/SEOHead';
import { generatePatternSvg } from '../utils/patternEngine';
import { Link } from '../components/common/Link';
import { KromaButton } from '../components/common/KromaButton';

interface PatternsPageProps {
  onNavigate: (route: RouteType) => void;
}

// Editorial Category Taxonomy
interface CategoryConfig {
  id: string;
  label: string;
  subcategories?: readonly string[];
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'all', label: 'ALL' },
  { id: 'geometric', label: 'GEOMETRIC', subcategories: ['geometric', 'modernist', 'architectural'] },
  { id: 'organic', label: 'ORGANIC', subcategories: ['organic', 'craft'] },
  { id: 'grid', label: 'GRID', subcategories: ['editorial', 'minimal', 'grid'] },
  { id: 'line', label: 'LINE', subcategories: ['line', 'technical', 'stripes'] },
  { id: 'abstract', label: 'ABSTRACT', subcategories: ['abstract', 'playful'] },
];

export const PatternsPage: React.FC<PatternsPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered patterns based on active category and search query
  const filteredPatterns = useMemo(() => {
    let result = CURATED_PATTERNS;

    if (activeCategory !== 'all') {
      const catConfig = CATEGORIES.find((c) => c.id === activeCategory);
      const subs = catConfig?.subcategories || [activeCategory];
      result = result.filter(
        (p) =>
          subs.some((s) => s.toLowerCase() === p.category.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase() === activeCategory) ||
          p.type.toLowerCase().includes(activeCategory)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.type.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  // Featured pattern (first pattern or filtered match)
  const featuredPattern = useMemo(() => {
    return filteredPatterns[0] || CURATED_PATTERNS[0];
  }, [filteredPatterns]);

  // New patterns section (patterns from index 6 to 11 — our newly introduced generative families)
  const newPatterns = useMemo(() => {
    return CURATED_PATTERNS.slice(6, 12);
  }, []);

  // Main archive specimens (when no search, show rest of library)
  const archiveItems = useMemo(() => {
    if (!searchQuery.trim() && activeCategory === 'all') {
      // Exclude featured from the primary archive list to avoid duplication
      return filteredPatterns.slice(1);
    }
    return filteredPatterns;
  }, [filteredPatterns, searchQuery, activeCategory]);

  // Render SVG for featured pattern
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
      1200,
      600
    );
  }, [featuredPattern]);

  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-12 sm:gap-16 pb-24 px-4 sm:px-6 md:px-8">
      <SEOHead
        title="Pattern Archive | Generative Vector Surfaces & Textures | Kroma"
        description="A collection of geometric systems, organic textures, repeating forms, and experimental color compositions synthesized inside Kroma."
        canonicalPath="/patterns"
        keywords={['pattern archive', 'generative art gallery', 'vector patterns', 'geometric textures', 'svg pattern library']}
      />

      {/* ─── 01. PAGE OPENING: COMPACT EDITORIAL INTRODUCTION ──────── */}
      <header className="flex flex-col gap-4 pt-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-6 sm:pb-8">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-[#707070] uppercase tracking-wider">
          <Link to={{ path: 'home' }} onNavigate={onNavigate} className="hover:text-[#171717] dark:hover:text-white transition-colors">
            HOME
          </Link>
          <span>/</span>
          <span className="text-[#171717] dark:text-white font-semibold">PATTERNS</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[#707070]">
              PATTERN ARCHIVE
            </span>
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[1.08] text-[#171717] dark:text-white m-0">
              PATTERNS IN MOTION.
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#707070] dark:text-[#A0A0A0] leading-relaxed m-0 mt-1 max-w-lg">
              A collection of geometric systems, organic textures, repeating forms, and experimental color compositions.
            </p>
          </div>

          {/* Quiet Studio Action */}
          <div className="flex items-center gap-3 shrink-0">
            <KromaButton
              variant="outline"
              size="sm"
              to={{ path: 'pattern-studio' }}
              onNavigate={onNavigate}
              iconLeft={<Sliders size={13} />}
            >
              Pattern Studio
            </KromaButton>
          </div>
        </div>
      </header>

      {/* ─── 02. FEATURED PATTERN COMPOSITION ──────────────────────── */}
      {!searchQuery.trim() && activeCategory === 'all' && featuredPattern && (
        <section className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between font-mono text-xs text-[#707070] uppercase">
            <span className="font-semibold tracking-wider">
              FEATURED COMPOSITION • PATTERN 001
            </span>
            <span>
              {featuredPattern.type.toUpperCase()} • {featuredPattern.scale}PX GRID
            </span>
          </div>

          <div
            className="group/featured relative w-full rounded-[4px] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden bg-[#F8F8F8] dark:bg-[#141518] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-black/20 dark:hover:border-white/20 select-none"
            onClick={() => onNavigate({ path: 'pattern-detail', slug: featuredPattern.slug })}
            role="button"
            tabIndex={0}
          >
            {/* Massive Pattern Artwork (Hero of the first viewport) */}
            <div className="w-full h-80 sm:h-[420px] md:h-[500px] relative overflow-hidden">
              <div
                className="w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/featured:scale-[1.02] motion-reduce:transform-none"
                dangerouslySetInnerHTML={{ __html: featuredSvg }}
              />

              {/* Quiet View Badge on Artwork */}
              <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-[3px] bg-black/75 text-white backdrop-blur-md border border-white/15 font-mono text-xs uppercase tracking-wider font-semibold opacity-90 group-hover/featured:opacity-100 transition-opacity">
                <span>VIEW SPECIMEN</span>
                <ArrowUpRight size={11} className="transition-transform group-hover/featured:translate-x-0.5 group-hover/featured:-translate-y-0.5" />
              </div>
            </div>

            {/* Pattern Metadata Strip Below Artwork */}
            <div className="p-4 sm:p-6 border-t border-black/[0.08] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 font-mono text-xs uppercase text-[#707070] tracking-wider">
                  <span className="font-semibold text-[#171717] dark:text-white">{featuredPattern.category}</span>
                  <span>•</span>
                  <span>{featuredPattern.tags.slice(0, 3).join(' / ')}</span>
                </div>
                <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0 truncate">
                  {featuredPattern.title}
                </h2>
                <p className="font-sans text-xs text-[#707070] dark:text-[#A0A0A0] leading-relaxed m-0 max-w-2xl line-clamp-1">
                  {featuredPattern.description}
                </p>
              </div>

              {/* Swatch Strip & View Action */}
              <div className="flex items-center gap-5 shrink-0">
                {/* Horizontal Swatch Strip */}
                <div className="flex items-center gap-1.5" title="Calibrated Palette">
                  {featuredPattern.palette.map((hex, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-[2px] border border-black/15 shadow-2xs"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>

                <KromaButton
                  variant="filled"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate({ path: 'pattern-detail', slug: featuredPattern.slug });
                  }}
                  iconRight={<ArrowUpRight size={13} />}
                >
                  View Pattern
                </KromaButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 03. COMPACT EDITORIAL ARCHIVE NAVIGATION ───────────────── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
        {/* Editorial Typographic Category Controls */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono text-xs tracking-wider">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <KromaButton
                key={cat.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={`py-1 whitespace-nowrap h-auto rounded-none ${
                  isActive
                    ? 'text-[#171717] dark:text-white font-bold border-b-2 border-[#171717] dark:border-white'
                    : 'text-[#707070] hover:text-[#171717] dark:hover:text-white font-medium'
                }`}
              >
                {cat.label}
              </KromaButton>
            );
          })}
        </div>

        {/* Quiet Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#707070]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER ARCHIVE..."
            className="w-full pl-8 pr-7 py-1.5 bg-transparent border-b border-black/15 dark:border-white/15 focus:border-[#171717] dark:focus:border-white text-xs font-mono text-[#171717] dark:text-white placeholder-[#707070] outline-none transition-colors"
          />
          {searchQuery && (
            <KromaButton
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#171717] dark:hover:text-white p-0.5 h-6 w-6"
              aria-label="Clear search"
              iconLeft={<X size={12} />}
            />
          )}
        </div>
      </section>

      {/* ─── 04. NEW PATTERNS DISCOVERY AREA ───────────────────────── */}
      {!searchQuery.trim() && activeCategory === 'all' && (
        <section className="flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] animate-pulse" />
              <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[#707070]">
                NEW PATTERNS
              </span>
            </div>
            <span className="font-mono text-xs text-[#707070] uppercase">
              GENERATIVE RELEASES
            </span>
          </div>

          {/* Panoramic Strip of Newly Added Patterns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {newPatterns.map((pat, idx) => {
              const svg = generatePatternSvg(
                {
                  type: pat.type,
                  palette: pat.palette,
                  scale: pat.scale,
                  density: pat.density,
                  rotation: pat.rotation,
                  strokeWidth: pat.strokeWidth,
                  opacity: pat.opacity,
                },
                240,
                240
              );

              return (
                <div
                  key={pat.id}
                  onClick={() => onNavigate({ path: 'pattern-detail', slug: pat.slug })}
                  className="group/new rounded-[3px] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden bg-[#F8F8F8] dark:bg-[#141518] cursor-pointer flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-black/25 dark:hover:border-white/25 hover:shadow-xs select-none"
                  role="button"
                  tabIndex={0}
                >
                  {/* Square Pattern Art Canvas */}
                  <div className="w-full aspect-square relative overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06]">
                    <div
                      className="w-full h-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/new:scale-105"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                    <span className="absolute top-2 right-2 font-mono text-xs uppercase font-bold px-1.5 py-0.5 rounded-[2px] bg-black/75 text-white backdrop-blur-xs">
                      {pat.type}
                    </span>
                  </div>

                  <div className="p-2.5 flex flex-col gap-0.5">
                    <span className="font-mono text-xs text-[#707070] uppercase truncate">
                      {String(idx + 7).padStart(3, '0')} • {pat.category}
                    </span>
                    <span className="font-sans text-xs font-bold text-[#171717] dark:text-white truncate">
                      {pat.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── 05. ASYMMETRIC CONTROLLED EDITORIAL ARCHIVE LAYOUT ────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between font-mono text-xs text-[#707070] uppercase">
          <span className="font-semibold tracking-wider">
            CURATED SPECIMENS ({archiveItems.length})
          </span>
          <span>ARTWORK DOMINANT INDEX</span>
        </div>

        {archiveItems.length > 0 ? (
          /* Editorial Asymmetric Grid: Alternating Spans and Visual Densities */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
            {archiveItems.map((pattern, idx) => {

              const svg = generatePatternSvg(
                {
                  type: pattern.type,
                  palette: pattern.palette,
                  scale: pattern.scale,
                  density: pattern.density,
                  rotation: pattern.rotation,
                  strokeWidth: pattern.strokeWidth,
                  opacity: pattern.opacity,
                },
                idx % 7 === 5 ? 1200 : idx % 7 === 0 ? 800 : 400,
                300
              );

              return (
                <div
                  key={pattern.id}
                  onClick={() => onNavigate({ path: 'pattern-detail', slug: pattern.slug })}
                  className={`group/tile col-span-4 rounded-[3px] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden bg-[#F8F8F8] dark:bg-[#141518] flex flex-col justify-between cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-black/25 dark:hover:border-white/25 hover:shadow-xs select-none`}
                  role="button"
                  tabIndex={0}
                >
                  {/* Pattern Art Canvas (Visual Hero) */}
                  <div className={`w-full h-full relative overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06]`}>
                    <div
                      className="w-full h-full transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:scale-[1.03]"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />

                    {/* Small Metadata Reveal on Hover */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover/tile:opacity-100 transition-opacity">
                      <span className="font-mono text-xs uppercase font-bold px-1.5 py-0.5 rounded-[2px] bg-black/75 text-white backdrop-blur-xs tracking-wider">
                        {pattern.type}
                      </span>
                    </div>

                    {/* Tactile VIEW pill indicator on hover */}
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover/tile:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] translate-y-1 group-hover/tile:translate-y-0">
                      <span className="inline-flex items-center gap-1 font-mono text-xs uppercase font-semibold px-2 py-0.5 rounded-[2px] bg-black/80 text-white backdrop-blur-xs">
                        <span>VIEW SPECIMEN</span>
                        <ArrowUpRight size={10} />
                      </span>
                    </div>
                  </div>

                  {/* Tile Editorial Footer */}
                  <div className="p-3.5 sm:p-4 flex flex-col justify-between gap-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-mono text-xs uppercase text-[#707070] tracking-wider truncate">
                        {pattern.category} • {pattern.scale}PX GRID
                      </div>
                      <div className="flex items-center gap-1 shrink-0" title="Palette">
                        {pattern.palette.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full border border-black/15"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-sans font-bold text-sm sm:text-[15px] text-[#171717] dark:text-white uppercase tracking-tight m-0 truncate group-hover/tile:text-[#00AEEF] transition-colors">
                        {pattern.title}
                      </h3>
                      <ArrowUpRight size={13} className="text-[#707070] group-hover/tile:text-[#00AEEF] group-hover/tile:translate-x-0.5 group-hover/tile:-translate-y-0.5 transition-transform shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Quiet Empty State */
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] bg-[#F8F8F8] dark:bg-[#141518]">
            <span className="font-mono text-xs uppercase tracking-wider text-[#707070]">
              NO MATCHING PATTERNS FOUND
            </span>
            <p className="font-sans text-xs text-[#707070] max-w-sm m-0">
              No vector surfaces match the filter &ldquo;{searchQuery || activeCategory}&rdquo;.
            </p>
            <KromaButton
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-2"
            >
              Reset Archive Filters
            </KromaButton>
          </div>
        )}
      </section>

      {/* ─── 06. VISUAL CATEGORY ARCHIVE INDEX ─────────────────────── */}
      <section className="flex flex-col gap-3.5 pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
        <div className="flex items-baseline justify-between font-mono text-xs text-[#707070] uppercase">
          <span className="font-semibold tracking-wider">
            VISUAL CATEGORY INDEX
          </span>
          <span>TAXONOMY MARKERS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
            const match = CURATED_PATTERNS.find(
              (p) =>
                (cat.subcategories && cat.subcategories.some((s) => s.toLowerCase() === p.category.toLowerCase())) ||
                p.tags.includes(cat.id) ||
                p.type.includes(cat.id)
            ) || CURATED_PATTERNS[0];

            const previewSvg = generatePatternSvg(
              {
                type: match.type,
                palette: match.palette,
                scale: match.scale,
                density: match.density,
                rotation: match.rotation,
                strokeWidth: match.strokeWidth,
                opacity: match.opacity,
              },
              200,
              60
            );

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`p-2.5 rounded-[3px] border border-black/[0.08] dark:border-white/[0.08] bg-[#F8F8F8] dark:bg-[#141518] cursor-pointer flex flex-col gap-2 transition-all hover:border-black/30 dark:hover:border-white/30 ${
                  activeCategory === cat.id ? 'ring-1 ring-[#00AEEF] border-[#00AEEF]' : ''
                }`}
                role="button"
                tabIndex={0}
              >
                <div
                  className="w-full h-9 rounded-[2px] overflow-hidden border border-black/10 dark:border-white/10 select-none"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
                <div className="flex items-center justify-between font-mono text-xs text-[#171717] dark:text-white uppercase font-bold">
                  <span>{cat.label}</span>
                  <span className="text-[#707070] font-normal">INDEX</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 07. FINAL CTA: RESTRAINED CREATION INVITATION ─────────── */}
      <section className="p-8 sm:p-12 rounded-[4px] border border-black/[0.08] dark:border-white/[0.08] bg-[#F8F8F8] dark:bg-[#141518] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5 max-w-xl">
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[#707070]">
            CREATIVE WORKBENCH
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
            Make Your Own Pattern.
          </h2>
          <p className="font-sans text-sm text-[#707070] dark:text-[#A0A0A0] leading-relaxed m-0 mt-0.5">
            Turn colour, geometry, and repetition into something new with live mathematical controls and instant SVG export.
          </p>
        </div>

        <KromaButton
          variant="filled"
          size="md"
          to={{ path: 'pattern-studio' }}
          onNavigate={onNavigate}
          iconRight={<ArrowUpRight size={14} />}
        >
          Create Pattern
        </KromaButton>
      </section>
    </div>
  );
};
