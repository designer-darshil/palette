import React, { useState } from 'react';
import { ArrowLeft, Trash2, Copy, Share2, Plus, ExternalLink, Layers, Check } from 'lucide-react';
import { RouteType } from '../types';
import { useCollections } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NotFoundPage } from './NotFoundPage';
import { Link } from '../components/common/Link';

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
    <div className="detail-container w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title={`${collection.title} — Color Collection Specimen`}
        description={collection.description}
        canonicalPath={`/collections/${collection.slug}`}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Collections', to: { path: 'collections' } },
          { label: collection.title, isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <span className="page-category-label text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
            CURATED COLLECTION • {collection.items.length} SPECIMENS
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
            {collection.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
            {collection.description}
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs text-[var(--text-tertiary)]">
            <span>Curated by <strong className="text-[var(--text-primary)]">{collection.creator.name}</strong></span>
            <span>•</span>
            <span className="font-mono">{new Date(collection.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={handleShare}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            title="Share collection link"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            onClick={handleDuplicate}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            title="Duplicate collection to your workspace"
          >
            <Copy size={13} />
            <span>Duplicate</span>
          </button>
          <button
            onClick={handleDelete}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 text-red-400 hover:text-red-300"
            title="Delete collection"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Items Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            Specimens in this Collection ({collection.items.length})
          </h2>
        </div>

        {collection.items.length === 0 ? (
          <div className="p-12 text-center bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md">
            <Layers size={32} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              This collection has no items yet.
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">
              Explore palettes, colors, or gradients and click "Add to Collection".
            </p>
            <Link to={{ path: 'explore' }} onNavigate={onNavigate} className="btn-primary text-xs px-4 py-2 inline-flex">
              Explore Library
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collection.items.map((item) => {
              const previews = item.preview.split(',').filter(Boolean);
              return (
                <div
                  key={item.id}
                  className="specimen-card p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Preview */}
                    <div className="h-20 rounded-xs overflow-hidden mb-2.5 border border-[var(--border-subtle)] flex">
                      {previews.map((c, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[var(--text-primary)] truncate">
                          {item.title}
                        </div>
                        <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase mt-0.5">
                          {item.type} {item.metadata ? `• ${item.metadata}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <Link
                      to={
                        item.type === 'palette'
                          ? { path: 'palette-detail', slug: item.slug }
                          : item.type === 'color'
                          ? { path: 'color-detail', slug: item.slug }
                          : item.type === 'gradient'
                          ? { path: 'gradient-detail', slug: item.slug }
                          : item.type === 'combo'
                          ? { path: 'combo-detail', slug: item.slug }
                          : { path: 'pattern-detail', slug: item.slug }
                      }
                      onNavigate={onNavigate}
                      className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono font-semibold"
                    >
                      <span>Open</span>
                      <ExternalLink size={11} />
                    </Link>

                    <button
                      onClick={() => removeItemFromCollection(collection.id, item.id)}
                      className="text-[11px] text-[var(--text-tertiary)] hover:text-red-400 p-1"
                      title="Remove from collection"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
