import React, { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { getContrastRatio, getContrastRating } from '../utils/colorUtils';

interface AccessibilityMatrixProps {
  colors: { name: string; hex: string; role?: string }[];
}

export const AccessibilityMatrix: React.FC<AccessibilityMatrixProps> = ({ colors }) => {
  const [selectedPair, setSelectedPair] = useState<{ fg: string; bg: string }>({
    fg: colors[1]?.hex || colors[0]?.hex || '#FFFFFF',
    bg: colors[0]?.hex || '#111215',
  });

  const selectedRatio = getContrastRatio(selectedPair.fg, selectedPair.bg);
  const rating = getContrastRating(selectedRatio);

  return (
    <div className="contrast-assessment-box p-4 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
            WCAG 2.1 Contrast Matrix &amp; Accessibility Center
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Pairwise contrast audit across all chromatic swatches. Click any cell to test UI ergonomics.
          </p>
        </div>
        <span className="font-mono text-xs text-[var(--accent-gold)] font-bold">
          WCAG AA (4.5:1) • AAA (7.0:1)
        </span>
      </div>

      {/* Selected Pair Preview Banner */}
      <div
        className="p-4 rounded-sm border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
        style={{
          backgroundColor: selectedPair.bg,
          color: selectedPair.fg,
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div>
          <div className="font-mono text-xs font-semibold opacity-80 uppercase mb-1">
            Active Pairing: FG {selectedPair.fg} ON BG {selectedPair.bg}
          </div>
          <div className="text-lg sm:text-xl font-extrabold tracking-tight">
            The quick brown fox jumps over the lazy dog.
          </div>
          <div className="text-xs opacity-90 mt-0.5">
            Body text readability proof at 14px regular font weight.
          </div>
        </div>

        <div
          className="flex flex-col items-center sm:items-end p-2.5 rounded-xs font-mono"
          style={{
            backgroundColor: selectedPair.fg,
            color: selectedPair.bg,
          }}
        >
          <span className="text-2xl font-black">{selectedRatio}:1</span>
          <span className="text-[10px] font-bold tracking-wider uppercase">
            {rating.passAAA ? 'WCAG AAA PASS' : rating.passAA ? 'WCAG AA PASS' : rating.passAALarge ? 'AA LARGE ONLY' : 'FAIL (<3.0:1)'}
          </span>
        </div>
      </div>

      {/* Interactive Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="p-2 text-[var(--text-tertiary)] font-normal text-[10px]">
                FG \ BG
              </th>
              {colors.map((c, i) => (
                <th key={i} className="p-2 text-center text-[var(--text-primary)]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-3 h-3 rounded-xs border border-black/10" style={{ backgroundColor: c.hex }} />
                    <span className="text-[10px] truncate max-w-[60px]">{c.hex}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map((fgColor, rIdx) => (
              <tr key={rIdx} className="border-b border-[var(--border-subtle)]/50 hover:bg-[var(--bg-surface-2)]/30">
                <td className="p-2 font-bold flex items-center gap-1.5 text-[var(--text-primary)]">
                  <span className="w-3 h-3 rounded-xs border border-black/10" style={{ backgroundColor: fgColor.hex }} />
                  <span className="text-[11px] truncate max-w-[80px]">{fgColor.hex}</span>
                </td>
                {colors.map((bgColor, cIdx) => {
                  if (fgColor.hex.toLowerCase() === bgColor.hex.toLowerCase()) {
                    return (
                      <td key={cIdx} className="p-2 text-center text-[var(--text-tertiary)]">
                        —
                      </td>
                    );
                  }

                  const ratio = getContrastRatio(fgColor.hex, bgColor.hex);
                  const isSelected = selectedPair.fg === fgColor.hex && selectedPair.bg === bgColor.hex;

                  return (
                    <td
                      key={cIdx}
                      onClick={() => setSelectedPair({ fg: fgColor.hex, bg: bgColor.hex })}
                      className={`p-2 text-center cursor-pointer transition-all rounded-xs ${
                        isSelected ? 'ring-2 ring-[var(--accent-gold)] bg-[var(--bg-surface-2)]' : 'hover:bg-[var(--bg-surface-2)]'
                      }`}
                      title={`Click to test ${fgColor.hex} on ${bgColor.hex} (${ratio}:1)`}
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={`px-1.5 py-0.5 rounded-2xs text-[10px] font-bold ${
                            ratio >= 7.0
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : ratio >= 4.5
                              ? 'bg-blue-500/20 text-blue-400'
                              : ratio >= 3.0
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {ratio}:1
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
