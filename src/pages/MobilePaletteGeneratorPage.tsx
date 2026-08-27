import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Lock,
  Unlock,
  Copy,
  Check,
  Share2,
  Bookmark,
  Sliders,
  RotateCcw,
  RotateCw,
  ChevronUp,
  ChevronDown,
  X,
  Plus,
  Minus,
  Edit2,
  ShieldCheck,
  Info,
  Layers,
} from 'lucide-react';
import { RouteType } from '../types';
import {
  GeneratorColor,
  HarmonyMode,
  generatePalette,
  findClosestColorName,
  formatPaletteExport,
} from '../utils/paletteGenerator';
import {
  hexToRgb,
  hexToHsl,
  hexToOklch,
  hslToHex,
  rgbToHex,
  getContrastRatio,
  getContrastRating,
  getTextColorForBackground,
  copyToClipboard,
} from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';

interface MobilePaletteGeneratorProps {
  initialColorsQuery?: string;
  onNavigate: (route: RouteType) => void;
}

export const MobilePaletteGeneratorPage: React.FC<MobilePaletteGeneratorProps> = ({
  initialColorsQuery,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved } = useSaved();
  const { addPalette } = useLibraryData();

  // Palette Configuration State
  const [colorCount, setColorCount] = useState<number>(5);
  const [harmony, setHarmony] = useState<HarmonyMode>('curated');
  const [baseColor, setBaseColor] = useState<string>('');

  // Palette Colors State
  const [colors, setColors] = useState<GeneratorColor[]>(() => {
    if (initialColorsQuery) {
      const hexList = initialColorsQuery.split(',').map((h) => (h.startsWith('#') ? h : `#${h}`));
      if (hexList.length >= 3 && hexList.length <= 8) {
        return hexList.map((hex, i) => ({
          id: `init-${i}-${Date.now()}`,
          hex: hex.toUpperCase(),
          name: findClosestColorName(hex),
          locked: false,
        }));
      }
    }
    // Default initial generation
    return generatePalette(5, [], 'curated');
  });

  // History for Undo / Redo
  const [history, setHistory] = useState<GeneratorColor[][]>([colors]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Active Modals & Sheets
  const [activeEditingIndex, setActiveEditingIndex] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [exportOpen, setExportOpen] = useState<boolean>(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'hex' | 'css' | 'tailwind' | 'json'>('hex');

  // Push to history
  const pushToHistory = (newColors: GeneratorColor[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newColors);
    // Keep max 20 history states
    if (nextHistory.length > 20) nextHistory.shift();
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  // Sync URL query state
  useEffect(() => {
    const hexList = colors.map((c) => c.hex.replace('#', '')).join(',');
    const newUrl = `/palette-generator?colors=${hexList}`;
    if (window.location.search !== `?colors=${hexList}`) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [colors]);

  // Generate action
  const handleGenerate = useCallback(() => {
    const newColors = generatePalette(colorCount, colors, harmony, baseColor || undefined);
    setColors(newColors);
    pushToHistory(newColors);
  }, [colorCount, colors, harmony, baseColor, historyIndex, history]);

  // Keyboard shortcut (Spacebar to generate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeEditingIndex === null && !settingsOpen && !exportOpen) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, activeEditingIndex, settingsOpen, exportOpen]);

  // Lock / Unlock toggle
  const toggleLock = (index: number) => {
    setColors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], locked: !next[index].locked };
      return next;
    });
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setColors(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setColors(next);
    }
  };

  // Move color Up / Down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= colors.length) return;
    const next = [...colors];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setColors(next);
    pushToHistory(next);
  };

  // Copy Single HEX
  const handleCopySingle = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1200);
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  // Save Palette
  const handleSavePalette = () => {
    const title = `${colors[0].name} & ${colors[1]?.name || 'Gamut'} System`;
    const paletteId = `gen-pal-${colors.map((c) => c.hex.replace('#', '')).join('-')}`;
    const preview = colors.map((c) => c.hex).join(',');

    saveItem({
      id: paletteId,
      type: 'palette',
      title,
      slug: `gen-${Date.now()}`,
      preview,
      metadata: `${colors.length} Colors • ${harmony.toUpperCase()}`,
    });

    // Also add to active Library Data
    addPalette({
      id: paletteId,
      slug: `custom-palette-${Date.now()}`,
      title,
      category: 'Curated Generation',
      description: `Generated dynamic ${harmony} balance system with ${colors.length} chromatic steps.`,
      colors: colors.map((c, i) => ({
        name: c.name,
        hex: c.hex,
        role: i === 0 ? 'Background Anchor' : i === 1 ? 'Primary Dominant' : i === 2 ? 'Accent Focus' : 'Surface / Highlight',
      })),
      tags: ['generator', harmony, 'custom'],
    });

    showToast('Saved palette to collection', title);
  };

  // Share action
  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Palette URL copied to clipboard', 'Share link ready');
    }
  };

  // Color Editor change handler
  const handleColorUpdate = (newHex: string) => {
    if (activeEditingIndex === null) return;
    const clean = newHex.toUpperCase();
    if (/^#[0-9A-F]{6}$/i.test(clean)) {
      setColors((prev) => {
        const next = [...prev];
        next[activeEditingIndex] = {
          ...next[activeEditingIndex],
          hex: clean,
          name: findClosestColorName(clean),
        };
        return next;
      });
    }
  };

  const activeColor = activeEditingIndex !== null ? colors[activeEditingIndex] : null;

  return (
    <div className="generator-page-container">
      {/* Top Header Bar */}
      <header className="generator-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="brand-glyph" style={{ width: 12, height: 12 }} />
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Palette Generator
            </h1>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
              {harmony.toUpperCase()} • {colors.length} SPECIMENS
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="generator-action-btn"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            aria-label="Undo palette generation"
          >
            <RotateCcw size={14} />
          </button>
          <button
            className="generator-action-btn"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            aria-label="Redo palette generation"
          >
            <RotateCw size={14} />
          </button>
          <button
            className="generator-action-btn"
            onClick={() => setSettingsOpen(true)}
            title="Generation Settings & Harmony Mode"
            aria-label="Palette settings"
          >
            <Sliders size={14} />
          </button>
          <button
            className="generator-action-btn"
            onClick={() => setExportOpen(true)}
            title="Export & Share Palette"
            aria-label="Export palette"
          >
            <Share2 size={14} />
          </button>
          <button
            className="generator-action-btn primary"
            onClick={handleSavePalette}
            title="Save Palette"
            aria-label="Save palette"
          >
            <Bookmark size={14} />
          </button>
        </div>
      </header>

      {/* Main Specimen Visualizer (Fill Viewport) */}
      <main className="generator-canvas">
        {colors.map((color, index) => {
          const textColor = getTextColorForBackground(color.hex);
          const isDarkText = textColor === '#111111';
          const contrastWhite = getContrastRatio(color.hex, '#FFFFFF');
          const contrastBlack = getContrastRatio(color.hex, '#111111');
          const isCopied = copiedHex === color.hex;

          return (
            <div
              key={color.id}
              className="generator-color-strip"
              style={{
                backgroundColor: color.hex,
                color: textColor,
              }}
            >
              {/* Color Metadata Header */}
              <div className="generator-strip-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className="generator-step-badge"
                    style={{
                      backgroundColor: isDarkText ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
                      color: textColor,
                    }}
                  >
                    0{index + 1}
                  </span>
                  <span className="generator-color-title" style={{ color: textColor }}>
                    {color.name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    className="generator-wcag-badge"
                    style={{
                      backgroundColor: isDarkText ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
                      color: textColor,
                    }}
                    title={`WCAG Contrast: ${contrastWhite}:1 on White, ${contrastBlack}:1 on Black`}
                  >
                    {contrastWhite >= 4.5 || contrastBlack >= 4.5 ? 'WCAG AA' : 'ACCENT'}
                  </span>
                </div>
              </div>

              {/* Central HEX Value Tap Area */}
              <div
                className="generator-strip-center"
                onClick={() => handleCopySingle(color.hex, color.name)}
                title="Tap to copy HEX"
              >
                <div className="generator-hex-display" style={{ color: textColor }}>
                  {color.hex}
                </div>
                <div className="generator-copy-pill" style={{ color: textColor, opacity: isCopied ? 1 : 0.8 }}>
                  {isCopied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{isCopied ? 'Copied!' : 'Tap to copy'}</span>
                </div>
              </div>

              {/* Strip Action Controls (Lock, Edit, Reorder) */}
              <div className="generator-strip-controls">
                <div style={{ display: 'flex', gap: '4px' }}>
                  {index > 0 && (
                    <button
                      className="generator-icon-control"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, 'up');
                      }}
                      style={{ color: textColor, borderColor: isDarkText ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }}
                      title="Move Up"
                      aria-label="Move color up"
                    >
                      <ChevronUp size={14} />
                    </button>
                  )}
                  {index < colors.length - 1 && (
                    <button
                      className="generator-icon-control"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, 'down');
                      }}
                      style={{ color: textColor, borderColor: isDarkText ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }}
                      title="Move Down"
                      aria-label="Move color down"
                    >
                      <ChevronDown size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="generator-icon-control"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveEditingIndex(index);
                    }}
                    style={{ color: textColor, borderColor: isDarkText ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }}
                    title="Edit Color"
                    aria-label={`Edit ${color.name}`}
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    className={`generator-icon-control ${color.locked ? 'locked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(index);
                    }}
                    style={{
                      color: textColor,
                      borderColor: color.locked ? '#E9C46A' : isDarkText ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                      backgroundColor: color.locked ? 'rgba(233, 196, 106, 0.25)' : 'transparent',
                    }}
                    title={color.locked ? 'Locked (will not regenerate)' : 'Unlocked (will regenerate)'}
                    aria-label={color.locked ? 'Unlock color' : 'Lock color'}
                  >
                    {color.locked ? <Lock size={14} color="#E9C46A" /> : <Unlock size={14} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Floating Bottom Generator Command Bar */}
      <footer className="generator-bottom-bar">
        <button
          className="generator-main-btn"
          onClick={handleGenerate}
          aria-label="Generate new harmonious palette"
        >
          <Sparkles size={18} />
          <span>Generate Palette</span>
          <kbd className="generator-kbd-hint">Space</kbd>
        </button>
      </footer>

      {/* Color Edit Sheet / Modal */}
      {activeColor !== null && activeEditingIndex !== null && (
        <div className="generator-modal-backdrop" onClick={() => setActiveEditingIndex(null)}>
          <div className="generator-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="generator-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: activeColor.hex, border: '1px solid var(--border-medium)' }} />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{activeColor.name}</h3>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                    SLOT 0{activeEditingIndex + 1} • {activeColor.hex}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveEditingIndex(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {/* Native Color Picker & Hex Input */}
              <div>
                <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  HEX VALUE
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="color"
                    value={activeColor.hex}
                    onChange={(e) => handleColorUpdate(e.target.value)}
                    style={{
                      width: '44px',
                      height: '40px',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <input
                    type="text"
                    value={activeColor.hex}
                    onChange={(e) => handleColorUpdate(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '0 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              {/* Color Code Representations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="generator-color-spec-box">
                  <span className="generator-spec-label">RGB</span>
                  <span className="generator-spec-val">
                    {(() => {
                      const rgb = hexToRgb(activeColor.hex);
                      return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '-';
                    })()}
                  </span>
                </div>
                <div className="generator-color-spec-box">
                  <span className="generator-spec-label">HSL</span>
                  <span className="generator-spec-val">
                    {(() => {
                      const hsl = hexToHsl(activeColor.hex);
                      return hsl ? `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` : '-';
                    })()}
                  </span>
                </div>
              </div>

              <div className="generator-color-spec-box">
                <span className="generator-spec-label">OKLCH PERCEPTUAL GAMUT</span>
                <span className="generator-spec-val">{hexToOklch(activeColor.hex)}</span>
              </div>

              {/* Contrast Assessment */}
              <div className="generator-color-spec-box">
                <span className="generator-spec-label">CONTRAST READABILITY</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #CCC' }} />
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      {getContrastRatio(activeColor.hex, '#FFFFFF')}:1 (White)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#111215', border: '1px solid #444' }} />
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      {getContrastRatio(activeColor.hex, '#111215')}:1 (Obsidian)
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={() => setActiveEditingIndex(null)}
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              >
                Done Adjusting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="generator-modal-backdrop" onClick={() => setSettingsOpen(false)}>
          <div className="generator-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="generator-modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Generator Configuration</h3>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
              {/* Palette Size */}
              <div>
                <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  PALETTE SPECIMEN COUNT
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setColorCount(num);
                        const newColors = generatePalette(num, colors, harmony, baseColor || undefined);
                        setColors(newColors);
                        pushToHistory(newColors);
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-xs)',
                        border: colorCount === num ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                        background: colorCount === num ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)',
                        color: colorCount === num ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: colorCount === num ? 700 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                      }}
                    >
                      {num} Colors
                    </button>
                  ))}
                </div>
              </div>

              {/* Harmony Mode */}
              <div>
                <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  COLOR HARMONY ALGORITHM
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'curated', label: 'Curated Balance' },
                    { id: 'analogous', label: 'Analogous' },
                    { id: 'complementary', label: 'Complementary' },
                    { id: 'triadic', label: 'Triadic' },
                    { id: 'splitComplementary', label: 'Split Comp.' },
                    { id: 'monochromatic', label: 'Monochrome' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        setHarmony(h.id as HarmonyMode);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-xs)',
                        border: harmony === h.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                        background: harmony === h.id ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)',
                        color: harmony === h.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: harmony === h.id ? 700 : 500,
                        fontSize: '0.82rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Color Mode */}
              <div>
                <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  BASE ANCHOR COLOR (OPTIONAL)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="color"
                    value={baseColor || '#1D4ED8'}
                    onChange={(e) => setBaseColor(e.target.value)}
                    style={{
                      width: '44px',
                      height: '40px',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="e.g. #1D4ED8"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '0 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.88rem',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {baseColor && (
                    <button
                      className="btn-secondary"
                      onClick={() => setBaseColor('')}
                      style={{ padding: '0 10px', fontSize: '0.75rem' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={() => {
                  setSettingsOpen(false);
                  handleGenerate();
                }}
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              >
                Apply &amp; Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export & Share Modal */}
      {exportOpen && (
        <div className="generator-modal-backdrop" onClick={() => setExportOpen(false)}>
          <div className="generator-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="generator-modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Export &amp; Share Palette</h3>
              <button
                onClick={() => setExportOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {/* Shareable Link */}
              <div>
                <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  SHAREABLE PALETTE LINK
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    style={{
                      flex: 1,
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '8px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                    }}
                  />
                  <button className="btn-secondary" onClick={handleShare} style={{ whiteSpace: 'nowrap' }}>
                    <Share2 size={13} />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Export Formats */}
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {(['hex', 'css', 'tailwind', 'json'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-xs)',
                        border: exportFormat === fmt ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                        background: exportFormat === fmt ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)',
                        color: exportFormat === fmt ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                <textarea
                  readOnly
                  rows={6}
                  value={formatPaletteExport(colors, exportFormat)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: 'var(--text-primary)',
                    resize: 'none',
                  }}
                />
              </div>

              <button
                className="btn-primary"
                onClick={async () => {
                  const code = formatPaletteExport(colors, exportFormat);
                  const success = await copyToClipboard(code);
                  if (success) {
                    showToast(`Copied ${exportFormat.toUpperCase()} tokens`, 'Palette exported');
                    setExportOpen(false);
                  }
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Copy size={14} />
                <span>Copy {exportFormat.toUpperCase()} Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
