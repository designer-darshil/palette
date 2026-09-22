import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Palette, Layers, Wand2, Sparkles, ArrowRight, Grid, Users } from 'lucide-react';
import { CURATED_COLORS } from '../data/colors';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_COMBOS } from '../data/combos';
import { CURATED_GRADIENTS } from '../data/gradients';
import { CURATED_PATTERNS } from '../data/patterns';
import { CURATED_CREATORS } from '../data/creators';
import { CURATED_COLLECTIONS } from '../data/collections';
import { RouteType } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: RouteType) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rawQ = query.trim().toLowerCase();
  const hexQ = rawQ.startsWith('#') ? rawQ : `#${rawQ}`;

  const matchedColors = rawQ
    ? CURATED_COLORS.filter(
        (c) =>
          c.name.toLowerCase().includes(rawQ) ||
          c.hex.toLowerCase().includes(rawQ) ||
          c.hex.toLowerCase() === hexQ ||
          c.family.toLowerCase().includes(rawQ) ||
          c.hueGroup.toLowerCase().includes(rawQ) ||
          c.tags.some((t) => t.toLowerCase().includes(rawQ))
      ).slice(0, 4)
    : [];

  const matchedPalettes = rawQ
    ? CURATED_PALETTES.filter(
        (p) =>
          p.title.toLowerCase().includes(rawQ) ||
          p.category.toLowerCase().includes(rawQ) ||
          p.tags.some((t) => t.toLowerCase().includes(rawQ)) ||
          p.colors.some(
            (c) =>
              c.hex.toLowerCase().includes(rawQ) ||
              c.hex.toLowerCase() === hexQ ||
              c.name.toLowerCase().includes(rawQ)
          )
      ).slice(0, 3)
    : [];

  const matchedCollections = rawQ
    ? CURATED_COLLECTIONS.filter(
        (col) =>
          col.title.toLowerCase().includes(rawQ) ||
          col.description.toLowerCase().includes(rawQ) ||
          col.tags.some((t) => t.toLowerCase().includes(rawQ))
      ).slice(0, 2)
    : [];

  const matchedPatterns = rawQ
    ? CURATED_PATTERNS.filter(
        (pat) =>
          pat.title.toLowerCase().includes(rawQ) ||
          pat.type.toLowerCase().includes(rawQ) ||
          pat.tags.some((t) => t.toLowerCase().includes(rawQ))
      ).slice(0, 2)
    : [];

  const matchedCreators = rawQ
    ? CURATED_CREATORS.filter(
        (cr) =>
          cr.name.toLowerCase().includes(rawQ) ||
          cr.username.toLowerCase().includes(rawQ) ||
          cr.specialties.some((s) => s.toLowerCase().includes(rawQ))
      ).slice(0, 2)
    : [];

  const matchedGradients = rawQ
    ? CURATED_GRADIENTS.filter(
        (g) =>
          g.title.toLowerCase().includes(rawQ) ||
          g.category.toLowerCase().includes(rawQ) ||
          g.tags.some((t) => t.toLowerCase().includes(rawQ))
      ).slice(0, 2)
    : [];

  const studioToolsList = [
    {
      id: 'color-name-finder',
      name: 'Color Name Finder',
      desc: 'Identify official names & nearest perceptual match for any HEX',
      route: { path: 'color-name-finder' as const },
    },
    {
      id: 'contrast-checker',
      name: 'Contrast Checker',
      desc: 'WCAG 2.1 compliance ratio & remediation tokens',
      route: { path: 'contrast-checker' as const },
    },
    {
      id: 'ramps',
      name: 'Ramps Studio',
      desc: 'OKLCH color scales & semantic design tokens',
      route: { path: 'ramps' as const },
    },
    {
      id: 'mesh',
      name: 'Mesh Gradient Studio',
      desc: 'Radial mesh gradient generative canvas',
      route: { path: 'mesh' as const },
    },
    {
      id: 'antigravity',
      name: 'Antigravity Studio',
      desc: 'Kinetic physics simulation & motion token exports',
      route: { path: 'antigravity' as const },
    },
    {
      id: 'pattern-studio',
      name: 'Pattern Studio',
      desc: 'Algorithmic geometric textures & SVG wallpaper generator',
      route: { path: 'pattern-studio' as const },
    },
    {
      id: 'extract-from-image',
      name: 'Extract from Image',
      desc: 'Sample and extract color systems from photos',
      route: { path: 'extract-from-image' as const },
    },
  ];

  const matchedTools = rawQ
    ? studioToolsList.filter(
        (t) =>
          t.name.toLowerCase().includes(rawQ) ||
          t.desc.toLowerCase().includes(rawQ) ||
          t.id.includes(rawQ)
      )
    : [];

  const allResults: { type: string; label: string; route: RouteType }[] = [
    ...matchedTools.map((t) => ({
      type: 'tool',
      label: t.name,
      route: t.route,
    })),
    ...matchedColors.map((c) => ({
      type: 'color',
      label: `${c.name} (${c.hex})`,
      route: { path: 'color-detail' as const, slug: c.slug },
    })),
    ...matchedPalettes.map((p) => ({
      type: 'palette',
      label: p.title,
      route: { path: 'palette-detail' as const, slug: p.slug },
    })),
    ...matchedCollections.map((col) => ({
      type: 'collection',
      label: col.title,
      route: { path: 'collection-detail' as const, slug: col.slug },
    })),
    ...matchedPatterns.map((pat) => ({
      type: 'pattern',
      label: pat.title,
      route: { path: 'pattern-detail' as const, slug: pat.slug },
    })),
    ...matchedCreators.map((cr) => ({
      type: 'creator',
      label: `${cr.name} (@${cr.username})`,
      route: { path: 'creator-detail' as const, username: cr.username },
    })),
    ...matchedGradients.map((g) => ({
      type: 'gradient',
      label: g.title,
      route: { path: 'gradient-detail' as const, slug: g.slug },
    })),
  ];

  const handleSelect = (route: RouteType) => {
    onNavigate(route);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (allResults.length > 0 ? (prev + 1) % allResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (allResults.length > 0 ? (prev - 1 + allResults.length) % allResults.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex].route);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="search-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search Library"
        onKeyDown={handleKeyDown}
      >
        <div className="search-dialog-header">
          <Search size={18} color="#9DA3AF" />
          <input
            ref={inputRef}
            type="text"
            className="search-dialog-input"
            placeholder="Search by color name, HEX code, or mood..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button onClick={onClose} aria-label="Close search">
            <X size={18} color="#9DA3AF" />
          </button>
        </div>

        <div className="search-dialog-results">
          {rawQ && allResults.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9DA3AF', fontSize: '0.9rem' }}>
              No specimens found matching &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Quick Suggestions when empty: Color pills with actual colors */}
          {!rawQ && (
            <div className="p-4 flex flex-col gap-3">
              <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                POPULAR CHROMATIC SEARCHES
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'TERRACOTTA', hex: '#E07A5F' },
                  { name: 'SAGE', hex: '#81B29A' },
                  { name: 'ELECTRIC BLUE', hex: '#00AEEF' },
                  { name: 'WARM NEUTRALS', hex: '#D4A373' },
                  { name: 'CYBERPUNK', hex: '#F72585' },
                ].map((pill) => (
                  <button
                    key={pill.name}
                    onClick={() => setQuery(pill.name.toLowerCase())}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 bg-white dark:bg-[#1C1E24] text-xs font-sans font-semibold tracking-wider uppercase text-neutral-800 dark:text-neutral-200 transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pill.hex }} />
                    <span>{pill.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Studios & Tools */}
          {matchedTools.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs text-[var(--text-tertiary)] font-sans font-semibold tracking-tight">
                Studio Engines &amp; Utilities
              </div>
              {matchedTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => handleSelect(tool.route)}
                  className="search-result-item cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded-xs bg-[var(--bg-surface-3)] text-teal-400">
                      <Wand2 size={13} />
                    </span>
                    <span className="font-bold text-xs text-[var(--text-primary)]">{tool.name}</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">{tool.desc}</span>
                  </div>
                  <ArrowRight size={13} className="text-[var(--text-tertiary)]" />
                </div>
              ))}
            </div>
          )}

          {/* Colors */}
          {matchedColors.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs text-[var(--text-tertiary)] font-sans font-semibold tracking-tight">
                Colors
              </div>
              {matchedColors.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelect({ path: 'color-detail', slug: c.slug })}
                  className="search-result-item"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-xs border border-black/20" style={{ backgroundColor: c.hex }} />
                    <span className="font-bold text-xs text-[var(--text-primary)]">{c.name}</span>
                    <span className="font-mono text-[11px] text-[var(--text-secondary)]">{c.hex}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{c.family}</span>
                </div>
              ))}
            </div>
          )}

          {/* Palettes */}
          {matchedPalettes.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs text-[var(--text-tertiary)] font-sans font-semibold tracking-tight">
                Palettes
              </div>
              {matchedPalettes.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect({ path: 'palette-detail', slug: p.slug })}
                  className="search-result-item"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-3.5 rounded-xs overflow-hidden flex">
                      {p.colors.map((col, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: col.hex }} />
                      ))}
                    </div>
                    <span className="font-bold text-xs text-[var(--text-primary)]">{p.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">{p.category}</span>
                </div>
              ))}
            </div>
          )}

          {/* Collections */}
          {matchedCollections.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs text-[var(--text-tertiary)] font-sans font-semibold tracking-tight">
                Collections
              </div>
              {matchedCollections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => handleSelect({ path: 'collection-detail', slug: col.slug })}
                  className="search-result-item"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers size={14} className="text-[var(--color-primary)]" />
                    <span className="font-bold text-xs text-[var(--text-primary)]">{col.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{col.items.length} items</span>
                </div>
              ))}
            </div>
          )}

          {/* Patterns */}
          {matchedPatterns.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs text-[var(--text-tertiary)] font-sans font-semibold tracking-tight">
                Patterns
              </div>
              {matchedPatterns.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => handleSelect({ path: 'pattern-detail', slug: pat.slug })}
                  className="search-result-item"
                >
                  <div className="flex items-center gap-2.5">
                    <Grid size={14} className="text-[var(--accent-gold)]" />
                    <span className="font-bold text-xs text-[var(--text-primary)]">{pat.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">{pat.type}</span>
                </div>
              ))}
            </div>
          )}

          {/* Creators */}
          {matchedCreators.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs text-[var(--text-tertiary)] font-sans font-semibold tracking-tight">
                Creators
              </div>
              {matchedCreators.map((cr) => (
                <div
                  key={cr.id}
                  onClick={() => handleSelect({ path: 'creator-detail', username: cr.username })}
                  className="search-result-item"
                >
                  <div className="flex items-center gap-2.5">
                    <Users size={14} className="text-emerald-400" />
                    <span className="font-bold text-xs text-[var(--text-primary)]">{cr.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">@{cr.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
