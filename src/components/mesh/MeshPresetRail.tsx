import React from 'react';
import { MESH_PRESETS } from '../../utils/meshEngine';
import { Sparkles } from 'lucide-react';

interface MeshPresetRailProps {
  activePreset: string | null;
  onSelectPreset: (presetId: string) => void;
}

export const MeshPresetRail: React.FC<MeshPresetRailProps> = ({
  activePreset,
  onSelectPreset,
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <Sparkles size={14} style={{ color: 'var(--color-primary-text)' }} />
          <span>Curated Color Presets</span>
        </label>
        <span className="text-[11px] text-[var(--text-tertiary)] hidden sm:inline">
          Starting baseline harmonies (fully customizable)
        </span>
      </div>

      <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {MESH_PRESETS.map((preset) => {
          const isSelected = activePreset === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`px-3 py-2 rounded-xs text-xs font-mono whitespace-nowrap flex items-center gap-2.5 transition-all cursor-pointer border select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                isSelected
                  ? 'bg-[var(--bg-surface-2)] shadow-xs font-bold'
                  : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] hover:border-[var(--border-medium)]'
              }`}
              style={{
                borderColor: isSelected ? 'var(--color-primary)' : undefined,
                color: isSelected ? 'var(--text-primary)' : undefined,
                boxShadow: isSelected ? '0 0 0 1px var(--color-primary)' : undefined,
              }}
            >
              {/* Preset Color Swatch Mini-Strip */}
              <div className="flex items-center -space-x-1">
                {preset.colors.slice(0, 3).map((col, idx) => (
                  <span
                    key={idx}
                    className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-xs inline-block"
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>

              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
