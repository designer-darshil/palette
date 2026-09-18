import React, { useMemo } from 'react';
import { ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { PaletteCard } from '../components/PaletteCard';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { SEOHead } from '../components/seo/SEOHead';

interface CollectionDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const CollectionDetailPage: React.FC<CollectionDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();

  const title = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const palettes = useMemo(() => {
    const cleanSlug = slug.toLowerCase();
    return CURATED_PALETTES.filter(
      (p) =>
        p.category.toLowerCase().includes(cleanSlug) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(cleanSlug)) ||
        ((p.style as string[] | undefined) || []).some((s) => s.toLowerCase().includes(cleanSlug)) ||
        ((p.industry as string[] | undefined) || []).some((i) => i.toLowerCase().includes(cleanSlug))
    );
  }, [slug]);

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Collection link copied to clipboard');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--kroma-paper)] text-[var(--kroma-ink)] py-5 md:py-6">
      <SEOHead
        rawTitle
        title={`${title} Collection — KROMA`}
        description={`Curated color palette collection for ${title}.`}
        canonicalPath={`/collections/${slug}`}
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* Top Back Nav & Actions */}
        <div className="flex items-center justify-between pb-2 mb-2">
          <button
            onClick={() => onNavigate({ path: 'collections' })}
            className="font-sans text-xs text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>Back to collections</span>
          </button>

          <button
            onClick={handleShare}
            className="kroma-btn-secondary h-[30px] text-xs px-3"
          >
            <Share2 size={13} />
            <span>Share collection</span>
          </button>
        </div>

        {/* Collection Header */}
        <div className="mb-4 pb-2.5 border-b border-[var(--kroma-border)]">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--kroma-muted)] mb-1">
            COLLECTION ARCHIVE
          </div>
          <h1 className="font-sans text-[32px] md:text-[40px] leading-[1.05] tracking-[-0.03em] text-[var(--kroma-ink)] font-normal mb-1.5">
            {title}
          </h1>
          <p className="font-sans text-xs text-[var(--kroma-muted)]">
            {palettes.length} curated specimens matching this thematic classification.
          </p>
        </div>

        {/* Palettes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {palettes.map((palette) => (
            <PaletteCard
              key={palette.id}
              palette={palette}
              onNavigate={onNavigate}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
