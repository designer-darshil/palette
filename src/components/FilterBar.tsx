import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { USE_CASES, MOODS, VISUAL_CHARACTERS, SEASONS } from '../utils/taxonomy';
import { FilterSheet } from './FilterSheet';
import { KromaButton } from './common/KromaButton';

export interface FilterState {
  category?: string;
  mood?: string;
  character?: string;
  season?: string;
  sortBy?: 'trending' | 'newest' | 'saved' | 'contrast';
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  showCategories?: boolean;
  categoriesList?: string[];
  totalResults?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  showCategories = true,
  categoriesList = [],
  totalResults,
}) => {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const hasActiveFilters = Boolean(
    filters.category || filters.mood || filters.character || filters.season || (filters.sortBy && filters.sortBy !== 'trending')
  );

  const clearAll = () => {
    onChange({
      category: undefined,
      mood: undefined,
      character: undefined,
      season: undefined,
      sortBy: 'trending',
    });
  };

  return (
    <div className="flex flex-col gap-2.5 mb-6">
      {/* Desktop Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile Filter Button */}
          <KromaButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMobileSheetOpen(true)}
            className="md:hidden text-xs flex items-center gap-1.5"
            iconLeft={<SlidersHorizontal size={13} />}
          >
            <span>Filters {hasActiveFilters && '•'}</span>
          </KromaButton>

          {/* Desktop Categories / Use Cases */}
          {showCategories && categoriesList.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
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
          )}

          {/* Desktop Taxonomy Mood Select */}
          <div className="hidden md:flex items-center gap-2">
            <select
              value={filters.mood || ''}
              onChange={(e) => onChange({ ...filters, mood: e.target.value || undefined })}
              className="text-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xs px-2.5 py-1"
            >
              <option value="">Mood (All)</option>
              {MOODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={filters.character || ''}
              onChange={(e) => onChange({ ...filters, character: e.target.value || undefined })}
              className="text-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xs px-2.5 py-1"
            >
              <option value="">Gamut Character</option>
              {VISUAL_CHARACTERS.map((vc) => (
                <option key={vc.id} value={vc.id}>
                  {vc.name}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <KromaButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-[var(--accent-gold)] flex items-center gap-1 font-mono min-h-[30px] p-1.5"
              iconLeft={<X size={12} />}
            >
              <span>Reset</span>
            </KromaButton>
          )}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-3">
          {totalResults !== undefined && (
            <span className="font-mono text-xs text-[var(--text-tertiary)] hidden sm:inline">
              {totalResults} {totalResults === 1 ? 'specimen' : 'specimens'}
            </span>
          )}

          <select
            value={filters.sortBy || 'trending'}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="text-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xs px-2.5 py-1"
          >
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="saved">Most Saved</option>
            <option value="contrast">Highest Contrast</option>
          </select>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <FilterSheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        filters={filters}
        onChange={onChange}
        categoriesList={categoriesList}
      />
    </div>
  );
};
