import React, { useState, useMemo } from 'react';
import { Search, Trash2, Eye, Pencil, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ComboItem } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';
import { KromaButton } from '../../components/common/KromaButton';

interface ComboFormState {
  title: string;
  harmonyType: string;
  description: string;
  usageContext: string;
  contrastScore: string;
  colors: {
    name: string;
    hex: string;
    role: string;
    percentage?: number;
  }[];
}

const DEFAULT_FORM: ComboFormState = {
  title: '',
  harmonyType: 'Complementary',
  description: 'Balanced visual harmony for interface surfaces and accents.',
  usageContext: 'UI Elements & Highlights',
  contrastScore: '7.8:1 (AAA)',
  colors: [
    { name: 'Primary Surface', hex: '#0F172A', role: 'Dominant Background', percentage: 60 },
    { name: 'Vibrant Accent', hex: '#00AEEF', role: 'Interactive Accent', percentage: 30 },
    { name: 'Highlight', hex: '#F8FAFC', role: 'Text / High Contrast', percentage: 10 }
  ]
};

export const AdminCombosPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const { combos, addCombo, updateCombo, deleteCombo } = useLibraryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHarmony, setSelectedHarmony] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [inspectCombo, setInspectCombo] = useState<ComboItem | null>(null);
  const [editingCombo, setEditingCombo] = useState<ComboItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ComboFormState>(DEFAULT_FORM);

  const filtered = useMemo(() => {
    return combos.filter((cb) => {
      if (selectedHarmony !== 'all' && cb.harmonyType !== selectedHarmony) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!cb.title.toLowerCase().includes(q) && !cb.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [combos, selectedHarmony, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove harmony combination "${title}"?`)) {
      deleteCombo(id);
      logActivity('Deleted Combo', `Removed harmony "${title}"`);
    }
  };

  const openCreate = () => {
    setFormData(DEFAULT_FORM);
    setIsCreating(true);
  };

  const openEdit = (combo: ComboItem) => {
    setEditingCombo(combo);
    setFormData({
      title: combo.title,
      harmonyType: combo.harmonyType,
      description: combo.description || '',
      usageContext: combo.usageContext || 'UI Design',
      contrastScore: combo.contrastScore || '7.1:1 (AAA)',
      colors: combo.colors.map(c => ({ ...c }))
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingCombo) {
      const updated: ComboItem = {
        ...editingCombo,
        title: formData.title.trim(),
        harmonyType: formData.harmonyType,
        description: formData.description,
        usageContext: formData.usageContext,
        contrastScore: formData.contrastScore,
        colors: formData.colors
      };
      updateCombo(updated);
      logActivity('Updated Combo', `Modified harmony combination "${updated.title}"`);
      setEditingCombo(null);
    } else {
      const newCombo: ComboItem = {
        id: `combo-custom-${Date.now()}`,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        title: formData.title.trim(),
        harmonyType: formData.harmonyType,
        description: formData.description,
        usageContext: formData.usageContext,
        contrastScore: formData.contrastScore,
        colors: formData.colors,
        tags: [formData.harmonyType.toLowerCase(), 'custom-combo']
      };
      addCombo(newCombo);
      logActivity('Created Combo', `Generated new harmony combination "${newCombo.title}"`);
      setIsCreating(false);
    }
  };

  const updateColorSwatch = (index: number, hex: string, role?: string) => {
    setFormData(prev => {
      const colors = [...prev.colors];
      colors[index] = {
        ...colors[index],
        hex,
        role: role !== undefined ? role : colors[index].role
      };
      return { ...prev, colors };
    });
  };

  const addColorSlot = () => {
    if (formData.colors.length >= 5) return;
    setFormData(prev => ({
      ...prev,
      colors: [
        ...prev.colors,
        { name: `Role ${prev.colors.length + 1}`, hex: '#3B82F6', role: 'Support Accent', percentage: 10 }
      ]
    }));
  };

  const removeColorSlot = (index: number) => {
    if (formData.colors.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
            Color Harmonies &amp; Combos
          </h1>
          <p className="text-xs text-[#595959] dark:text-[#9DA3AF] mt-1 font-mono">
            {combos.length.toLocaleString()} relational pairings with surface roles and WCAG AAA compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#595959] dark:text-[#9DA3AF]">
            {filtered.length.toLocaleString()} MATCHED
          </span>
          <KromaButton
            variant="filled"
            size="sm"
            onClick={openCreate}
            iconLeft={<Plus size={13} />}
          >
            New Harmony
          </KromaButton>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-[#595959] dark:text-[#9DA3AF]" />
            <input
              type="text"
              placeholder="Search combos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] dark:placeholder-[#9DA3AF] w-64 focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
            />
          </div>

          <select
            value={selectedHarmony}
            onChange={(e) => {
              setSelectedHarmony(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
          >
            <option value="all">All Harmonies</option>
            <option value="Complementary">Complementary</option>
            <option value="Triadic">Triadic</option>
            <option value="Analogous">Analogous</option>
            <option value="Split Complementary">Split Complementary</option>
            <option value="Warm & Cool">Warm &amp; Cool</option>
            <option value="Monochromatic">Monochromatic</option>
          </select>
        </div>
      </div>

      {/* Editorial Table */}
      <div className="admin-table-container">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-black/[0.02] dark:bg-white/[0.04] border-b border-black/10 dark:border-white/10 font-mono text-xs text-[#595959] dark:text-[#9DA3AF]">
              <th className="py-2.5 px-4 font-semibold">PAIRING SWATCHES</th>
              <th className="py-2.5 px-4 font-semibold">TITLE</th>
              <th className="py-2.5 px-4 font-semibold">HARMONY TYPE</th>
              <th className="py-2.5 px-4 font-semibold">WCAG CONTRAST</th>
              <th className="py-2.5 px-4 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {paginated.map((combo) => (
              <tr
                key={combo.id}
                className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-2.5 px-4">
                  <div
                    className="flex w-20 h-5 rounded-xs overflow-hidden border border-black/10 dark:border-white/10 cursor-pointer shadow-xs"
                    onClick={() => setInspectCombo(combo)}
                  >
                    {combo.colors.map((c, i) => (
                      <div
                        key={i}
                        className="flex-1 h-full"
                        style={{ backgroundColor: c.hex }}
                        title={`${c.role || c.name}: ${c.hex}`}
                      />
                    ))}
                  </div>
                </td>
                <td className="py-2.5 px-4 font-semibold text-[#171717] dark:text-[#F8F8F8]">
                  {combo.title}
                </td>
                <td className="py-2.5 px-4 font-mono text-xs text-[#595959] dark:text-[#9DA3AF]">
                  {combo.harmonyType}
                </td>
                <td className="py-2.5 px-4 font-mono text-xs">
                  <span className="px-1.5 py-0.5 rounded-xs bg-[#1B8738]/10 text-[#1B8738] dark:bg-[#34C759]/15 dark:text-[#34C759] font-bold">
                    {combo.contrastScore}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(combo)}
                      title="Edit Harmony"
                      className="p-1.5 text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8] transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectCombo(combo)}
                      title="Inspect"
                      className="p-1.5 text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8] transition-colors"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(combo.id, combo.title)}
                      title="Delete"
                      className="p-1.5 text-[#D70015] dark:text-[#FF453A] hover:bg-[#D70015]/10 rounded-xs transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex justify-between items-center text-xs font-mono text-[#595959] dark:text-[#9DA3AF]">
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

      {/* Create / Edit Harmony Modal */}
      {(isCreating || editingCombo) && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setIsCreating(false);
            setEditingCombo(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-base font-bold">
                {editingCombo ? `Edit Harmony: ${editingCombo.title}` : 'Create New Color Harmony'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCombo(null);
                }}
                className="text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                  HARMONY TITLE
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Electric Sapphire & Gold"
                  className="px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                    HARMONY TYPE
                  </label>
                  <select
                    value={formData.harmonyType}
                    onChange={(e) => setFormData({ ...formData, harmonyType: e.target.value })}
                    className="px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                  >
                    <option value="Complementary">Complementary</option>
                    <option value="Triadic">Triadic</option>
                    <option value="Analogous">Analogous</option>
                    <option value="Split Complementary">Split Complementary</option>
                    <option value="Warm & Cool">Warm &amp; Cool</option>
                    <option value="Monochromatic">Monochromatic</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                    CONTRAST SCORE
                  </label>
                  <input
                    type="text"
                    value={formData.contrastScore}
                    onChange={(e) => setFormData({ ...formData, contrastScore: e.target.value })}
                    placeholder="e.g. 7.5:1 (AAA)"
                    className="px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Color Role Swatches */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                    COLOR PARTICIPANTS ({formData.colors.length})
                  </label>
                  {formData.colors.length < 5 && (
                    <button
                      type="button"
                      onClick={addColorSlot}
                      className="text-xs text-[#0077A8] dark:text-[#00AEEF] hover:underline font-bold"
                    >
                      + Add Swatch
                    </button>
                  )}
                </div>

                {/* Live Ribbon */}
                <div className="h-10 flex rounded-xs overflow-hidden border border-black/10 dark:border-white/10 shadow-xs mb-2">
                  {formData.colors.map((c, i) => (
                    <div
                      key={i}
                      className="flex-1 h-full flex items-center justify-center text-xs font-mono font-bold text-white drop-shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    >
                      {c.hex}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {formData.colors.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xs"
                    >
                      <input
                        type="color"
                        value={c.hex.startsWith('#') ? c.hex : '#000000'}
                        onChange={(e) => updateColorSwatch(idx, e.target.value)}
                        className="w-8 h-8 rounded-xs cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={c.hex}
                        onChange={(e) => updateColorSwatch(idx, e.target.value)}
                        className="w-20 px-2 py-1 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs font-mono uppercase text-xs"
                      />
                      <input
                        type="text"
                        value={c.role}
                        onChange={(e) => updateColorSwatch(idx, c.hex, e.target.value)}
                        placeholder="Role name..."
                        className="flex-1 px-2 py-1 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs text-xs"
                      />
                      {formData.colors.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeColorSlot(idx)}
                          className="p-1 text-[#D70015] dark:text-[#FF453A] hover:bg-[#D70015]/10 rounded-xs"
                          title="Remove Swatch"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                  DESCRIPTION / USAGE NOTES
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                <KromaButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCombo(null);
                  }}
                >
                  Cancel
                </KromaButton>
                <KromaButton type="submit" variant="filled" size="sm">
                  {editingCombo ? 'Save Harmony' : 'Create Harmony'}
                </KromaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Combo Modal */}
      {inspectCombo && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectCombo(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-md w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold">{inspectCombo.title}</h2>
                <div className="font-mono text-xs text-[#595959] dark:text-[#9DA3AF]">
                  {inspectCombo.harmonyType} · Contrast: {inspectCombo.contrastScore}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectCombo(null)}
                aria-label="Close"
                className="text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Split Swatches Visual */}
            <div className="h-24 flex rounded-xs overflow-hidden border border-black/10 dark:border-white/10 shadow-xs">
              {inspectCombo.colors.map((c, i) => (
                <div
                  key={i}
                  className="flex-1 h-full flex flex-col justify-end p-2"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className="font-mono text-xs font-bold px-1 rounded-xs bg-black/50 text-white truncate text-center">
                    {c.hex}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {inspectCombo.colors.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between p-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs"
                >
                  <span className="font-bold text-[#171717] dark:text-[#F8F8F8]">{c.role || c.name}</span>
                  <span className="text-[#595959] dark:text-[#9DA3AF] font-mono">{c.hex}</span>
                </div>
              ))}
            </div>

            {inspectCombo.description && (
              <p className="text-xs text-[#595959] dark:text-[#9DA3AF] leading-relaxed">
                {inspectCombo.description}
              </p>
            )}

            <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = inspectCombo;
                  setInspectCombo(null);
                  openEdit(target);
                }}
                iconLeft={<Pencil size={12} />}
              >
                Edit
              </KromaButton>
              <KromaButton
                variant="filled"
                size="sm"
                onClick={() => setInspectCombo(null)}
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
