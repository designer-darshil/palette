import React from 'react';
import { AntigravityConfig, ANTIGRAVITY_PRESETS } from '../../utils/antigravityEngine';
import { Sparkles, Check, Play } from 'lucide-react';

interface PresetSelectorProps {
  activePreset: string | null;
  onSelectPreset: (presetId: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ activePreset, onSelectPreset }) => {
  return (
    <section id="presets-gallery" className="w-full flex flex-col gap-4">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
          <Sparkles size={18} className="text-amber-400" />
          <span>Curated Motion Presets</span>
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
          Select a deterministic baseline physics profile. Parameters remain fully editable after selection.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {ANTIGRAVITY_PRESETS.map((preset) => {
          const isSelected = activePreset === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all active:scale-[0.99] ${
                isSelected
                  ? 'bg-[var(--bg-surface-2)] border-blue-500 shadow-md ring-1 ring-blue-500/50'
                  : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-2)]/60'
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                    {preset.name}
                  </span>
                  {isSelected ? (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1 font-bold">
                      <Check size={10} /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                      gy: {preset.config.gravityY}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono text-[var(--text-secondary)]">
                  {preset.tagline}
                </div>

                <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)] pt-2 border-t border-[var(--border-subtle)] w-full">
                <span>m: {preset.config.mass}kg</span>
                <span>bounce: {((preset.config.restitution || 0) * 100).toFixed(0)}%</span>
                <span>damp: {((preset.config.damping || 0) * 100).toFixed(1)}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
