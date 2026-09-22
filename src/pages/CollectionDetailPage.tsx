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
    <div className="studio-page">
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
            className="studio-btn-secondary py-1.5 px-3 text-[11px]"
            title="Share collection link"
          >
            <Share2 size={12} />
            <span>SHARE</span>
          </button>
          <button
            onClick={handleDuplicate}
            className="studio-btn-secondary py-1.5 px-3 text-[11px]"
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
        <span className="studio-label">CURATED MOODBOARD</span>
        <h1 className="studio-headline">{collection.title}</h1>
        <p className="studio-subhead">
          {collection.description} Curated by {collection.creator.name} · {collection.items.length} specimens.
        </p>
      </header>

      {/* ── 19: OPEN VISUAL WALL (Moodboard) ────────────────────── */}
      {collection.items.length === 0 ? (
        <div className="studio-empty-state max-w-md border border-dashed border-[var(--border-subtle)] p-8">
          <div className="studio-empty-title">COLLECTION IS EMPTY.</div>
          <p className="studio-empty-desc">
            Explore palettes, colors, or gradients and save them directly to this moodboard wall.
          </p>
          <button
            onClick={() => onNavigate({ path: 'explore' })}
            className="studio-btn-primary"
          >
            <span>EXPLORE SPECIMENS ↗</span>
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
                    className="studio-btn-link"
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
