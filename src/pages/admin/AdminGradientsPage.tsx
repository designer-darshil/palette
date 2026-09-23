import React, { useState, useMemo } from 'react';
import { Search, Trash2, Eye, X, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { GradientItem } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';
import { KromaButton } from '../../components/common/KromaButton';
import { copyToClipboard } from '../../utils/colorUtils';

export const AdminGradientsPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const { gradients, deleteGradient } = useLibraryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [inspectGradient, setInspectGradient] = useState<GradientItem | null>(null);
  const [copiedCss, setCopiedCss] = useState<string | null>(null);

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

  const handleCopyCss = async (gradient: GradientItem) => {
    await copyToClipboard(gradient.css);
    setCopiedCss(gradient.id);
    setTimeout(() => setCopiedCss(null), 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
            CSS Gradient Library
          </h1>
          <p className="text-xs text-[#707070] dark:text-[#9DA3AF] mt-1 font-mono">
            {gradients.length.toLocaleString()} continuous multi-stop CSS gradient specimens.
          </p>
        </div>

        <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
          {filtered.length.toLocaleString()} GRADIENTS MATCHED
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-[#707070]" />
            <input
              type="text"
              placeholder="Search gradients..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] w-64 focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
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
            <tr className="bg-black/[0.02] dark:bg-white/[0.04] border-b border-black/10 dark:border-white/10 font-mono text-[10.5px] text-[#707070] dark:text-[#9DA3AF]">
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
                    className="w-24 h-5 rounded-xs border border-black/10 dark:border-white/10 cursor-pointer"
                    style={{ background: g.css }}
                    onClick={() => setInspectGradient(g)}
                  />
                </td>
                <td className="py-2.5 px-4 font-semibold text-[#171717] dark:text-[#F8F8F8]">
                  {g.title}
                </td>
                <td className="py-2.5 px-4 capitalize font-mono text-[11px] text-[#707070] dark:text-[#9DA3AF]">
                  {g.category}
                </td>
                <td className="py-2.5 px-4 font-mono text-[11px] text-[#707070] dark:text-[#9DA3AF]">
                  {g.stops.map((s) => s.color).join(' → ')}
                </td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyCss(g)}
                      title="Copy CSS"
                      className="p-1 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                    >
                      {copiedCss === g.id ? <Check size={12} className="text-[#34C759]" /> : <Copy size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectGradient(g)}
                      title="Inspect"
                      className="p-1 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(g.id, g.title)}
                      title="Delete"
                      className="p-1 text-[#707070] hover:text-[#FF3B30]"
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
                <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                  {inspectGradient.category} · Slug: {inspectGradient.slug}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectGradient(null)}
                aria-label="Close"
                className="text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Gradient Strip */}
            <div
              className="w-full h-28 rounded-xs border border-black/10 dark:border-white/10"
              style={{ background: inspectGradient.css }}
            />

            <div className="p-3 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs font-mono text-xs break-all">
              {inspectGradient.css}
            </div>

            <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => handleCopyCss(inspectGradient)}
                iconLeft={copiedCss === inspectGradient.id ? <Check size={12} /> : <Copy size={12} />}
              >
                {copiedCss === inspectGradient.id ? 'Copied' : 'Copy CSS'}
              </KromaButton>
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
