import React from 'react';
import { Trash2, Copy, Bookmark, Download, ExternalLink, ArrowRight } from 'lucide-react';
import { RouteType } from '../types';
import { useSaved, SavedItem } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/colorUtils';

interface SavedPageProps {
  onNavigate: (route: RouteType) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({ onNavigate }) => {
  const { savedItems, removeItem, clearAll } = useSaved();
  const { showToast } = useToast();

  const handleCopyPreview = async (item: SavedItem) => {
    let textToCopy = item.preview;
    if (item.type === 'gradient') {
      textToCopy = `background: ${item.preview};`;
    }
    const success = await copyToClipboard(textToCopy);
    if (success) {
      showToast('Copied to clipboard', item.title);
    }
  };

  const handleExportJson = async () => {
    const dataStr = JSON.stringify(savedItems, null, 2);
    const success = await copyToClipboard(dataStr);
    if (success) {
      showToast('Exported saved workspace to clipboard', `${savedItems.length} items`);
    }
  };

  const handleOpenItem = (item: SavedItem) => {
    if (item.type === 'color') {
      onNavigate({ path: 'color-detail', slug: item.slug });
    } else if (item.type === 'palette') {
      onNavigate({ path: 'palette-detail', slug: item.slug });
    } else if (item.type === 'combo') {
      onNavigate({ path: 'combo-detail', slug: item.slug });
    } else if (item.type === 'gradient') {
      onNavigate({ path: 'gradient-detail', slug: item.slug });
    }
  };

  return (
    <div className="saved-page">
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-category-label">Curator Workspace</span>
            <h1 className="page-title">Saved Color Specimens ({savedItems.length})</h1>
            <p className="page-description">
              Your personal library of bookmarked colors, palette systems, harmonies, and gradient tokens.
            </p>
          </div>

          {savedItems.length > 0 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={handleExportJson}>
                <Download size={14} />
                <span>Export JSON</span>
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  if (window.confirm('Clear all saved items?')) {
                    clearAll();
                    showToast('Cleared saved workspace');
                  }
                }}
                style={{ borderColor: 'rgba(230, 57, 70, 0.4)', color: '#E63946' }}
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {savedItems.length === 0 ? (
        <div
          style={{
            padding: '80px 24px',
            textAlign: 'center',
            background: 'var(--bg-surface-1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            maxWidth: '600px',
            margin: '40px auto',
          }}
        >
          <Bookmark size={36} color="#606675" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
            No Saved Specimens Yet
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
            Click the bookmark icon on any color card, palette system, harmony combo, or gradient to save it here for fast reference and export.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="btn-primary" onClick={() => onNavigate({ path: 'colors' })}>
              <span>Explore Colors</span>
              <ArrowRight size={14} />
            </button>
            <button className="btn-secondary" onClick={() => onNavigate({ path: 'palettes' })}>
              <span>Explore Palettes</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="color-card"
              style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {/* Preview banner */}
              <div
                style={{
                  height: '100px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  background:
                    item.type === 'gradient'
                      ? item.preview
                      : item.preview.includes(',')
                      ? undefined
                      : item.preview,
                  display: item.preview.includes(',') ? 'flex' : 'block',
                }}
                onClick={() => handleOpenItem(item)}
              >
                {item.preview.includes(',') &&
                  item.preview.split(',').map((hex, i) => (
                    <div key={i} style={{ flex: 1, backgroundColor: hex }} />
                  ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    {item.type}
                  </div>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '2px',
                    }}
                    onClick={() => handleOpenItem(item)}
                  >
                    {item.title}
                  </h3>
                  {item.metadata && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {item.metadata}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    removeItem(item.id);
                    showToast('Removed item', item.title);
                  }}
                  aria-label="Remove item"
                  style={{ color: 'var(--text-tertiary)', padding: '4px' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="color-card-footer" style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  className="color-card-hex-btn"
                  onClick={() => handleCopyPreview(item)}
                  aria-label="Copy values"
                >
                  <Copy size={11} />
                  <span>Copy Values</span>
                </button>

                <button
                  className="card-icon-btn"
                  onClick={() => handleOpenItem(item)}
                  title="View Detail"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
