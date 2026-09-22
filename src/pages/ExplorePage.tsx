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
    <div className="explore-page">
      <SEOHead
        title="Explore Color Systems, Palettes & Harmonies | KROMA"
        description="A living digital color archive. Explore harmonic palette systems, daily chromatic specimens, mood studies, and design tokens."
        canonicalPath="/explore"
      />

      {/* ─── 1. Editorial Hero & Dynamic Color Installation ──────── */}
      <section className="explore-hero">
        <div className="explore-hero__content">
          <div className="explore-hero__eyebrow">
            <span className="explore-hero__eyebrow-dot" />
            <span>KROMA ARCHIVE • VOL. 01</span>
          </div>
          <h1 className="explore-hero__title">
            DISCOVER<br />
            <span className="explore-hero__title-accent">COLOR.</span>
          </h1>
          <p className="explore-hero__lead">
            Explore palettes, color relationships and visual combinations created across Kroma.
          </p>
        </div>

        {/* Dynamic Solid Color Installation (Real library colors, no gradients) */}
        <div className="explore-hero__composition" role="region" aria-label="Interactive color installation">
          {heroColorBlocks.map((block, idx) => (
            <div
              key={idx}
              className="explore-hero__block"
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
              <span className="explore-hero__block-tag">
                {copiedColor === block.hex ? 'COPIED' : block.hex}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 2. Featured Color (Large Open Composition) ──────────── */}
      <section className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <span className="explore-section__label">
              <span>01</span>
              <span>•</span>
              <span>DAILY SPECIMEN</span>
            </span>
            <h2 className="explore-section__title">FEATURED COLOR</h2>
          </div>
          <p className="explore-section__desc">
            An isolated study in chromatic vibration, luminance, and perceptually balanced lightness.
          </p>
        </div>

        <div className="explore-featured-color">
          {/* Heroic Color Field */}
          <div
            className="explore-featured-color__swatch"
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
            <span className="explore-featured-color__swatch-cta">
              <span>INSPECT SPECIMEN</span>
              <ArrowUpRight size={13} />
            </span>
          </div>

          {/* Color Intelligence & Minimal Specs */}
          <div className="explore-featured-color__details">
            <div>
              <div className="explore-spec-label mb-2">
                COLOR OF THE DAY • {dailyColor.dateString}
              </div>
              <h3 className="explore-featured-color__name">
                {dailyColor.color.name}
              </h3>
              <p className="explore-section__desc text-sm">
                {dailyColor.color.description}
              </p>
            </div>

            <div className="explore-featured-color__specs">
              <div className="explore-spec-item">
                <span className="explore-spec-label">HEX</span>
                <span className="explore-spec-value">{dailyColor.color.hex}</span>
              </div>
              <div className="explore-spec-item">
                <span className="explore-spec-label">OKLCH</span>
                <span className="explore-spec-value">{dailyColor.color.oklch}</span>
              </div>
              <div className="explore-spec-item">
                <span className="explore-spec-label">RGB</span>
                <span className="explore-spec-value">
                  {(() => {
                    const rgb = hexToRgb(dailyColor.color.hex);
                    return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '—';
                  })()}
                </span>
              </div>
              <div className="explore-spec-item">
                <span className="explore-spec-label">FAMILY</span>
                <span className="explore-spec-value">
                  {dailyColor.color.family || 'SPECTRUM'}
                </span>
              </div>
            </div>

            <div className="explore-featured-color__actions">
              <button
                type="button"
                className="explore-btn-primary"
                onClick={() => handleCopySingleHex(dailyColor.color.hex, dailyColor.color.name)}
              >
                <Copy size={13} />
                <span>{copiedColor === dailyColor.color.hex ? 'COPIED' : 'COPY HEX'}</span>
              </button>

              <button
                type="button"
                className="explore-btn-secondary"
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
      <section className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <span className="explore-section__label">
              <span>02</span>
              <span>•</span>
              <span>SYSTEM STUDY</span>
            </span>
            <h2 className="explore-section__title">FEATURED PALETTE</h2>
          </div>
          <p className="explore-section__desc">
            A cohesive harmonic structure engineered for digital interfaces, print specimen documents, and design tokens.
          </p>
        </div>

        <div className="explore-featured-palette">
          {/* Architectural Color Bands Spread */}
          <div className="explore-featured-palette__strip" role="group" aria-label="Featured palette colors">
            {dailyPalette.palette.colors.map((c, idx) => {
              const weights = [1.25, 0.85, 1.4, 0.9, 1.1];
              const flexWeight = weights[idx % weights.length];
              const isCopied = copiedColor === c.hex;

              return (
                <div
                  key={idx}
                  className="explore-featured-palette__bar"
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
                  <span className={`palette-swatch-pop ${isCopied ? 'copied' : ''}`}>
                    {isCopied ? 'COPIED' : c.hex}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Palette Spread Meta & Actions */}
          <div className="explore-featured-palette__meta">
            <div className="explore-featured-palette__info">
              <span className="explore-featured-palette__tag">
                {dailyPalette.palette.category} • {dailyPalette.palette.colors.length} TONES • SYSTEM
              </span>
              <h3 className="explore-featured-palette__title">
                {dailyPalette.palette.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="explore-btn-secondary"
                onClick={() => handleCopyPalette(dailyPalette.palette)}
                title="Copy all hex codes"
              >
                <Copy size={13} />
                <span>COPY ALL</span>
              </button>

              <button
                type="button"
                className="explore-btn-secondary"
                onClick={() => handleToggleSavePalette(dailyPalette.palette)}
                title={featuredPaletteSaved ? 'Remove from saved' : 'Save palette'}
              >
                <Bookmark size={13} fill={featuredPaletteSaved ? 'currentColor' : 'none'} />
                <span>{featuredPaletteSaved ? 'SAVED' : 'SAVE'}</span>
              </button>

              <button
                type="button"
                className="explore-btn-primary"
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
      <section className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <span className="explore-section__label">
              <span>03</span>
              <span>•</span>
              <span>CURATED DISCOVERY</span>
            </span>
            <h2 className="explore-section__title">TRENDING NOW</h2>
          </div>
          <p className="explore-section__desc">
            The most referenced and explored chromatic systems across the Kroma studio community.
          </p>
        </div>

        <div className="explore-trending-grid">
          {trendingPalettes.map((palette) => (
            <div
              key={palette.id}
              className="explore-specimen-item"
              onClick={() => onNavigate({ path: 'palette-detail', slug: palette.slug })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onNavigate({ path: 'palette-detail', slug: palette.slug });
              }}
            >
              <div className="explore-specimen-item__strip">
                {palette.colors.map((c, ci) => (
                  <div
                    key={ci}
                    className="explore-specimen-item__bar"
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (${c.hex})`}
                  />
                ))}
              </div>
              <div className="explore-specimen-item__body">
                <span className="explore-specimen-item__title">{palette.title}</span>
                <span className="explore-specimen-item__tones">
                  {palette.colors.length} TONES
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. Color Stories (Explore by Mood) ───────────────────── */}
      <section className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <span className="explore-section__label">
              <span>04</span>
              <span>•</span>
              <span>MOOD &amp; EMOTION</span>
            </span>
            <h2 className="explore-section__title">COLOR STORIES</h2>
          </div>
          <p className="explore-section__desc">
            Navigate the archive through emotional resonance, tactile temperature, and atmospheric intensity.
          </p>
        </div>

        <div className="explore-moods-grid">
          {moodStories.map((mood) => (
            <div
              key={mood.id}
              className="explore-mood-card"
              onClick={() => handleFilterJump(mood.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFilterJump(mood.id);
              }}
            >
              <div className="explore-mood-card__header">
                <span className="explore-mood-card__label">{mood.label}</span>
                <span className="explore-mood-card__arrow">↗</span>
              </div>
              <div className="explore-mood-card__strip">
                {mood.colors.map((hex, hi) => (
                  <div
                    key={hi}
                    className="explore-mood-card__bar"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6. Explore By Color (Spectrum Navigation) ────────────── */}
      <section className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <span className="explore-section__label">
              <span>05</span>
              <span>•</span>
              <span>CHROMATIC SPECTRUM</span>
            </span>
            <h2 className="explore-section__title">EXPLORE BY COLOR</h2>
          </div>
          <p className="explore-section__desc">
            Filter the entire collection through fundamental spectral primaries and signature wavelengths.
          </p>
        </div>

        <div className="explore-spectrum-container">
          {SPECTRUM_NAV.map((spec) => (
            <div
              key={spec.name}
              className="explore-spectrum-chip"
              onClick={() => handleSpectrumJump(spec.tag)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSpectrumJump(spec.tag);
              }}
            >
              <div
                className="explore-spectrum-chip__marker"
                style={{ backgroundColor: spec.hex }}
              />
              <span className="explore-spectrum-chip__name">{spec.name}</span>
              <span className="explore-spectrum-chip__hex">{spec.hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. The Archive (Palette Collection) ─────────────────── */}
      <section className="explore-section" ref={archiveRef} id="archive">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <span className="explore-section__label">
              <span>06</span>
              <span>•</span>
              <span>COMPLETE COLLECTION</span>
            </span>
            <h2 className="explore-section__title">THE ARCHIVE</h2>
          </div>
          <p className="explore-section__desc">
            Showing {filteredPalettes.length} harmonic color systems. Filter by aesthetic mood or search by keyword.
          </p>
        </div>

        {/* Minimal Editorial Filter Toolbar & Search */}
        <div className="explore-archive-toolbar">
          <div className="explore-filter-tabs">
            {['all', 'trending', 'new', 'warm', 'cool', 'neutral', 'bold'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`explore-filter-tab ${isActive ? 'explore-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {isActive && <span className="explore-filter-tab__dot" />}
                  <span>{tab.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          <div className="explore-search-input-wrap">
            <Search size={14} className="explore-search-icon" />
            <input
              type="text"
              className="explore-search-input"
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
              className="explore-btn-secondary"
            >
              RESET ARCHIVE FILTERS
            </button>
          </div>
        ) : (
          <>
            <div className="kroma-palettes-gallery">
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
