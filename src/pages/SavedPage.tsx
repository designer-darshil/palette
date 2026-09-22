import React, { useState, useMemo } from 'react';
import { Trash2, Copy, Bookmark, Check, ArrowUpRight, ArrowLeft } from 'lucide-react';
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
    <div className="kroma-page">
      <SEOHead
        title="Saved Colors — A Little Color Archive | KROMA"
        description="Your personal color drawer. Bookmarked pigments, palettes, and gradient specimens."
        canonicalPath="/saved"
        noindex={true}
        nofollow={true}
      />

      {/* Top Editorial Hero */}
      <header className="kroma-hero flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="kroma-label">SAVED</div>
          <h1 className="kroma-headline">A LITTLE COLOR ARCHIVE.</h1>
          <p className="kroma-lead">
            A collection of precious things. Bookmarked specimens, custom balance studies, and shades that stopped your scroll.
          </p>
        </div>

        {savedItems.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Clear all saved colors from your drawer?')) {
                  clearAll();
                  showToast('Cleared saved archive');
                }
              }}
              className="font-sans text-xs font-semibold tracking-wider uppercase px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:border-red-500 text-neutral-600 dark:text-neutral-400 hover:text-red-500 rounded-sm transition-colors"
            >
              CLEAR DRAWER
            </button>
          </div>
        )}
      </header>

      {/* Simple Typographic Filters */}
      {savedItems.length > 0 && (
        <div className="kroma-filter-bar mb-8">
          {(['all', 'recent', 'warm', 'cool', 'neutral'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`kroma-filter-btn ${filter === f ? 'kroma-filter-btn--active' : ''}`}
            >
              {f.toUpperCase()} {f === 'all' && `(${savedItems.length})`}
            </button>
          ))}
        </div>
      )}

      {/* The Color Swatch Wall */}
      {filteredItems.length > 0 ? (
        <div className="kroma-color-grid mb-16">
          {filteredItems.map((item) => {
            const isCopied = copiedId === item.id;
            const isPalette = item.type === 'palette';
            const colorsList = isPalette ? item.preview.split(',') : [];

            return (
              <div
                key={item.id}
                className="kroma-color-tile"
                onClick={() => handleOpenItem(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleOpenItem(item);
                }}
              >
                {/* Large Color Field */}
                {isPalette ? (
                  <div className="kroma-color-tile__swatch flex overflow-hidden">
                    {colorsList.map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.trim() }} />
                    ))}
                    <span className="kroma-color-tile__copy-badge">
                      <span>VIEW PALETTE</span>
                      <ArrowUpRight size={11} />
                    </span>
                  </div>
                ) : (
                  <div
                    className="kroma-color-tile__swatch"
                    style={{
                      background: item.type === 'gradient' ? item.preview : item.preview,
                    }}
                    onClick={(e) => handleCopy(item, e)}
                  >
                    <span className="kroma-color-tile__copy-badge">
                      {isCopied ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <span>COPY HEX</span>
                          <ArrowUpRight size={11} />
                        </>
                      )}
                    </span>
                  </div>
                )}

                {/* Info: Name & HEX */}
                <div className="kroma-color-tile__info">
                  <div className="flex items-center justify-between gap-1">
                    <span className="kroma-color-tile__name">{item.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                        showToast('Removed from archive', item.title);
                      }}
                      className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                      title="Remove from saved"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <span className="kroma-color-tile__hex">
                    {isPalette ? `${colorsList.length} SHADES` : item.preview}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Artistic Empty State */
        <div className="py-24 px-6 text-center max-w-xl mx-auto border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm my-8">
          <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
            <Bookmark size={20} />
          </div>
          <h2 className="font-sans text-3xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white mb-3">
            YOUR DRAWER IS EMPTY.
          </h2>
          <p className="font-sans text-sm text-neutral-500 max-w-md mx-auto mb-8 leading-relaxed">
            Find a color you love and save it. Click the bookmark icon on any specimen or palette to assemble your personal drawer.
          </p>
          <button
            onClick={() => onNavigate({ path: 'colors' })}
            className="font-sans text-xs font-bold tracking-wider uppercase px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <span>START EXPLORING</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
