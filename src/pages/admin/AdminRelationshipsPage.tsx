import React, { useState } from 'react';
import { Network } from 'lucide-react';
import { CURATED_COLORS } from '../../data/colors';
import { CURATED_PALETTES } from '../../data/palettes';
import { CURATED_COMBOS } from '../../data/combos';

export const AdminRelationshipsPage: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState(CURATED_COLORS[0]);

  // Find connections
  const relatedPalettes = CURATED_PALETTES.filter((p) =>
    p.colors.some((c) => c.hex.toLowerCase() === selectedColor.hex.toLowerCase())
  ).slice(0, 4);

  const relatedCombos = CURATED_COMBOS.filter((cb) =>
    cb.colors.some((c) => c.hex.toLowerCase() === selectedColor.hex.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
          Resource Relationship Network
        </h1>
        <p className="text-xs text-[#707070] dark:text-[#9DA3AF] mt-1 font-mono">
          Inspect relational cross-referencing loops connecting Colors ↔ Palettes ↔ Combos ↔ Gradients.
        </p>
      </div>

      {/* Selector Capsule */}
      <div className="p-4 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex items-center gap-4 flex-wrap">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#707070] dark:text-[#9DA3AF]">
          FOCAL COLOR SPECIMEN:
        </span>
        <select
          value={selectedColor.id}
          onChange={(e) => {
            const found = CURATED_COLORS.find((c) => c.id === e.target.value);
            if (found) setSelectedColor(found);
          }}
          className="px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs font-mono text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
        >
          {CURATED_COLORS.slice(0, 40).map((c) => (
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
            className="w-12 h-12 rounded-xs border border-black/15 dark:border-white/15 shrink-0"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <div>
            <h2 className="text-lg font-bold text-[#171717] dark:text-[#F8F8F8]">
              {selectedColor.name}
            </h2>
            <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
              {selectedColor.hex} · {selectedColor.oklch}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Calculated Harmonies */}
          <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#FFD60A] font-bold uppercase tracking-wider mb-2">
                MATHEMATICAL HARMONIES
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#707070] dark:text-[#9DA3AF]">Complementary</span>
                  <span className="font-bold">{selectedColor.complementaryHex}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#707070] dark:text-[#9DA3AF]">Analogous 1</span>
                  <span>{selectedColor.analogousHexes[0] || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#707070] dark:text-[#9DA3AF]">Triadic 1</span>
                  <span>{selectedColor.triadicHexes[0] || '—'}</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-[#707070] dark:text-[#9DA3AF] pt-2 mt-2 border-t border-black/5 dark:border-white/5">
              Derived on-the-fly
            </div>
          </div>

          {/* Connected Palettes */}
          <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#00AEEF] font-bold uppercase tracking-wider mb-2">
                CONNECTED PALETTES ({relatedPalettes.length})
              </div>
              {relatedPalettes.length === 0 ? (
                <div className="text-[#707070] dark:text-[#9DA3AF] py-2">No direct palette assignments</div>
              ) : (
                <div className="space-y-1 text-[11px]">
                  {relatedPalettes.map((p) => (
                    <div key={p.id} className="truncate py-0.5">
                      • {p.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-[10px] text-[#707070] dark:text-[#9DA3AF] pt-2 mt-2 border-t border-black/5 dark:border-white/5">
              Active library sets
            </div>
          </div>

          {/* Connected Combos */}
          <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#FF3B30] font-bold uppercase tracking-wider mb-2">
                CONNECTED COMBOS ({relatedCombos.length})
              </div>
              {relatedCombos.length === 0 ? (
                <div className="text-[#707070] dark:text-[#9DA3AF] py-2">No direct combo pairings</div>
              ) : (
                <div className="space-y-1 text-[11px]">
                  {relatedCombos.map((cb) => (
                    <div key={cb.id} className="truncate py-0.5">
                      • {cb.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-[10px] text-[#707070] dark:text-[#9DA3AF] pt-2 mt-2 border-t border-black/5 dark:border-white/5">
              Relational harmony pairs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
