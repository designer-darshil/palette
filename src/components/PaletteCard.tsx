import React from 'react';
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

export const PaletteCard: React.FC<PaletteCardProps> = ({ palette, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const saved = isSaved(palette.id);

  const handleCopySingleHex = async (e: React.MouseEvent, hex: string, name: string) => {
    e.stopPropagation();
    const success = await copyToClipboard(hex);
    if (success) {
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
      metadata: `${palette.category} • ${palette.colors.length} swatches`,
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
    <article className="palette-card" aria-label={`Palette: ${palette.title}`}>
      <div className="palette-swatches-strip" role="group" aria-label="Color swatches">
        {palette.colors.map((c, idx) => (
          <div
            key={idx}
            className="palette-swatch-item"
            style={{ backgroundColor: c.hex }}
            onClick={(e) => handleCopySingleHex(e, c.hex, c.name)}
            role="button"
            tabIndex={0}
            aria-label={`Copy ${c.name} (${c.hex})`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCopySingleHex(e as any, c.hex, c.name);
              }
            }}
          >
            <span className="palette-swatch-pop">{c.hex}</span>
          </div>
        ))}
      </div>

      <div className="palette-card-body">
        <div className="palette-card-meta">
          <span>{palette.category}</span>
          <span>•</span>
          <span>{palette.colors.length} tones</span>
        </div>

        <h3 className="palette-card-title">
          <Link
            to={{ path: 'palette-detail', slug: palette.slug }}
            onNavigate={onNavigate}
            style={{ textAlign: 'left', display: 'inline-block', color: 'inherit', textDecoration: 'none' }}
            className="hover:underline"
          >
            {palette.title}
          </Link>
        </h3>

        <p className="color-card-desc">{palette.description}</p>

        <div className="palette-color-hex-list">
          {palette.colors.map((c, idx) => (
            <button
              key={idx}
              className="palette-mini-hex-pill"
              onClick={(e) => handleCopySingleHex(e, c.hex, c.name)}
              title={`Click to copy ${c.name}`}
            >
              <span className="palette-mini-dot" style={{ backgroundColor: c.hex }} />
              <span>{c.hex}</span>
            </button>
          ))}
        </div>

        <div className="color-card-footer" style={{ marginTop: '12px' }}>
          <button
            className="color-card-hex-btn"
            onClick={handleCopyAllHexes}
            aria-label="Copy entire palette"
          >
            <Copy size={11} />
            <span>Copy All</span>
          </button>

          <div className="card-action-icons">
            <button
              className="card-icon-btn"
              onClick={handleShare}
              aria-label="Share palette link"
              title="Share palette link"
            >
              <Share2 size={14} />
            </button>
            <button
              className={`card-icon-btn ${saved ? 'saved' : ''}`}
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save palette'}
            >
              <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
