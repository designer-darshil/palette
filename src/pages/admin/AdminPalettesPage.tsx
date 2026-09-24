import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { PaletteItem } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';
import { KromaButton } from '../../components/common/KromaButton';
import { KromaInput } from '../../components/common/KromaInput';
import { copyToClipboard } from '../../utils/colorUtils';

export const AdminPalettesPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const { palettes, addPalette, updatePalette, deletePalette } = useLibraryData();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === 'grid' ? 12 : 20;

  // Modals & Inspection
  const [inspectPalette, setInspectPalette] = useState<PaletteItem | null>(null);
  const [editingPalette, setEditingPalette] = useState<PaletteItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedTokens, setCopiedTokens] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('editorial');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('editorial, harmony, specimen');
  const [formColors, setFormColors] = useState<
    Array<{ name: string; hex: string; role: string }>
  >([
    { name: 'Tone 1', hex: '#FF3B30', role: 'primary' },
    { name: 'Tone 2', hex: '#FF9500', role: 'accent' },
    { name: 'Tone 3', hex: '#FFD60A', role: 'highlight' },
    { name: 'Tone 4', hex: '#34C759', role: 'secondary' },
    { name: 'Tone 5', hex: '#00AEEF', role: 'surface' },
  ]);

  const filtered = useMemo(() => {
    return palettes.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [palettes, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingPalette(null);
    setFormTitle('New Harmonized System');
    setFormCategory('editorial');
    setFormDescription('Curated five-tone chromatic palette specification.');
    setFormTags('editorial, harmony, modernist');
    setFormColors([
      { name: 'Anchor Hue', hex: '#FF3B30', role: 'primary' },
      { name: 'Secondary Hue', hex: '#FF9500', role: 'accent' },
      { name: 'Highlight', hex: '#FFD60A', role: 'highlight' },
      { name: 'Harmonic Cool', hex: '#34C759', role: 'secondary' },
      { name: 'Neutral Base', hex: '#171717', role: 'surface' },
    ]);
  };

  const handleOpenEdit = (palette: PaletteItem) => {
    setIsCreating(false);
    setEditingPalette(palette);
    setFormTitle(palette.title);
    setFormCategory(palette.category);
    setFormDescription(palette.description || '');
    setFormTags(palette.tags?.join(', ') || 'editorial, palette');
    setFormColors(
      palette.colors.map((c, i) => ({
        name: c.name || `Tone ${i + 1}`,
        hex: c.hex,
        role: c.role || `tone-${i + 1}`,
      }))
    );
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = formTags.split(',').map((t) => t.trim()).filter(Boolean);
    const slug = formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `palette-${Date.now()}`;

    if (isCreating) {
      const newPalette: PaletteItem = {
        id: `pal-custom-${Date.now()}`,
        slug,
        title: formTitle,
        category: formCategory,
        description: formDescription,
        tags: tagArray,
        colors: formColors.map((c, i) => ({
          name: c.name || `Tone ${i + 1}`,
          hex: c.hex.toUpperCase(),
          role: c.role || `tone-${i + 1}`,
        })),
        likes: 0,
        saves: 0,
        createdAt: new Date().toISOString(),
      };
      addPalette(newPalette);
      logActivity('Created Palette', `Added palette system "${formTitle}"`);
    } else if (editingPalette) {
      const updated: PaletteItem = {
        ...editingPalette,
        title: formTitle,
        category: formCategory,
        description: formDescription,
        tags: tagArray,
        colors: formColors.map((c, i) => ({
          name: c.name || `Tone ${i + 1}`,
          hex: c.hex.toUpperCase(),
          role: c.role || `tone-${i + 1}`,
        })),
      };
      updatePalette(updated);
      logActivity('Updated Palette', `Modified palette system "${formTitle}"`);
    }

    setIsCreating(false);
    setEditingPalette(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove palette system "${title}"?`)) {
      deletePalette(id);
      logActivity('Deleted Palette', `Removed palette "${title}"`);
    }
  };

  const handleCopyTokens = async (palette: PaletteItem) => {
    const tokenObject = {
      name: palette.title,
      category: palette.category,
      colors: palette.colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        role: c.role,
      })),
    };
    await copyToClipboard(JSON.stringify(tokenObject, null, 2));
    setCopiedTokens(palette.id);
    setTimeout(() => setCopiedTokens(null), 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
            Palette Systems Archive
          </h1>
          <p className="text-xs text-[#707070] dark:text-[#9DA3AF] mt-1 font-mono">
            {palettes.length.toLocaleString()} structured 5-tone chromatic harmony systems with tone roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <KromaButton
            onClick={handleOpenCreate}
            variant="filled"
            size="sm"
            iconLeft={<Plus size={14} />}
          >
            New Palette System
          </KromaButton>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-64">
            <KromaInput
              type="text"
              placeholder="Search palette title or slug..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              iconLeft={<Search size={14} />}
              inputSize="sm"
              variant="surface"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
          >
            <option value="all">All Disciplines</option>
            <option value="editorial">Editorial</option>
            <option value="minimal">Minimal</option>
            <option value="nature">Nature</option>
            <option value="architectural">Architectural</option>
            <option value="vintage">Vintage</option>
            <option value="vibrant">Vibrant</option>
            <option value="monochrome">Monochrome</option>
            <option value="dark-mode">Dark Mode</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-xs gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Visual Grid"
              className={`p-1 rounded-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#181A20] text-[#171717] dark:text-[#F8F8F8] shadow-xs'
                  : 'text-[#707070] dark:text-[#9DA3AF]'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Editorial Table"
              className={`p-1 rounded-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#181A20] text-[#171717] dark:text-[#F8F8F8] shadow-xs'
                  : 'text-[#707070] dark:text-[#9DA3AF]'
              }`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT: VISUAL PALETTE ARCHIVE GRID OR EDITORIAL TABLE */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((palette) => (
            <div
              key={palette.id}
              className="bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Color Composition Dominates the Card (Full Width 5-Color Strip) */}
              <button
                type="button"
                className="w-full h-28 flex cursor-pointer group relative overflow-hidden border-0 p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                onClick={() => setInspectPalette(palette)}
                aria-label={`Inspect ${palette.title} palette`}
              >
                {palette.colors.map((c, i) => (
                  <div
                    key={i}
                    className="flex-1 h-full relative transition-transform duration-200 group-hover:scale-y-105 origin-bottom"
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (${c.hex})`}
                  />
                ))}
              </button>

              {/* Data & Real Metadata */}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#F8F8F8]">
                      {palette.title}
                    </h3>
                    <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF] mt-0.5 capitalize">
                      {palette.category} · 5 COLORS
                    </div>
                  </div>

                  <span className="font-mono text-xs uppercase px-1.5 py-0.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.04] text-[#707070] dark:text-[#9DA3AF]">
                    #{palette.slug}
                  </span>
                </div>

                {/* Swatches Hex Sequence */}
                <div className="flex items-center gap-1.5 font-mono text-xs text-[#707070] dark:text-[#9DA3AF] overflow-x-auto py-1 border-t border-black/5 dark:border-white/5">
                  {palette.colors.map((c, i) => (
                    <span key={i} className="flex items-center gap-1 shrink-0">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c.hex }} />
                      <span>{c.hex}</span>
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
                  <KromaButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyTokens(palette)}
                    iconLeft={copiedTokens === palette.id ? <Check size={12} /> : <Copy size={12} />}
                    className="!text-xs !py-1 !px-2 text-[#707070] dark:text-[#9DA3AF]"
                  >
                    {copiedTokens === palette.id ? 'Copied' : 'Tokens'}
                  </KromaButton>

                  <div className="flex items-center gap-1">
                    <KromaButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(palette)}
                      iconLeft={<Edit2 size={12} />}
                      className="!text-xs !py-1 !px-2 text-[#707070] dark:text-[#9DA3AF]"
                    >
                      Edit
                    </KromaButton>
                    <KromaButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectPalette(palette)}
                      iconLeft={<Eye size={12} />}
                      className="!text-xs !py-1 !px-2 text-[#707070] dark:text-[#9DA3AF]"
                    >
                      View
                    </KromaButton>
                    <KromaButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(palette.id, palette.title)}
                      iconLeft={<Trash2 size={12} />}
                      className="!text-xs !py-1 !px-2 text-[#D70015] dark:text-[#FF453A] hover:bg-[#FF3B30]/10"
                    >
                      Delete
                    </KromaButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EDITORIAL TABLE */
        <div className="w-full overflow-x-auto border border-border-subtle rounded-xs bg-surface-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/[0.02] dark:bg-white/[0.04] border-b border-black/10 dark:border-white/10 font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                <th className="py-2.5 px-4 font-semibold">SPECTRUM COMPOSITION</th>
                <th className="py-2.5 px-4 font-semibold">PALETTE TITLE</th>
                <th className="py-2.5 px-4 font-semibold">DISCIPLINE</th>
                <th className="py-2.5 px-4 font-semibold">SWATCH HEXES</th>
                <th className="py-2.5 px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {paginated.map((palette) => (
                <tr
                  key={palette.id}
                  className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-2 px-4">
                    <button
                      type="button"
                      className="flex w-24 h-5 rounded-xs overflow-hidden border border-black/10 dark:border-white/10 cursor-pointer p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                      onClick={() => setInspectPalette(palette)}
                      aria-label={`Inspect ${palette.title} palette`}
                    >
                      {palette.colors.map((c, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
                      ))}
                    </button>
                  </td>
                  <td className="py-2 px-4 font-semibold text-[#171717] dark:text-[#F8F8F8]">
                    {palette.title}
                  </td>
                  <td className="py-2 px-4 capitalize font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                    {palette.category}
                  </td>
                  <td className="py-2 px-4 font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                    {palette.colors.map((c) => c.hex).join(' · ')}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyTokens(palette)}
                        title="Copy Tokens"
                        className="p-1 text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(palette)}
                        title="Edit Palette"
                        className="p-1 text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectPalette(palette)}
                        title="Inspect"
                        className="p-1 text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(palette.id, palette.title)}
                        title="Delete"
                        className="p-1 text-[#D70015] dark:text-[#FF453A] hover:opacity-80"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex justify-between items-center text-xs font-mono text-[#707070] dark:text-[#9DA3AF]">
        <div>
          PAGE {currentPage} OF {totalPages}
        </div>
        <div className="flex gap-2">
          <KromaButton
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            iconLeft={<ChevronLeft size={13} />}
            className="!py-1 !px-2.5 !text-xs"
          >
            Prev
          </KromaButton>
          <KromaButton
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            iconRight={<ChevronRight size={13} />}
            className="!py-1 !px-2.5 !text-xs"
          >
            Next
          </KromaButton>
        </div>
      </div>

      {/* Create / Edit Palette Modal */}
      {(isCreating || editingPalette) && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setIsCreating(false);
            setEditingPalette(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-xl w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-base font-bold text-[#171717] dark:text-[#F8F8F8]">
                {isCreating ? 'Create Palette System' : `Edit: ${editingPalette?.title}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPalette(null);
                }}
                className="text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Live 5-Tone Preview */}
            <div className="w-full h-16 flex rounded-xs overflow-hidden border border-black/10 dark:border-white/10">
              {formColors.map((c, i) => (
                <div
                  key={i}
                  className="flex-1 h-full flex flex-col justify-end p-1 text-center"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className="font-mono text-xs font-bold px-0.5 rounded-xs bg-black/50 text-white truncate">
                    {c.hex}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSaveForm} className="flex flex-col gap-4">
              <KromaInput
                label="Palette Title"
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                variant="surface"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
                    Discipline / Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none capitalize"
                  >
                    <option value="editorial">Editorial</option>
                    <option value="minimal">Minimal</option>
                    <option value="nature">Nature</option>
                    <option value="architectural">Architectural</option>
                    <option value="vintage">Vintage</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="monochrome">Monochrome</option>
                    <option value="dark-mode">Dark Mode</option>
                  </select>
                </div>

                <KromaInput
                  label="Tags (Comma Separated)"
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  variant="surface"
                />
              </div>

              {/* 5-Color Swatch Configurator */}
              <div>
                <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-2 uppercase tracking-wider">
                  5-Tone Architecture Swatches
                </label>
                <div className="space-y-2">
                  {formColors.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xs flex items-center gap-2"
                    >
                      <input
                        type="color"
                        value={col.hex}
                        onChange={(e) => {
                          const updated = [...formColors];
                          updated[idx].hex = e.target.value.toUpperCase();
                          setFormColors(updated);
                        }}
                        className="w-7 h-7 rounded-xs border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={col.hex}
                        onChange={(e) => {
                          const updated = [...formColors];
                          updated[idx].hex = e.target.value;
                          setFormColors(updated);
                        }}
                        className="w-20 px-2 py-1 bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs font-mono text-xs text-[#171717] dark:text-[#F8F8F8] uppercase"
                      />
                      <input
                        type="text"
                        placeholder="Tone name"
                        value={col.name}
                        onChange={(e) => {
                          const updated = [...formColors];
                          updated[idx].name = e.target.value;
                          setFormColors(updated);
                        }}
                        className="flex-1 px-2 py-1 bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8]"
                      />
                      <select
                        value={col.role}
                        onChange={(e) => {
                          const updated = [...formColors];
                          updated[idx].role = e.target.value;
                          setFormColors(updated);
                        }}
                        className="w-24 px-2 py-1 bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8]"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="accent">Accent</option>
                        <option value="highlight">Highlight</option>
                        <option value="surface">Surface</option>
                        <option value="border">Border</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
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
                    setEditingPalette(null);
                  }}
                >
                  Cancel
                </KromaButton>
                <KromaButton type="submit" variant="filled" size="sm">
                  {isCreating ? 'Create Palette' : 'Save Changes'}
                </KromaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Palette Modal */}
      {inspectPalette && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectPalette(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold text-[#171717] dark:text-[#F8F8F8]">{inspectPalette.title}</h2>
                <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                  {inspectPalette.category} · Slug: {inspectPalette.slug}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectPalette(null)}
                aria-label="Close"
                className="text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Large 5-Band Composition Strip */}
            <div className="w-full h-24 flex rounded-xs overflow-hidden border border-black/10 dark:border-white/10">
              {inspectPalette.colors.map((c, i) => (
                <div
                  key={i}
                  className="flex-1 h-full flex flex-col justify-end p-2"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className="font-mono text-xs font-bold px-1 rounded-xs bg-black/40 text-white truncate text-center">
                    {c.hex}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#707070] dark:text-[#9DA3AF]">
                5-Tone Role Architecture
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {inspectPalette.colors.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span className="font-bold text-[#171717] dark:text-[#F8F8F8]">{c.name}</span>
                    </div>
                    <span className="text-[#707070] dark:text-[#9DA3AF] uppercase text-xs">
                      {c.role || `Tone ${i + 1}`} · {c.hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => handleCopyTokens(inspectPalette)}
                iconLeft={copiedTokens === inspectPalette.id ? <Check size={12} /> : <Copy size={12} />}
              >
                {copiedTokens === inspectPalette.id ? 'Copied Tokens' : 'Copy Tokens JSON'}
              </KromaButton>
              <div className="flex gap-2">
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const toEdit = inspectPalette;
                    setInspectPalette(null);
                    handleOpenEdit(toEdit);
                  }}
                  iconLeft={<Edit2 size={12} />}
                >
                  Edit
                </KromaButton>
                <KromaButton
                  variant="filled"
                  size="sm"
                  onClick={() => setInspectPalette(null)}
                >
                  Done
                </KromaButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
