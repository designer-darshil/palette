import React from 'react';
import { Copy, Bookmark, Share2 } from 'lucide-react';
import { ComboItem, RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';

interface ComboCardProps {
  combo: ComboItem;
  onNavigate: (route: RouteType) => void;
}

export const ComboCard: React.FC<ComboCardProps> = ({ combo, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const saved = isSaved(combo.id);

  const handleCopySingleHex = async (e: React.MouseEvent, hex: string, name: string) => {
    e.stopPropagation();
    const success = await copyToClipboard(hex);
    if (success) {
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  const handleCopyCombo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const allHexes = combo.colors.map((c) => `${c.hex} (${c.name})`).join(', ');
    const success = await copyToClipboard(allHexes);
    if (success) {
      showToast(`Copied combo harmony`, combo.title);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/combos/${combo.slug}`;
    const success = await copyToClipboard(url);
    if (success) {
      showToast('Copied combo link', combo.title);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveItem({
      id: combo.id,
      type: 'combo',
      title: combo.title,
      slug: combo.slug,
      preview: combo.colors.map((c) => c.hex).join(','),
      metadata: `${combo.harmonyType} • ${combo.contrastScore}`,
    });
    showToast(
      saved ? 'Removed harmony from saved' : 'Saved harmony to collection',
      combo.title
    );
  };

  return (
    <article className="combo-card" aria-label={`Color harmony combo: ${combo.title}`}>
      <div className="combo-specimen-stage">
        {combo.colors.map((c, idx) => (
          <div
            key={idx}
            className="combo-stage-surface"
            style={{
              backgroundColor: c.hex,
              flex: c.percentage || 25,
            }}
            onClick={(e) => handleCopySingleHex(e, c.hex, c.name)}
            title={`${c.name} (${c.hex}) - ${c.role}`}
          >
            <span className="combo-role-label">{c.role.split('/')[0]}</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#FFFFFF',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}
            >
              {c.hex}
            </span>
          </div>
        ))}
      </div>

      <div className="combo-card-body">
        <div className="combo-badge-row">
          <span className="combo-harmony-badge">{combo.harmonyType}</span>
          <span className="combo-contrast-badge">{combo.contrastScore}</span>
        </div>

        <h3 className="palette-card-title">
          <button
            onClick={() => onNavigate({ path: 'combo-detail', slug: combo.slug })}
            style={{ textAlign: 'left' }}
          >
            {combo.title}
          </button>
        </h3>

        <p className="color-card-desc">{combo.description}</p>

        <div className="palette-color-hex-list">
          {combo.colors.map((c, idx) => (
            <button
              key={idx}
              className="palette-mini-hex-pill"
              onClick={(e) => handleCopySingleHex(e, c.hex, c.name)}
            >
              <span className="palette-mini-dot" style={{ backgroundColor: c.hex }} />
              <span>{c.hex}</span>
            </button>
          ))}
        </div>

        <div className="color-card-footer" style={{ marginTop: '12px' }}>
          <button
            className="color-card-hex-btn"
            onClick={handleCopyCombo}
            aria-label="Copy entire combination"
          >
            <Copy size={11} />
            <span>Copy Values</span>
          </button>

          <div className="card-action-icons">
            <button
              className="card-icon-btn"
              onClick={handleShare}
              aria-label="Share combo link"
              title="Share combo link"
            >
              <Share2 size={14} />
            </button>
            <button
              className={`card-icon-btn ${saved ? 'saved' : ''}`}
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save combo'}
            >
              <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
