import React, { useState, useMemo } from 'react';
import { Search, Trash2, Eye, Pencil, Plus, X, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { GradientItem } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';
import { KromaButton } from '../../components/common/KromaButton';
import { copyToClipboard } from '../../utils/colorUtils';

interface GradientFormState {
  title: string;
  category: string;
  angle: number;
  stops: {
    color: string;
    position: number;
    name?: string;
  }[];
}

const DEFAULT_FORM: GradientFormState = {
  title: '',
  category: 'atmospheric',
  angle: 135,
  stops: [
    { color: '#00AEEF', position: 0, name: 'Cyan Dawn' },
    { color: '#6366F1', position: 50, name: 'Indigo Core' },
    { color: '#D946EF', position: 100, name: 'Magenta Veil' }
  ]
};

const compileCss = (angle: number, stops: { color: string; position: number }[]) => {
  const stopsStr = stops.map(s => `${s.color} ${s.position}%`).join(', ');
  return `linear-gradient(${angle}deg, ${stopsStr})`;
};

export const AdminGradientsPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const { gradients, addGradient, updateGradient, deleteGradient } = useLibraryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [inspectGradient, setInspectGradient] = useState<GradientItem | null>(null);
  const [editingGradient, setEditingGradient] = useState<GradientItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCss, setCopiedCss] = useState<string | null>(null);
  const [formData, setFormData] = useState<GradientFormState>(DEFAULT_FORM);

  const filtered = useMemo(() => {
    return gradients.filter((g) => {
      if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!g.title.toLowerCase().includes(q) && !g.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [gradients, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove gradient specimen "${title}"?`)) {
      deleteGradient(id);
      logActivity('Deleted Gradient', `Removed gradient "${title}"`);
    }
  };

  const handleCopyCss = async (css: string, id: string) => {
    await copyToClipboard(css);
    setCopiedCss(id);
    setTimeout(() => setCopiedCss(null), 1800);
  };

  const openCreate = () => {
    setFormData(DEFAULT_FORM);
    setIsCreating(true);
  };

  const openEdit = (g: GradientItem) => {
    setEditingGradient(g);
    setFormData({
      title: g.title,
      category: g.category || 'atmospheric',
      angle: g.angle || 135,
      stops: g.stops.map(s => ({ ...s }))
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const css = compileCss(formData.angle, formData.stops);

    if (editingGradient) {
      const updated: GradientItem = {
        ...editingGradient,
        title: formData.title.trim(),
        category: formData.category,
        angle: formData.angle,
        stops: formData.stops,
        css
      };
      updateGradient(updated);
      logActivity('Updated Gradient', `Modified gradient specimen "${updated.title}"`);
      setEditingGradient(null);
    } else {
      const newGrad: GradientItem = {
        id: `grad-custom-${Date.now()}`,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        title: formData.title.trim(),
        type: 'linear',
        angle: formData.angle,
        stops: formData.stops,
        css,
        category: formData.category,
        tags: [formData.category, 'custom-gradient']
      };
      addGradient(newGrad);
      logActivity('Created Gradient', `Configured new gradient specimen "${newGrad.title}"`);
      setIsCreating(false);
    }
  };

  const updateStop = (index: number, color: string, position?: number) => {
    setFormData(prev => {
      const stops = [...prev.stops];
      stops[index] = {
        ...stops[index],
        color,
        position: position !== undefined ? position : stops[index].position
      };
      return { ...prev, stops };
    });
  };

  const addStop = () => {
    if (formData.stops.length >= 6) return;
    const lastStop = formData.stops[formData.stops.length - 1];
    const prevPosition = lastStop ? Math.min(95, lastStop.position + 15) : 50;
    setFormData(prev => ({
      ...prev,
      stops: [
        ...prev.stops,
        { color: '#F59E0B', position: prevPosition, name: 'Specimen Accent' }
      ]
    }));
  };

  const removeStop = (index: number) => {
    if (formData.stops.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  const currentPreviewCss = compileCss(formData.angle, formData.stops);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
            CSS Gradient Library
          </h1>
          <p className="text-xs text-[#595959] dark:text-[#9DA3AF] mt-1 font-mono">
            {gradients.length.toLocaleString()} continuous multi-stop CSS gradient specimens.
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
            New Gradient
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
              placeholder="Search gradients..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] dark:placeholder-[#9DA3AF] w-64 focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
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
            <option value="all">All Atmospheres</option>
            <option value="atmospheric">Atmospheric</option>
            <option value="sunset">Sunset</option>
            <option value="holographic">Holographic</option>
            <option value="deep-space">Deep Space</option>
            <option value="organic">Organic</option>
            <option value="editorial-metal">Editorial Metal</option>
          </select>
        </div>
      </div>

      {/* Editorial Table */}
      <div className="admin-table-container">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-black/[0.02] dark:bg-white/[0.04] border-b border-black/10 dark:border-white/10 font-mono text-xs text-[#595959] dark:text-[#9DA3AF]">
              <th className="py-2.5 px-4 font-semibold">PREVIEW STRIP</th>
              <th className="py-2.5 px-4 font-semibold">SPECIMEN TITLE</th>
              <th className="py-2.5 px-4 font-semibold">CATEGORY</th>
              <th className="py-2.5 px-4 font-semibold">STOPS SEQUENCE</th>
              <th className="py-2.5 px-4 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {paginated.map((g) => (
              <tr
                key={g.id}
                className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-2.5 px-4">
                  <div
                    className="w-24 h-5 rounded-xs border border-black/10 dark:border-white/10 cursor-pointer shadow-xs"
                    style={{ background: g.css }}
                    onClick={() => setInspectGradient(g)}
                  />
                </td>
                <td className="py-2.5 px-4 font-semibold text-[#171717] dark:text-[#F8F8F8]">
                  {g.title}
                </td>
                <td className="py-2.5 px-4 capitalize font-mono text-xs text-[#595959] dark:text-[#9DA3AF]">
                  {g.category}
                </td>
                <td className="py-2.5 px-4 font-mono text-xs text-[#595959] dark:text-[#9DA3AF]">
                  {g.stops.map((s) => s.color).join(' → ')}
                </td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyCss(g.css, g.id)}
                      title="Copy CSS"
                      className="p-1.5 text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8] transition-colors"
                    >
                      {copiedCss === g.id ? <Check size={13} className="text-[#1B8738] dark:text-[#34C759]" /> : <Copy size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(g)}
                      title="Edit Gradient"
                      className="p-1.5 text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8] transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectGradient(g)}
                      title="Inspect"
                      className="p-1.5 text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8] transition-colors"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(g.id, g.title)}
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

      {/* Create / Edit Gradient Modal */}
      {(isCreating || editingGradient) && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setIsCreating(false);
            setEditingGradient(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-base font-bold">
                {editingGradient ? `Edit Gradient: ${editingGradient.title}` : 'Create New CSS Gradient'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingGradient(null);
                }}
                className="text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                  GRADIENT SPECIMEN TITLE
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Neo-Tokyo Dusk"
                  className="px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                    ATMOSPHERE CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                  >
                    <option value="atmospheric">Atmospheric</option>
                    <option value="sunset">Sunset</option>
                    <option value="holographic">Holographic</option>
                    <option value="deep-space">Deep Space</option>
                    <option value="organic">Organic</option>
                    <option value="editorial-metal">Editorial Metal</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                    ANGLE ({formData.angle}°)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={formData.angle}
                    onChange={(e) => setFormData({ ...formData, angle: Number(e.target.value) })}
                    className="w-full h-8"
                  />
                </div>
              </div>

              {/* Live Preview Strip */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                  LIVE SPECIMEN PREVIEW
                </label>
                <div
                  className="w-full h-24 rounded-xs border border-black/10 dark:border-white/10 shadow-xs"
                  style={{ background: currentPreviewCss }}
                />
              </div>

              {/* Multi-stop Editor */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                    GRADIENT STOPS ({formData.stops.length})
                  </label>
                  {formData.stops.length < 6 && (
                    <button
                      type="button"
                      onClick={addStop}
                      className="text-xs text-[#0077A8] dark:text-[#00AEEF] hover:underline font-bold"
                    >
                      + Add Stop
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {formData.stops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xs"
                    >
                      <input
                        type="color"
                        value={stop.color.startsWith('#') ? stop.color : '#000000'}
                        onChange={(e) => updateStop(idx, e.target.value)}
                        className="w-8 h-8 rounded-xs cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={stop.color}
                        onChange={(e) => updateStop(idx, e.target.value)}
                        className="w-24 px-2 py-1 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs font-mono uppercase text-xs"
                      />
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-xs text-[#595959] dark:text-[#9DA3AF]">Pos:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={stop.position}
                          onChange={(e) => updateStop(idx, stop.color, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs font-mono text-xs"
                        />
                        <span className="text-xs text-[#595959] dark:text-[#9DA3AF]">%</span>
                      </div>
                      {formData.stops.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeStop(idx)}
                          className="p-1 text-[#D70015] dark:text-[#FF453A] hover:bg-[#D70015]/10 rounded-xs"
                          title="Remove Stop"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated CSS display */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#595959] dark:text-[#9DA3AF]">
                    GENERATED CSS
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyCss(currentPreviewCss, 'form-css')}
                    className="text-xs text-[#0077A8] dark:text-[#00AEEF] hover:underline"
                  >
                    {copiedCss === 'form-css' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs font-mono break-all text-[#171717] dark:text-[#F8F8F8]">
                  {currentPreviewCss}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                <KromaButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingGradient(null);
                  }}
                >
                  Cancel
                </KromaButton>
                <KromaButton type="submit" variant="filled" size="sm">
                  {editingGradient ? 'Save Gradient' : 'Create Gradient'}
                </KromaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Gradient Modal */}
      {inspectGradient && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectGradient(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-md w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold">{inspectGradient.title}</h2>
                <div className="font-mono text-xs text-[#595959] dark:text-[#9DA3AF]">
                  {inspectGradient.category} · Slug: {inspectGradient.slug}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectGradient(null)}
                aria-label="Close"
                className="text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Gradient Strip */}
            <div
              className="w-full h-28 rounded-xs border border-black/10 dark:border-white/10 shadow-xs"
              style={{ background: inspectGradient.css }}
            />

            <div className="p-3 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs font-mono text-xs break-all">
              {inspectGradient.css}
            </div>

            <div className="space-y-1 font-mono text-xs">
              {inspectGradient.stops.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center p-1.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: s.color }} />
                    <span className="font-semibold text-[#171717] dark:text-[#F8F8F8]">{s.color}</span>
                  </div>
                  <span className="text-[#595959] dark:text-[#9DA3AF]">{s.position}%</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10">
              <div className="flex gap-2">
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyCss(inspectGradient.css, inspectGradient.id)}
                  iconLeft={copiedCss === inspectGradient.id ? <Check size={12} /> : <Copy size={12} />}
                >
                  {copiedCss === inspectGradient.id ? 'Copied' : 'Copy CSS'}
                </KromaButton>
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const target = inspectGradient;
                    setInspectGradient(null);
                    openEdit(target);
                  }}
                  iconLeft={<Pencil size={12} />}
                >
                  Edit
                </KromaButton>
              </div>
              <KromaButton
                variant="filled"
                size="sm"
                onClick={() => setInspectGradient(null)}
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
