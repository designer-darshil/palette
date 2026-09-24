import React, { useState, useMemo } from 'react';
import { Trash2, ArrowUpRight } from 'lucide-react';
import { RouteType } from '../types';
import { useSaved, SavedItem } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { KromaButton } from '../components/common/KromaButton';
import { Link } from '../components/common/Link';

interface SavedPageProps {
  onNavigate: (route: RouteType) => void;
}

type FilterType = 'all' | 'recent' | 'warm' | 'cool' | 'neutral';

export const SavedPage: React.FC<SavedPageProps> = ({ onNavigate }) => {
  const { savedItems, removeItem, clearAll } = useSaved();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<FilterType>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return savedItems;
    if (filter === 'recent') return [...savedItems].reverse();
    return savedItems.filter((item) => {
      const meta = (item.metadata || '').toLowerCase();
      const title = item.title.toLowerCase();
      if (filter === 'warm') return meta.includes('warm') || meta.includes('red') || meta.includes('orange') || meta.includes('yellow') || title.includes('warm') || title.includes('gold');
      if (filter === 'cool') return meta.includes('cool') || meta.includes('blue') || meta.includes('cyan') || meta.includes('teal') || title.includes('cool') || title.includes('slate');
      if (filter === 'neutral') return meta.includes('neutral') || meta.includes('grey') || meta.includes('earth') || meta.includes('minimal') || title.includes('neutral');
      return true;
    });
  }, [savedItems, filter]);

  const handleCopy = async (item: SavedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = item.type === 'gradient' ? `background: ${item.preview};` : item.preview;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(item.id);
      showToast(`Copied ${item.title}`, text);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const handleOpenItem = (item: SavedItem) => {
    if (item.type === 'color') {
      onNavigate({ path: 'color-detail', slug: item.slug });
    } else if (item.type === 'palette') {
      onNavigate({ path: 'palette-detail', slug: item.slug });
    } else if (item.type === 'combo') {
      onNavigate({ path: 'combo-detail', slug: item.slug });
    } else if (item.type === 'gradient') {
      onNavigate({ path: 'gradient-detail', slug: item.slug });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pb-16 md:pb-24 box-border">
      <SEOHead
        title="Saved Colors — Studio Color Wall | KROMA"
        description="Your personal color archive. Bookmarked pigments, palettes, and gradient specimens."
        canonicalPath="/saved"
        noindex={true}
        nofollow={true}
      />

      {/* Editorial Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
          <Link to={{ path: 'create' }} onNavigate={onNavigate} className="hover:text-[var(--text-primary)]">STUDIO</Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold">SAVED ARCHIVE</span>
        </div>

        {savedItems.length > 0 && (
          <KromaButton
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm('Clear all saved colors from your drawer?')) {
                clearAll();
                showToast('Cleared saved archive');
              }
            }}
          >
            CLEAR ARCHIVE
          </KromaButton>
        )}
      </div>

      {/* Hero */}
      <header className="mb-14">
        <span className="font-mono text-xs font-semibold tracking-wider uppercase text-text-tertiary mb-3 block">PERSONAL ARCHIVE</span>
        <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight text-text-primary uppercase m-0">
          A LITTLE COLOR ARCHIVE.
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl mt-3">
          A collection of precious things. Bookmarked specimens, custom balance studies, and shades that stopped your scroll.
        </p>
      </header>

      {/* Simple Typographic Filters */}
      {savedItems.length > 0 && (
        <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] pb-3 mb-8 overflow-x-auto scrollbar-none">
          {(['all', 'recent', 'warm', 'cool', 'neutral'] as FilterType[]).map((f) => (
            <KromaButton
              key={f}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(f)}
              className={`font-mono text-xs uppercase tracking-wider pb-1 h-auto rounded-none ${
                filter === f
                  ? 'text-[var(--text-primary)] font-bold border-b-2 border-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.toUpperCase()} {f === 'all' && `(${savedItems.length})`}
            </KromaButton>
          ))}
        </div>
      )}

      {/* ── 20: VISUAL COLOR WALL (Large Tiles) ─────────────────── */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 mb-20">
          {filteredItems.map((item) => {
            const isCopied = copiedId === item.id;
            const isPalette = item.type === 'palette';
            const itemRoute: RouteType =
              item.type === 'color'
                ? { path: 'color-detail', slug: item.slug }
                : item.type === 'palette'
                ? { path: 'palette-detail', slug: item.slug }
                : item.type === 'combo'
                ? { path: 'combo-detail', slug: item.slug }
                : { path: 'gradient-detail', slug: item.slug };

            const colorsList = item.preview.split(',').filter(Boolean);

            return (
              <article
                key={item.id}
                className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] overflow-hidden flex flex-col transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] group select-none"
              >
                {/* Full-bleed Visual Swatch Hero */}
                {isPalette ? (
                  <Link
                    to={itemRoute}
                    onNavigate={onNavigate}
                    className="w-full h-28 sm:h-32 flex overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06] cursor-pointer block"
                    aria-label={`View ${item.title}`}
                  >
                    {colorsList.map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.trim() }} />
                    ))}
                  </Link>
                ) : (
                  <Link
                    to={itemRoute}
                    onNavigate={onNavigate}
                    className="w-full h-28 sm:h-32 border-b border-black/[0.06] dark:border-white/[0.06] cursor-pointer block"
                    style={{
                      background: item.preview.includes('gradient') ? item.preview : undefined,
                      backgroundColor: !item.preview.includes('gradient') ? item.preview : undefined,
                    }}
                    aria-label={`View ${item.title}`}
                  />
                )}

                {/* Metadata & Copy */}
                <div className="p-3 sm:p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
                  <div>
                    <h3 className="m-0 font-sans text-xs font-bold uppercase tracking-wider text-[#171717] dark:text-white truncate mb-0.5">
                      <Link
                        to={itemRoute}
                        onNavigate={onNavigate}
                        className="hover:underline text-inherit no-underline"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <div className="font-mono text-xs text-[#707070] dark:text-[#909090] flex items-center justify-between">
                      <span className="truncate">{item.preview.split(',')[0]}</span>
                      <KromaButton
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleCopy(item, e)}
                        className="text-xs uppercase font-semibold tracking-wider hover:text-[#171717] dark:hover:text-white p-0 h-auto"
                        title="Copy HEX"
                      >
                        {isCopied ? 'COPIED' : 'COPY'}
                      </KromaButton>
                    </div>
                  </div>

                  {/* Quick Delete & Type Tag */}
                  <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#707070] dark:text-[#909090] uppercase tracking-wider">
                    <span>{item.type}</span>
                    <KromaButton
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                        showToast('Removed from saved', item.title);
                      }}
                      className="hover:text-rose-500 p-1 h-6 w-6"
                      title="Remove from saved drawer"
                      aria-label="Remove from saved drawer"
                      iconLeft={<Trash2 size={12} />}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Branded Empty State */
        <div className="max-w-md py-16 px-8 text-center border border-dashed border-border-subtle rounded flex flex-col items-center justify-center gap-4">
          <div className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-text-secondary">YOUR DRAWER IS EMPTY.</div>
          <p className="font-sans text-sm text-text-tertiary max-w-[420px] leading-relaxed">
            Find a color or balance study you love, and bookmark it to create your personal color wall.
          </p>
          <KromaButton
            variant="filled"
            onClick={() => onNavigate({ path: 'colors' })}
            iconRight={<ArrowUpRight size={14} />}
          >
            START EXPLORING
          </KromaButton>
        </div>
      )}
    </div>
  );
};
