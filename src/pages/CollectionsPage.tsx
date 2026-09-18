import React from 'react';
import { RouteType } from '../types';
import { CURATED_CATEGORIES } from '../data/categories';
import { SEOHead } from '../components/seo/SEOHead';

interface CollectionsPageProps {
  onNavigate: (route: RouteType) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({ onNavigate }) => {
  const collections = [
    {
      id: 'col-editorial',
      slug: 'editorial',
      title: 'Editorial',
      count: 12,
      description: 'Disciplined sumi blacks, vermilion accents, and raw paper tones for publications and typography.',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      swatches: ['#121212', '#686258', '#C7B8A3', '#E9E2D5'],
    },
    {
      id: 'col-luxury',
      slug: 'luxury',
      title: 'Luxury',
      count: 8,
      description: 'Sartorial depth, deep espresso, and raw travertine for timeless atelier branding.',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      swatches: ['#101010', '#8C8773', '#CFC8B8', '#EFEAE0'],
    },
    {
      id: 'col-website',
      slug: 'website-projects',
      title: 'Website Projects',
      count: 15,
      description: 'Clean UI palettes with enforced WCAG AAA text contrast and dark mode tokens.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      swatches: ['#1E3024', '#3A5648', '#88A168', '#D7E0D3'],
    },
    {
      id: 'col-brand',
      slug: 'brand-inspiration',
      title: 'Brand Inspiration',
      count: 9,
      description: 'Organic terrain, mineral clays, and Mediterranean shadow play translated into brand kits.',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      swatches: ['#3A2F24', '#7A6B5B', '#C9B8A7', '#EDE4D9'],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--kroma-paper)] text-[var(--kroma-ink)] py-5 md:py-6">
      <SEOHead
        rawTitle
        title="Curated Collections — KROMA"
        description="Explore thematic collections of curated color palettes for editorial, luxury, and digital design."
        canonicalPath="/collections"
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-4 pb-2.5 border-b border-[var(--kroma-border)]">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--kroma-muted)] mb-1.5">
            CURATED ARCHIVES
          </div>
          <h1 className="font-sans text-[32px] md:text-[40px] leading-[1.05] tracking-[-0.03em] text-[var(--kroma-ink)] font-normal">
            Collections
          </h1>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => onNavigate({ path: 'collection-detail', slug: col.slug })}
              className="group relative h-[320px] rounded-[4px] overflow-hidden border border-[var(--kroma-border)] cursor-pointer bg-[#0D0D0C] flex flex-col justify-between p-5 text-white"
            >
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="relative z-10 flex justify-between items-start font-mono text-[9px] uppercase tracking-widest text-white/70">
                <span>ARCHIVE</span>
                <span>{col.count} PALETTES</span>
              </div>

              <div className="relative z-10">
                <h3 className="font-sans text-xl md:text-2xl font-medium text-white tracking-[-0.02em] mb-1.5">
                  {col.title}
                </h3>
                <p className="font-sans text-[11px] text-white/75 line-clamp-2 leading-relaxed mb-3">
                  {col.description}
                </p>
                <div className="flex h-4 w-28 rounded-[2px] overflow-hidden">
                  {col.swatches.map((hex, i) => (
                    <div key={i} className="flex-1 h-full" style={{ backgroundColor: hex }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
