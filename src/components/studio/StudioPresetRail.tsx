import React from 'react';

export interface StudioPresetItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  previewNode: React.ReactNode;
}

interface StudioPresetRailProps {
  title?: string;
  presets: StudioPresetItem[];
  selectedPresetId?: string;
  onSelectPreset: (presetId: string) => void;
  columns?: 2 | 3 | 4;
}

export const StudioPresetRail: React.FC<StudioPresetRailProps> = ({
  title = 'PRESETS',
  presets,
  selectedPresetId,
  onSelectPreset,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3.5 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
          {title}
        </span>
        <span className="font-mono text-[9px] text-[var(--text-tertiary)]">
          {presets.length} Presets
        </span>
      </div>

      <div className="p-2.5 grid grid-cols-2 gap-2 overflow-y-auto max-h-[calc(100vh-140px)]">
        {presets.map((p) => {
          const isSelected = p.id === selectedPresetId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPreset(p.id)}
              className={`group flex flex-col rounded-xs border text-left p-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[var(--bg-surface-2)] border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                  : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-3)]'
              }`}
              title={p.description || p.name}
            >
              {/* Visual Thumbnail Container */}
              <div className="w-full h-14 rounded-xs overflow-hidden bg-[var(--bg-canvas)] border border-[var(--border-subtle)] relative flex items-center justify-center pointer-events-none mb-1.5">
                {p.previewNode}
              </div>

              {/* Title & Metadata */}
              <div className="flex items-center justify-between w-full">
                <span className={`font-mono text-[10px] font-bold truncate ${isSelected ? 'text-[var(--color-primary-text)]' : 'text-[var(--text-primary)] group-hover:text-[var(--color-primary)]'}`}>
                  {p.name}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0 ml-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
