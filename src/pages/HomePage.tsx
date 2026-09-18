import React, { useState } from 'react';
import { Search, Heart, ArrowRight, Plus, Copy, Check, Sparkles, Image as ImageIcon, Wand2 } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebSiteSchema } from '../utils/schemaGenerator';
import { Link } from '../components/common/Link';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/colorUtils';

interface HomePageProps {
  onNavigate: (route: RouteType) => void;
}

const HERO_TAGS = [
  'Minimal',
  'Luxury',
  'Editorial',
  'Retro',
  'Nature',
  'Warm',
  'Cool',
  'Tech',
  'Fashion',
];

const CATEGORIES = [
  {
    name: 'Minimal',
    count: '124 palettes',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    slug: 'minimal',
  },
  {
    name: 'Luxury',
    count: '98 palettes',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
    slug: 'luxury',
  },
  {
    name: 'Editorial',
    count: '156 palettes',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    slug: 'editorial',
  },
  {
    name: 'Nature',
    count: '112 palettes',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
    slug: 'nature',
  },
  {
    name: 'Fashion',
    count: '134 palettes',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
    slug: 'fashion',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const { saveItem, isSaved, removeItem } = useSaved();
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigate({ path: 'search', q: heroSearch.trim() });
    } else {
      onNavigate({ path: 'explore' });
    }
  };

  const handleCopyPalette = async (palette: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const hexList = palette.colors.map((c: any) => c.hex).join(', ');
    const ok = await copyToClipboard(hexList);
    if (ok) {
      showToast('Copied palette to clipboard', palette.title);
    }
  };

  const handleToggleSave = (palette: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved(palette.id)) {
      removeItem(palette.id);
      showToast('Removed from saved', palette.title);
    } else {
      saveItem({
        id: palette.id,
        type: 'palette',
        title: palette.title,
        slug: palette.slug,
        preview: palette.colors.map((c: any) => c.hex).join(','),
        metadata: `${palette.category} • ${palette.colors.length} tones`,
      });
      showToast('Saved to collection', palette.title);
    }
  };

  // Top 8 trending palettes from reference specification
  const trendingPalettes = CURATED_PALETTES.slice(0, 8);

  return (
    <div className="w-full bg-[#FAF8F5] text-[#151513]">
      <SEOHead
        rawTitle
        title="KROMA — The Definitive Color & Palette Library"
        description="Discover curated color palettes, architectural photography, and design specimens for branding, editorial, fashion, interiors, and creative projects."
        canonicalPath="/"
        jsonLd={generateWebSiteSchema()}
      />

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Warm Ivory Canvas, Split Typography & Arch Photo)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-8 pt-8 md:pt-14 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Typography, Search Bar & Tag Pills */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h1 className="font-serif font-normal text-[44px] sm:text-[54px] md:text-[64px] leading-[1.02] tracking-[-0.03em] text-[#151513] mb-4">
              Find the right<br />
              color palette for<br />
              your <span className="italic font-normal">next project.</span>
            </h1>

            <p className="font-sans text-xs md:text-[13px] text-[#69665F] max-w-[420px] leading-relaxed mb-6 font-light">
              Curated palettes, searchable by mood, color, industry and style.
            </p>

            {/* Search Bar (Ivory pill with subtle hairline border) */}
            <form onSubmit={handleHeroSubmit} className="relative w-full max-w-[440px] mb-4">
              <div className="h-[42px] bg-white border border-[rgba(21,21,19,0.14)] rounded-[22px] px-4 flex items-center gap-2.5 text-[#151513] shadow-sm">
                <Search size={14} strokeWidth={1.5} className="text-[#8E8A81] shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search palettes, colors, moods or styles..."
                  className="w-full bg-transparent border-none outline-none font-sans text-[11.5px] text-[#151513] placeholder:text-[#8E8A81]"
                />
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-[#8E8A81] border border-[rgba(21,21,19,0.12)] px-1.5 py-0.5 rounded-[4px] bg-[#FAF8F5]">
                  ⌘ K
                </span>
              </div>
            </form>

            {/* Hero Filter Tags */}
            <div className="flex flex-wrap items-center gap-1.5 max-w-[480px]">
              {HERO_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    const lower = tag.toLowerCase();
                    if (['minimal', 'luxury', 'editorial', 'retro'].includes(lower)) {
                      onNavigate({ path: 'search', style: lower });
                    } else if (['warm', 'cool', 'nature'].includes(lower)) {
                      onNavigate({ path: 'search', mood: lower });
                    } else if (['tech', 'fashion'].includes(lower)) {
                      onNavigate({ path: 'search', industry: lower });
                    } else {
                      onNavigate({ path: 'search', q: lower });
                    }
                  }}
                  className="h-[24px] px-2.5 rounded-[12px] bg-transparent hover:bg-black/5 border border-[rgba(21,21,19,0.14)] text-[#151513] font-sans text-[10px] font-medium tracking-wide transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Architectural Terracotta Arch Photograph + Vertical Swatches */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
            <div className="flex items-start gap-4">
              
              {/* Terracotta Arch Image */}
              <div className="w-[240px] sm:w-[280px] md:w-[310px] aspect-[3/4] rounded-[6px] overflow-hidden border border-[rgba(21,21,19,0.1)] shadow-md bg-[#E8DECE]">
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=85"
                  alt="Warm terracotta Mediterranean architectural arch with natural sunlight and stairs"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              {/* Swatch Stack with COLOR CREATES EMOTION label */}
              <div className="flex flex-col items-start pt-1">
                <div className="flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-wider text-[#8E8A81] font-semibold mb-2 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#151513]" />
                  <span>COLOR CREATES EMOTION</span>
                </div>
                <div className="w-full h-[1px] bg-[rgba(21,21,19,0.12)] mb-3" />

                <div className="flex flex-col gap-2">
                  {[
                    { hex: '#555D3E', name: 'Olive' },
                    { hex: '#9E9789', name: 'Taupe' },
                    { hex: '#B25A38', name: 'Terracotta' },
                    { hex: '#E8DECE', name: 'Linen' },
                  ].map((s) => (
                    <div
                      key={s.hex}
                      onClick={() => {
                        copyToClipboard(s.hex);
                        showToast(`Copied ${s.hex}`, s.name);
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] border border-[rgba(21,21,19,0.12)] cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: s.hex }}
                      title={`${s.name} (${s.hex})`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. TRENDING PALETTES SECTION (Exact Reference Swatch Cards)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 border-t border-[rgba(21,21,19,0.08)]">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-[20px] md:text-[22px] tracking-[-0.025em] text-[#151513] font-medium">
            Trending Palettes
          </h2>
          <Link
            to={{ path: 'explore' }}
            onNavigate={onNavigate}
            className="text-[11px] font-sans font-medium text-[#8E8A81] hover:text-[#151513] transition-colors flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* 4-Column Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingPalettes.map((palette) => {
            const saved = isSaved(palette.id);
            return (
              <div
                key={palette.id}
                onClick={() => onNavigate({ path: 'palette-detail', slug: palette.slug || palette.id })}
                className="group border border-[rgba(21,21,19,0.12)] hover:border-[rgba(21,21,19,0.28)] rounded-[4px] bg-[#FAF9F5] p-2.5 flex flex-col transition-all cursor-pointer"
              >
                {/* Horizontal Swatch Strip with Heart on upper right */}
                <div className="relative h-[72px] rounded-[3px] overflow-hidden flex border border-[rgba(21,21,19,0.08)]">
                  {palette.colors.map((col, idx) => (
                    <div
                      key={`${col.hex}-${idx}`}
                      className="flex-1 h-full"
                      style={{ backgroundColor: col.hex }}
                    />
                  ))}

                  {/* Top-Right Heart Save Button */}
                  <button
                    onClick={(e) => handleToggleSave(palette, e)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    aria-label="Save palette"
                  >
                    <Heart
                      size={12}
                      className={saved ? 'fill-white text-white' : 'text-white'}
                    />
                  </button>
                </div>

                {/* Card Meta Underneath */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-sans text-[12px] font-medium text-[#151513] leading-snug group-hover:underline">
                      {palette.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[#8E8A81]">
                      {palette.colors.length}
                    </span>
                    <button
                      onClick={(e) => handleCopyPalette(palette, e)}
                      className="text-[#8E8A81] hover:text-[#151513] transition-colors p-0.5"
                      title="Copy palette HEX list"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                {/* Tags Row */}
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  {(palette.tags || ['Editorial', 'Warm']).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded-[2px] bg-black/[0.04] text-[#69665F] font-sans text-[9px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. EXPLORE BY CATEGORY SECTION (Dark Architectural Band)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-8 py-6 my-4">
        <div className="bg-[#11110F] text-[#F5F2EB] rounded-[6px] p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-[22px] md:text-[26px] tracking-[-0.025em] font-normal text-white">
              Explore by Category
            </h2>
            <Link
              to={{ path: 'explore' }}
              onNavigate={onNavigate}
              className="text-[11px] font-sans font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* 5 Photographic Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                onClick={() => onNavigate({ path: 'explore', style: cat.slug })}
                className="group relative aspect-[3/4] rounded-[4px] overflow-hidden cursor-pointer border border-white/10 hover:border-white/30 transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                {/* Upper Right Bookmark Icon */}
                <div className="absolute top-2 right-2 text-white/60">
                  <Heart size={13} />
                </div>

                {/* Bottom Title & Count */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <h3 className="font-sans text-sm font-medium leading-tight">
                    {cat.name}
                  </h3>
                  <p className="font-mono text-[9px] text-white/60 mt-0.5">
                    {cat.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THREE FEATURE CARDS (Generate, Extract, Create Custom)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Generate a Palette */}
          <div
            onClick={() => onNavigate({ path: 'generate' })}
            className="group border border-[rgba(21,21,19,0.12)] hover:border-[rgba(21,21,19,0.28)] rounded-[4px] bg-[#FAF9F5] p-3 flex gap-3.5 items-center cursor-pointer transition-all"
          >
            <div className="w-24 h-24 rounded-[3px] overflow-hidden shrink-0 border border-[rgba(21,21,19,0.1)]">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80"
                alt="Mountain landscape"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col justify-between h-full py-0.5">
              <div>
                <h3 className="font-serif text-base font-normal text-[#151513] leading-snug">
                  Generate<br />a palette
                </h3>
                <p className="font-sans text-[10.5px] text-[#69665F] leading-relaxed mt-1 line-clamp-2">
                  Create beautiful palettes from a base color, with different color harmony options.
                </p>
              </div>
              <span className="text-[10px] font-sans font-medium text-[#151513] flex items-center gap-1 mt-2 group-hover:underline">
                <span>Try it now</span>
                <ArrowRight size={10} />
              </span>
            </div>
          </div>

          {/* Card 2: Extract Colors from an Image */}
          <div
            onClick={() => onNavigate({ path: 'extract-from-image' })}
            className="group border border-[rgba(21,21,19,0.12)] hover:border-[rgba(21,21,19,0.28)] rounded-[4px] bg-[#FAF9F5] p-3 flex gap-3.5 items-center cursor-pointer transition-all"
          >
            <div className="w-24 h-24 rounded-[3px] overflow-hidden shrink-0 border border-[rgba(21,21,19,0.1)] relative">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80"
                alt="Mediterranean architecture"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute bottom-0 inset-x-0 h-2 flex">
                <div className="flex-1 bg-[#1D3557]" />
                <div className="flex-1 bg-[#457B9D]" />
                <div className="flex-1 bg-[#A8DADC]" />
                <div className="flex-1 bg-[#F1FAEE]" />
              </div>
            </div>
            <div className="flex flex-col justify-between h-full py-0.5">
              <div>
                <h3 className="font-serif text-base font-normal text-[#151513] leading-snug">
                  Extract colors<br />from an image
                </h3>
                <p className="font-sans text-[10.5px] text-[#69665F] leading-relaxed mt-1 line-clamp-2">
                  Upload an image and get a stunning palette in seconds.
                </p>
              </div>
              <span className="text-[10px] font-sans font-medium text-[#151513] flex items-center gap-1 mt-2 group-hover:underline">
                <span>Upload image</span>
                <ArrowRight size={10} />
              </span>
            </div>
          </div>

          {/* Card 3: Create Your Own */}
          <div
            onClick={() => onNavigate({ path: 'create' })}
            className="group border border-[rgba(21,21,19,0.12)] hover:border-[rgba(21,21,19,0.28)] rounded-[4px] bg-[#FAF9F5] p-3 flex gap-3.5 items-center cursor-pointer transition-all"
          >
            <div className="w-24 h-24 rounded-[3px] overflow-hidden shrink-0 border border-[rgba(21,21,19,0.1)]">
              <img
                src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&q=80"
                alt="Minimalist vase detail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col justify-between h-full py-0.5">
              <div>
                <h3 className="font-serif text-base font-normal text-[#151513] leading-snug">
                  Create your own
                </h3>
                <p className="font-sans text-[10.5px] text-[#69665F] leading-relaxed mt-1 line-clamp-2">
                  Build and save custom palettes for your projects.
                </p>
              </div>
              <span className="text-[10px] font-sans font-medium text-[#151513] flex items-center gap-1 mt-2 group-hover:underline">
                <span>Start creating</span>
                <ArrowRight size={10} />
              </span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
