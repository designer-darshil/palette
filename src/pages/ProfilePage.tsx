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
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { SpecimenCardBase } from '../components/common/SpecimenCardBase';

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

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Curator Workspace', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Personal studio repository"
        title="Curator Workspace"
        description={`Local workstation library · ${savedItems.length} saved specimens · ${userCollections.length} custom collections.`}
        actions={
          <Button
            variant="primary"
            size="sm"
            iconLeft={<FolderPlus size={13} />}
            onClick={() => onNavigate({ path: 'collections' })}
          >
            Manage Collections
          </Button>
        }
      />

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
            <EmptyState
              icon={<Bookmark size={32} />}
              title="No saved specimens yet"
              description="Explore colors, palettes, and gradients to save your favorites."
              actionLabel="Discover Library"
              onAction={() => onNavigate({ path: 'explore' })}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedItems.map((item) => {
                const previews = item.preview.split(',').filter(Boolean);
                return (
                  <SpecimenCardBase
                    key={item.id}
                    className="p-3.5 flex flex-col justify-between"
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
                  </SpecimenCardBase>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Collections */}
      {activeTab === 'collections' && (
        <div className="w-full">
          {userCollections.length === 0 ? (
            <EmptyState
              icon={<Layers size={32} />}
              title="You haven't created any custom collections yet"
              description="Curate custom groups of palettes, swatches, and gradients."
              actionLabel="Create Collection"
              onAction={() => onNavigate({ path: 'collections' })}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {userCollections.map((col) => (
                <CollectionCard key={col.id} collection={col} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Liked Items */}
      {activeTab === 'liked' && (
        <div className="w-full">
          {likedItems.length === 0 ? (
            <EmptyState
              icon={<Heart size={32} />}
              title="No liked items yet"
              description="Click the heart icon on any specimen to bookmark it in your favorites."
              actionLabel="Explore Library"
              onAction={() => onNavigate({ path: 'explore' })}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {likedItems.map((item) => (
                <SpecimenCardBase key={item.id} className="p-3">
                  <div className="font-bold text-xs text-[var(--text-primary)]">{item.title}</div>
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)]">{item.type}</div>
                </SpecimenCardBase>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Remixes */}
      {activeTab === 'remixes' && (
        <div className="w-full">
          {remixItems.length === 0 ? (
            <EmptyState
              icon={<Wand2 size={32} />}
              title="No saved remixes yet"
              description="Open any palette in the library and click 'Remix' to calibrate custom variations."
              actionLabel="Browse Palettes"
              onAction={() => onNavigate({ path: 'palettes' })}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {remixItems.map((item) => (
                <SpecimenCardBase key={item.id} className="p-3">
                  <div className="font-bold text-xs text-[var(--text-primary)]">{item.title}</div>
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)]">{item.metadata}</div>
                </SpecimenCardBase>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
