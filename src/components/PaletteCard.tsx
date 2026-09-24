import React, { useState } from 'react';
import { Copy, Bookmark, Share2 } from 'lucide-react';
import { PaletteItem, RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';
import { KromaCard } from './common/KromaCard';
import { KromaButton } from './common/KromaButton';
import { Analytics } from '../utils/analytics';

interface PaletteCardProps {
  palette: PaletteItem;
  onNavigate: (route: RouteType) => void;
}

// Deterministic architectural rhythm proportions per palette color count
const getProportionWeight = (index: number, total: number): number => {
  if (total === 5) {
    const weights = [1.25, 0.85, 1.4, 0.9, 1.1];
    return weights[index % weights.length];
  }
  if (total === 4) {
    const weights = [1.3, 0.85, 1.25, 1.0];
    return weights[index % weights.length];
  }
  if (total === 3) {
    const weights = [1.35, 0.85, 1.2];
    return weights[index % weights.length];
  }
  if (total === 6) {
    const weights = [1.2, 0.8, 1.35, 0.85, 1.1, 0.9];
    return weights[index % weights.length];
  }
  const defaultWeights = [1.2, 0.9, 1.3, 0.85, 1.15, 0.95];
  return defaultWeights[index % defaultWeights.length];
};

export const PaletteCard: React.FC<PaletteCardProps> = ({ palette, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const saved = isSaved(palette.id);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopySingleHex = async (
    e: React.MouseEvent | React.KeyboardEvent | undefined,
    hex: string,
    name: string
  ) => {
    e?.stopPropagation();
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1300);
      Analytics.trackColorCopy(hex, 'HEX', name);
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  const handleCopyAllHexes = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const allHexes = palette.colors.map((c) => c.hex).join(', ');
    const success = await copyToClipboard(allHexes);
    if (success) {
      Analytics.trackPaletteCopy(
        palette.title,
        palette.colors.map((c) => c.hex)
      );
      showToast(`Copied all ${palette.colors.length} hex values`, palette.title);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/palettes/${palette.slug}`;
    const success = await copyToClipboard(url);
    if (success) {
      showToast('Copied palette link', palette.title);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveItem({
      id: palette.id,
      type: 'palette',
      title: palette.title,
      slug: palette.slug,
      preview: palette.colors.map((c) => c.hex).join(','),
      metadata: `${palette.category} • ${palette.colors.length} colors`,
    });
    if (!saved) {
      Analytics.trackSpecimenSave('palette', palette.id, palette.title);
    }
    showToast(
      saved ? 'Removed palette from saved' : 'Saved palette to collection',
      palette.title
    );
  };

  return (
    <KromaCard
      aria-label={`Palette: ${palette.title}`}
      className="group/pcard"
      onClick={() => onNavigate({ path: 'palette-detail', slug: palette.slug })}
    >
      {/* Edge-to-edge Color Composition (Hero of the Card) */}
      <div
        className="flex h-52 sm:h-56 w-full select-none overflow-hidden"
        role="group"
        aria-label="Color swatches"
      >
        {palette.colors.map((c, idx) => {
          const isCopied = copiedHex === c.hex;
          const weight = getProportionWeight(idx, palette.colors.length);

          return (
            <button
              type="button"
              key={idx}
              className="relative cursor-pointer transition-[flex] duration-200 ease-out hover:grow-[2.2] flex items-end justify-center p-2.5 outline-none group/swatch border-0"
              style={{
                backgroundColor: c.hex,
                flex: weight,
              }}
              onClick={(e) => handleCopySingleHex(e, c.hex, c.name)}
              aria-label={`Copy ${c.name} (${c.hex})`}
            >
              <span
                className={`font-mono text-xs font-semibold tracking-wider text-white bg-black/75 px-1.5 py-0.5 rounded-[2px] shadow-xs transition-all duration-150 ${
                  isCopied
                    ? 'opacity-100 translate-y-0 text-emerald-300'
                    : 'opacity-0 translate-y-1 group-hover/swatch:opacity-100 group-hover/swatch:translate-y-0'
                }`}
              >
                {isCopied ? 'COPIED' : c.hex}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quiet, Editorial Information & Action Area */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-[var(--bg-surface-1)]">
        <div className="min-w-0 flex flex-col gap-0.5">
          <h3 className="font-sans font-bold text-[15px] leading-tight tracking-[-0.01em] text-[var(--text-primary)] truncate m-0">
            <Link
              to={{ path: 'palette-detail', slug: palette.slug }}
              onNavigate={onNavigate}
              className="hover:underline text-inherit no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              {palette.title}
            </Link>
          </h3>
          <div className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <span>{palette.category}</span>
            <span>•</span>
            <span>{palette.colors.length} COLORS</span>
          </div>
        </div>

        {/* Subtle, Non-Domineering Card Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <KromaButton
            type="button"
            variant="ghost"
            size="icon-sm"
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] rounded-[2px]"
            onClick={handleCopyAllHexes}
            aria-label="Copy all hex values"
            title="Copy all hex values"
          >
            <Copy size={13} />
          </KromaButton>

          <KromaButton
            type="button"
            variant="ghost"
            size="icon-sm"
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] rounded-[2px]"
            onClick={handleShare}
            aria-label="Share palette link"
            title="Share palette link"
          >
            <Share2 size={13} />
          </KromaButton>

          <KromaButton
            type="button"
            variant="ghost"
            size="icon-sm"
            className={`p-1 rounded-[2px] ${
              saved
                ? 'text-[var(--accent-gold)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]'
            }`}
            onClick={handleToggleSave}
            aria-label={saved ? 'Remove from saved' : 'Save palette'}
            title={saved ? 'Remove from saved' : 'Save palette'}
          >
            <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
          </KromaButton>
        </div>
      </div>
    </KromaCard>
  );
};
