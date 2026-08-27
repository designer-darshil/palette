import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Copy,
  Check,
  Share2,
  Bookmark,
  Shuffle,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { RouteType, ColorItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import {
  hexToRgb,
  hexToHsl,
  hexToOklch,
  getTextColorForBackground,
  copyToClipboard,
} from '../utils/colorUtils';
import {
  findClosestColorMatches,
  searchColorsByName,
  ColorMatchResult,
} from '../utils/colorNameFinder';
import { createPaletteSlug } from '../utils/canonicalResourceUtils';

interface ColorNameFinderPageProps {
  initialHex?: string;
  onNavigate: (route: RouteType) => void;
}

export const ColorNameFinderPage: React.FC<ColorNameFinderPageProps> = ({
  initialHex,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved } = useSaved();
  const { colors: libraryColors, palettes, addPalette } = useLibraryData();

  // Active HEX state (default to high-interest specimen #10288C Celestial Cobalt)
  const [currentHex, setCurrentHex] = useState<string>(() => {
    if (initialHex) {
      const clean = initialHex.startsWith('#') ? initialHex : `#${initialHex}`;
      if (/^#[0-9A-F]{6}$/i.test(clean)) return clean.toUpperCase();
    }
    return '#10288C';
  });

  const [hexInput, setHexInput] = useState<string>(currentHex);
  const [nameSearchQuery, setNameSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'single' | 'palette'>('single');

  // History State
  const [history, setHistory] = useState<{ name: string; hex: string }[]>(() => {
    try {
      const raw = localStorage.getItem('kroma_color_finder_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Sync valid input to currentHex
  const handleHexInputChange = (val: string) => {
    setHexInput(val);
    const clean = val.startsWith('#') ? val.toUpperCase() : `#${val.toUpperCase()}`;
    if (/^#[0-9A-F]{6}$/i.test(clean)) {
      setCurrentHex(clean);
    }
  };

  // Sync URL query state
  useEffect(() => {
    const rawHex = currentHex.replace('#', '');
    const newUrl = `/color-name-finder?hex=${rawHex}`;
    if (window.location.search !== `?hex=${rawHex}`) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [currentHex]);

  // Find matches using perceptual distance engine
  const matches = useMemo(() => {
    return findClosestColorMatches(currentHex, libraryColors, 6);
  }, [currentHex, libraryColors]);

  const primaryMatch = matches[0] || {
    name: 'Chromatic Tone',
    hex: currentHex,
    slug: 'chromatic-tone',
    source: 'KROMA Curated',
    deltaE: 0,
    matchPercentage: 100,
    isExact: false,
  };

  // Name Search Autocomplete results
  const nameSearchResults = useMemo(() => {
    return searchColorsByName(nameSearchQuery, libraryColors, 8);
  }, [nameSearchQuery, libraryColors]);

  // Update history on valid lookup
  useEffect(() => {
    if (primaryMatch && primaryMatch.name) {
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.hex !== currentHex);
        const updated = [{ name: primaryMatch.name, hex: currentHex }, ...filtered].slice(0, 10);
        try {
          localStorage.setItem('kroma_color_finder_history', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [currentHex, primaryMatch?.name]);

  // Random color generator
  const handleRandomColor = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
      .toUpperCase()}`;
    setCurrentHex(randomHex);
    setHexInput(randomHex);
    setNameSearchQuery('');
  };

  // Select color helper
  const handleSelectColor = (hex: string) => {
    const clean = hex.startsWith('#') ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
    setCurrentHex(clean);
    setHexInput(clean);
    setNameSearchQuery('');
  };

  // Copy helper
  const handleCopy = async (text: string, key: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
      showToast(`Copied ${label}`, text);
    }
  };

  // Save specimen to workspace
  const handleSaveColor = () => {
    saveItem({
      id: `color-${currentHex.replace('#', '').toLowerCase()}`,
      type: 'color',
      title: primaryMatch.name,
      slug: primaryMatch.slug || `color-${currentHex.replace('#', '').toLowerCase()}`,
      preview: currentHex,
      metadata: `${primaryMatch.source} • ${currentHex}`,
    });
    showToast('Saved color specimen to workspace', primaryMatch.name, currentHex);
  };

  // Share action
  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Color link copied to clipboard', `${primaryMatch.name} (${currentHex})`);
    }
  };

  // Selected Palette for Palette Name Analyzer
  const selectedPalette = useMemo(() => {
    return palettes.find((p) => p.id === selectedPaletteId) || palettes[0];
  }, [palettes, selectedPaletteId]);

  const analyzedPaletteColors = useMemo(() => {
    if (!selectedPalette) return [];
    return selectedPalette.colors.map((c) => {
      const match = findClosestColorMatches(c.hex, libraryColors, 1)[0];
      return {
        originalHex: c.hex,
        matchedName: match?.name || c.name,
        source: match?.source || 'KROMA Curated',
        matchPercentage: match?.matchPercentage || 100,
        isExact: match?.isExact || false,
        role: c.role,
      };
    });
  }, [selectedPalette, libraryColors]);

  const textColor = getTextColorForBackground(currentHex);
  const isDarkText = textColor === '#111111';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-8">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <span className="font-mono text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
            PERCEPTUAL COLOR IDENTIFICATION ENGINE
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
            Color Name Finder
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            Identify exact and closest meaningful color names from curated editorial gamuts using human visual perceptual distance ($\Delta E$).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRandomColor}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Generate Random Color"
          >
            <Shuffle size={13} />
            <span>Random</span>
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Share Color URL"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            onClick={handleSaveColor}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] text-[var(--accent-gold)] border border-[var(--accent-gold)] rounded-xs transition-colors whitespace-nowrap"
            title="Save Specimen"
          >
            <Bookmark size={13} />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* Mode Switcher Tabs (Single Color vs Palette Analyzer) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-all ${
            activeTab === 'single'
              ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]'
              : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
          }`}
        >
          Single Color Specimen
        </button>
        <button
          onClick={() => setActiveTab('palette')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-all ${
            activeTab === 'palette'
              ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]'
              : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
          }`}
        >
          Analyze Palette Colors
        </button>
      </div>

      {activeTab === 'single' ? (
        /* Main Single Color Studio Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Color Input, Name Search, Specs & History (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Color Input Control Card */}
            <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-4">
              <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                INPUT COLOR (HEX / PICKER)
              </span>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentHex}
                  onChange={(e) => handleSelectColor(e.target.value)}
                  className="w-12 h-11 border border-[var(--border-medium)] rounded-xs bg-transparent cursor-pointer p-0"
                  title="Pick Any Color"
                />
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexInputChange(e.target.value)}
                  placeholder="#10288C"
                  className="flex-1 bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs px-3.5 py-2.5 font-mono text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                />
              </div>

              {/* Name -> Color Search Input */}
              <div className="relative mt-1">
                <div className="flex items-center bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-3 py-2">
                  <Search size={14} className="text-[var(--text-tertiary)] mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={nameSearchQuery}
                    onChange={(e) => setNameSearchQuery(e.target.value)}
                    placeholder="Search by name (e.g. Cobalt, Sage, Rose)..."
                    className="bg-transparent border-none outline-none text-xs text-[var(--text-primary)] w-full placeholder:text-[var(--text-tertiary)]"
                  />
                </div>

                {/* Autocomplete Name Results Dropdown */}
                {nameSearchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs shadow-2xl z-30 max-h-56 overflow-y-auto">
                    {nameSearchResults.length === 0 ? (
                      <div className="p-3 text-xs text-[var(--text-tertiary)] font-mono text-center">
                        No color names found for "{nameSearchQuery}"
                      </div>
                    ) : (
                      nameSearchResults.map((res, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectColor(res.hex)}
                          className="flex items-center justify-between p-2.5 hover:bg-[var(--bg-surface-3)] cursor-pointer border-b border-[var(--border-subtle)] last:border-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-5 h-5 rounded-xs border border-[var(--border-subtle)] inline-block"
                              style={{ backgroundColor: res.hex }}
                            />
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {res.name}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                            {res.hex}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Technical Color Coordinates Spec Card */}
            <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-3">
              <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                COLOR REPRESENTATION SPECS
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div
                  onClick={() => handleCopy(currentHex, 'hex', 'HEX')}
                  className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-xs cursor-pointer transition-colors group"
                >
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase block">
                    HEX
                  </span>
                  <div className="font-mono text-xs font-bold text-[var(--text-primary)] mt-0.5 flex items-center justify-between">
                    <span>{currentHex}</span>
                    <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div
                  onClick={() => {
                    const rgb = hexToRgb(currentHex);
                    if (rgb) handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb', 'RGB');
                  }}
                  className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-xs cursor-pointer transition-colors group"
                >
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase block">
                    RGB
                  </span>
                  <div className="font-mono text-xs font-bold text-[var(--text-primary)] mt-0.5 flex items-center justify-between">
                    <span>
                      {(() => {
                        const rgb = hexToRgb(currentHex);
                        return rgb ? `${rgb.r} ${rgb.g} ${rgb.b}` : '-';
                      })()}
                    </span>
                    <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div
                  onClick={() => {
                    const hsl = hexToHsl(currentHex);
                    if (hsl) handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl', 'HSL');
                  }}
                  className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-xs cursor-pointer transition-colors group"
                >
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase block">
                    HSL
                  </span>
                  <div className="font-mono text-xs font-bold text-[var(--text-primary)] mt-0.5 flex items-center justify-between">
                    <span>
                      {(() => {
                        const hsl = hexToHsl(currentHex);
                        return hsl ? `${hsl.h}° ${hsl.s}% ${hsl.l}%` : '-';
                      })()}
                    </span>
                    <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div
                  onClick={() => handleCopy(hexToOklch(currentHex), 'oklch', 'OKLCH')}
                  className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-xs cursor-pointer transition-colors group"
                >
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase block">
                    OKLCH
                  </span>
                  <div className="font-mono text-xs font-bold text-[var(--text-primary)] mt-0.5 flex items-center justify-between">
                    <span className="truncate">{hexToOklch(currentHex)}</span>
                    <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Lookups History */}
            {history.length > 0 && (
              <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-3">
                <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                  RECENTLY IDENTIFIED SPECIMENS
                </span>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectColor(h.hex)}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] rounded-xs text-xs transition-colors"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-xs border border-[var(--border-subtle)]"
                        style={{ backgroundColor: h.hex }}
                      />
                      <span className="font-bold text-[var(--text-primary)] truncate max-w-[120px]">
                        {h.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Hero Visual Specimen & Closest Alternative Matches (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Main Dominant Color Hero Box */}
            <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md overflow-hidden shadow-xl flex flex-col">
              {/* Massive Color Swatch Hero Viewport */}
              <div
                className="w-full h-56 md:h-64 p-6 flex flex-col justify-between transition-colors duration-200"
                style={{
                  backgroundColor: currentHex,
                  color: textColor,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-xs font-bold px-2.5 py-1 rounded-xs uppercase tracking-wider shadow-sm"
                    style={{
                      backgroundColor: isDarkText ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)',
                      color: textColor,
                    }}
                  >
                    {primaryMatch.isExact ? '✓ EXACT MATCH' : 'CLOSEST HARMONIC MATCH'}
                  </span>

                  <span
                    className="font-mono text-xs font-bold px-2.5 py-1 rounded-xs uppercase tracking-wider"
                    style={{
                      backgroundColor: isDarkText ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)',
                      color: textColor,
                    }}
                  >
                    {primaryMatch.matchPercentage}% MATCH • ΔE {primaryMatch.deltaE}
                  </span>
                </div>

                <div>
                  <h2
                    className="text-3xl md:text-4xl font-extrabold tracking-tight"
                    style={{ color: textColor }}
                  >
                    {primaryMatch.name}
                  </h2>
                  <div
                    className="font-mono text-base md:text-lg font-bold opacity-90 mt-1"
                    style={{ color: textColor }}
                  >
                    {currentHex}
                  </div>
                </div>
              </div>

              {/* Action Bar Beneath Hero */}
              <div className="p-4 bg-[var(--bg-surface-1)] flex items-center justify-between flex-wrap gap-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase">
                    SOURCE:
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--accent-gold)]">
                    {primaryMatch.source.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onNavigate({
                        path: 'contrast-checker',
                        fg: currentHex,
                        bg: '#111215',
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xs transition-colors"
                    title="Check in Contrast Checker"
                  >
                    <ShieldCheck size={13} color="#3B82F6" />
                    <span>Contrast</span>
                  </button>

                  <button
                    onClick={() =>
                      onNavigate({
                        path: 'palette-generator',
                        colors: currentHex,
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xs transition-colors"
                    title="Open in Palette Generator"
                  >
                    <Sparkles size={13} color="#E9C46A" />
                    <span>Generator</span>
                  </button>

                  <button
                    onClick={() =>
                      onNavigate({
                        path: 'color-detail',
                        slug: primaryMatch.slug || currentHex.replace('#', ''),
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[var(--bg-surface-3)] hover:bg-[var(--text-primary)] text-[var(--text-primary)] hover:text-[var(--text-inverse)] border border-[var(--border-medium)] rounded-xs transition-all"
                    title="View Color Specimen Detail"
                  >
                    <span>Specimen Detail</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            </div>

            {/* Closest Alternative Matches Section */}
            <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                  CLOSEST NEIGHBORING COLOR SPECIMENS
                </span>
                <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                  Calculated via Perceptual Distance
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {matches.slice(1).map((match, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectColor(match.hex)}
                    className="flex items-center justify-between p-3 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-xs cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-xs border border-[var(--border-medium)] flex-shrink-0 shadow-inner"
                        style={{ backgroundColor: match.hex }}
                      />
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
                          {match.name}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {match.hex} • {match.source}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-[var(--text-primary)] font-bold">
                          {match.matchPercentage}%
                        </span>
                        <span className="text-[var(--text-tertiary)] block text-[10px]">
                          ΔE {match.deltaE}
                        </span>
                      </div>
                      <ArrowRight size={13} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Palette Name Analyzer View */
        <div className="flex flex-col gap-6">
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
                  SELECT PALETTE TO IDENTIFY
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                  Multi-Tone Palette Name Analyzer
                </h3>
              </div>

              <select
                value={selectedPalette?.id}
                onChange={(e) => setSelectedPaletteId(e.target.value)}
                className="bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs p-2.5 text-xs text-[var(--text-primary)] font-semibold max-w-xs"
              >
                {palettes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.colors.length} tones)
                  </option>
                ))}
              </select>
            </div>

            {/* Analyzed Swatch Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-2">
              {analyzedPaletteColors.map((color, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    handleSelectColor(color.originalHex);
                    setActiveTab('single');
                  }}
                  className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-xs p-3 flex flex-col gap-2 cursor-pointer transition-all"
                >
                  <div
                    className="h-20 rounded-xs border border-[var(--border-subtle)] shadow-inner"
                    style={{ backgroundColor: color.originalHex }}
                  />
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {color.matchedName}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5 flex items-center justify-between">
                      <span>{color.originalHex}</span>
                      <span className="text-[var(--accent-gold)] font-bold">
                        {color.matchPercentage}%
                      </span>
                    </div>
                    {color.role && (
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] block mt-1">
                        Role: {color.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action to open in Palette Detail */}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => onNavigate({ path: 'palette-detail', slug: selectedPalette.slug })}
                className="btn-primary inline-flex items-center gap-2"
              >
                <span>View Full Palette Detail</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
