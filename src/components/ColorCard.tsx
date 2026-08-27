import React from 'react';
import { Copy, Bookmark, Share2, Search } from 'lucide-react';
import { ColorItem, RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';
import { Analytics } from '../utils/analytics';

interface ColorCardProps {
  color: ColorItem;
  onNavigate: (route: RouteType) => void;
}

export const ColorCard: React.FC<ColorCardProps> = ({ color, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const saved = isSaved(color.id);

  const handleCopyHex = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(color.hex);
    if (success) {
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
    <article className="color-card" aria-label={`Color specimen: ${color.name}`}>
      <div
        className="color-card-swatch"
        style={{ backgroundColor: color.hex }}
        onClick={handleCopyHex}
        role="button"
        tabIndex={0}
        aria-label={`Copy hex code ${color.hex}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopyHex(e as any);
          }
        }}
      >
        <div className="color-card-swatch-overlay">
          <Copy size={16} />
          <span>Click to copy HEX</span>
        </div>
      </div>

      <div className="color-card-body">
        <div className="color-card-header">
          <h3 className="color-card-name">
            <Link
              to={{ path: 'color-detail', slug: color.slug }}
              onNavigate={onNavigate}
              style={{ textAlign: 'left', display: 'inline-block', color: 'inherit', textDecoration: 'none' }}
              className="hover:underline"
            >
              {color.name}
            </Link>
          </h3>

          <button
            className="color-card-hex-btn"
            onClick={handleCopyHex}
            aria-label={`Copy hex value ${color.hex}`}
          >
            <Copy size={11} />
            <span>{color.hex}</span>
          </button>
        </div>

        <p className="color-card-desc">{color.description}</p>

        <div className="color-card-footer">
          <span className="color-card-family-tag">
            {color.family} • {color.tone}
          </span>

          <div className="card-action-icons">
            <button
              className="card-icon-btn"
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
              className="card-icon-btn"
              onClick={handleShare}
              aria-label="Share specimen URL"
              title="Share specimen link"
            >
              <Share2 size={14} />
            </button>
            <button
              className={`card-icon-btn ${saved ? 'saved' : ''}`}
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save color'}
              title={saved ? 'Saved' : 'Save color'}
            >
              <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
