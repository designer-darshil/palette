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
    <div className="kroma-page">
      <SEOHead
        title="Collections — Keep What Inspires You | KROMA"
        description="Personal art archives of color systems, brand identities, and design tokens assembled into curated folders."
        canonicalPath="/collections"
      />

      {/* Top Editorial Hero */}
      <header className="kroma-hero flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="kroma-label">COLLECTIONS</div>
          <h1 className="kroma-headline">KEEP WHAT INSPIRES YOU.</h1>
          <p className="kroma-lead">
            Curated anthologies of harmonic systems, editorial swatches, and personal workspaces gathered into tactile archives.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="self-start md:self-auto font-sans text-xs font-bold tracking-wider uppercase px-5 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={14} />
          <span>NEW COLLECTION</span>
        </button>
      </header>

      {/* Visual Folder / Palette Strip Compositions */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {collections.map((col, idx) => {
            const previewColors = (col.coverPreview || '#171717,#3B82F6,#E9C46A,#10B981,#8B5CF6')
              .split(',')
              .filter(Boolean);

            return (
              <div
                key={col.id}
                className="group relative bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between"
                onClick={() => onNavigate({ path: 'collection-detail', slug: col.slug })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onNavigate({ path: 'collection-detail', slug: col.slug });
                }}
              >
                {/* Layered Palette Strip Preview */}
                <div className="relative mb-6">
                  {/* Subtle layered paper shadow behind */}
                  <div className="absolute inset-x-2 -top-2 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-xs -z-10" />
                  
                  <div className="h-28 rounded-sm overflow-hidden flex border border-black/5 shadow-inner">
                    {previewColors.map((hex, ci) => (
                      <div
                        key={ci}
                        className="flex-1 transition-transform group-hover:scale-105 duration-200"
                        style={{ backgroundColor: hex.trim() }}
                      />
                    ))}
                  </div>
                </div>

                {/* Collection Metadata */}
                <div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
                    <span>ARCHIVE 0{idx + 1}</span>
                    <span>{col.items?.length || previewColors.length} SWATCHES</span>
                  </div>

                  <h3 className="font-sans text-xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase mb-1 flex items-center justify-between">
                    <span>{col.title}</span>
                    <ArrowUpRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  <div className="font-sans text-xs text-neutral-500 uppercase tracking-wider">
                    BY {col.creator?.name || 'STUDIO CURATOR'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Artistic Empty State */
        <div className="py-24 px-6 text-center max-w-xl mx-auto border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm my-8">
          <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
            <FolderPlus size={22} />
          </div>
          <h2 className="font-sans text-3xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white mb-3">
            NOTHING HERE YET.
          </h2>
          <p className="font-sans text-sm text-neutral-500 max-w-md mx-auto mb-8 leading-relaxed">
            Start collecting colors that make you stop scrolling. Gather palettes, specimens, and gradients into your private archive.
          </p>
          <button
            onClick={() => onNavigate({ path: 'colors' })}
            className="font-sans text-xs font-bold tracking-wider uppercase px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <span>EXPLORE COLORS</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      )}

      {/* Create New Collection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4" onClick={() => setModalOpen(false)}>
          <div
            className="w-full max-w-md bg-white dark:bg-[#1C1E24] border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 shadow-2xl flex flex-col gap-4 text-neutral-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="font-sans text-base font-bold uppercase tracking-tight">
                NEW COLOR COLLECTION
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                  COLLECTION TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kyoto Moss & Bamboo Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#111216] border border-neutral-300 dark:border-neutral-700 rounded-sm py-2 px-3 text-xs font-sans text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                  DESCRIPTION (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes on chromatic balance, typography pairings, or design intent..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#111216] border border-neutral-300 dark:border-neutral-700 rounded-sm py-2 px-3 text-xs font-sans text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="font-sans text-xs font-bold uppercase tracking-wider px-5 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  CREATE ARCHIVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
