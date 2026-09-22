import React, { useState } from 'react';
import { Copy, Bookmark, Share2, Search, Check } from 'lucide-react';
import { ColorItem, RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';
import { KromaCard } from './common/KromaCard';
import { Analytics } from '../utils/analytics';

interface ColorCardProps {
  color: ColorItem;
  onNavigate: (route: RouteType) => void;
}

export const ColorCard: React.FC<ColorCardProps> = ({ color, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const saved = isSaved(color.id);
  const [copied, setCopied] = useState(false);

  const handleCopyHex = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    const success = await copyToClipboard(color.hex);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
      Analytics.trackColorCopy(color.hex, 'HEX', color.name);
      showToast(`Copied ${color.hex}`, color.name, color.hex);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/colors/${color.slug}`;
    const success = await copyToClipboard(url);
    if (success) {
      showToast('Copied specimen link', color.name);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveItem({
      id: color.id,
      type: 'color',
      title: color.name,
      slug: color.slug,
      preview: color.hex,
      metadata: `${color.family} • ${color.hex}`,
    });
    if (!saved) {
      Analytics.trackSpecimenSave('color', color.id, color.name);
    }
    showToast(
      saved ? 'Removed from saved' : 'Saved to specimen library',
      color.name,
      color.hex
    );
  };

  return (
    <KromaCard
      aria-label={`Color specimen: ${color.name}`}
      className="specimen-card group/color"
      onClick={() => onNavigate({ path: 'color-detail', slug: color.slug })}
    >
      {/* Edge-to-Edge Color Field (Hero of the Card) */}
      <div
        className="w-full h-44 sm:h-48 relative cursor-pointer flex items-end justify-center p-3 select-none"
        style={{ backgroundColor: color.hex }}
        onClick={handleCopyHex}
        role="button"
        tabIndex={0}
        aria-label={`Copy hex code ${color.hex}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopyHex(e);
          }
        }}
      >
        {/* Subtle hover copy pill badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] font-mono text-[11px] font-medium tracking-wider text-white bg-black/70 backdrop-blur-xs shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-150 ${
            copied ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover/color:opacity-100 group-hover/color:scale-100'
          }`}
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span>COPIED</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>{color.hex}</span>
            </>
          )}
        </span>
      </div>

      {/* Editorial Information Layer */}
      <div className="p-3.5 sm:p-4 flex flex-col gap-1.5 flex-1 bg-[#F8F8F8] dark:bg-[#141518]">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-sans font-bold text-[15px] leading-tight text-[#171717] dark:text-white tracking-[-0.01em] truncate">
            <Link
              to={{ path: 'color-detail', slug: color.slug }}
              onNavigate={onNavigate}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline text-inherit no-underline"
            >
              {color.name}
            </Link>
          </h3>

          <button
            type="button"
            className="font-mono text-xs font-semibold px-2 py-0.5 rounded-[2px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#171717] dark:text-white transition-colors flex items-center gap-1 flex-shrink-0"
            onClick={handleCopyHex}
            aria-label={`Copy hex value ${color.hex}`}
            title="Click to copy HEX"
          >
            <Copy size={10} />
            <span>{color.hex}</span>
          </button>
        </div>

        {color.description && (
          <p className="text-xs text-[#707070] dark:text-[#A0A0A0] line-clamp-2 leading-relaxed m-0">
            {color.description}
          </p>
        )}

        {/* Minimal Specimen Footer */}
        <div className="mt-auto pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] dark:text-[#909090]">
            {color.family} • {color.tone}
          </span>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="p-1.5 text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white rounded-[2px] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate({ path: 'color-name-finder', hex: color.hex });
              }}
              aria-label="Find closest color name"
              title="Identify in Color Name Finder"
            >
              <Search size={13} />
            </button>
            <button
              type="button"
              className="p-1.5 text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white rounded-[2px] transition-colors"
              onClick={handleShare}
              aria-label="Share specimen URL"
              title="Share specimen link"
            >
              <Share2 size={13} />
            </button>
            <button
              type="button"
              className={`p-1.5 rounded-[2px] transition-colors ${
                saved ? 'text-[var(--accent-gold)]' : 'text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white'
              }`}
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save color'}
              title={saved ? 'Saved' : 'Save color'}
            >
              <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </KromaCard>
  );
};
