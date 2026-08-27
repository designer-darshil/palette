import React, { useState } from 'react';
import { Bookmark, Share2, ArrowRight, Check } from 'lucide-react';
import { ComboItem, RouteType } from '../types';
import { copyToClipboard, getComboKeyColors } from '../utils/colorUtils';
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

  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Extract the true focal color pair representing the relationship
  const [color1, color2] = getComboKeyColors(combo.colors);

  const handleCopyHex = async (e: React.MouseEvent, hex: string, name: string) => {
    e.stopPropagation();
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1400);
      showToast(`Copied ${hex}`, name, hex);
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
      preview: `${color1.hex},${color2.hex}`,
      metadata: `${combo.harmonyType} • ${combo.contrastScore}`,
    });
    showToast(
      saved ? 'Removed harmony from saved' : 'Saved harmony to collection',
      combo.title
    );
  };

  return (
    <article
      className="combo-specimen-card"
      onClick={() => onNavigate({ path: 'combo-detail', slug: combo.slug })}
      aria-label={`Color harmony combo: ${combo.title} (${color1.hex} and ${color2.hex})`}
    >
      {/* Pure Two-Color Split Visual Hero — Zero Text Overlay */}
      <div className="combo-two-color-stage">
        <div
          className="combo-color-half"
          style={{ backgroundColor: color1.hex }}
          onClick={(e) => handleCopyHex(e, color1.hex, color1.name)}
          title={`Click to copy ${color1.name} (${color1.hex})`}
        />
        <div
          className="combo-color-half"
          style={{ backgroundColor: color2.hex }}
          onClick={(e) => handleCopyHex(e, color2.hex, color2.name)}
          title={`Click to copy ${color2.name} (${color2.hex})`}
        />
      </div>

      {/* Information Area Below Color Visualization */}
      <div className="combo-card-content">
        {/* Two-Column Aligned HEX Values & Names */}
        <div className="combo-hex-names-row">
          {/* Left Specimen Info */}
          <div className="combo-color-col left">
            <button
              type="button"
              className="combo-hex-btn"
              onClick={(e) => handleCopyHex(e, color1.hex, color1.name)}
              title="Click to copy HEX"
            >
              <span>{copiedHex === color1.hex ? 'COPIED' : color1.hex}</span>
              {copiedHex === color1.hex && <Check size={11} />}
            </button>
            <span className="combo-color-name" title={color1.name}>
              {color1.name}
            </span>
          </div>

          {/* Right Specimen Info */}
          <div className="combo-color-col right">
            <button
              type="button"
              className="combo-hex-btn"
              onClick={(e) => handleCopyHex(e, color2.hex, color2.name)}
              title="Click to copy HEX"
            >
              <span>{copiedHex === color2.hex ? 'COPIED' : color2.hex}</span>
              {copiedHex === color2.hex && <Check size={11} />}
            </button>
            <span className="combo-color-name" title={color2.name}>
              {color2.name}
            </span>
          </div>
        </div>

        {/* Level 3: Compact Relationship / Footer Bar */}
        <div className="combo-card-footer">
          <div className="combo-relationship-label">
            <span>{combo.harmonyType}</span>
            <ArrowRight size={12} className="combo-arrow-icon" />
          </div>

          <div className="card-action-icons">
            <button
              className="card-icon-btn"
              onClick={handleShare}
              aria-label="Share combo link"
              title="Share combo link"
            >
              <Share2 size={13} />
            </button>
            <button
              className={`card-icon-btn ${saved ? 'saved' : ''}`}
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save combo'}
              title={saved ? 'Saved' : 'Save combo'}
            >
              <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
