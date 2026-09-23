import React, { useState, useMemo } from 'react';
import { Search, Trash2, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ComboItem } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';
import { KromaButton } from '../../components/common/KromaButton';

export const AdminCombosPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const { combos, deleteCombo } = useLibraryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHarmony, setSelectedHarmony] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [inspectCombo, setInspectCombo] = useState<ComboItem | null>(null);

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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
            Color Harmonies &amp; Combos
          </h1>
          <p className="text-xs text-[#707070] dark:text-[#9DA3AF] mt-1 font-mono">
            {combos.length.toLocaleString()} relational pairings with surface roles and WCAG AAA compliance.
          </p>
        </div>

        <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
          {filtered.length.toLocaleString()} COMBOS MATCHED
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-[#707070]" />
            <input
              type="text"
              placeholder="Search combos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] w-64 focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
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
            <tr className="bg-black/[0.02] dark:bg-white/[0.04] border-b border-black/10 dark:border-white/10 font-mono text-[10.5px] text-[#707070] dark:text-[#9DA3AF]">
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
                    className="flex w-20 h-5 rounded-xs overflow-hidden border border-black/10 dark:border-white/10 cursor-pointer"
                    onClick={() => setInspectCombo(combo)}
                  >
                    {combo.colors.map((c, i) => (
                      <div
                        key={i}
                        className="flex-1 h-full"
                        style={{ backgroundColor: c.hex }}
                        title={`${c.role}: ${c.hex}`}
                      />
                    ))}
                  </div>
                </td>
                <td className="py-2.5 px-4 font-semibold text-[#171717] dark:text-[#F8F8F8]">
                  {combo.title}
                </td>
                <td className="py-2.5 px-4 font-mono text-[11px] text-[#707070] dark:text-[#9DA3AF]">
                  {combo.harmonyType}
                </td>
                <td className="py-2.5 px-4 font-mono text-[11px]">
                  <span className="px-1.5 py-0.5 rounded-xs bg-[#34C759]/10 text-[#34C759] font-bold">
                    {combo.contrastScore}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setInspectCombo(combo)}
                      title="Inspect"
                      className="p-1 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(combo.id, combo.title)}
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
                <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                  {inspectCombo.harmonyType} · Contrast: {inspectCombo.contrastScore}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectCombo(null)}
                aria-label="Close"
                className="text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Split Swatches Visual */}
            <div className="h-24 flex rounded-xs overflow-hidden border border-black/10 dark:border-white/10">
              {inspectCombo.colors.map((c, i) => (
                <div
                  key={i}
                  className="flex-1 h-full flex flex-col justify-end p-2"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className="font-mono text-[9px] font-bold px-1 rounded-xs bg-black/40 text-white truncate text-center">
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
                  <span className="font-bold text-[#171717] dark:text-[#F8F8F8]">{c.role}</span>
                  <span className="text-[#707070] dark:text-[#9DA3AF]">{c.hex}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-black/10 dark:border-white/10">
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
