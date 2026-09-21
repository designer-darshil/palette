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
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { SpecimenCardBase } from '../components/common/SpecimenCardBase';

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

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Collections', to: { path: 'collections' } },
          { label: collection.title, isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel={`Curated collection · ${collection.items.length} specimens`}
        title={collection.title}
        description={`${collection.description} Curated by ${collection.creator.name} on ${new Date(collection.createdAt).toLocaleDateString()}.`}
        actions={
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Share2 size={13} />}
              onClick={handleShare}
              title="Share collection link"
            >
              Share
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Copy size={13} />}
              onClick={handleDuplicate}
              title="Duplicate collection to your workspace"
            >
              Duplicate
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Trash2 size={13} />}
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300"
              title="Delete collection"
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* Items Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            Specimens in this Collection ({collection.items.length})
          </h2>
        </div>

        {collection.items.length === 0 ? (
          <EmptyState
            icon={<Layers size={32} />}
            title="This collection has no items yet"
            description="Explore palettes, colors, or gradients and click 'Add to Collection'."
            actionLabel="Explore Library"
            onAction={() => onNavigate({ path: 'explore' })}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collection.items.map((item) => {
              const previews = item.preview.split(',').filter(Boolean);
              return (
                <SpecimenCardBase
                  key={item.id}
                  className="p-3.5 flex flex-col justify-between"
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
                </SpecimenCardBase>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
