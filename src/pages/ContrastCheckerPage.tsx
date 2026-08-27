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
import { findClosestColorName } from '../utils/paletteGenerator';
import {
  getContrastSuggestions,
  simulateCvd,
  CvdType,
  ContrastSuggestion,
} from '../utils/contrastSuggestions';
import { ColorPickerModal } from '../components/ColorPickerModal';

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
  const { palettes, addCombo } = useLibraryData();

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
  const [pickerTarget, setPickerTarget] = useState<'fg' | 'bg' | null>(null);

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
    const hex1 = fgHex.replace('#', '').toLowerCase();
    const hex2 = bgHex.replace('#', '').toLowerCase();
    const canonicalSlug = `contrast-${hex1}-${hex2}`;
    const name1 = findClosestColorName(fgHex);
    const name2 = findClosestColorName(bgHex);
    const title = `${name1} on ${name2}`;

    saveItem({
      id: canonicalSlug,
      type: 'combo',
      title,
      slug: canonicalSlug,
      preview: `${fgHex},${bgHex}`,
      metadata: `Contrast Ratio ${ratio}:1 • ${ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Non-Compliant'}`,
    });

    addCombo({
      id: canonicalSlug,
      slug: canonicalSlug,
      title,
      harmonyType: 'Accessibility Contrast',
      description: `Accessibility contrast pairing featuring ${name1} on ${name2} with a tested ratio of ${ratio}:1.`,
      colors: [
        { name: name1, hex: fgHex, role: 'Foreground' },
        { name: name2, hex: bgHex, role: 'Background' },
      ],
      contrastScore: `${ratio}:1`,
      usageContext: 'Typography & Interface Surface Pairing',
      tags: ['contrast', 'pairing', 'custom'],
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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 flex flex-col gap-6 sm:gap-8 min-w-0">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <span className="font-mono text-[10px] sm:text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
            ACCESSIBILITY &amp; WCAG 2.1 SPEC
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
            Color Contrast Checker
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed">
            Evaluate exact luminance contrast ratios between foreground and background specimens, inspect WCAG AA/AAA compliance, and simulate color vision perception.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Share Contrast Pair"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            onClick={handleCopyReport}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Copy Full Report"
          >
            {copiedKey === 'report' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
            <span>Copy Report</span>
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] text-[var(--accent-gold)] border border-[var(--accent-gold)] rounded-xs transition-colors whitespace-nowrap"
            title="Save Specimen"
          >
            <Bookmark size={13} />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start min-w-0">
        {/* Left Column: Color Pickers, Swap, and Ratio Result (6 Cols on Desktop) */}
        <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6 min-w-0">
          {/* Dual Color Input Controls Card */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-4 sm:gap-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[var(--border-subtle)]/60">
              <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                PAIR CONFIGURATION
              </span>
              <button
                onClick={handleSwap}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-medium)] rounded-xs transition-all self-start sm:self-auto"
                title="Swap Foreground and Background"
              >
                <ArrowLeftRight size={12} className="text-[var(--accent-gold)]" />
                <span>Swap Colors</span>
              </button>
            </div>

            {/* Foreground Input Control */}
            <div className="flex flex-col gap-2.5 p-3 sm:p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-sm min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-mono text-[var(--text-secondary)] font-bold uppercase">
                    FOREGROUND (TEXT / ICON)
                  </label>
                  <button
                    onClick={() => onNavigate({ path: 'color-name-finder', hex: fgHex })}
                    className="text-[10px] font-mono text-[var(--accent-gold)] hover:underline inline-flex items-center gap-0.5"
                    title="Find closest color name"
                  >
                    <span>Find Name</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono text-[var(--text-tertiary)] truncate">
                  {findClosestColorName(fgHex)} • {hexToOklch(fgHex)}
                </span>
              </div>

              {/* Main Input Row */}
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setPickerTarget('fg')}
                  className="w-10 h-10 sm:w-11 sm:h-10 border border-[var(--border-medium)] hover:scale-105 rounded-xs p-0 flex-shrink-0 shadow-inner cursor-pointer transition-transform"
                  style={{ backgroundColor: fgHex }}
                  title="Open Color Selector for Foreground"
                />
                <input
                  type="text"
                  value={fgHex}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (/^#[0-9A-F]{0,6}$/i.test(val)) setFgHex(val);
                  }}
                  className="flex-1 min-w-0 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xs px-3 py-2 font-mono text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                />
              </div>

              {/* Adjustment Controls Row */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]/60">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">
                  Lightness Shift
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustLightness('fg', -5)}
                    className="px-2.5 py-1 bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xs text-xs font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="Darken Foreground 5%"
                  >
                    −5%
                  </button>
                  <button
                    onClick={() => handleAdjustLightness('fg', 5)}
                    className="px-2.5 py-1 bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xs text-xs font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="Lighten Foreground 5%"
                  >
                    +5%
                  </button>
                </div>
              </div>
            </div>

            {/* Background Input Control */}
            <div className="flex flex-col gap-2.5 p-3 sm:p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-sm min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-mono text-[var(--text-secondary)] font-bold uppercase">
                    BACKGROUND (CANVAS / SURFACE)
                  </label>
                  <button
                    onClick={() => onNavigate({ path: 'color-name-finder', hex: bgHex })}
                    className="text-[10px] font-mono text-[var(--accent-gold)] hover:underline inline-flex items-center gap-0.5"
                    title="Find closest color name"
                  >
                    <span>Find Name</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono text-[var(--text-tertiary)] truncate">
                  {findClosestColorName(bgHex)} • {hexToOklch(bgHex)}
                </span>
              </div>

              {/* Main Input Row */}
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setPickerTarget('bg')}
                  className="w-10 h-10 sm:w-11 sm:h-10 border border-[var(--border-medium)] hover:scale-105 rounded-xs p-0 flex-shrink-0 shadow-inner cursor-pointer transition-transform"
                  style={{ backgroundColor: bgHex }}
                  title="Open Color Selector for Background"
                />
                <input
                  type="text"
                  value={bgHex}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (/^#[0-9A-F]{0,6}$/i.test(val)) setBgHex(val);
                  }}
                  className="flex-1 min-w-0 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xs px-3 py-2 font-mono text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                />
              </div>

              {/* Adjustment Controls Row */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]/60">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">
                  Lightness Shift
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustLightness('bg', -5)}
                    className="px-2.5 py-1 bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xs text-xs font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="Darken Background 5%"
                  >
                    −5%
                  </button>
                  <button
                    onClick={() => handleAdjustLightness('bg', 5)}
                    className="px-2.5 py-1 bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xs text-xs font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="Lighten Background 5%"
                  >
                    +5%
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contrast Ratio Hero Card */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
            <div>
              <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                CONTRAST RATIO
              </span>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight mt-1 text-[var(--text-primary)]">
                {ratio} <span className="text-xl sm:text-2xl text-[var(--text-tertiary)] font-normal">: 1</span>
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
            <div className="flex items-center gap-3 self-start sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xs border border-[var(--border-medium)] shadow-inner cursor-pointer"
                  style={{ backgroundColor: fgHex }}
                  onClick={() => handleCopy(fgHex, 'fg', 'Foreground HEX')}
                  title="Foreground Swatch (Tap to copy)"
                />
                <span className="font-mono text-[10px] sm:text-[11px] text-[var(--text-secondary)] mt-1 font-bold">{fgHex}</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-tertiary)] font-bold">ON</span>
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xs border border-[var(--border-medium)] shadow-inner cursor-pointer"
                  style={{ backgroundColor: bgHex }}
                  onClick={() => handleCopy(bgHex, 'bg', 'Background HEX')}
                  title="Background Swatch (Tap to copy)"
                />
                <span className="font-mono text-[10px] sm:text-[11px] text-[var(--text-secondary)] mt-1 font-bold">{bgHex}</span>
              </div>
            </div>
          </div>

          {/* WCAG Criteria Breakdown Grid */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-3 min-w-0">
            <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              WCAG 2.1 COMPLIANCE BREAKDOWN
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(wcagResults).map(([key, item]) => (
                <div
                  key={key}
                  className={`p-2.5 sm:p-3 rounded-xs border flex items-center justify-between transition-colors gap-2 ${
                    item.pass
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-rose-500/5 border-rose-500/20'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Target: {item.threshold}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs font-mono text-[10px] sm:text-[11px] font-bold flex-shrink-0 ${
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
            <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <Zap size={14} color="#E9C46A" />
                <span className="font-mono text-[10px] sm:text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs hover:border-[var(--border-medium)] transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-7 h-7 rounded-xs border border-[var(--border-medium)] flex-shrink-0"
                        style={{ backgroundColor: sugg.suggestedHex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {sugg.label}
                        </div>
                        <div className="font-mono text-[10px] sm:text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {sugg.suggestedHex} • Reaches {sugg.newRatio}:1
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplySuggestion(sugg)}
                      className="px-3 py-1.5 bg-[var(--bg-surface-3)] hover:bg-[var(--text-primary)] text-[var(--text-primary)] hover:text-[var(--text-inverse)] border border-[var(--border-medium)] rounded-xs text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap self-start sm:self-auto"
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
        <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6 min-w-0 w-full">
          {/* Live Design Preview Canvas */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-4 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                REAL-WORLD DESIGN SPECIMEN PREVIEW
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-bold">
                {ratio}:1 Ratio
              </span>
            </div>

            {/* Specimen Frame */}
            <div
              className="rounded-md border p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 transition-colors duration-200 min-w-0"
              style={{
                backgroundColor: simulatedBg,
                color: simulatedFg,
                borderColor: fgHex === '#FFFFFF' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              }}
            >
              {/* Heading Specimen */}
              <div>
                <span style={{ color: simulatedFg, opacity: 0.8 }} className="font-mono text-[10px] sm:text-xs uppercase tracking-wider font-semibold">
                  Large Display Typography
                </span>
                <h3 style={{ color: simulatedFg }} className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 leading-snug">
                  Accessible Design Empowers Everyone
                </h3>
              </div>

              {/* Body Typography Specimen */}
              <div>
                <span style={{ color: simulatedFg, opacity: 0.8 }} className="font-mono text-[10px] sm:text-xs uppercase tracking-wider font-semibold">
                  Regular Body Text (15px / 1.6 Line Height)
                </span>
                <p style={{ color: simulatedFg, opacity: 0.95 }} className="text-xs sm:text-sm mt-1 leading-relaxed">
                  Luminance contrast is the perceived difference in visual lightness between foreground typography and background canvas surfaces. Ensuring sufficient contrast prevents eye strain and guarantees universal readability across OLED, IPS, and e-paper displays.
                </p>
              </div>

              {/* UI Component: Primary Button */}
              <div>
                <span style={{ color: simulatedFg, opacity: 0.8 }} className="font-mono text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-2 block">
                  Interactive UI Component
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                  <button
                    style={{
                      backgroundColor: simulatedFg,
                      color: simulatedBg,
                      border: 'none',
                    }}
                    className="px-4 sm:px-5 py-2.5 rounded-xs font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity text-center"
                  >
                    Primary Action Button
                  </button>

                  <div
                    style={{
                      border: `1px solid ${simulatedFg}`,
                      color: simulatedFg,
                    }}
                    className="px-3.5 py-2 rounded-xs font-mono text-xs font-semibold text-center"
                  >
                    Input Focus State
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Vision Deficiency (CVD) Simulation Controls */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={14} color="#3B82F6" />
                <span className="font-mono text-[10px] sm:text-xs text-[var(--accent-blue)] uppercase tracking-wider font-semibold">
                  COLOR VISION DEFICIENCY (CVD) SIMULATION
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Preview how this color pairing is perceived by users with different color vision deficiencies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
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
                  className={`p-2.5 rounded-xs text-xs font-semibold text-left transition-all ${
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
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-3.5 sm:gap-4 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers size={14} color="#E9C46A" />
                <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                  COMPARE FROM PALETTE LIBRARY
                </span>
              </div>
              <button
                onClick={() => setMatrixOpen(!matrixOpen)}
                className="text-xs font-mono text-[var(--accent-gold)] hover:underline self-start sm:self-auto"
              >
                {matrixOpen ? 'Hide Full Matrix' : 'Show Full Matrix'}
              </button>
            </div>

            {/* Select Existing Palette */}
            <div className="flex flex-col gap-3">
              <select
                value={selectedPalette?.id}
                onChange={(e) => setSelectedPaletteId(e.target.value)}
                className="bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs p-2.5 text-xs text-[var(--text-primary)] font-semibold w-full"
                aria-label="Select Palette System"
              >
                {palettes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.colors.length} tones)
                  </option>
                ))}
              </select>

              {/* Responsive Swatch Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 mt-1">
                {selectedPalette.colors.map((c, idx) => {
                  const isFg = fgHex.toUpperCase() === c.hex.toUpperCase();
                  const isBg = bgHex.toUpperCase() === c.hex.toUpperCase();

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 bg-[var(--bg-surface-2)] border rounded-xs flex flex-col gap-2 transition-all ${
                        isFg || isBg
                          ? 'border-[var(--border-strong)] bg-[var(--bg-surface-3)] shadow-md'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] text-[var(--text-tertiary)] font-bold">
                          0{idx + 1}
                        </span>
                        <span className="font-mono text-[9px] text-[var(--text-secondary)] font-semibold truncate max-w-[64px]">
                          {c.hex}
                        </span>
                      </div>

                      <div
                        className="h-9 w-full rounded-xs border border-[var(--border-subtle)] shadow-inner cursor-pointer"
                        style={{ backgroundColor: c.hex }}
                        onClick={() => setFgHex(c.hex)}
                        title={`Click to set ${c.name} (${c.hex}) as Foreground`}
                      />

                      <div className="text-[10px] font-bold text-[var(--text-primary)] truncate">
                        {c.name}
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-1 border-t border-[var(--border-subtle)]">
                        <button
                          onClick={() => setFgHex(c.hex)}
                          className={`py-1 rounded-xs font-mono text-[9px] font-bold transition-all text-center ${
                            isFg
                              ? 'bg-[var(--accent-gold)] text-black shadow-sm'
                              : 'bg-[var(--bg-surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                          }`}
                          title="Set as Foreground"
                        >
                          FG {isFg ? '✓' : ''}
                        </button>
                        <button
                          onClick={() => setBgHex(c.hex)}
                          className={`py-1 rounded-xs font-mono text-[9px] font-bold transition-all text-center ${
                            isBg
                              ? 'bg-[var(--accent-gold)] text-black shadow-sm'
                              : 'bg-[var(--bg-surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                          }`}
                          title="Set as Background"
                        >
                          BG {isBg ? '✓' : ''}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full N x N Palette Contrast Matrix */}
            {matrixOpen && (
              <div className="overflow-x-auto mt-2 pt-3 border-t border-[var(--border-subtle)] w-full">
                <table className="w-full text-left font-mono text-[11px] min-w-[360px]">
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
                            className="w-3.5 h-3.5 rounded-xs border border-[var(--border-subtle)] inline-block flex-shrink-0"
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

      {/* Interactive Color Selector Modal */}
      {pickerTarget && (
        <ColorPickerModal
          isOpen={!!pickerTarget}
          initialColor={pickerTarget === 'fg' ? fgHex : bgHex}
          paletteColors={selectedPalette?.colors?.map((c) => c.hex) || []}
          title={pickerTarget === 'fg' ? 'SELECT FOREGROUND COLOR' : 'SELECT BACKGROUND COLOR'}
          onApply={(hex) => {
            if (pickerTarget === 'fg') setFgHex(hex);
            else setBgHex(hex);
          }}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
};
