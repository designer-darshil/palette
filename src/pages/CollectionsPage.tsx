import React, { useState } from 'react';
import { Plus, X, ArrowUpRight } from 'lucide-react';
import { RouteType } from '../types';
import { useCollections } from '../context/CollectionContext';
import { SEOHead } from '../components/seo/SEOHead';
import { KromaButton } from '../components/common/KromaButton';
import { Link } from '../components/common/Link';

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
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
          <Link to={{ path: 'create' }} onNavigate={onNavigate} className="hover:text-[var(--text-primary)]">STUDIO</Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold">COLLECTIONS</span>
        </div>

        <KromaButton
          size="sm"
          variant="filled"
          onClick={() => setModalOpen(true)}
          className="font-mono text-xs font-medium tracking-[0.08em] uppercase"
          iconLeft={<Plus size={13} />}
        >
          <span>NEW COLLECTION</span>
        </KromaButton>
      </div>

      {/* Hero */}
      <header className="mb-14">
        <span className="font-mono text-xs font-semibold tracking-wider uppercase text-text-secondary block mb-4">INSPIRATION ARCHIVE</span>
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
              <Link
                key={col.id}
                to={{ path: 'collection-detail', slug: col.slug }}
                onNavigate={onNavigate}
                className="group bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] overflow-hidden flex flex-col justify-between transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] cursor-pointer select-none block no-underline text-inherit"
              >
                {/* Edge-to-Edge Color Bands Hero */}
                <div className="w-full h-36 sm:h-40 flex overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06]">
                  {previewColors.map((hex, ci) => (
                    <div
                      key={ci}
                      className="flex-1 h-full transition-[flex] duration-200 group-hover:hover:flex-[1.25]"
                      style={{ backgroundColor: hex.trim() }}
                    />
                  ))}
                </div>

                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090] uppercase tracking-wider block mb-1.5">
                      COLLECTION 0{idx + 1}
                    </span>

                    <h3 className="font-sans text-lg font-bold text-[#171717] dark:text-white uppercase tracking-tight mb-1">
                      {col.title}
                    </h3>
                    <p className="font-mono text-xs text-[#707070] dark:text-[#909090] uppercase tracking-wider mb-4">
                      {col.items?.length || previewColors.length} COLORS · BY {col.creator?.name?.toUpperCase() || 'STUDIO'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.06] text-xs font-sans font-bold uppercase tracking-wider text-[#707070] dark:text-[#909090] group-hover:text-[#171717] dark:group-hover:text-white transition-colors">
                    <span>VIEW COLLECTION</span>
                    <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
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
          <KromaButton
            size="sm"
            variant="filled"
            onClick={() => onNavigate({ path: 'colors' })}
            className="font-mono text-xs font-medium tracking-[0.08em] uppercase px-6 py-3"
            iconRight={<ArrowUpRight size={13} />}
          >
            <span>EXPLORE COLORS</span>
          </KromaButton>
        </div>
      )}

      {/* Create New Collection Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="New Collection"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-md bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-6 rounded-xs flex flex-col gap-4 text-[var(--text-primary)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <span className="font-mono text-xs font-semibold tracking-wider uppercase text-text-secondary mb-0">NEW COLLECTION</span>
              <KromaButton
                size="icon"
                variant="ghost"
                onClick={() => setModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-6 w-6"
                aria-label="Close modal"
                iconLeft={<X size={16} />}
              />
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
                <KromaButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  className="font-mono text-xs font-medium tracking-[0.08em] uppercase py-1.5 px-3"
                >
                  CANCEL
                </KromaButton>
                <KromaButton
                  type="submit"
                  variant="filled"
                  size="sm"
                  className="font-mono text-xs font-medium tracking-[0.08em] uppercase py-1.5 px-4"
                  iconRight={<Plus size={13} />}
                >
                  <span>CREATE ARCHIVE</span>
                </KromaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
