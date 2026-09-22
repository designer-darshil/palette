import React from 'react';
import { Trash2, Copy, Share2, ArrowUpRight, ExternalLink } from 'lucide-react';
import { RouteType } from '../types';
import { useCollections } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { NotFoundPage } from './NotFoundPage';

interface CollectionDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const CollectionDetailPage: React.FC<CollectionDetailPageProps> = ({ slug, onNavigate }) => {
  const { getCollectionBySlug, removeItemFromCollection, deleteCollection, duplicateCollection } = useCollections();
  const { showToast } = useToast();
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return <NotFoundPage requestedUrl={`/collections/${slug}`} onNavigate={onNavigate} />;
  }

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Collection link copied to clipboard', collection.title);
    }
  };

  const handleDuplicate = () => {
    const copy = duplicateCollection(collection.id);
    if (copy) {
      showToast('Duplicated collection', copy.title);
      onNavigate({ path: 'collection-detail', slug: copy.slug });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete collection "${collection.title}"?`)) {
      deleteCollection(collection.id);
      showToast('Deleted collection', collection.title);
      onNavigate({ path: 'collections' });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pb-16 md:pb-24 box-border">
      <SEOHead
        title={`${collection.title} — Moodboard Collection | KROMA`}
        description={collection.description}
        canonicalPath={`/collections/${collection.slug}`}
      />

      {/* Editorial Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
          <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => onNavigate({ path: 'create' })}>STUDIO</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => onNavigate({ path: 'collections' })}>COLLECTIONS</span>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold truncate max-w-xs">{collection.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase py-1.5 px-3 bg-surface-1 text-text-primary border border-border-subtle rounded cursor-pointer inline-flex items-center gap-1.5 transition-all duration-150 select-none hover:border-text-primary hover:-translate-y-0.5"
            title="Share collection link"
          >
            <Share2 size={12} />
            <span>SHARE</span>
          </button>
          <button
            onClick={handleDuplicate}
            className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase py-1.5 px-3 bg-surface-1 text-text-primary border border-border-subtle rounded cursor-pointer inline-flex items-center gap-1.5 transition-all duration-150 select-none hover:border-text-primary hover:-translate-y-0.5"
            title="Duplicate collection"
          >
            <Copy size={12} />
            <span>DUPLICATE</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
            title="Delete collection"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Header — Moodboard Identity */}
      <header className="mb-14">
        <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary block mb-4">CURATED MOODBOARD</span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-normal leading-[1.05] tracking-tight text-text-primary uppercase m-0 mb-5">{collection.title}</h1>
        <p className="font-sans text-base leading-relaxed text-text-secondary max-w-[680px] m-0">
          {collection.description} Curated by {collection.creator.name} · {collection.items.length} specimens.
        </p>
      </header>

      {/* ── 19: OPEN VISUAL WALL (Moodboard) ────────────────────── */}
      {collection.items.length === 0 ? (
        <div className="max-w-md py-16 px-8 text-center border border-dashed border-border-subtle rounded flex flex-col items-center justify-center gap-4">
          <div className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-text-secondary">COLLECTION IS EMPTY.</div>
          <p className="font-sans text-sm text-text-tertiary max-w-[420px] leading-relaxed">
            Explore palettes, colors, or gradients and save them directly to this moodboard wall.
          </p>
          <button
            onClick={() => onNavigate({ path: 'explore' })}
            className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase px-6 py-3 bg-text-primary text-canvas border border-text-primary rounded cursor-pointer inline-flex items-center gap-2 transition-all duration-150 select-none hover:opacity-90 hover:-translate-y-0.5"
          >
            <span>EXPLORE SPECIMENS</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {collection.items.map((item, idx) => {
            const previews = item.preview.split(',').filter(Boolean);
            const isWide = idx % 5 === 0;

            return (
              <div
                key={item.id}
                className={`border border-[var(--border-subtle)] hover:border-[var(--text-primary)] p-5 flex flex-col justify-between transition-colors ${
                  isWide ? 'md:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    <span>SPECIMEN 0{idx + 1} · {item.type}</span>
                    <button
                      onClick={() => removeItemFromCollection(collection.id, item.id)}
                      className="text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Visual Specimen Preview */}
                  <div className="h-28 rounded-xs overflow-hidden flex mb-4 border border-[var(--border-subtle)]">
                    {previews.map((c, i) => (
                      <div
                        key={i}
                        className="flex-1 h-full"
                        style={{ backgroundColor: c.trim() }}
                        title={c.trim()}
                      />
                    ))}
                  </div>

                  <h3 className="font-sans text-base font-bold text-[var(--text-primary)] uppercase tracking-tight mb-1">
                    {item.title}
                  </h3>
                  {item.metadata && (
                    <p className="font-mono text-[11px] text-[var(--text-secondary)] uppercase">
                      {item.metadata}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (item.type === 'palette') onNavigate({ path: 'palette-detail', slug: item.slug });
                      else if (item.type === 'color') onNavigate({ path: 'color-detail', slug: item.slug });
                      else if (item.type === 'gradient') onNavigate({ path: 'gradient-detail', slug: item.slug });
                      else if (item.type === 'combo') onNavigate({ path: 'combo-detail', slug: item.slug });
                      else onNavigate({ path: 'pattern-detail', slug: item.slug });
                    }}
                    className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-secondary bg-transparent border-0 cursor-pointer inline-flex items-center gap-1.5 p-0 transition-colors duration-150 hover:text-text-primary"
                  >
                    <span>OPEN SPECIMEN</span>
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
