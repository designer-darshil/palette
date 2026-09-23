import React, { useState } from 'react';
import { useLibraryData } from '../../context/LibraryDataContext';

export const AdminRelationshipsPage: React.FC = () => {
  const { colors, palettes, combos } = useLibraryData();
  const [selectedColorId, setSelectedColorId] = useState<string>(colors[0]?.id || '');

  const selectedColor = colors.find((c) => c.id === selectedColorId) || colors[0];

  // Find live connections
  const relatedPalettes = selectedColor
    ? palettes.filter((p) =>
        p.colors.some((c) => c.hex.toLowerCase() === selectedColor.hex.toLowerCase())
      ).slice(0, 6)
    : [];

  const relatedCombos = selectedColor
    ? combos.filter((cb) =>
        cb.colors.some((c) => c.hex.toLowerCase() === selectedColor.hex.toLowerCase())
      ).slice(0, 6)
    : [];

  if (!selectedColor) {
    return (
      <div className="p-8 text-center font-mono text-xs text-[#595959] dark:text-[#9DA3AF]">
        No color specimens available in library.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
          Resource Relationship Network
        </h1>
        <p className="text-xs text-[#595959] dark:text-[#9DA3AF] mt-1 font-mono">
          Inspect relational cross-referencing loops connecting Colors ↔ Palettes ↔ Combos ↔ Gradients.
        </p>
      </div>

      {/* Selector Capsule */}
      <div className="p-4 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex items-center gap-4 flex-wrap">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#595959] dark:text-[#9DA3AF]">
          FOCAL COLOR SPECIMEN:
        </span>
        <select
          value={selectedColor.id}
          onChange={(e) => setSelectedColorId(e.target.value)}
          className="px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs font-mono text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
        >
          {colors.slice(0, 50).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.hex})
            </option>
          ))}
        </select>
      </div>

      {/* Network Overview Card */}
      <div className="p-6 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-col gap-6">
        <div className="flex items-center gap-4 pb-4 border-b border-black/5 dark:border-white/5">
          <div
            className="w-12 h-12 rounded-xs border border-black/15 dark:border-white/15 shrink-0 shadow-xs"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <div>
            <h2 className="text-lg font-bold text-[#171717] dark:text-[#F8F8F8]">
              {selectedColor.name}
            </h2>
            <div className="font-mono text-xs text-[#595959] dark:text-[#9DA3AF]">
              {selectedColor.hex} · {selectedColor.oklch}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Calculated Harmonies */}
          <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs flex flex-col justify-between">
            <div>
              <div className="text-xs text-[#946300] dark:text-[#FFD60A] font-bold uppercase tracking-wider mb-2">
                MATHEMATICAL HARMONIES
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#595959] dark:text-[#9DA3AF]">Complementary</span>
                  <span className="font-bold">{selectedColor.complementaryHex}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#595959] dark:text-[#9DA3AF]">Analogous 1</span>
                  <span>{selectedColor.analogousHexes?.[0] || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#595959] dark:text-[#9DA3AF]">Triadic 1</span>
                  <span>{selectedColor.triadicHexes?.[0] || '—'}</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-[#595959] dark:text-[#9DA3AF] pt-2 mt-2 border-t border-black/5 dark:border-white/5">
              Derived on-the-fly from OKLCH polar coords
            </div>
          </div>

          {/* Connected Palettes */}
          <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs flex flex-col justify-between">
            <div>
              <div className="text-xs text-[#0077A8] dark:text-[#00AEEF] font-bold uppercase tracking-wider mb-2">
                CONNECTED PALETTES ({relatedPalettes.length})
              </div>
              {relatedPalettes.length === 0 ? (
                <div className="text-[#595959] dark:text-[#9DA3AF] py-2">No direct palette assignments</div>
              ) : (
                <div className="space-y-1 text-xs">
                  {relatedPalettes.map((p) => (
                    <div key={p.id} className="truncate py-0.5">
                      • {p.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-[#595959] dark:text-[#9DA3AF] pt-2 mt-2 border-t border-black/5 dark:border-white/5">
              Active library sets
            </div>
          </div>

          {/* Connected Combos */}
          <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs flex flex-col justify-between">
            <div>
              <div className="text-xs text-[#D70015] dark:text-[#FF453A] font-bold uppercase tracking-wider mb-2">
                CONNECTED COMBOS ({relatedCombos.length})
              </div>
              {relatedCombos.length === 0 ? (
                <div className="text-[#595959] dark:text-[#9DA3AF] py-2">No direct combo pairings</div>
              ) : (
                <div className="space-y-1 text-xs">
                  {relatedCombos.map((cb) => (
                    <div key={cb.id} className="truncate py-0.5">
                      • {cb.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-[#595959] dark:text-[#9DA3AF] pt-2 mt-2 border-t border-black/5 dark:border-white/5">
              Relational harmony pairs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
