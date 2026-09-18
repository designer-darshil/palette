import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { PaletteItem, RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { Analytics } from '../utils/analytics';

interface PaletteCardProps {
  palette: PaletteItem;
  onNavigate: (route: RouteType) => void;
  variant?: 'standard' | 'editorial' | 'large';
}

export const PaletteCard: React.FC<PaletteCardProps> = ({ palette, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem, removeItem } = useSaved();
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const saved = isSaved(palette.id);
  const colors = palette.colors.slice(0, 4);

  const handleToggleHeart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeItem(palette.id);
      showToast('Removed from saved', palette.title);
    } else {
      saveItem({
        id: palette.id,
        type: 'palette',
        title: palette.title,
        slug: palette.slug,
        preview: palette.colors.map((c) => c.hex).join(','),
        metadata: `${palette.category} • ${palette.colors.length} tones`,
      });
      showToast('Saved to collection', palette.title);
    }
  };

  const handleCopyHex = async (e: React.MouseEvent, hex: string, name: string) => {
    e.stopPropagation();
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      Analytics.trackColorCopy(hex, 'HEX', name);
      showToast(`Copied ${hex}`, name, hex);
      setTimeout(() => setCopiedHex(null), 1400);
    }
  };

  const formatTags = () => {
    if (palette.tags && palette.tags.length > 0) {
      return palette.tags.slice(0, 3).join(' · ');
    }
    return `${palette.category} · Curated`;
  };

  // Fallback image if not specified
  const cardImage = palette.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onClick={() => onNavigate({ path: 'palette-detail', slug: palette.slug })}
      className="group relative border border-[var(--kroma-border)] rounded-[4px] bg-transparent p-2.5 flex flex-col justify-between transition-all duration-200 hover:border-[var(--kroma-border-strong)] cursor-pointer"
      style={{ boxShadow: 'none' }}
    >
      {/* 1. Header Image (2.3–2.5:1 Aspect Ratio, ~65px height) */}
      <div className="w-full h-[65px] rounded-[2px] overflow-hidden relative bg-[var(--kroma-paper-light)] mb-2.5">
        <img
          src={cardImage}
          alt={palette.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* 2. Title & Heart Icon */}
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <h3 className="font-sans text-[12px] font-medium text-[var(--kroma-ink)] tracking-tight truncate">
          {palette.title}
        </h3>
        <button
          onClick={handleToggleHeart}
          className="p-1 text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)] transition-colors"
          aria-label={saved ? 'Remove from saved' : 'Save palette'}
          title={saved ? 'Saved' : 'Save'}
        >
          <Heart
            size={13}
            strokeWidth={1.5}
            className={saved ? 'fill-[var(--kroma-ink)] text-[var(--kroma-ink)]' : 'text-inherit'}
          />
        </button>
      </div>

      {/* 3. Small Tags Row */}
      <div className="text-[9.5px] text-[var(--kroma-muted)] tracking-wide font-normal truncate mb-2">
        {formatTags()}
      </div>

      {/* 4. Color Swatch Strip (4 colors, height ~20px, tiny gaps) */}
      <div className="flex h-[20px] gap-[2px] w-full rounded-[2px] overflow-hidden">
        {colors.map((color, idx) => (
          <div
            key={`${color.hex}-${idx}`}
            onClick={(e) => handleCopyHex(e, color.hex, color.name)}
            className="flex-1 h-full relative group/swatch transition-transform duration-150 hover:opacity-90"
            style={{ backgroundColor: color.hex }}
            title={`Click to copy ${color.hex}`}
          />
        ))}
      </div>

      {/* 5. Monospace HEX Codes Row */}
      <div className="flex justify-between items-center mt-1.5 font-mono text-[8.5px] text-[var(--kroma-muted)] tracking-tight">
        {colors.map((color, idx) => (
          <span
            key={`${color.hex}-hex-${idx}`}
            onClick={(e) => handleCopyHex(e, color.hex, color.name)}
            className="hover:text-[var(--kroma-ink)] transition-colors cursor-pointer"
            title={`Copy ${color.hex}`}
          >
            {copiedHex === color.hex ? '✓' : color.hex}
          </span>
        ))}
      </div>
    </div>
  );
};
