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
    <div className="saved-page w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <header className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="page-category-label text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
              Curator Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
              Saved Color Specimens ({savedItems.length})
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
              Your personal library of bookmarked colors, palette systems, harmonies, and gradient tokens.
            </p>
          </div>

          {savedItems.length > 0 && (
            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              <button
                className="btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 whitespace-nowrap"
                onClick={handleExportJson}
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
              <button
                className="btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 whitespace-nowrap"
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
        <div className="p-8 sm:p-14 text-center bg-[var(--bg-surface-1)] rounded-md border border-[var(--border-subtle)] max-w-xl mx-auto my-6 flex flex-col items-center">
          <Bookmark size={40} className="text-[var(--text-tertiary)] mb-4" />
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-[var(--text-primary)]">
            No Saved Specimens Yet
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 leading-relaxed max-w-md">
            Click the bookmark icon on any color card, palette system, harmony combo, or gradient to save it here for fast reference and export.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
            <button
              className="btn-primary text-xs px-5 py-2.5 inline-flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
              onClick={() => onNavigate({ path: 'colors' })}
            >
              <span>Explore Colors</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="btn-secondary text-xs px-5 py-2.5 inline-flex items-center justify-center w-full sm:w-auto whitespace-nowrap"
              onClick={() => onNavigate({ path: 'palettes' })}
            >
              <span>Explore Palettes</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
