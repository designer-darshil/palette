import React, { useState } from 'react';
import { Copy, Bookmark, Share2 } from 'lucide-react';
import { PaletteItem, RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';
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
    <article
      className="palette-card"
      aria-label={`Palette: ${palette.title}`}
      onClick={() => onNavigate({ path: 'palette-detail', slug: palette.slug })}
    >
      {/* Edge-to-edge Color Composition (Hero of the Card) */}
      <div
        className="palette-swatches-strip"
        role="group"
        aria-label="Color swatches"
      >
        {palette.colors.map((c, idx) => {
          const isCopied = copiedHex === c.hex;
          const weight = getProportionWeight(idx, palette.colors.length);

          return (
            <div
              key={idx}
              className="palette-swatch-item"
              style={{
                backgroundColor: c.hex,
                flex: weight,
              }}
              onClick={(e) => handleCopySingleHex(e, c.hex, c.name)}
              role="button"
              tabIndex={0}
              aria-label={`Copy ${c.name} (${c.hex})`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCopySingleHex(e, c.hex, c.name);
                }
              }}
            >
              <span className={`palette-swatch-pop ${isCopied ? 'copied' : ''}`}>
                {isCopied ? 'COPIED' : c.hex}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quiet, Editorial Information & Action Area */}
      <div className="palette-card-body">
        <div className="palette-card-info">
          <h3 className="palette-card-title">
            <Link
              to={{ path: 'palette-detail', slug: palette.slug }}
              onNavigate={onNavigate}
              className="palette-card-title-link"
              onClick={(e) => e.stopPropagation()}
            >
              {palette.title}
            </Link>
          </h3>
          <div className="palette-card-meta">
            <span>{palette.category}</span>
            <span>•</span>
            <span>{palette.colors.length} COLORS</span>
          </div>
        </div>

        {/* Subtle, Non-Domineering Card Actions */}
        <div className="palette-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="palette-action-btn"
            onClick={handleCopyAllHexes}
            aria-label="Copy all hex values"
            title="Copy all hex values"
          >
            <Copy size={13} />
          </button>

          <button
            type="button"
            className="palette-action-btn"
            onClick={handleShare}
            aria-label="Share palette link"
            title="Share palette link"
          >
            <Share2 size={13} />
          </button>

          <button
            type="button"
            className={`palette-action-btn ${saved ? 'saved' : ''}`}
            onClick={handleToggleSave}
            aria-label={saved ? 'Remove from saved' : 'Save palette'}
            title={saved ? 'Remove from saved' : 'Save palette'}
          >
            <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </article>
  );
};
