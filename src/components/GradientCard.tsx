import React from 'react';
import { Copy, Bookmark, Sparkles } from 'lucide-react';
import { GradientItem, RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';

interface GradientCardProps {
  gradient: GradientItem;
  onNavigate: (route: RouteType) => void;
}

export const GradientCard: React.FC<GradientCardProps> = ({ gradient, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const saved = isSaved(gradient.id);

  const handleCopyCss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(`background: ${gradient.css};`);
    if (success) {
      showToast('Copied CSS Gradient', gradient.title, gradient.css);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveItem({
      id: gradient.id,
      type: 'gradient',
      title: gradient.title,
      slug: gradient.slug,
      preview: gradient.css,
      metadata: `${gradient.type} • ${gradient.category}`,
    });
    showToast(
      saved ? 'Removed gradient from saved' : 'Saved gradient to collection',
      gradient.title
    );
  };

  return (
    <article className="gradient-card" aria-label={`CSS Gradient: ${gradient.title}`}>
      <div
        className="gradient-preview-area"
        style={{ background: gradient.css }}
        onClick={handleCopyCss}
        role="button"
        tabIndex={0}
        aria-label="Click to copy CSS gradient"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopyCss(e as any);
          }
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#FFFFFF',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            background: 'rgba(0,0,0,0.4)',
            padding: '2px 6px',
            borderRadius: '2px',
          }}
        >
          {gradient.type.toUpperCase()} {gradient.angle ? `${gradient.angle}°` : ''}
        </span>
      </div>

      <div className="color-card-body">
        <div className="palette-card-meta">
          <span>{gradient.category}</span>
          <span>•</span>
          <span>{gradient.stops.length} color stops</span>
        </div>

        <h3 className="palette-card-title">
          <button
            onClick={() => onNavigate({ path: 'gradient-detail', slug: gradient.slug })}
            style={{ textAlign: 'left' }}
          >
            {gradient.title}
          </button>
        </h3>

        <div className="palette-color-hex-list">
          {gradient.stops.map((s, idx) => (
            <span
              key={idx}
              className="palette-mini-hex-pill"
              title={`${s.name || s.color} at ${s.position}%`}
            >
              <span className="palette-mini-dot" style={{ backgroundColor: s.color }} />
              <span>{s.color}</span>
            </span>
          ))}
        </div>

        <div className="gradient-code-banner" onClick={handleCopyCss} style={{ marginTop: '6px' }}>
          <span>background: {gradient.css.substring(0, 32)}...</span>
          <Copy size={12} />
        </div>

        <div className="color-card-footer" style={{ marginTop: '8px' }}>
          <button
            className="color-card-hex-btn"
            onClick={handleCopyCss}
            aria-label="Copy gradient CSS"
          >
            <Copy size={11} />
            <span>Copy CSS</span>
          </button>

          <div className="card-action-icons">
            <button
              className={`card-icon-btn ${saved ? 'saved' : ''}`}
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save gradient'}
            >
              <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
