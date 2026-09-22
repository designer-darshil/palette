import React, { useState, useMemo } from 'react';
import { Trash2, Copy, Bookmark, Check, ArrowUpRight } from 'lucide-react';
import { RouteType } from '../types';
import { useSaved, SavedItem } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';

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
    <div className="studio-page">
      <SEOHead
        title="Saved Colors — Studio Color Wall | KROMA"
        description="Your personal color archive. Bookmarked pigments, palettes, and gradient specimens."
        canonicalPath="/saved"
        noindex={true}
        nofollow={true}
      />

      {/* Editorial Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
          <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => onNavigate({ path: 'create' })}>STUDIO</span>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold">SAVED ARCHIVE</span>
        </div>

        {savedItems.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Clear all saved colors from your drawer?')) {
                clearAll();
                showToast('Cleared saved archive');
              }
            }}
            className="studio-btn-secondary py-1 px-3 text-[11px]"
          >
            CLEAR ARCHIVE
          </button>
        )}
      </div>

      {/* Hero */}
      <header className="mb-14">
        <span className="studio-label">PERSONAL ARCHIVE</span>
        <h1 className="studio-headline">
          A LITTLE COLOR<br />
          ARCHIVE.
        </h1>
        <p className="studio-subhead">
          A collection of precious things. Bookmarked specimens, custom balance studies, and shades that stopped your scroll.
        </p>
      </header>

      {/* Simple Typographic Filters */}
      {savedItems.length > 0 && (
        <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] pb-3 mb-8 overflow-x-auto scrollbar-none">
          {(['all', 'recent', 'warm', 'cool', 'neutral'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-xs uppercase tracking-wider transition-colors pb-1 ${
                filter === f
                  ? 'text-[var(--text-primary)] font-bold border-b-2 border-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.toUpperCase()} {f === 'all' && `(${savedItems.length})`}
            </button>
          ))}
        </div>
      )}

      {/* ── 20: VISUAL COLOR WALL (Large Tiles) ─────────────────── */}
      {filteredItems.length > 0 ? (
        <div className="studio-color-wall mb-20">
          {filteredItems.map((item) => {
            const isCopied = copiedId === item.id;
            const isPalette = item.type === 'palette';
            const colorsList = isPalette ? item.preview.split(',') : [];

            return (
              <div
                key={item.id}
                className="studio-wall-tile group"
                onClick={() => handleOpenItem(item)}
                role="button"
                tabIndex={0}
              >
                {/* Visual Swatch */}
                {isPalette ? (
                  <div className="studio-wall-swatch flex overflow-hidden border border-[var(--border-subtle)]">
                    {colorsList.map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.trim() }} />
                    ))}
                  </div>
                ) : (
                  <div
                    className="studio-wall-swatch border border-[var(--border-subtle)]"
                    style={{
                      background: item.preview.includes('gradient') ? item.preview : undefined,
                      backgroundColor: !item.preview.includes('gradient') ? item.preview : undefined,
                    }}
                  />
                )}

                {/* Metadata & Copy on hover */}
                <div className="flex flex-col gap-1">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] truncate">
                    {item.title}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
                    <span className="truncate">{item.preview.split(',')[0]}</span>
                    <button
                      onClick={(e) => handleCopy(item, e)}
                      className="text-[10px] uppercase tracking-wider hover:text-[var(--text-primary)] transition-colors"
                      title="Copy HEX"
                    >
                      {isCopied ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                </div>

                {/* Quick Delete */}
                <div className="pt-2 mt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] uppercase">
                  <span>{item.type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                      showToast('Removed from archive', item.title);
                    }}
                    className="hover:text-red-500 transition-colors p-0.5"
                    title="Remove item"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Branded Empty State */
        <div className="studio-empty-state max-w-md border border-dashed border-[var(--border-subtle)] p-8">
          <div className="studio-empty-title">YOUR DRAWER IS EMPTY.</div>
          <p className="studio-empty-desc">
            Find a color or balance study you love, and bookmark it to create your personal color wall.
          </p>
          <button
            onClick={() => onNavigate({ path: 'colors' })}
            className="studio-btn-primary"
          >
            <span>START EXPLORING ↗</span>
          </button>
        </div>
      )}
    </div>
  );
};
