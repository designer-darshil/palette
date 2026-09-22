import React from 'react';
import { X, Check } from 'lucide-react';
import { FilterState } from './FilterBar';
import { MOODS, VISUAL_CHARACTERS, SEASONS } from '../utils/taxonomy';
import { KromaButton } from './common/KromaButton';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  categoriesList?: string[];
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  categoriesList = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs md:hidden">
      <div
        className="w-full bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)] rounded-t-xl p-5 max-h-[85dvh] overflow-y-auto flex flex-col gap-5 shadow-2xl"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 20px)' }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[var(--text-primary)]">Refine Spectrum</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories */}
        {categoriesList.length > 0 && (
          <div>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase font-semibold mb-2 block">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                className={`filter-pill text-xs px-2.5 py-1 ${!filters.category ? 'active' : ''}`}
                onClick={() => onChange({ ...filters, category: undefined })}
              >
                All
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill text-xs px-2.5 py-1 ${filters.category?.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      category: filters.category?.toLowerCase() === cat.toLowerCase() ? undefined : cat,
                    })
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mood */}
        <div>
          <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase font-semibold mb-2 block">
            Mood & Atmosphere
          </span>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m.id}
                className={`filter-pill text-xs px-2.5 py-1 ${filters.mood === m.id ? 'active' : ''}`}
                onClick={() =>
                  onChange({
                    ...filters,
                    mood: filters.mood === m.id ? undefined : m.id,
                  })
                }
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Character */}
        <div>
          <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase font-semibold mb-2 block">
            Gamut Character
          </span>
          <div className="flex flex-wrap gap-1.5">
            {VISUAL_CHARACTERS.map((vc) => (
              <button
                key={vc.id}
                className={`filter-pill text-xs px-2.5 py-1 ${filters.character === vc.id ? 'active' : ''}`}
                onClick={() =>
                  onChange({
                    ...filters,
                    character: filters.character === vc.id ? undefined : vc.id,
                  })
                }
              >
                {vc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Season */}
        <div>
          <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase font-semibold mb-2 block">
            Seasonal Palette
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SEASONS.map((s) => (
              <button
                key={s.id}
                className={`filter-pill text-xs px-2.5 py-1 ${filters.season === s.id ? 'active' : ''}`}
                onClick={() =>
                  onChange({
                    ...filters,
                    season: filters.season === s.id ? undefined : s.id,
                  })
                }
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            onClick={() =>
              onChange({
                category: undefined,
                mood: undefined,
                character: undefined,
                season: undefined,
                sortBy: 'trending',
              })
            }
            className="text-xs text-[var(--text-tertiary)] hover:underline"
          >
            Reset All
          </button>
          <KromaButton
            onClick={onClose}
            variant="filled"
            size="sm"
            iconLeft={<Check size={14} />}
          >
            Apply Filters
          </KromaButton>
        </div>
      </div>
    </div>
  );
};
