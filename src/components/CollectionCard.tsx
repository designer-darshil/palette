import React from 'react';
import { Layers, Bookmark, Heart, ArrowRight } from 'lucide-react';
import { CollectionItem, RouteType } from '../types';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';
import { KromaCard } from './common/KromaCard';
import { KromaButton } from './common/KromaButton';

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
    <KromaCard
      aria-label={`Collection: ${collection.title}`}
      className="group/col"
      onClick={() => onNavigate({ path: 'collection-detail', slug: collection.slug })}
    >
      {/* Edge-to-Edge Cover Swatches Hero */}
      <div className="w-full h-36 sm:h-40 relative select-none flex overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06]">
        {previews.length > 0 ? (
          <div className="flex h-full w-full">
            {previews.slice(0, 5).map((color, idx) => (
              <div
                key={idx}
                className="flex-1 h-full transition-[flex] duration-200 hover:flex-[1.2]"
                style={{ backgroundColor: color.startsWith('#') ? color : '#111215' }}
              />
            ))}
          </div>
        ) : (
          <div className="h-full w-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#707070]">
            <Layers size={22} />
          </div>
        )}

        <span className="absolute bottom-2.5 right-2.5 font-mono text-xs font-bold px-2 py-0.5 rounded-[2px] bg-black/75 text-white backdrop-blur-xs tracking-wider">
          {collection.items.length} {collection.items.length === 1 ? 'SPECIMEN' : 'SPECIMENS'}
        </span>
      </div>

      {/* Editorial Content Layer */}
      <div className="p-3.5 sm:p-4 flex flex-col gap-1.5 flex-1 bg-[#F8F8F8] dark:bg-[#141518]">
        <h3 className="font-sans font-bold text-[15px] leading-tight text-[#171717] dark:text-white tracking-[-0.01em] truncate m-0">
          <Link
            to={{ path: 'collection-detail', slug: collection.slug }}
            onNavigate={onNavigate}
            onClick={(e) => e.stopPropagation()}
            className="hover:underline text-inherit no-underline"
          >
            {collection.title}
          </Link>
        </h3>

        {collection.description && (
          <p className="text-xs text-[#707070] dark:text-[#A0A0A0] line-clamp-2 leading-relaxed m-0">
            {collection.description}
          </p>
        )}

        {/* Minimal Footer & Actions */}
        <div className="mt-auto pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
          <span className="font-mono text-xs text-[#707070] dark:text-[#909090] uppercase tracking-wider truncate">
            BY {collection.creator.name}
          </span>

          <div className="flex items-center gap-1">
            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleToggleLike}
              className={`w-7 h-7 min-h-[28px] p-1 rounded-[2px] ${
                liked ? 'text-rose-500' : 'text-[#707070] dark:text-[#909090] hover:text-rose-500'
              }`}
              title={liked ? 'Unlike' : 'Like'}
              aria-label={liked ? 'Unlike collection' : 'Like collection'}
            >
              <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
            </KromaButton>
            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleToggleSave}
              className={`w-7 h-7 min-h-[28px] p-1 rounded-[2px] ${
                saved
                  ? 'text-[var(--accent-gold)]'
                  : 'text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white'
              }`}
              title={saved ? 'Remove from saved' : 'Save collection'}
              aria-label={saved ? 'Remove from saved' : 'Save collection'}
            >
              <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
            </KromaButton>
            <Link
              to={{ path: 'collection-detail', slug: collection.slug }}
              onNavigate={onNavigate}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white rounded-[2px] transition-colors"
              title="Open collection"
              aria-label="Open collection"
            >
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </KromaCard>
  );
};
