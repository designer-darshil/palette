import React, { useState } from 'react';
import { Plus, X, ArrowUpRight, FolderPlus } from 'lucide-react';
import { RouteType } from '../types';
import { useCollections } from '../context/CollectionContext';
import { SEOHead } from '../components/seo/SEOHead';

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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pb-16 md:pb-24 box-border">
      <SEOHead
        title="Collections — Inspiration Archive | KROMA"
        description="Personal art archives of color systems, brand identities, and design tokens assembled into curated folders."
        canonicalPath="/collections"
      />

      {/* Editorial Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
          <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => onNavigate({ path: 'create' })}>STUDIO</span>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold">COLLECTIONS</span>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="font-mono text-xs font-medium tracking-[0.08em] uppercase py-1.5 px-3.5 bg-text-primary text-canvas border border-text-primary rounded cursor-pointer flex items-center gap-2 transition-all duration-150 select-none hover:opacity-90 hover:-translate-y-0.5"
        >
          <Plus size={13} />
          <span>NEW COLLECTION</span>
        </button>
      </div>

      {/* Hero */}
      <header className="mb-14">
        <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary block mb-4">INSPIRATION ARCHIVE</span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-normal leading-[1.05] tracking-tight text-text-primary uppercase m-0 mb-5">
          KEEP WHAT<br />
          INSPIRES YOU.
        </h1>
        <p className="font-sans text-base leading-relaxed text-text-secondary max-w-[680px] m-0">
          A tactile archive of curated color sets, harmony experiments, and saved palettes.
        </p>
      </header>

      {/* ── 18: COLLECTIONS INSIDE STUDIO (Large Visual Previews) ── */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {collections.map((col, idx) => {
            const previewColors = (col.coverPreview || '#171717,#3B82F6,#E9C46A,#10B981,#8B5CF6')
              .split(',')
              .filter(Boolean);

            return (
              <div
                key={col.id}
                className="group border border-[var(--border-subtle)] hover:border-[var(--text-primary)] p-6 cursor-pointer transition-all flex flex-col justify-between"
                onClick={() => onNavigate({ path: 'collection-detail', slug: col.slug })}
                role="button"
                tabIndex={0}
              >
                <div>
                  <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest block mb-3">
                    COLLECTION 0{idx + 1}
                  </span>

                  {/* Multi-layered visual color blocks */}
                  <div className="flex flex-col gap-1.5 mb-6">
                    <div className="h-16 flex rounded-xs overflow-hidden">
                      {previewColors.map((hex, ci) => (
                        <div key={ci} className="flex-1 h-full" style={{ backgroundColor: hex.trim() }} />
                      ))}
                    </div>
                    <div className="h-8 flex rounded-xs overflow-hidden opacity-80">
                      {previewColors.slice().reverse().map((hex, ci) => (
                        <div key={ci} className="flex-1 h-full" style={{ backgroundColor: hex.trim() }} />
                      ))}
                    </div>
                  </div>

                  <h3 className="font-sans text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight mb-1">
                    {col.title}
                  </h3>
                  <p className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                    {col.items?.length || previewColors.length} COLORS · BY {col.creator?.name || 'STUDIO'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] text-xs font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  <span>VIEW COLLECTION</span>
                  <ArrowUpRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Branded Empty State */
        <div className="max-w-md py-16 px-8 text-center border border-dashed border-border-subtle rounded flex flex-col items-center justify-center gap-4">
          <div className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-text-secondary">NOTHING HERE YET.</div>
          <p className="font-sans text-sm text-text-tertiary max-w-[420px] leading-relaxed">
            Start collecting colors that make you stop scrolling. Gather palettes, specimens, and gradients into your private archive.
          </p>
          <button
            onClick={() => onNavigate({ path: 'colors' })}
            className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase px-6 py-3 bg-text-primary text-canvas border border-text-primary rounded cursor-pointer inline-flex items-center gap-2 transition-all duration-150 select-none hover:opacity-90 hover:-translate-y-0.5"
          >
            <span>EXPLORE COLORS ↗</span>
          </button>
        </div>
      )}

      {/* Create New Collection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={() => setModalOpen(false)}>
          <div
            className="w-full max-w-md bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-6 rounded-xs flex flex-col gap-4 text-[var(--text-primary)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-0">NEW COLLECTION</span>
              <button onClick={() => setModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  TITLE *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kyoto Ochre & Tea"
                  className="w-full bg-transparent border border-[var(--border-subtle)] focus:border-[var(--text-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none rounded-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on chromatic harmony, use case, or project mood..."
                  className="w-full bg-transparent border border-[var(--border-subtle)] focus:border-[var(--text-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none rounded-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="font-mono text-xs font-medium tracking-[0.08em] uppercase py-1.5 px-3 bg-surface-1 text-text-primary border border-border-subtle rounded cursor-pointer transition-all duration-150 select-none hover:border-text-primary hover:-translate-y-0.5"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="font-mono text-xs font-medium tracking-[0.08em] uppercase py-1.5 px-4 bg-text-primary text-canvas border border-text-primary rounded cursor-pointer transition-all duration-150 select-none hover:opacity-90 hover:-translate-y-0.5"
                >
                  CREATE ARCHIVE ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
