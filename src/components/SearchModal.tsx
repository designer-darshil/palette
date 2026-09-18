import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { PaletteCard } from './PaletteCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: RouteType) => void;
}

const POPULAR_QUERIES = [
  'blue',
  'minimal',
  'luxury',
  'warm',
  'nature',
  'fashion',
  'retro',
  'editorial',
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();
  const hexQuery = cleanQuery.startsWith('#') ? cleanQuery : `#${cleanQuery}`;

  const results = cleanQuery
    ? CURATED_PALETTES.filter(
        (p) =>
          p.title.toLowerCase().includes(cleanQuery) ||
          p.category.toLowerCase().includes(cleanQuery) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(cleanQuery)) ||
          ((p.mood as string[] | undefined) || []).some((m) => m.toLowerCase().includes(cleanQuery)) ||
          ((p.style as string[] | undefined) || []).some((s) => s.toLowerCase().includes(cleanQuery)) ||
          p.colors.some(
            (c) =>
              c.name.toLowerCase().includes(cleanQuery) ||
              c.hex.toLowerCase() === hexQuery ||
              c.hex.toLowerCase().includes(cleanQuery)
          )
      ).slice(0, 12)
    : CURATED_PALETTES.slice(0, 8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onNavigate({ path: 'search', q: query.trim() });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--kroma-paper)] text-[var(--kroma-ink)] overflow-y-auto animate-fadeIn">
      <div className="max-w-[1360px] mx-auto px-6 md:px-8 py-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-8 border-b border-[var(--kroma-border)] mb-12">
          <div className="font-sans text-[13px] font-medium tracking-[0.14em] uppercase">
            KROMA SEARCH
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:opacity-70 transition-opacity flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-[var(--kroma-muted)]"
            aria-label="Close search overlay"
          >
            <span>ESC</span>
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Search Input Section */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="font-sans text-2xl md:text-4xl text-[var(--kroma-ink)] font-normal tracking-[-0.03em] mb-6">
            What are you looking for?
          </h2>

          <form onSubmit={handleSubmit} className="relative w-full mb-4">
            <div className="kroma-search-bar h-[44px] bg-[var(--kroma-white)] border border-[var(--kroma-border)] rounded-full px-4 flex items-center gap-3">
              <Search size={15} strokeWidth={1.5} className="text-[var(--kroma-muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search palettes, colors, moods or styles..."
                className="w-full bg-transparent border-none outline-none font-sans text-xs text-[var(--kroma-ink)] placeholder:text-[var(--kroma-muted)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)] p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>

          {/* Popular Searches Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--kroma-muted)] mr-2">
              POPULAR SEARCHES:
            </span>
            {POPULAR_QUERIES.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className={`kroma-tag ${cleanQuery === term ? 'bg-[var(--kroma-ink)] text-[var(--kroma-paper)]' : ''}`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Grid */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[var(--kroma-border)] mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--kroma-muted)]">
              {cleanQuery ? `${results.length} SPECIMENS FOUND FOR "${query}"` : 'CURATED DISCOVERY'}
            </span>
            {cleanQuery && results.length > 0 && (
              <button
                onClick={() => {
                  onNavigate({ path: 'search', q: query });
                  onClose();
                }}
                className="font-mono text-[10px] uppercase tracking-widest text-[var(--kroma-ink)] hover:underline flex items-center gap-1"
              >
                <span>View all results in search catalog</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((palette) => (
              <PaletteCard
                key={palette.id}
                palette={palette}
                onNavigate={(route) => {
                  onNavigate(route);
                  onClose();
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
