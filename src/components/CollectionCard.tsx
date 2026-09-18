import React from 'react';
import { Layers, Bookmark, Heart, ArrowRight } from 'lucide-react';
import { CollectionItem, RouteType } from '../types';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';

interface CollectionCardProps {
  collection: CollectionItem;
  onNavigate: (route: RouteType) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onNavigate }) => {
  const { isSaved, saveItem, isLiked, toggleLike } = useSaved();
  const saved = isSaved(collection.id);
  const liked = isLiked(collection.id);

  const previews = (collection.coverPreview || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveItem({
      id: collection.id,
      type: 'collection',
      title: collection.title,
      slug: collection.slug,
      preview: collection.coverPreview || '',
      metadata: `${collection.items.length} items • ${collection.creator.name}`,
    });
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(collection.id);
  };

  return (
    <div className="specimen-card group flex flex-col justify-between p-4 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-md transition-all duration-200">
      <div>
        {/* Cover Preview Swatches */}
        <Link
          to={{ path: 'collection-detail', slug: collection.slug }}
          onNavigate={onNavigate}
          className="block h-28 rounded-sm overflow-hidden mb-3.5 border border-[var(--border-subtle)] relative group-hover:shadow-md transition-shadow"
        >
          {previews.length > 0 ? (
            <div className="flex h-full w-full">
              {previews.slice(0, 5).map((color, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-full"
                  style={{ backgroundColor: color.startsWith('#') ? color : '#111215' }}
                />
              ))}
            </div>
          ) : (
            <div className="h-full w-full bg-[var(--bg-surface-2)] flex items-center justify-center text-[var(--text-tertiary)]">
              <Layers size={24} />
            </div>
          )}

          <span className="absolute bottom-2 right-2 font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs bg-black/60 text-white backdrop-blur-xs">
            {collection.items.length} {collection.items.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </Link>

        {/* Header & Title */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link
            to={{ path: 'collection-detail', slug: collection.slug }}
            onNavigate={onNavigate}
            className="font-bold text-sm text-[var(--text-primary)] hover:text-[var(--color-primary)] line-clamp-1"
          >
            {collection.title}
          </Link>
        </div>

        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
          {collection.description}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[var(--text-tertiary)] truncate">
          by {collection.creator.name}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleLike}
            className="p-1 text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={13} fill={liked ? '#F87171' : 'none'} color={liked ? '#F87171' : 'currentColor'} />
          </button>
          <button
            onClick={handleToggleSave}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] transition-colors"
            title={saved ? 'Remove from saved' : 'Save collection'}
          >
            <Bookmark size={13} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : 'currentColor'} />
          </button>
          <Link
            to={{ path: 'collection-detail', slug: collection.slug }}
            onNavigate={onNavigate}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Open collection"
          >
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
