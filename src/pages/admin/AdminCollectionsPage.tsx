import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit2, Eye, X, BookmarkCheck } from 'lucide-react';
import { CollectionItem } from '../../types';
import { CURATED_COLLECTIONS } from '../../data/collections';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { KromaButton } from '../../components/common/KromaButton';

export const AdminCollectionsPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const [collections, setCollections] = useState<CollectionItem[]>(() => {
    try {
      const stored = localStorage.getItem('kroma_admin_collections');
      if (stored) return JSON.parse(stored);
    } catch {}
    return CURATED_COLLECTIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [inspectCollection, setInspectCollection] = useState<CollectionItem | null>(null);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formVisibility, setFormVisibility] = useState<'public' | 'private'>('public');
  const [formTags, setFormTags] = useState('curated, editorial, anthology');
  const [formCoverHexes, setFormCoverHexes] = useState('#FF3B30, #FF9500, #34C759, #00AEEF');

  const filtered = useMemo(() => {
    return collections.filter((col) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!col.title.toLowerCase().includes(q) && !col.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [collections, searchQuery]);

  const persistCollections = (next: CollectionItem[]) => {
    setCollections(next);
    localStorage.setItem('kroma_admin_collections', JSON.stringify(next));
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingCollection(null);
    setFormTitle('New Curated Anthology');
    setFormDescription('Editorial collection of harmonized specimens and chromatic assets.');
    setFormVisibility('public');
    setFormTags('curated, editorial, anthology');
    setFormCoverHexes('#FF3B30, #FF9500, #FFD60A, #34C759, #00AEEF');
  };

  const handleOpenEdit = (col: CollectionItem) => {
    setIsCreating(false);
    setEditingCollection(col);
    setFormTitle(col.title);
    setFormDescription(col.description);
    setFormVisibility(col.visibility);
    setFormTags(col.tags.join(', '));
    setFormCoverHexes(col.coverPreview || '#FF3B30, #FF9500, #34C759');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = formTags.split(',').map((t) => t.trim()).filter(Boolean);
    const slug = formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `collection-${Date.now()}`;

    if (isCreating) {
      const newCollection: CollectionItem = {
        id: `col-custom-${Date.now()}`,
        slug,
        title: formTitle,
        description: formDescription,
        visibility: formVisibility,
        tags: tagArray,
        coverPreview: formCoverHexes,
        creator: {
          name: 'Kroma Editorial Board',
          username: 'kroma-curator',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        },
        items: [
          {
            id: `item-${Date.now()}-1`,
            type: 'palette',
            refId: 'palette-anchor',
            title: 'Foundational Anchor Spectrum',
            slug: 'foundational-spectrum',
            preview: formCoverHexes,
            metadata: '5-Tone Relational System',
            addedAt: Date.now(),
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        featured: false,
      };
      const next = [newCollection, ...collections];
      persistCollections(next);
      logActivity('Created Collection', `Added collection "${formTitle}"`);
    } else if (editingCollection) {
      const updated: CollectionItem = {
        ...editingCollection,
        title: formTitle,
        description: formDescription,
        visibility: formVisibility,
        tags: tagArray,
        coverPreview: formCoverHexes,
        updatedAt: Date.now(),
      };
      const next = collections.map((c) => (c.id === updated.id ? updated : c));
      persistCollections(next);
      logActivity('Updated Collection', `Modified collection "${formTitle}"`);
    }

    setIsCreating(false);
    setEditingCollection(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove curated collection "${title}"?`)) {
      const next = collections.filter((c) => c.id !== id);
      persistCollections(next);
      logActivity('Deleted Collection', `Removed collection "${title}"`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
            Curated Collections
          </h1>
          <p className="text-xs text-[#707070] dark:text-[#9DA3AF] mt-1 font-mono">
            Manage editorial anthologies and multi-specimen design archives ({collections.length} total).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <KromaButton
            onClick={handleOpenCreate}
            variant="filled"
            size="sm"
            iconLeft={<Plus size={14} />}
          >
            New Collection
          </KromaButton>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex items-center justify-between">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-[#707070] dark:text-[#9DA3AF]" />
          <input
            type="text"
            placeholder="Search collection title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] dark:placeholder-[#9DA3AF] w-72 focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
          />
        </div>

        <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
          {filtered.length} COLLECTIONS MATCHED
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((col) => {
          const coverHexes = (col.coverPreview || '').split(',').map((s) => s.trim()).filter(Boolean);

          return (
            <div
              key={col.id}
              className="bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Cover Preview Strip */}
              <div className="flex h-16 w-full border-b border-black/10 dark:border-white/10 cursor-pointer" onClick={() => setInspectCollection(col)}>
                {coverHexes.length > 0 ? (
                  coverHexes.map((hex, i) => (
                    <div
                      key={i}
                      className="flex-1 h-full"
                      style={{
                        background: hex.includes('gradient') ? hex : hex,
                      }}
                      title={hex}
                    />
                  ))
                ) : (
                  <div className="w-full h-full bg-[#111216]" />
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#F8F8F8]">
                      {col.title}
                    </h3>
                    <span className="font-mono text-xs uppercase px-1.5 py-0.5 rounded-xs bg-black/[0.04] dark:bg-white/[0.06] text-[#707070] dark:text-[#9DA3AF] font-bold">
                      {col.visibility}
                    </span>
                  </div>
                  <p className="text-xs text-[#707070] dark:text-[#9DA3AF] line-clamp-2 mt-1 leading-relaxed">
                    {col.description}
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs font-mono text-[#707070] dark:text-[#9DA3AF] pt-2 border-t border-black/5 dark:border-white/5">
                  <span>{col.items.length} SPECIMENS</span>
                  <span>BY {col.creator.name}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {col.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono px-1.5 py-0.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.04] text-[#707070] dark:text-[#9DA3AF]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                  <KromaButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(col)}
                    iconLeft={<Edit2 size={12} />}
                    className="!text-xs !py-1 !px-2.5 text-[#707070] dark:text-[#9DA3AF]"
                  >
                    Edit
                  </KromaButton>
                  <KromaButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspectCollection(col)}
                    iconLeft={<Eye size={12} />}
                    className="!text-xs !py-1 !px-2.5 text-[#707070] dark:text-[#9DA3AF]"
                  >
                    Inspect
                  </KromaButton>
                  <KromaButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(col.id, col.title)}
                    iconLeft={<Trash2 size={12} />}
                    className="!text-xs !py-1 !px-2.5 text-[#D70015] dark:text-[#FF453A] hover:bg-[#FF3B30]/10"
                  >
                    Delete
                  </KromaButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Collection Modal */}
      {(isCreating || editingCollection) && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setIsCreating(false);
            setEditingCollection(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-base font-bold text-[#171717] dark:text-[#F8F8F8]">
                {isCreating ? 'New Curated Collection' : `Edit: ${editingCollection?.title}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCollection(null);
                }}
                className="text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
                  Collection Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
                  Visibility
                </label>
                <select
                  value={formVisibility}
                  onChange={(e) => setFormVisibility(e.target.value as any)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
                  Cover Swatches (Comma Separated HEX Codes)
                </label>
                <input
                  type="text"
                  value={formCoverHexes}
                  onChange={(e) => setFormCoverHexes(e.target.value)}
                  placeholder="#FF3B30, #FF9500, #34C759"
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs font-mono text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                <KromaButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCollection(null);
                  }}
                >
                  Cancel
                </KromaButton>
                <KromaButton type="submit" variant="filled" size="sm">
                  {isCreating ? 'Create Collection' : 'Save Changes'}
                </KromaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Collection Modal */}
      {inspectCollection && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectCollection(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold text-[#171717] dark:text-[#F8F8F8]">{inspectCollection.title}</h2>
                <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                  Slug: {inspectCollection.slug}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectCollection(null)}
                aria-label="Close"
                className="text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#707070] dark:text-[#9DA3AF] leading-relaxed">
              {inspectCollection.description}
            </p>

            <div className="font-mono text-xs font-semibold text-[#171717] dark:text-[#F8F8F8] uppercase tracking-wider">
              Enclosed Specimens ({inspectCollection.items.length})
            </div>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
              {inspectCollection.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00AEEF]" />
                    <span className="font-bold text-[#171717] dark:text-[#F8F8F8]">{item.title}</span>
                  </div>
                  <span className="text-[#707070] dark:text-[#9DA3AF] text-xs">
                    {item.metadata}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = inspectCollection;
                  setInspectCollection(null);
                  handleOpenEdit(target);
                }}
                iconLeft={<Edit2 size={12} />}
              >
                Edit
              </KromaButton>
              <KromaButton
                variant="filled"
                size="sm"
                onClick={() => setInspectCollection(null)}
              >
                Done
              </KromaButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
