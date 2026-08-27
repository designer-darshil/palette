import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  Share2,
  Bookmark,
  Sparkles,
  Layers,
  Eye,
  Sliders,
  RotateCcw,
  Info,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import {
  getContrastRatio,
  getContrastRating,
  getTextColorForBackground,
  hexToRgb,
  hexToHsl,
  hexToOklch,
  hslToHex,
  rgbToHex,
  copyToClipboard,
} from '../utils/colorUtils';
import {
  getContrastSuggestions,
  simulateCvd,
  CvdType,
  ContrastSuggestion,
} from '../utils/contrastSuggestions';

interface ContrastCheckerPageProps {
  initialFg?: string;
  initialBg?: string;
  onNavigate: (route: RouteType) => void;
}

export const ContrastCheckerPage: React.FC<ContrastCheckerPageProps> = ({
  initialFg,
  initialBg,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved } = useSaved();
  const { palettes } = useLibraryData();

  // Color State (defaults to classic high-contrast pairing)
  const [fgHex, setFgHex] = useState<string>(() => {
    if (initialFg) {
      const clean = initialFg.startsWith('#') ? initialFg : `#${initialFg}`;
      if (/^#[0-9A-F]{6}$/i.test(clean)) return clean.toUpperCase();
    }
    return '#E9C46A';
  });

  const [bgHex, setBgHex] = useState<string>(() => {
    if (initialBg) {
      const clean = initialBg.startsWith('#') ? initialBg : `#${initialBg}`;
      if (/^#[0-9A-F]{6}$/i.test(clean)) return clean.toUpperCase();
    }
    return '#111215';
  });

  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('');
  const [matrixOpen, setMatrixOpen] = useState<boolean>(false);
  const [cvdMode, setCvdMode] = useState<CvdType>('normal');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync URL query state
  useEffect(() => {
    const fg = fgHex.replace('#', '');
    const bg = bgHex.replace('#', '');
    const newUrl = `/contrast-checker?fg=${fg}&bg=${bg}`;
    if (window.location.search !== `?fg=${fg}&bg=${bg}`) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [fgHex, bgHex]);

  // Real-time Contrast Ratio Calculation
  const ratio = useMemo(() => getContrastRatio(fgHex, bgHex), [fgHex, bgHex]);

  // WCAG 2.1 Criteria evaluations
  const wcagResults = useMemo(() => {
    return {
      aaNormal: {
        pass: ratio >= 4.5,
        threshold: '4.5:1',
        title: 'AA Normal Text',
        description: 'Standard body text (< 18pt / 24px)',
      },
      aaLarge: {
        pass: ratio >= 3.0,
        threshold: '3.0:1',
        title: 'AA Large Text',
        description: 'Headings (≥ 18pt or 14pt bold)',
      },
      aaaNormal: {
        pass: ratio >= 7.0,
        threshold: '7.0:1',
        title: 'AAA Normal Text',
        description: 'Enhanced readability standard',
      },
      aaaLarge: {
        pass: ratio >= 4.5,
        threshold: '4.5:1',
        title: 'AAA Large Text',
        description: 'Enhanced large typography standard',
      },
      uiComponents: {
        pass: ratio >= 3.0,
        threshold: '3.0:1',
        title: 'UI Components & Graphics',
        description: 'Icons, buttons, input borders',
      },
    };
  }, [ratio]);

  // Dynamic Suggestions
  const suggestions = useMemo(() => getContrastSuggestions(fgHex, bgHex), [fgHex, bgHex]);

  // Simulated colors under CVD
  const simulatedFg = useMemo(() => simulateCvd(fgHex, cvdMode), [fgHex, cvdMode]);
  const simulatedBg = useMemo(() => simulateCvd(bgHex, cvdMode), [bgHex, cvdMode]);

  // Selected palette for comparison
  const selectedPalette = useMemo(() => {
    return palettes.find((p) => p.id === selectedPaletteId) || palettes[0];
  }, [palettes, selectedPaletteId]);

  // Swap colors action
  const handleSwap = () => {
    const temp = fgHex;
    setFgHex(bgHex);
    setBgHex(temp);
  };

  // 1-Click Apply Suggestion
  const handleApplySuggestion = (sugg: ContrastSuggestion) => {
    if (sugg.type === 'modify-fg') {
      setFgHex(sugg.suggestedHex);
      showToast(`Updated Foreground to ${sugg.suggestedHex}`, `New ratio: ${sugg.newRatio}:1`);
    } else {
      setBgHex(sugg.suggestedHex);
      showToast(`Updated Background to ${sugg.suggestedHex}`, `New ratio: ${sugg.newRatio}:1`);
    }
  };

  // Copy Actions
  const handleCopy = async (text: string, key: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
      showToast(`Copied ${label}`, text);
    }
  };

  // Copy Full Contrast Report
  const handleCopyReport = async () => {
    const report = [
      `KROMA Contrast Assessment Report`,
      `Foreground: ${fgHex}`,
      `Background: ${bgHex}`,
      `Contrast Ratio: ${ratio}:1`,
      `WCAG AA Normal: ${wcagResults.aaNormal.pass ? 'PASS' : 'FAIL'}`,
      `WCAG AA Large: ${wcagResults.aaLarge.pass ? 'PASS' : 'FAIL'}`,
      `WCAG AAA Normal: ${wcagResults.aaaNormal.pass ? 'PASS' : 'FAIL'}`,
      `WCAG AAA Large: ${wcagResults.aaaLarge.pass ? 'PASS' : 'FAIL'}`,
      `WCAG UI Components: ${wcagResults.uiComponents.pass ? 'PASS' : 'FAIL'}`,
      `URL: ${window.location.href}`,
    ].join('\n');

    await handleCopy(report, 'report', 'Accessibility Report');
  };

  // Save Contrast Specimen
  const handleSave = () => {
    const id = `contrast-${fgHex.replace('#', '')}-${bgHex.replace('#', '')}`;
    saveItem({
      id,
      type: 'combo',
      title: `${fgHex} on ${bgHex}`,
      slug: `contrast-${Date.now()}`,
      preview: `${fgHex},${bgHex}`,
      metadata: `Contrast Ratio ${ratio}:1 • ${ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Non-Compliant'}`,
    });
    showToast('Saved contrast specimen to collection', `${ratio}:1 Ratio`);
  };

  // Share action
  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Contrast link copied to clipboard', 'Share URL ready');
    }
  };

  // Adjust Lightness helper
  const handleAdjustLightness = (target: 'fg' | 'bg', delta: number) => {
    const currentHex = target === 'fg' ? fgHex : bgHex;
    const hsl = hexToHsl(currentHex);
    if (!hsl) return;
    const newL = Math.max(0, Math.min(100, hsl.l + delta));
    const newHex = hslToHex(hsl.h, hsl.s, newL);
    if (target === 'fg') setFgHex(newHex);
    else setBgHex(newHex);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-8">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <span className="font-mono text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
            ACCESSIBILITY &amp; WCAG 2.1 SPEC
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
            Color Contrast Checker
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            Evaluate exact luminance contrast ratios between foreground and background specimens, inspect WCAG AA/AAA compliance, and simulate color vision perception.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Share Contrast Pair"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Copy Full Report"
          >
            {copiedKey === 'report' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
            <span>Copy Report</span>
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] text-[var(--accent-gold)] border border-[var(--accent-gold)] rounded-xs transition-colors whitespace-nowrap"
            title="Save Specimen"
          >
            <Bookmark size={13} />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Color Pickers, Swap, and Ratio Result (7 Cols on Desktop) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Dual Color Input Controls Card */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                PAIR CONFIGURATION
              </span>
              <button
                onClick={handleSwap}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] rounded-xs transition-all"
                title="Swap Foreground and Background"
              >
                <ArrowLeftRight size={12} />
                <span>Swap Colors</span>
              </button>
            </div>

            {/* Foreground Input Control */}
            <div className="flex flex-col gap-2 p-3.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[var(--text-secondary)] font-bold uppercase">
                  FOREGROUND (TEXT / ICON)
                </label>
                <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                  {hexToOklch(fgHex)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value.toUpperCase())}
                  className="w-11 h-10 border border-[var(--border-medium)] rounded-xs bg-transparent cursor-pointer p-0"
                  title="Pick Foreground Color"
                />
                <input
                  type="text"
                  value={fgHex}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (/^#[0-9A-F]{0,6}$/i.test(val)) setFgHex(val);
                  }}
                  className="flex-1 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xs px-3 py-2 font-mono text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAdjustLightness('fg', -5)}
                    className="px-2 py-1 bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xs text-xs font-mono font-bold"
                    title="Darken Foreground 5%"
                  >
                    -5%
                  </button>
                  <button
                    onClick={() => handleAdjustLightness('fg', 5)}
                    className="px-2 py-1 bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xs text-xs font-mono font-bold"
                    title="Lighten Foreground 5%"
                  >
                    +5%
                  </button>
                </div>
              </div>
            </div>

            {/* Background Input Control */}
            <div className="flex flex-col gap-2 p-3.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[var(--text-secondary)] font-bold uppercase">
                  BACKGROUND (CANVAS / SURFACE)
                </label>
                <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                  {hexToOklch(bgHex)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value.toUpperCase())}
                  className="w-11 h-10 border border-[var(--border-medium)] rounded-xs bg-transparent cursor-pointer p-0"
                  title="Pick Background Color"
                />
                <input
                  type="text"
                  value={bgHex}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (/^#[0-9A-F]{0,6}$/i.test(val)) setBgHex(val);
                  }}
                  className="flex-1 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xs px-3 py-2 font-mono text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAdjustLightness('bg', -5)}
                    className="px-2 py-1 bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xs text-xs font-mono font-bold"
                    title="Darken Background 5%"
                  >
                    -5%
                  </button>
                  <button
                    onClick={() => handleAdjustLightness('bg', 5)}
                    className="px-2 py-1 bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xs text-xs font-mono font-bold"
                    title="Lighten Background 5%"
                  >
                    +5%
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contrast Ratio Hero Card */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                CONTRAST RATIO
              </span>
              <div className="text-4xl md:text-5xl font-black font-mono tracking-tight mt-1 text-[var(--text-primary)]">
                {ratio} <span className="text-2xl text-[var(--text-tertiary)] font-normal">: 1</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs font-mono text-xs font-bold ${
                    ratio >= 7.0
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : ratio >= 4.5
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : ratio >= 3.0
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {ratio >= 7.0 ? <CheckCircle2 size={12} /> : ratio >= 4.5 ? <CheckCircle2 size={12} /> : ratio >= 3.0 ? <AlertTriangle size={12} /> : <XCircle size={12} />}
                  <span>{ratio >= 7.0 ? 'AAA ENHANCED' : ratio >= 4.5 ? 'AA COMPLIANT' : ratio >= 3.0 ? 'AA LARGE ONLY' : 'NON-COMPLIANT'}</span>
                </span>
              </div>
            </div>

            {/* Quick Visual Swatch Preview */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-xs border border-[var(--border-medium)] shadow-inner cursor-pointer"
                  style={{ backgroundColor: fgHex }}
                  onClick={() => handleCopy(fgHex, 'fg', 'Foreground HEX')}
                  title="Foreground Swatch (Tap to copy)"
                />
                <span className="font-mono text-[11px] text-[var(--text-secondary)] mt-1 font-bold">{fgHex}</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-tertiary)]">ON</span>
              <div className="flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-xs border border-[var(--border-medium)] shadow-inner cursor-pointer"
                  style={{ backgroundColor: bgHex }}
                  onClick={() => handleCopy(bgHex, 'bg', 'Background HEX')}
                  title="Background Swatch (Tap to copy)"
                />
                <span className="font-mono text-[11px] text-[var(--text-secondary)] mt-1 font-bold">{bgHex}</span>
              </div>
            </div>
          </div>

          {/* WCAG Criteria Breakdown Grid */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-3">
            <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              WCAG 2.1 COMPLIANCE BREAKDOWN
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(wcagResults).map(([key, item]) => (
                <div
                  key={key}
                  className={`p-3 rounded-xs border flex items-center justify-between transition-colors ${
                    item.pass
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-rose-500/5 border-rose-500/20'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Target: {item.threshold}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs font-mono text-[11px] font-bold ${
                      item.pass
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {item.pass ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    <span>{item.pass ? 'PASS' : 'FAIL'}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation & Suggestions Engine */}
          {suggestions.length > 0 && (
            <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Zap size={14} color="#E9C46A" />
                <span className="font-mono text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
                  AUTOMATIC CONTRAST REMEDIATION
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                The current pairing does not meet standard AAA thresholds. Below are mathematically optimized tone suggestions that reach target contrast while preserving your original hue.
              </p>

              <div className="flex flex-col gap-2 mt-1">
                {suggestions.map((sugg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs hover:border-[var(--border-medium)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-xs border border-[var(--border-medium)] flex-shrink-0"
                        style={{ backgroundColor: sugg.suggestedHex }}
                      />
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          {sugg.label}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {sugg.suggestedHex} • Reaches {sugg.newRatio}:1
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplySuggestion(sugg)}
                      className="px-3 py-1.5 bg-[var(--bg-surface-3)] hover:bg-[var(--text-primary)] text-[var(--text-primary)] hover:text-[var(--text-inverse)] border border-[var(--border-medium)] rounded-xs text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Design Preview Stage & Palette Matrix (6 Cols on Desktop) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Live Design Preview Canvas */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                REAL-WORLD DESIGN SPECIMEN PREVIEW
              </span>
              <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                {ratio}:1 Contast
              </span>
            </div>

            {/* Specimen Frame */}
            <div
              className="rounded-md border p-6 flex flex-col gap-5 transition-colors duration-200"
              style={{
                backgroundColor: simulatedBg,
                color: simulatedFg,
                borderColor: fgHex === '#FFFFFF' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              }}
            >
              {/* Heading Specimen */}
              <div>
                <span style={{ color: simulatedFg, opacity: 0.8 }} className="font-mono text-xs uppercase tracking-wider font-semibold">
                  Large Display Typography
                </span>
                <h3 style={{ color: simulatedFg }} className="text-2xl font-extrabold tracking-tight mt-1 leading-snug">
                  Accessible Design Empowers Everyone
                </h3>
              </div>

              {/* Body Typography Specimen */}
              <div>
                <span style={{ color: simulatedFg, opacity: 0.8 }} className="font-mono text-xs uppercase tracking-wider font-semibold">
                  Regular Body Text (15px / 1.6 Line Height)
                </span>
                <p style={{ color: simulatedFg, opacity: 0.95 }} className="text-sm mt-1 leading-relaxed">
                  Luminance contrast is the perceived difference in visual lightness between foreground typography and background canvas surfaces. Ensuring sufficient contrast prevents eye strain and guarantees universal readability across OLED, IPS, and e-paper displays.
                </p>
              </div>

              {/* UI Component: Primary Button */}
              <div>
                <span style={{ color: simulatedFg, opacity: 0.8 }} className="font-mono text-xs uppercase tracking-wider font-semibold mb-2 block">
                  Interactive UI Component
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    style={{
                      backgroundColor: simulatedFg,
                      color: simulatedBg,
                      border: 'none',
                    }}
                    className="px-5 py-2.5 rounded-xs font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity"
                  >
                    Primary Action Button
                  </button>

                  <div
                    style={{
                      border: `1px solid ${simulatedFg}`,
                      color: simulatedFg,
                    }}
                    className="px-4 py-2 rounded-xs font-mono text-xs font-semibold"
                  >
                    Input Field Focus State
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Vision Deficiency (CVD) Simulation Controls */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={14} color="#3B82F6" />
                <span className="font-mono text-xs text-[var(--accent-blue)] uppercase tracking-wider font-semibold">
                  COLOR VISION DEFICIENCY (CVD) SIMULATION
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Preview how this color pairing is perceived by users with different color vision deficiencies.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {[
                { id: 'normal', label: 'Normal Vision' },
                { id: 'protanopia', label: 'Protanopia (Red)' },
                { id: 'deuteranopia', label: 'Deuteranopia (Green)' },
                { id: 'tritanopia', label: 'Tritanopia (Blue)' },
                { id: 'achromatopsia', label: 'Achromatopsia (Mono)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setCvdMode(m.id as CvdType)}
                  className={`p-2 rounded-xs text-xs font-semibold text-left transition-all ${
                    cvdMode === m.id
                      ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--accent-blue)]'
                      : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-3)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Palette Mode & Multi-Pair Matrix */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={14} color="#E9C46A" />
                <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                  COMPARE FROM PALETTE LIBRARY
                </span>
              </div>
              <button
                onClick={() => setMatrixOpen(!matrixOpen)}
                className="text-xs font-mono text-[var(--accent-gold)] hover:underline"
              >
                {matrixOpen ? 'Hide Full Matrix' : 'Show Full Matrix'}
              </button>
            </div>

            {/* Select Existing Palette */}
            <div className="flex flex-col gap-2">
              <select
                value={selectedPalette?.id}
                onChange={(e) => setSelectedPaletteId(e.target.value)}
                className="bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs p-2.5 text-xs text-[var(--text-primary)] font-semibold"
              >
                {palettes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.colors.length} tones)
                  </option>
                ))}
              </select>

              {/* Swatch Quick Picker */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {selectedPalette.colors.map((c, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => setFgHex(c.hex)}
                      className="w-9 h-9 rounded-xs border border-[var(--border-medium)] hover:scale-105 transition-transform"
                      style={{ backgroundColor: c.hex }}
                      title={`Set ${c.name} (${c.hex}) as Foreground`}
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => setFgHex(c.hex)}
                        className="text-[9px] font-mono px-1 py-0.5 bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xs"
                        title="Set as Foreground"
                      >
                        FG
                      </button>
                      <button
                        onClick={() => setBgHex(c.hex)}
                        className="text-[9px] font-mono px-1 py-0.5 bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xs"
                        title="Set as Background"
                      >
                        BG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full N x N Palette Contrast Matrix */}
            {matrixOpen && (
              <div className="overflow-x-auto mt-2 pt-3 border-t border-[var(--border-subtle)]">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-tertiary)]">
                      <th className="p-2">FG / BG</th>
                      {selectedPalette.colors.map((c, i) => (
                        <th key={i} className="p-2 text-center">
                          <span
                            className="inline-block w-4 h-4 rounded-xs border border-[var(--border-subtle)]"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPalette.colors.map((fg, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-[var(--border-subtle)]">
                        <td className="p-2 font-bold flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-xs border border-[var(--border-subtle)] inline-block"
                            style={{ backgroundColor: fg.hex }}
                          />
                          <span className="truncate max-w-[80px]">{fg.name}</span>
                        </td>
                        {selectedPalette.colors.map((bg, colIdx) => {
                          const r = getContrastRatio(fg.hex, bg.hex);
                          const pass = r >= 4.5;
                          return (
                            <td
                              key={colIdx}
                              onClick={() => {
                                setFgHex(fg.hex);
                                setBgHex(bg.hex);
                              }}
                              className={`p-2 text-center cursor-pointer transition-colors ${
                                pass ? 'text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15' : 'text-rose-400 bg-rose-500/5 hover:bg-rose-500/15'
                              }`}
                              title={`${fg.name} on ${bg.name}: ${r}:1 (Click to test)`}
                            >
                              {r}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
