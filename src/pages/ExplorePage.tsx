import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ArrowUpRight, Copy, Bookmark, Share2, ArrowRight, Loader2 } from 'lucide-react';
import { RouteType, PaletteItem, ColorItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { PaletteCard } from '../components/PaletteCard';
import { getColorOfTheDay, getPaletteOfTheDay } from '../utils/dailyEngine';
import { sortTrendingPalettes, sortNewestPalettes } from '../utils/rankingEngine';
import { copyToClipboard, hexToRgb } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { Analytics } from '../utils/analytics';

interface ExplorePageProps {
  onNavigate: (route: RouteType) => void;
  initialMood?: string;
  initialUseCase?: string;
  initialCharacter?: string;
  initialSeason?: string;
}

const BATCH_SIZE = 24;

// Curated mood stories with fallback colors if library match is empty
const MOOD_SPECS: { id: string; label: string; defaultColors: string[] }[] = [
  { id: 'warm', label: 'WARM', defaultColors: ['#E2583E', '#F38A5E', '#F6BE9A', '#7A2E1E'] },
  { id: 'cool', label: 'COOL', defaultColors: ['#1C3D5A', '#2D68C4', '#6BB5FF', '#D4E9FF'] },
  { id: 'earth', label: 'EARTH', defaultColors: ['#3A4032', '#7D8461', '#C5BFA0', '#E5DCC5'] },
  { id: 'bold', label: 'BOLD', defaultColors: ['#FF2A54', '#FFD600', '#00D68F', '#1800FF'] },
  { id: 'soft', label: 'SOFT', defaultColors: ['#E8D7F1', '#D3BCC0', '#A89F91', '#8C7A6B'] },
  { id: 'dark', label: 'DARK', defaultColors: ['#0D0E12', '#1E2028', '#2F3240', '#565A70'] },
  { id: 'bright', label: 'BRIGHT', defaultColors: ['#FF0055', '#FF7700', '#FFEE00', '#00EEFF'] },
  { id: 'neutral', label: 'NEUTRAL', defaultColors: ['#171717', '#4A4A4A', '#8C8C8C', '#D9D9D9'] },
];

// 6 Primary Kroma Spectrum Navigation Markers
const SPECTRUM_NAV = [
  { name: 'RED', hex: '#FF3B30', tag: 'red' },
  { name: 'ORANGE', hex: '#FF9500', tag: 'orange' },
  { name: 'YELLOW', hex: '#FFD60A', tag: 'yellow' },
  { name: 'GREEN', hex: '#34C759', tag: 'green' },
  { name: 'BLUE', hex: '#00AEEF', tag: 'blue' },
  { name: 'PURPLE', hex: '#7B2CBF', tag: 'purple' },
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onNavigate,
  initialMood,
  initialUseCase,
  initialCharacter,
  initialSeason,
}) => {
  const { palettes, colors } = useLibraryData();
  const { isSaved, saveItem } = useSaved();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>(initialMood || initialUseCase || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const archiveRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Daily Specimens
  const dailyColor = useMemo(() => getColorOfTheDay(new Date(), colors), [colors]);
  const dailyPalette = useMemo(() => getPaletteOfTheDay(new Date(), palettes), [palettes]);

  // Trending Palettes for the specimen gallery
  const trendingPalettes = useMemo(() => sortTrendingPalettes(palettes).slice(0, 4), [palettes]);

  // Compute Mood Stories with REAL library colors
  const moodStories = useMemo(() => {
    return MOOD_SPECS.map((mood) => {
      const matchingPalette = palettes.find((p) =>
        p.tags?.some((t) => t.toLowerCase().includes(mood.id)) ||
        p.category?.toLowerCase() === mood.id
      );
      const paletteColors = matchingPalette
        ? matchingPalette.colors.map((c) => c.hex).slice(0, 4)
        : mood.defaultColors;

      return {
        id: mood.id,
        label: mood.label,
        colors: paletteColors,
      };
    });
  }, [palettes]);

  // Hero dynamic color installation tiles (real colors from top curated palettes)
  const heroColorBlocks = useMemo(() => {
    const list: { hex: string; name: string; colSpan: string; rowSpan: string }[] = [];
    const sourcePalettes = palettes.slice(0, 3);
    const allColors = sourcePalettes.flatMap((p) => p.colors);

    if (allColors.length >= 7) {
      list.push({ hex: allColors[0].hex, name: allColors[0].name, colSpan: 'span 2', rowSpan: 'span 2' });
      list.push({ hex: allColors[1].hex, name: allColors[1].name, colSpan: 'span 2', rowSpan: 'span 1' });
      list.push({ hex: allColors[2].hex, name: allColors[2].name, colSpan: 'span 2', rowSpan: 'span 2' });
      list.push({ hex: allColors[3].hex, name: allColors[3].name, colSpan: 'span 1', rowSpan: 'span 1' });
      list.push({ hex: allColors[4].hex, name: allColors[4].name, colSpan: 'span 1', rowSpan: 'span 1' });
      list.push({ hex: allColors[5].hex, name: allColors[5].name, colSpan: 'span 3', rowSpan: 'span 1' });
      list.push({ hex: allColors[6].hex, name: allColors[6].name, colSpan: 'span 1', rowSpan: 'span 1' });
      if (allColors[7]) {
        list.push({ hex: allColors[7].hex, name: allColors[7].name, colSpan: 'span 2', rowSpan: 'span 1' });
      }
    } else {
      // Fallback
      list.push(
        { hex: '#FF3B30', name: 'Crimson Vermilion', colSpan: 'span 2', rowSpan: 'span 2' },
        { hex: '#00AEEF', name: 'Electric Cyan', colSpan: 'span 2', rowSpan: 'span 1' },
        { hex: '#FF9500', name: 'International Orange', colSpan: 'span 2', rowSpan: 'span 2' },
        { hex: '#34C759', name: 'Emerald Leaf', colSpan: 'span 1', rowSpan: 'span 1' },
        { hex: '#7B2CBF', name: 'Deep Violet', colSpan: 'span 1', rowSpan: 'span 1' },
        { hex: '#171717', name: 'Carbon Black', colSpan: 'span 3', rowSpan: 'span 1' },
        { hex: '#FFD60A', name: 'Spectral Yellow', colSpan: 'span 1', rowSpan: 'span 1' },
        { hex: '#E5E5EA', name: 'Architectural Stone', colSpan: 'span 2', rowSpan: 'span 1' }
      );
    }
    return list;
  }, [palettes]);

  // Copy single color helper
  const handleCopySingleHex = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 1300);
      Analytics.trackColorCopy(hex, 'HEX', name);
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  // Copy all palette hexes helper
  const handleCopyPalette = async (palette: PaletteItem) => {
    const allHexes = palette.colors.map((c) => c.hex).join(', ');
    const success = await copyToClipboard(allHexes);
    if (success) {
      Analytics.trackPaletteCopy(palette.title, palette.colors.map((c) => c.hex));
      showToast(`Copied ${palette.colors.length} hex values`, palette.title);
    }
  };

  // Toggle save palette helper
  const handleToggleSavePalette = (palette: PaletteItem) => {
    const saved = isSaved(palette.id);
    saveItem({
      id: palette.id,
      type: 'palette',
      title: palette.title,
      slug: palette.slug,
      preview: palette.colors.map((c) => c.hex).join(','),
      metadata: `${palette.category} • ${palette.colors.length} colors`,
    });
    showToast(
      saved ? 'Removed palette from saved' : 'Saved palette to collection',
      palette.title
    );
  };

  // Jump to archive and filter
  const handleFilterJump = (filterId: string) => {
    setActiveTab(filterId);
    setSearchQuery('');
    archiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Jump to archive by spectrum color
  const handleSpectrumJump = (colorTag: string) => {
    setActiveTab('all');
    setSearchQuery(colorTag);
    archiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Filtered palettes for The Archive
  const filteredPalettes = useMemo(() => {
    let list = [...palettes];

    if (activeTab === 'trending') {
      list = sortTrendingPalettes(list);
    } else if (activeTab === 'new') {
      list = sortNewestPalettes(list);
    } else if (activeTab !== 'all') {
      const tabLower = activeTab.toLowerCase();
      list = list.filter((p) => {
        const matchCategory = p.category?.toLowerCase() === tabLower;
        const matchTag = (p.tags || []).some((t) => t.toLowerCase().includes(tabLower));
        return matchCategory || matchTag;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCategory = p.category?.toLowerCase().includes(q);
        const matchTag = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchColor = p.colors.some(
          (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
        );
        return matchTitle || matchCategory || matchTag || matchColor;
      });
    }

    return list;
  }, [palettes, activeTab, searchQuery]);

  // Reset pagination on filter or search change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [activeTab, searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && visibleCount < filteredPalettes.length && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredPalettes.length));
            setIsLoadingMore(false);
          }, 80);
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, filteredPalettes, isLoadingMore]);

  const displayedPalettes = useMemo(() => {
    return filteredPalettes.slice(0, visibleCount);
  }, [filteredPalettes, visibleCount]);

  const featuredPaletteSaved = isSaved(dailyPalette.palette.id);

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 sm:pb-28 text-[#171717] dark:text-white">
      <SEOHead
        title="Explore Color Systems, Palettes & Harmonies | KROMA"
        description="A living digital color archive. Explore harmonic palette systems, daily chromatic specimens, mood studies, and design tokens."
        canonicalPath="/explore"
      />

      {/* ─── 1. Editorial Hero & Dynamic Color Installation ──────── */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-12 items-center mb-16 lg:mb-24 pb-10 lg:pb-14 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="flex flex-col gap-4">
          <div className="font-mono text-[11px] font-semibold tracking-[0.1em] uppercase text-[#707070] dark:text-[#8E8E93] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[#00AEEF]" />
            <span>KROMA ARCHIVE • VOL. 01</span>
          </div>
          <h1 className="font-sans text-5xl sm:text-6xl lg:text-[76px] font-extrabold tracking-[-0.035em] leading-[0.94] text-[#171717] dark:text-white m-0 uppercase">
            DISCOVER<br />
            <span className="text-[#00AEEF] inline-block relative">COLOR.</span>
          </h1>
          <p className="font-sans text-[15px] font-normal leading-[1.55] text-[#707070] dark:text-[#9A9A9E] max-w-[480px] m-0 mt-2">
            Explore palettes, color relationships and visual combinations created across Kroma.
          </p>
        </div>

        {/* Dynamic Solid Color Installation (Real library colors, no gradients) */}
        <div className="grid grid-cols-6 grid-rows-4 gap-1.5 sm:gap-2 w-full rounded overflow-hidden bg-[#F8F8F8] dark:bg-[#141518] p-1.5 sm:p-2 border border-black/[0.08] dark:border-white/[0.08] h-[200px] sm:h-[260px]" role="region" aria-label="Interactive color installation">
          {heroColorBlocks.map((block, idx) => (
            <div
              key={idx}
              className="group/block rounded-[2px] relative cursor-pointer flex items-end p-1.5 overflow-hidden transition-transform duration-200 hover:scale-[0.98] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:z-10"
              style={{
                backgroundColor: block.hex,
                gridColumn: block.colSpan,
                gridRow: block.rowSpan,
              }}
              onClick={() => handleCopySingleHex(block.hex, block.name)}
              role="button"
              tabIndex={0}
              title={`Click to copy ${block.name} (${block.hex})`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCopySingleHex(block.hex, block.name);
                }
              }}
            >
              <span className="opacity-0 group-hover/block:opacity-100 translate-y-1 group-hover/block:translate-y-0 font-mono text-[10px] font-semibold py-0.5 px-1.5 bg-black/85 text-white rounded-[2px] transition-all pointer-events-none whitespace-nowrap">
                {copiedColor === block.hex ? 'COPIED' : block.hex}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 2. Featured Color (Large Open Composition) ──────────── */}
      <section className="mb-16 sm:mb-24">
        <div className="flex items-end justify-between mb-8 gap-5 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] dark:text-[#8E8E93] flex items-center gap-2">
              <span>01</span>
              <span>•</span>
              <span>DAILY SPECIMEN</span>
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-[-0.02em] leading-[1.1] text-[#171717] dark:text-white m-0 uppercase">FEATURED COLOR</h2>
          </div>
          <p className="font-sans text-[13.5px] text-[#707070] dark:text-[#9A9A9E] max-w-[520px] m-0 leading-[1.45]">
            An isolated study in chromatic vibration, luminance, and perceptually balanced lightness.
          </p>
        </div>

        <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded overflow-hidden grid grid-cols-1 md:grid-cols-[1.4fr_1fr] items-stretch">
          {/* Heroic Color Field */}
          <div
            className="min-h-[220px] sm:min-h-[280px] relative flex items-end p-4 sm:p-6 cursor-pointer"
            style={{ backgroundColor: dailyColor.color.hex }}
            onClick={() =>
              onNavigate({
                path: 'color-detail',
                slug: dailyColor.color.slug || dailyColor.color.hex.replace('#', '').toLowerCase(),
              })
            }
            role="button"
            tabIndex={0}
            aria-label={`View details for ${dailyColor.color.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onNavigate({
                  path: 'color-detail',
                  slug: dailyColor.color.slug || dailyColor.color.hex.replace('#', '').toLowerCase(),
                });
              }
            }}
          >
            <span className="bg-black/85 text-white font-mono text-[11px] font-semibold py-1.5 px-3 rounded-[2px] inline-flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
              <span>INSPECT SPECIMEN</span>
              <ArrowUpRight size={13} />
            </span>
          </div>

          {/* Color Intelligence & Minimal Specs */}
          <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase text-[#707070] dark:text-[#8E8E93] tracking-[0.06em] mb-2">
                COLOR OF THE DAY • {dailyColor.dateString}
              </div>
              <h3 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] leading-[1.05] text-[#171717] dark:text-white m-0 mb-3 uppercase">
                {dailyColor.color.name}
              </h3>
              <p className="font-sans text-[13.5px] text-[#707070] dark:text-[#9A9A9E] max-w-[520px] m-0 leading-[1.45] text-sm">
                {dailyColor.color.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-black/[0.08] dark:border-white/[0.08] mb-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] font-semibold uppercase text-[#707070] dark:text-[#8E8E93] tracking-[0.06em]">HEX</span>
                <span className="font-mono text-[13px] font-semibold text-[#171717] dark:text-white">{dailyColor.color.hex}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] font-semibold uppercase text-[#707070] dark:text-[#8E8E93] tracking-[0.06em]">OKLCH</span>
                <span className="font-mono text-[13px] font-semibold text-[#171717] dark:text-white">{dailyColor.color.oklch}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] font-semibold uppercase text-[#707070] dark:text-[#8E8E93] tracking-[0.06em]">RGB</span>
                <span className="font-mono text-[13px] font-semibold text-[#171717] dark:text-white">
                  {(() => {
                    const rgb = hexToRgb(dailyColor.color.hex);
                    return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '—';
                  })()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] font-semibold uppercase text-[#707070] dark:text-[#8E8E93] tracking-[0.06em]">FAMILY</span>
                <span className="font-mono text-[13px] font-semibold text-[#171717] dark:text-white">
                  {dailyColor.color.family || 'SPECTRUM'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-[#171717] dark:bg-white text-white dark:text-[#171717] border border-[#171717] dark:border-white hover:bg-black dark:hover:bg-[#E5E5E5] rounded-[2px] px-4 py-2 font-sans text-[12.5px] font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
                onClick={() => handleCopySingleHex(dailyColor.color.hex, dailyColor.color.name)}
              >
                <Copy size={13} />
                <span>{copiedColor === dailyColor.color.hex ? 'COPIED' : 'COPY HEX'}</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-transparent text-[#171717] dark:text-white border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/30 dark:hover:border-white/30 rounded-[2px] px-4 py-2 font-sans text-[12.5px] font-semibold cursor-pointer transition-all"
                onClick={() =>
                  onNavigate({
                    path: 'color-detail',
                    slug: dailyColor.color.slug || dailyColor.color.hex.replace('#', '').toLowerCase(),
                  })
                }
              >
                <span>EXPLORE COLOR</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Featured Palette (Large Editorial Spread) ────────── */}
      <section className="mb-16 sm:mb-24">
        <div className="flex items-end justify-between mb-8 gap-5 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] dark:text-[#8E8E93] flex items-center gap-2">
              <span>02</span>
              <span>•</span>
              <span>SYSTEM STUDY</span>
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-[-0.02em] leading-[1.1] text-[#171717] dark:text-white m-0 uppercase">FEATURED PALETTE</h2>
          </div>
          <p className="font-sans text-[13.5px] text-[#707070] dark:text-[#9A9A9E] max-w-[520px] m-0 leading-[1.45]">
            A cohesive harmonic structure engineered for digital interfaces, print specimen documents, and design tokens.
          </p>
        </div>

        <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded overflow-hidden flex flex-col">
          {/* Architectural Color Bands Spread */}
          <div className="flex h-44 sm:h-56 w-full" role="group" aria-label="Featured palette colors">
            {dailyPalette.palette.colors.map((c, idx) => {
              const weights = [1.25, 0.85, 1.4, 0.9, 1.1];
              const flexWeight = weights[idx % weights.length];
              const isCopied = copiedColor === c.hex;

              return (
                <div
                  key={idx}
                  className="group/bar h-full relative cursor-pointer transition-[flex] duration-200 ease-out hover:grow-[2.2] flex items-end justify-center p-3"
                  style={{
                    backgroundColor: c.hex,
                    flex: flexWeight,
                  }}
                  onClick={() => handleCopySingleHex(c.hex, c.name)}
                  role="button"
                  tabIndex={0}
                  title={`Copy ${c.name} (${c.hex})`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCopySingleHex(c.hex, c.name);
                    }
                  }}
                >
                  <span className={`opacity-0 group-hover/bar:opacity-100 font-mono text-[11px] font-semibold py-1 px-2 bg-black/85 text-white rounded-[2px] transition-opacity pointer-events-none whitespace-nowrap ${isCopied ? '!opacity-100' : ''}`}>
                    {isCopied ? 'COPIED' : c.hex}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Palette Spread Meta & Actions */}
          <div className="p-5 sm:p-7 flex items-center justify-between gap-5 flex-wrap">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] font-semibold uppercase text-[#707070] dark:text-[#8E8E93] tracking-[0.06em]">
                {dailyPalette.palette.category} • {dailyPalette.palette.colors.length} TONES • SYSTEM
              </span>
              <h3 className="font-sans text-[22px] font-bold tracking-[-0.015em] text-[#171717] dark:text-white m-0">
                {dailyPalette.palette.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-transparent text-[#171717] dark:text-white border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/30 dark:hover:border-white/30 rounded-[2px] px-4 py-2 font-sans text-[12.5px] font-semibold cursor-pointer transition-all"
                onClick={() => handleCopyPalette(dailyPalette.palette)}
                title="Copy all hex codes"
              >
                <Copy size={13} />
                <span>COPY ALL</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-transparent text-[#171717] dark:text-white border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/30 dark:hover:border-white/30 rounded-[2px] px-4 py-2 font-sans text-[12.5px] font-semibold cursor-pointer transition-all"
                onClick={() => handleToggleSavePalette(dailyPalette.palette)}
                title={featuredPaletteSaved ? 'Remove from saved' : 'Save palette'}
              >
                <Bookmark size={13} fill={featuredPaletteSaved ? 'currentColor' : 'none'} />
                <span>{featuredPaletteSaved ? 'SAVED' : 'SAVE'}</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-[#171717] dark:bg-white text-white dark:text-[#171717] border border-[#171717] dark:border-white hover:bg-black dark:hover:bg-[#E5E5E5] rounded-[2px] px-4 py-2 font-sans text-[12.5px] font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
                onClick={() =>
                  onNavigate({
                    path: 'palette-detail',
                    slug: dailyPalette.palette.slug,
                  })
                }
              >
                <span>EXPLORE PALETTE</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Trending Now (Visual Specimen Gallery) ────────────── */}
      <section className="mb-16 sm:mb-24">
        <div className="flex items-end justify-between mb-8 gap-5 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] dark:text-[#8E8E93] flex items-center gap-2">
              <span>03</span>
              <span>•</span>
              <span>CURATED DISCOVERY</span>
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-[-0.02em] leading-[1.1] text-[#171717] dark:text-white m-0 uppercase">TRENDING NOW</h2>
          </div>
          <p className="font-sans text-[13.5px] text-[#707070] dark:text-[#9A9A9E] max-w-[520px] m-0 leading-[1.45]">
            The most referenced and explored chromatic systems across the Kroma studio community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingPalettes.map((palette) => (
            <div
              key={palette.id}
              className="group/item bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.45)]"
              onClick={() => onNavigate({ path: 'palette-detail', slug: palette.slug })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onNavigate({ path: 'palette-detail', slug: palette.slug });
              }}
            >
              <div className="flex h-40 w-full">
                {palette.colors.map((c, ci) => (
                  <div
                    key={ci}
                    className="flex-1 h-full transition-[flex] duration-150 group-hover/item:hover:flex-[1.6]"
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (${c.hex})`}
                  />
                ))}
              </div>
              <div className="p-3.5 sm:px-4 flex items-center justify-between gap-2.5">
                <span className="font-sans text-sm font-semibold text-[#171717] dark:text-white truncate">{palette.title}</span>
                <span className="font-mono text-[11px] text-[#707070] shrink-0">
                  {palette.colors.length} TONES
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. Color Stories (Explore by Mood) ───────────────────── */}
      <section className="mb-16 sm:mb-24">
        <div className="flex items-end justify-between mb-8 gap-5 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] dark:text-[#8E8E93] flex items-center gap-2">
              <span>04</span>
              <span>•</span>
              <span>MOOD &amp; EMOTION</span>
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-[-0.02em] leading-[1.1] text-[#171717] dark:text-white m-0 uppercase">COLOR STORIES</h2>
          </div>
          <p className="font-sans text-[13.5px] text-[#707070] dark:text-[#9A9A9E] max-w-[520px] m-0 leading-[1.45]">
            Navigate the archive through emotional resonance, tactile temperature, and atmospheric intensity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moodStories.map((mood) => (
            <div
              key={mood.id}
              className="group/mood bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded overflow-hidden p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.4)]"
              onClick={() => handleFilterJump(mood.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFilterJump(mood.id);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-[13.5px] font-semibold tracking-[0.04em] uppercase text-[#171717] dark:text-white">{mood.label}</span>
                <span className="text-sm text-[#707070] group-hover/mood:text-[#171717] dark:group-hover/mood:text-white group-hover/mood:translate-x-0.5 group-hover/mood:-translate-y-0.5 transition-all">↗</span>
              </div>
              <div className="flex h-12 w-full rounded-[2px] overflow-hidden">
                {mood.colors.map((hex, hi) => (
                  <div
                    key={hi}
                    className="flex-1 h-full"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6. Explore By Color (Spectrum Navigation) ────────────── */}
      <section className="mb-16 sm:mb-24">
        <div className="flex items-end justify-between mb-8 gap-5 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] dark:text-[#8E8E93] flex items-center gap-2">
              <span>05</span>
              <span>•</span>
              <span>CHROMATIC SPECTRUM</span>
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-[-0.02em] leading-[1.1] text-[#171717] dark:text-white m-0 uppercase">EXPLORE BY COLOR</h2>
          </div>
          <p className="font-sans text-[13.5px] text-[#707070] dark:text-[#9A9A9E] max-w-[520px] m-0 leading-[1.45]">
            Filter the entire collection through fundamental spectral primaries and signature wavelengths.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SPECTRUM_NAV.map((spec) => (
            <div
              key={spec.name}
              className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded p-3.5 sm:px-4 flex flex-col gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_18px_-4px_rgba(0,0,0,0.06)]"
              onClick={() => handleSpectrumJump(spec.tag)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSpectrumJump(spec.tag);
              }}
            >
              <div
                className="w-full h-2 rounded-[1px]"
                style={{ backgroundColor: spec.hex }}
              />
              <span className="font-sans text-[13.5px] font-semibold text-[#171717] dark:text-white tracking-[0.02em]">{spec.name}</span>
              <span className="font-mono text-[11px] text-[#707070]">{spec.hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. The Archive (Palette Collection) ─────────────────── */}
      <section className="mb-16 sm:mb-24" ref={archiveRef} id="archive">
        <div className="flex items-end justify-between mb-8 gap-5 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] dark:text-[#8E8E93] flex items-center gap-2">
              <span>06</span>
              <span>•</span>
              <span>COMPLETE COLLECTION</span>
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-[-0.02em] leading-[1.1] text-[#171717] dark:text-white m-0 uppercase">THE ARCHIVE</h2>
          </div>
          <p className="font-sans text-[13.5px] text-[#707070] dark:text-[#9A9A9E] max-w-[520px] m-0 leading-[1.45]">
            Showing {filteredPalettes.length} harmonic color systems. Filter by aesthetic mood or search by keyword.
          </p>
        </div>

        {/* Minimal Editorial Filter Toolbar & Search */}
        <div className="flex items-center justify-between gap-5 mb-7 flex-wrap pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div className="flex items-center gap-4 overflow-x-auto py-1 scrollbar-none">
            {['all', 'trending', 'new', 'warm', 'cool', 'neutral', 'bold'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`inline-flex items-center gap-1.5 bg-transparent border-0 py-1.5 font-sans text-[12.5px] tracking-[0.06em] uppercase cursor-pointer transition-colors whitespace-nowrap ${
                    isActive ? 'text-[#171717] dark:text-white font-bold' : 'text-[#707070] dark:text-[#8E8E93] font-medium hover:text-[#171717] dark:hover:text-white'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-[1px] bg-[#00AEEF]" />}
                  <span>{tab.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[260px]">
            <Search size={14} className="absolute left-1 top-1/2 -translate-y-1/2 text-[#707070] pointer-events-none" />
            <input
              type="text"
              className="w-full bg-transparent border-0 border-b border-black/15 dark:border-white/15 py-2 pr-3 pl-7 font-sans text-[12.5px] text-[#171717] dark:text-white outline-none focus:border-[#171717] dark:focus:border-white transition-colors placeholder:text-neutral-400"
              placeholder="SEARCH BY NAME, HEX, OR MOOD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Palette Cards Grid */}
        {filteredPalettes.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm">
            <p className="font-sans text-sm font-semibold tracking-wider uppercase text-neutral-400 mb-2">
              NO PALETTES FOUND IN ARCHIVE
            </p>
            <p className="font-sans text-xs text-neutral-500 mb-6">
              Try adjusting your search criteria or selecting a different aesthetic mood.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 bg-transparent text-[#171717] dark:text-white border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/30 dark:hover:border-white/30 rounded-[2px] px-4 py-2 font-sans text-[12.5px] font-semibold cursor-pointer transition-all"
            >
              RESET ARCHIVE FILTERS
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {displayedPalettes.map((palette) => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={observerRef} style={{ height: '30px', margin: '30px 0' }} />

            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 py-8 text-neutral-500 font-mono text-xs">
                <Loader2 size={16} className="animate-spin" />
                <span>LOADING MORE SYSTEMS...</span>
              </div>
            )}

            {visibleCount >= filteredPalettes.length && filteredPalettes.length > BATCH_SIZE && (
              <div className="text-center py-12 text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
                END OF PALETTE ARCHIVE • {filteredPalettes.length} SYSTEMS DISPLAYED
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
