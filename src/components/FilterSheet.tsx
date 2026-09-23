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
          <KromaButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 min-h-[32px] p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            aria-label="Close filters"
          >
            <X size={18} />
          </KromaButton>
        </div>

        {/* Categories */}
        {categoriesList.length > 0 && (
          <div>
            <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase font-semibold mb-2 block">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              <KromaButton
                type="button"
                variant={!filters.category ? 'filled' : 'subtle'}
                size="sm"
                className="text-xs px-2.5 py-1 min-h-[30px]"
                onClick={() => onChange({ ...filters, category: undefined })}
              >
                All
              </KromaButton>
              {categoriesList.map((cat) => (
                <KromaButton
                  key={cat}
                  type="button"
                  variant={filters.category?.toLowerCase() === cat.toLowerCase() ? 'filled' : 'subtle'}
                  size="sm"
                  className="text-xs px-2.5 py-1 min-h-[30px]"
                  onClick={() =>
                    onChange({
                      ...filters,
                      category: filters.category?.toLowerCase() === cat.toLowerCase() ? undefined : cat,
                    })
                  }
                >
                  {cat}
                </KromaButton>
              ))}
            </div>
          </div>
        )}

        {/* Mood */}
        <div>
          <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase font-semibold mb-2 block">
            Mood & Atmosphere
          </span>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <KromaButton
                key={m.id}
                type="button"
                variant={filters.mood === m.id ? 'filled' : 'subtle'}
                size="sm"
                className="text-xs px-2.5 py-1 min-h-[30px]"
                onClick={() =>
                  onChange({
                    ...filters,
                    mood: filters.mood === m.id ? undefined : m.id,
                  })
                }
              >
                {m.name}
              </KromaButton>
            ))}
          </div>
        </div>

        {/* Character */}
        <div>
          <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase font-semibold mb-2 block">
            Gamut Character
          </span>
          <div className="flex flex-wrap gap-1.5">
            {VISUAL_CHARACTERS.map((vc) => (
              <KromaButton
                key={vc.id}
                type="button"
                variant={filters.character === vc.id ? 'filled' : 'subtle'}
                size="sm"
                className="text-xs px-2.5 py-1 min-h-[30px]"
                onClick={() =>
                  onChange({
                    ...filters,
                    character: filters.character === vc.id ? undefined : vc.id,
                  })
                }
              >
                {vc.name}
              </KromaButton>
            ))}
          </div>
        </div>

        {/* Season */}
        <div>
          <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase font-semibold mb-2 block">
            Seasonal Palette
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SEASONS.map((s) => (
              <KromaButton
                key={s.id}
                type="button"
                variant={filters.season === s.id ? 'filled' : 'subtle'}
                size="sm"
                className="text-xs px-2.5 py-1 min-h-[30px]"
                onClick={() =>
                  onChange({
                    ...filters,
                    season: filters.season === s.id ? undefined : s.id,
                  })
                }
              >
                {s.name}
              </KromaButton>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <KromaButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({
                category: undefined,
                mood: undefined,
                character: undefined,
                season: undefined,
                sortBy: 'trending',
              })
            }
            className="text-xs text-[var(--text-tertiary)]"
          >
            Reset All
          </KromaButton>
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
