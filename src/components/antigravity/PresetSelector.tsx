import React from 'react';
import { ANTIGRAVITY_PRESETS } from '../../utils/antigravityEngine';
import { Sparkles, Check } from 'lucide-react';

interface PresetSelectorProps {
  activePreset: string | null;
  onSelectPreset: (presetId: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ activePreset, onSelectPreset }) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <Sparkles size={14} style={{ color: 'var(--color-primary-text)' }} />
          <span>Curated Motion Presets</span>
        </label>
        <span className="text-[11px] text-[var(--text-tertiary)] hidden sm:inline">
          Deterministic baseline physics profiles
        </span>
      </div>

      <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {ANTIGRAVITY_PRESETS.map((preset) => {
          const isSelected = activePreset === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`px-3.5 py-2 rounded-xs text-xs font-mono whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
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
              {isSelected ? (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] flex-shrink-0 opacity-40" />
              )}
              <span>{preset.name}</span>
              <span className="text-[10px] text-[var(--text-tertiary)] opacity-80">
                {preset.config.gravityY !== undefined ? `(gy: ${preset.config.gravityY > 0 ? `+${preset.config.gravityY}` : preset.config.gravityY})` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
