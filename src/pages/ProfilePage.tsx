import React, { useState } from 'react';
import { Bookmark, Heart, Layers, Wand2, User, Trash2, ExternalLink, Sparkles, FolderPlus } from 'lucide-react';
import { RouteType } from '../types';
import { useSaved } from '../context/SavedContext';
import { useCollections } from '../context/CollectionContext';
import { useCreators } from '../context/CreatorContext';
import { CollectionCard } from '../components/CollectionCard';
import { PaletteCard } from '../components/PaletteCard';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../components/common/Link';

interface ProfilePageProps {
  onNavigate: (route: RouteType) => void;
  initialTab?: 'saved' | 'liked' | 'collections' | 'created' | 'remixes';
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, initialTab = 'saved' }) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'liked' | 'collections' | 'created' | 'remixes'>(initialTab);
  const { savedItems, removeItem, clearAll, likedIds } = useSaved();
  const { collections } = useCollections();
  const { myPublishedPalettes } = useCreators();

  const userCollections = collections.filter((c) => c.creator.username === 'user');
  const likedItems = savedItems.filter((s) => likedIds.includes(s.id));
  const remixItems = savedItems.filter((s) => s.metadata?.toLowerCase().includes('remix'));

  return (
    <div className="catalog-container w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title="Curator Workspace — Saved Specimens &amp; Collections"
        description="Your personal color laboratory workspace. Manage saved palettes, custom collections, remixed tokens, and published specimens."
        canonicalPath="/profile"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Curator Workspace', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* User Header */}
      <div className="p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xl shadow-md">
            CW
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
              Curator Workspace
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Local workstation library • {savedItems.length} saved specimens • {userCollections.length} custom collections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={{ path: 'collections' }}
            onNavigate={onNavigate}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <FolderPlus size={13} />
            <span>Manage Collections</span>
          </Link>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="filter-pills flex flex-wrap gap-1.5 border-b border-[var(--border-subtle)] pb-3">
        <button
          className={`filter-pill text-xs px-3 py-1.5 flex items-center gap-1.5 ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={13} />
          <span>Saved ({savedItems.length})</span>
        </button>
        <button
          className={`filter-pill text-xs px-3 py-1.5 flex items-center gap-1.5 ${activeTab === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          <Layers size={13} />
          <span>My Collections ({userCollections.length})</span>
        </button>
        <button
          className={`filter-pill text-xs px-3 py-1.5 flex items-center gap-1.5 ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          <Heart size={13} />
          <span>Liked ({likedItems.length})</span>
        </button>
        <button
          className={`filter-pill text-xs px-3 py-1.5 flex items-center gap-1.5 ${activeTab === 'remixes' ? 'active' : ''}`}
          onClick={() => setActiveTab('remixes')}
        >
          <Wand2 size={13} />
          <span>Remixes ({remixItems.length})</span>
        </button>
      </div>

      {/* Tab: Saved Items */}
      {activeTab === 'saved' && (
        <div>
          {savedItems.length === 0 ? (
            <div className="p-12 text-center bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md">
              <Bookmark size={32} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                No saved specimens yet.
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">
                Explore colors, palettes, and gradients to save your favorites.
              </p>
              <Link to={{ path: 'explore' }} onNavigate={onNavigate} className="btn-primary text-xs px-4 py-2 inline-flex">
                Discover Library
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedItems.map((item) => {
                const previews = item.preview.split(',').filter(Boolean);
                return (
                  <div
                    key={item.id}
                    className="specimen-card p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-16 rounded-xs overflow-hidden mb-2.5 border border-[var(--border-subtle)] flex">
                        {previews.map((c, i) => (
                          <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <div className="font-bold text-xs text-[var(--text-primary)] truncate">{item.title}</div>
                      <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase mt-0.5">{item.type}</div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <Link
                        to={
                          item.type === 'palette'
                            ? { path: 'palette-detail', slug: item.slug }
                            : item.type === 'color'
                            ? { path: 'color-detail', slug: item.slug }
                            : item.type === 'gradient'
                            ? { path: 'gradient-detail', slug: item.slug }
                            : item.type === 'combo'
                            ? { path: 'combo-detail', slug: item.slug }
                            : { path: 'pattern-detail', slug: item.slug }
                        }
                        onNavigate={onNavigate}
                        className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono font-semibold"
                      >
                        <span>Open</span>
                        <ExternalLink size={11} />
                      </Link>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] text-[var(--text-tertiary)] hover:text-red-400 p-1"
                        title="Remove from saved"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Collections */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {userCollections.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md">
              <Layers size={32} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                You haven't created any custom collections yet.
              </p>
              <Link to={{ path: 'collections' }} onNavigate={onNavigate} className="btn-primary text-xs px-4 py-2 inline-flex mt-3">
                Create Collection
              </Link>
            </div>
          ) : (
            userCollections.map((col) => (
              <CollectionCard key={col.id} collection={col} onNavigate={onNavigate} />
            ))
          )}
        </div>
      )}

      {/* Tab: Liked Items */}
      {activeTab === 'liked' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {likedItems.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md">
              <Heart size={32} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                No liked items yet.
              </p>
            </div>
          ) : (
            likedItems.map((item) => (
              <div key={item.id} className="p-3 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xs">
                <div className="font-bold text-xs text-[var(--text-primary)]">{item.title}</div>
                <div className="font-mono text-[10px] text-[var(--text-tertiary)]">{item.type}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Remixes */}
      {activeTab === 'remixes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {remixItems.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md">
              <Wand2 size={32} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                No saved remixes yet.
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Open any palette in the library and click "Remix" to create variations.
              </p>
            </div>
          ) : (
            remixItems.map((item) => (
              <div key={item.id} className="p-3 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xs">
                <div className="font-bold text-xs text-[var(--text-primary)]">{item.title}</div>
                <div className="font-mono text-[10px] text-[var(--text-tertiary)]">{item.metadata}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
