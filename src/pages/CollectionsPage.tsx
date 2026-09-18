import React, { useState } from 'react';
import { Layers, Plus, Sparkles, FolderPlus } from 'lucide-react';
import { RouteType } from '../types';
import { useCollections } from '../context/CollectionContext';
import { CollectionCard } from '../components/CollectionCard';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface CollectionsPageProps {
  onNavigate: (route: RouteType) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({ onNavigate }) => {
  const { collections, createCollection } = useCollections();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newCol = createCollection(title.trim(), description.trim() || 'Curated color specimen collection');
    setTitle('');
    setDescription('');
    setModalOpen(false);
    onNavigate({ path: 'collection-detail', slug: newCol.slug });
  };

  return (
    <div className="catalog-container w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title="Color Collections &amp; Design Token Libraries"
        description="Browse curated designer collections of color palettes, master pigment specimens, CSS gradients, and generative tokens."
        canonicalPath="/collections"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'Collections', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers size={16} className="text-[var(--color-primary)]" />
            <span className="page-category-label">Curator Workspaces</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Color Collections
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Curated anthologies of design systems, brand identities, editorial gamuts, and personal workspaces.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <FolderPlus size={14} />
          <span>New Collection</span>
        </button>
      </div>

      {/* Grid of Collections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {collections.map((col) => (
          <CollectionCard key={col.id} collection={col} onNavigate={onNavigate} />
        ))}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              Create New Collection
            </h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1">
                  Collection Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nordic Architecture Minimal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xs px-3 py-2"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of this collection's purpose or aesthetic..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xs px-3 py-2 h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs px-3.5 py-1.5"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-4 py-1.5">
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
