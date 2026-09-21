import React from 'react';
import { Trash2, Copy, Bookmark, Download, ExternalLink, ArrowRight } from 'lucide-react';
import { RouteType } from '../types';
import { useSaved, SavedItem } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { SpecimenCardBase } from '../components/common/SpecimenCardBase';

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
      <SEOHead
        title="Saved Color Specimens | Curator Workspace"
        description="Your personal library of bookmarked colors, palette systems, harmonies, and gradient tokens."
        canonicalPath="/saved"
        noindex={true}
        nofollow={true}
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Saved Library', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Curator workspace"
        title={`Saved Color Specimens (${savedItems.length})`}
        description="Your personal library of bookmarked colors, palette systems, harmonies, and gradient tokens."
        actions={
          savedItems.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                iconLeft={<Download size={14} />}
                onClick={handleExportJson}
              >
                Export JSON
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<Trash2 size={14} className="text-red-400" />}
                onClick={() => {
                  if (window.confirm('Clear all saved items?')) {
                    clearAll();
                    showToast('Cleared saved workspace');
                  }
                }}
                className="text-red-400 hover:text-red-300"
              >
                Clear All
              </Button>
            </div>
          ) : undefined
        }
      />

      {savedItems.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={36} />}
          title="No Saved Specimens Yet"
          description="Click the bookmark icon on any color card, palette system, harmony combo, or gradient to save it here for fast reference and export."
          actionLabel="Explore Colors"
          onAction={() => onNavigate({ path: 'colors' })}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {savedItems.map((item) => (
            <SpecimenCardBase
              key={item.id}
              className="p-4 flex flex-col gap-3 justify-between"
              onClick={() => handleOpenItem(item)}
            >
              {/* Preview banner */}
              <div
                className="h-24 rounded-[var(--radius-xs)] overflow-hidden border border-[var(--border-subtle)] cursor-pointer"
                style={{
                  background:
                    item.type === 'gradient'
                      ? item.preview
                      : item.preview.includes(',')
                      ? undefined
                      : item.preview,
                  display: item.preview.includes(',') ? 'flex' : 'block',
                }}
              >
                {item.preview.includes(',') &&
                  item.preview.split(',').map((hex, i) => (
                    <div key={i} style={{ flex: 1, backgroundColor: hex }} />
                  ))}
              </div>

              <div className="flex justify-between items-start">
                <div className="min-w-0 pr-2">
                  <span className="font-sans text-[11px] font-semibold text-[var(--text-tertiary)]">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  <h3 className="font-sans text-sm font-bold text-[var(--text-primary)] hover:text-[var(--color-primary)] truncate mt-0.5">
                    {item.title}
                  </h3>
                  {item.metadata && (
                    <div className="font-mono text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                      {item.metadata}
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                    showToast('Removed item', item.title);
                  }}
                  aria-label="Remove item"
                  className="p-1 text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="color-card-footer mt-auto pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <button
                  className="color-card-hex-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyPreview(item);
                  }}
                  aria-label="Copy values"
                >
                  <Copy size={11} />
                  <span>Copy Values</span>
                </button>

                <button
                  className="card-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenItem(item);
                  }}
                  title="View Detail"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </SpecimenCardBase>
          ))}
        </div>
      )}
    </div>
  );
};
