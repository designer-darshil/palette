import React, { useMemo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_CATEGORIES } from '../data/categories';
import { PaletteCard } from '../components/PaletteCard';
import { SEOHead } from '../components/seo/SEOHead';
import { Link } from '../components/common/Link';
import { NotFoundPage } from './NotFoundPage';

interface CategoryPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ slug, onNavigate }) => {
  const category = useMemo(() => {
    return CURATED_CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
  }, [slug]);

  const palettes = useMemo(() => {
    if (!category) return [];
    const catSlug = category.slug.toLowerCase();
    return CURATED_PALETTES.filter(
      (p) =>
        p.category.toLowerCase() === catSlug ||
        (p.tags || []).some((t) => t.toLowerCase() === catSlug) ||
        ((p.style as string[] | undefined) || []).some((s: string) => s.toLowerCase() === catSlug)
    );
  }, [category]);

  const relatedCategories = useMemo(() => {
    if (!category) return [];
    return CURATED_CATEGORIES.filter((c) => c.slug !== category.slug).slice(0, 4);
  }, [category]);

  if (!category) {
    return <NotFoundPage requestedUrl={`/category/${slug}`} onNavigate={onNavigate} />;
  }

  return (
    <div className="w-full min-h-screen bg-[var(--kroma-paper)] text-[var(--kroma-ink)] py-5 md:py-6">
      <SEOHead
        rawTitle
        title={`${category.name} Color Palettes — KROMA`}
        description={category.description}
        canonicalPath={`/category/${category.slug}`}
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* Top Back Nav */}
        <div className="pb-2 mb-2">
          <button
            onClick={() => onNavigate({ path: 'explore' })}
            className="font-sans text-xs text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>Back to explore</span>
          </button>
        </div>

        {/* 1. Category Hero (Architectural Photography + Typography) */}
        <div className="relative w-full h-[200px] md:h-[240px] rounded-[4px] overflow-hidden border border-[var(--kroma-border)] mb-5 bg-[#0D0D0C] text-white">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-between">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/70">
              CATEGORY CLASSIFICATION
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-1.5">
                <h1 className="font-sans text-[32px] md:text-[40px] leading-[1.05] tracking-[-0.03em] text-white font-normal">
                  {category.name}
                </h1>
                <span className="font-mono text-xs uppercase tracking-widest text-white/80">
                  {palettes.length || category.paletteCount} PALETTES
                </span>
              </div>
              <p className="font-sans text-xs text-white/75 max-w-xl leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Palette Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
          {palettes.map((palette) => (
            <PaletteCard
              key={palette.id}
              palette={palette}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* 3. Related Categories */}
        <div className="pt-5 border-t border-[var(--kroma-border)]">
          <h3 className="font-sans text-xl md:text-2xl font-medium text-[var(--kroma-ink)] mb-4">
            Related Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedCategories.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onNavigate({ path: 'category', slug: rel.slug })}
                className="group relative h-40 rounded-[4px] overflow-hidden border border-[var(--kroma-border)] cursor-pointer bg-[#0D0D0C] p-4 flex flex-col justify-end text-white"
              >
                <img
                  src={rel.image}
                  alt={rel.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="relative z-10">
                  <h4 className="font-sans font-medium text-lg text-white">{rel.name}</h4>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-white/70">
                    {rel.paletteCount} Palettes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
