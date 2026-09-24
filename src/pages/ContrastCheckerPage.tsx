import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Share2,
  Bookmark,
  ArrowUpRight,
} from 'lucide-react';
import { RouteType } from '../types';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import {
  getContrastRatio,
  hexToRgb,
  hexToHsl,
  hslToHex,
  copyToClipboard,
} from '../utils/colorUtils';
import { findClosestColorName } from '../utils/paletteGenerator';
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebApplicationSchema } from '../utils/schemaGenerator';
import { KromaButton } from '../components/common/KromaButton';
import { Link } from '../components/common/Link';

interface ContrastCheckerPageProps {
  initialFg?: string;
  initialBg?: string;
  onNavigate: (route: RouteType) => void;
}

interface QuickPair {
  name: string;
  fg: string;
  bg: string;
}

const QUICK_PAIRS: QuickPair[] = [
  { name: 'OBSIDIAN / RAW', fg: '#171717', bg: '#F8F8F8' },
  { name: 'BLACK / WHITE', fg: '#000000', bg: '#FFFFFF' },
  { name: 'NAVY / CREAM', fg: '#0A192F', bg: '#FDFBF7' },
  { name: 'PURPLE / YELLOW', fg: '#7B2CBF', bg: '#FFD60A' },
  { name: 'BLUE / WHITE', fg: '#00AEEF', bg: '#FFFFFF' },
  { name: 'DARK GREEN / WHITE', fg: '#134E4A', bg: '#FFFFFF' },
];

export const ContrastCheckerPage: React.FC<ContrastCheckerPageProps> = ({
  initialFg,
  initialBg,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved } = useSaved();
  const { addCombo } = useLibraryData();

  // Color State (defaults to Kroma Obsidian on Raw Canvas)
  const [fgHex, setFgHex] = useState<string>(() => {
    if (initialFg) {
      const clean = initialFg.startsWith('#') ? initialFg : `#${initialFg}`;
      if (/^#[0-9A-F]{6}$/i.test(clean)) return clean.toUpperCase();
    }
    return '#171717';
  });

  const [bgHex, setBgHex] = useState<string>(() => {
    if (initialBg) {
      const clean = initialBg.startsWith('#') ? initialBg : `#${initialBg}`;
      if (/^#[0-9A-F]{6}$/i.test(clean)) return clean.toUpperCase();
    }
    return '#F8F8F8';
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  // WCAG Evaluations
  const wcagNormalAA = ratio >= 4.5;
  const wcagNormalAAA = ratio >= 7.0;
  const wcagLargeAA = ratio >= 3.0;
  const wcagLargeAAA = ratio >= 4.5;

  // Swap colors action
  const handleSwap = () => {
    const temp = fgHex;
    setFgHex(bgHex);
    setBgHex(temp);
  };

  // Adjust lightness helper (+5% / -5%)
  const handleAdjustLightness = (target: 'fg' | 'bg', delta: number) => {
    const currentHex = target === 'fg' ? fgHex : bgHex;
    const hsl = hexToHsl(currentHex);
    if (!hsl) return;
    const newL = Math.max(0, Math.min(100, hsl.l + delta));
    const newHex = hslToHex(hsl.h, hsl.s, newL);
    if (target === 'fg') setFgHex(newHex);
    else setBgHex(newHex);
  };

  // Subtle Copy action (no large toast, inline indicator)
  const handleCopyValue = async (value: string, key: string) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1400);
    }
  };

  // Save pair to collection
  const handleSavePair = () => {
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

  const handleShare = async () => {
    const ok = await copyToClipboard(window.location.href);
    if (ok) {
      setCopiedField('share');
      setTimeout(() => setCopiedField(null), 1400);
      showToast('Contrast link copied to clipboard');
    }
  };

  const fgRgb = hexToRgb(fgHex);
  const fgHsl = hexToHsl(fgHex);
  const bgRgb = hexToRgb(bgHex);
  const bgHsl = hexToHsl(bgHex);

  // Position percentage for contrast scale (1 to 21 logarithmic approximation)
  const scalePosition = useMemo(() => {
    const clamped = Math.max(1, Math.min(21, ratio));
    return ((clamped - 1) / 20) * 100;
  }, [ratio]);

  const currentSlug = `contrast-${fgHex.replace('#', '').toLowerCase()}-${bgHex.replace('#', '').toLowerCase()}`;
  const isSavedPair = isSaved(currentSlug);

  const contrastSchema = useMemo(() => {
    return generateWebApplicationSchema({
      name: 'KROMA Color Contrast Instrument',
      description:
        'A visual color contrast instrument. See how two colors speak together through live typography, large canvas fields, and exact WCAG 2.1 verification.',
      url: '/contrast-checker',
      applicationCategory: 'DesignApplication',
    });
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pb-16 md:pb-24 box-border">
      <SEOHead
        title="Color Contrast Instrument — See How Colors Speak | KROMA"
        description="A visual color contrast instrument. See how two colors behave together through live typography, large canvas fields, and exact WCAG verification."
        canonicalPath="/contrast-checker"
        jsonLd={contrastSchema}
      />

      {/* ── 22: Editorial Breadcrumb ────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
          <Link to={{ path: 'create' }} onNavigate={onNavigate} className="hover:text-[var(--text-primary)]">STUDIO</Link>
          <span>/</span>
          <Link to={{ path: 'explore' }} onNavigate={onNavigate} className="hover:text-[var(--text-primary)]">TOOLS</Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold">CONTRAST</span>
        </div>

        <div className="flex items-center gap-3">
          <KromaButton
            variant="outline"
            size="sm"
            iconLeft={<Share2 size={12} />}
            onClick={handleShare}
            title="Share pair URL"
          >
            {copiedField === 'share' ? 'COPIED' : 'SHARE'}
          </KromaButton>
          <KromaButton
            variant="filled"
            size="sm"
            iconLeft={<Bookmark size={12} />}
            onClick={handleSavePair}
          >
            {isSavedPair ? 'SAVED' : 'SAVE PAIR'}
          </KromaButton>
        </div>
      </div>

      {/* ── 03: Page Intro ──────────────────────────────────────── */}
      <header className="mb-12">
        <span className="font-mono text-xs font-semibold tracking-wider uppercase text-text-tertiary block mb-3">COLOR / CONTRAST</span>
        <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight text-text-primary uppercase m-0">
          SEE HOW COLORS SPEAK.
        </h1>
        <p className="font-sans text-base leading-relaxed text-text-secondary max-w-[680px] m-0">
          A visual instrument to see, test, and understand how two colors behave together.
        </p>
      </header>

      {/* ── 04: Main Contrast Canvas ────────────────────────────── */}
      <section className="mb-8">
        <div
          className="w-full min-h-[280px] md:min-h-[220px] rounded p-5 md:p-8 flex flex-col justify-between box-border transition-colors duration-200 relative border border-[var(--border-subtle)]"
          style={{ backgroundColor: bgHex, color: fgHex }}
        >
          {/* Top Canvas Label */}
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest opacity-80">
            <span>VISUAL CONTRAST FIELD</span>
            <span>{ratio}:1</span>
          </div>

          {/* Large Hero Typography Demonstration */}
          <div className="my-8 sm:my-12">
            <div className="font-sans font-bold text-5xl sm:text-7xl md:text-8xl tracking-tighter leading-none mb-3 uppercase">
              COLOR SPEAKS.
            </div>
            <p className="font-sans text-lg sm:text-2xl font-medium tracking-tight max-w-xl opacity-90 leading-snug">
              Typography is light and shadow. Contrast creates voice.
            </p>
          </div>

          {/* Bottom Canvas Metadata */}
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider opacity-80 pt-4 border-t border-current/15">
            <span>FOREGROUND: {fgHex}</span>
            <span>BACKGROUND: {bgHex}</span>
          </div>
        </div>
      </section>

      {/* ── 05 & 06: Live Color Controls with SWAP ───────────────── */}
      <section className="mb-14 p-5 sm:p-6 border border-[var(--border-subtle)] rounded-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
          {/* Background Control */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
              <span>BACKGROUND</span>
              <span>{findClosestColorName(bgHex)}</span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xs border border-[var(--border-subtle)] relative overflow-hidden flex-shrink-0 cursor-pointer"
                style={{ backgroundColor: bgHex }}
                title="Click to choose background color"
              >
                <input
                  type="color"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value.toUpperCase())}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Background color picker"
                />
              </div>

              <input
                type="text"
                value={bgHex}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (/^#[0-9A-F]{0,6}$/i.test(val)) setBgHex(val);
                }}
                className="flex-1 bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--text-primary)] font-mono text-lg font-bold text-[var(--text-primary)] py-1 outline-none"
              />

              <div className="flex items-center gap-1 font-mono text-xs">
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustLightness('bg', -5)}
                  className="px-2 py-1 text-xs h-auto min-h-0"
                  title="Darken Background 5%"
                >
                  -5%
                </KromaButton>
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustLightness('bg', 5)}
                  className="px-2 py-1 text-xs h-auto min-h-0"
                  title="Lighten Background 5%"
                >
                  +5%
                </KromaButton>
              </div>
            </div>

            {/* Technical values with copy */}
            <div className="flex items-center gap-3 font-mono text-xs text-[var(--text-secondary)]">
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => handleCopyValue(bgHex, 'bg-hex')}
                className="p-0 h-auto font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                HEX {copiedField === 'bg-hex' ? 'COPIED' : bgHex}
              </KromaButton>
              <span>·</span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => handleCopyValue(`rgb(${bgRgb?.r}, ${bgRgb?.g}, ${bgRgb?.b})`, 'bg-rgb')}
                className="p-0 h-auto font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                RGB {copiedField === 'bg-rgb' ? 'COPIED' : `${bgRgb?.r}, ${bgRgb?.g}, ${bgRgb?.b}`}
              </KromaButton>
              <span>·</span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => handleCopyValue(`hsl(${bgHsl?.h}, ${bgHsl?.s}%, ${bgHsl?.l}%)`, 'bg-hsl')}
                className="p-0 h-auto font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                HSL {copiedField === 'bg-hsl' ? 'COPIED' : `${bgHsl?.h}°, ${bgHsl?.s}%`}
              </KromaButton>
            </div>
          </div>

          {/* Central SWAP Button */}
          <div className="flex justify-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10 my-2 md:my-0">
            <KromaButton
              variant="outline"
              size="sm"
              iconLeft={<ArrowLeftRight size={12} />}
              onClick={handleSwap}
              title="Swap Foreground and Background"
            >
              SWAP
            </KromaButton>
          </div>

          {/* Foreground Control */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
              <span>FOREGROUND</span>
              <span>{findClosestColorName(fgHex)}</span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xs border border-[var(--border-subtle)] relative overflow-hidden flex-shrink-0 cursor-pointer"
                style={{ backgroundColor: fgHex }}
                title="Click to choose foreground color"
              >
                <input
                  type="color"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value.toUpperCase())}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Foreground color picker"
                />
              </div>

              <input
                type="text"
                value={fgHex}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (/^#[0-9A-F]{0,6}$/i.test(val)) setFgHex(val);
                }}
                className="flex-1 bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--text-primary)] font-mono text-lg font-bold text-[var(--text-primary)] py-1 outline-none"
              />

              <div className="flex items-center gap-1 font-mono text-xs">
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustLightness('fg', -5)}
                  className="px-2 py-1 text-xs h-auto min-h-0"
                  title="Darken Foreground 5%"
                >
                  -5%
                </KromaButton>
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustLightness('fg', 5)}
                  className="px-2 py-1 text-xs h-auto min-h-0"
                  title="Lighten Foreground 5%"
                >
                  +5%
                </KromaButton>
              </div>
            </div>

            {/* Technical values with copy */}
            <div className="flex items-center gap-3 font-mono text-xs text-[var(--text-secondary)]">
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => handleCopyValue(fgHex, 'fg-hex')}
                className="p-0 h-auto font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                HEX {copiedField === 'fg-hex' ? 'COPIED' : fgHex}
              </KromaButton>
              <span>·</span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => handleCopyValue(`rgb(${fgRgb?.r}, ${fgRgb?.g}, ${fgRgb?.b})`, 'fg-rgb')}
                className="p-0 h-auto font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                RGB {copiedField === 'fg-rgb' ? 'COPIED' : `${fgRgb?.r}, ${fgRgb?.g}, ${fgRgb?.b}`}
              </KromaButton>
              <span>·</span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => handleCopyValue(`hsl(${fgHsl?.h}, ${fgHsl?.s}%, ${fgHsl?.l}%)`, 'fg-hsl')}
                className="p-0 h-auto font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                HSL {copiedField === 'fg-hsl' ? 'COPIED' : `${fgHsl?.h}°, ${fgHsl?.s}%`}
              </KromaButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── 07, 08 & 13: Contrast Score, WCAG Matrix & Visual Scale ─ */}
      <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Prominent Ratio & Scale (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="mb-6">
            <span className="font-mono text-xs font-medium tracking-[0.12em] uppercase text-text-secondary block mb-4">LUMINANCE RATIO</span>
            <div className="flex items-baseline gap-4">
              <span className="font-sans text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)]">
                {ratio} : 1
              </span>
              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => handleCopyValue(`${ratio}:1`, 'ratio')}
                className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-0 h-auto"
              >
                {copiedField === 'ratio' ? 'COPIED' : 'COPY'}
              </KromaButton>
            </div>
          </div>

          {/* 13: Horizontal Contrast Scale */}
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
              CONTRAST SPECTRUM (1:1 TO 21:1)
            </span>
            <div className="w-full h-1 bg-border-subtle rounded-xs relative my-4 md:mb-6">
              <div
                className="absolute -top-1 w-3 h-3 rounded-full bg-text-primary -translate-x-1/2 transition-[left] duration-300 ease-out"
                style={{ left: `${scalePosition}%` }}
                title={`Current ratio: ${ratio}:1`}
              />
            </div>
            <div className="flex justify-between font-mono text-xs text-[var(--text-secondary)] pt-1">
              <span>1:1</span>
              <span>3:1 (AA Lg)</span>
              <span>4.5:1 (AA)</span>
              <span>7:1 (AAA)</span>
              <span>21:1</span>
            </div>
          </div>
        </div>

        {/* Right: 08 & 09 Accessibility Status (5 Cols) */}
        <div className="lg:col-span-5 p-5 border border-[var(--border-subtle)] rounded-xs">
          <span className="font-mono text-xs font-medium tracking-[0.12em] uppercase text-text-secondary mb-2 block">WCAG 2.1 SPECIFICATION</span>

          <div className="flex flex-col">
            {/* Row 1: Normal AA */}
            <div className="flex items-center justify-between py-3 border-b border-border-subtle">
              <div>
                <div className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  NORMAL TEXT · AA
                </div>
                <div className="font-mono text-xs text-[var(--text-secondary)]">
                  BODY TEXT &lt; 18PT (4.5:1)
                </div>
              </div>
              <span className={wcagNormalAA ? 'font-mono text-xs font-semibold tracking-wider px-2 py-0.5 rounded-xs bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759] dark:bg-[#34C759]/20' : 'font-mono text-xs font-semibold tracking-wider px-2 py-0.5 rounded-xs bg-[#FF3B30]/15 text-[#C0271D] dark:text-[#FF453A] dark:bg-[#FF3B30]/20'}>
                ● {wcagNormalAA ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {/* Row 2: Normal AAA */}
            <div className="flex items-center justify-between py-3 border-b border-border-subtle">
              <div>
                <div className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  NORMAL TEXT · AAA
                </div>
                <div className="font-mono text-xs text-[var(--text-secondary)]">
                  ENHANCED READING (7.0:1)
                </div>
              </div>
              <span className={wcagNormalAAA ? 'font-mono text-xs font-semibold tracking-wider px-2 py-0.5 rounded-xs bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759] dark:bg-[#34C759]/20' : 'font-mono text-xs font-semibold tracking-wider px-2 py-0.5 rounded-xs bg-[#FF3B30]/15 text-[#C0271D] dark:text-[#FF453A] dark:bg-[#FF3B30]/20'}>
                ● {wcagNormalAAA ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {/* Row 3: Large AA */}
            <div className="flex items-center justify-between py-3 border-b border-border-subtle">
              <div>
                <div className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  LARGE TEXT · AA
                </div>
                <div className="font-mono text-xs text-[var(--text-secondary)]">
                  HEADINGS ≥ 18PT OR 14PT BOLD (3.0:1)
                </div>
              </div>
              <span className={wcagLargeAA ? 'font-mono text-xs font-semibold tracking-wider px-2 py-0.5 rounded-xs bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759] dark:bg-[#34C759]/20' : 'font-mono text-xs font-semibold tracking-wider px-2 py-0.5 rounded-xs bg-[#FF3B30]/15 text-[#C0271D] dark:text-[#FF453A] dark:bg-[#FF3B30]/20'}>
                ● {wcagLargeAA ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {/* Row 4: Large AAA */}
            <div className="flex items-center justify-between py-3" style={{ borderBottom: 'none' }}>
              <div>
                <div className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  LARGE TEXT · AAA
                </div>
                <div className="font-mono text-xs text-[var(--text-secondary)]">
                  ENHANCED HEADINGS (4.5:1)
                </div>
              </div>
              <span className={wcagLargeAAA ? 'font-mono text-xs font-semibold tracking-wider px-2 py-0.5 rounded-xs bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759] dark:bg-[#34C759]/20' : 'font-mono text-xs font-semibold tracking-wider px-2 py-0.5 rounded-xs bg-[#FF3B30]/15 text-[#C0271D] dark:text-[#FF453A] dark:bg-[#FF3B30]/20'}>
                ● {wcagLargeAAA ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10: Live Typography Test ("TEST IT.") ────────────────── */}
      <section className="mb-20">
        <div className="mb-6">
          <span className="font-mono text-xs font-medium tracking-[0.12em] uppercase text-text-secondary block mb-2">SCALE AUDIT</span>
          <h2 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
            TEST IT.
          </h2>
        </div>

        <div
          className="p-6 sm:p-8 rounded-xs border border-[var(--border-subtle)] flex flex-col gap-8 transition-colors duration-300"
          style={{ backgroundColor: bgHex, color: fgHex }}
        >
          {/* 48px Display */}
          <div>
            <span className="font-mono text-xs uppercase tracking-wider opacity-60 block mb-1">
              48PX / DISPLAY HEADLINE
            </span>
            <div className="font-sans font-bold text-3xl sm:text-5xl tracking-tight leading-none">
              Sphinx of black quartz, judge my vow.
            </div>
          </div>

          {/* 24px Medium Heading */}
          <div>
            <span className="font-mono text-xs uppercase tracking-wider opacity-60 block mb-1">
              24PX / SECTION HEADING
            </span>
            <div className="font-sans font-semibold text-xl sm:text-2xl tracking-tight">
              Color is perceptual luminance interacting with the human eye.
            </div>
          </div>

          {/* 16px Paragraph */}
          <div>
            <span className="font-mono text-xs uppercase tracking-wider opacity-60 block mb-1">
              16PX / BODY PARAGRAPH
            </span>
            <p className="font-sans text-base leading-relaxed max-w-3xl opacity-90">
              Good contrast is not merely an accessibility requirement—it is the foundation of hierarchy, pacing, and editorial authority in digital design. Readers process high-contrast typographies with reduced cognitive fatigue.
            </p>
          </div>

          {/* 12px Small Body / Metadata */}
          <div>
            <span className="font-mono text-xs uppercase tracking-wider opacity-60 block mb-1">
              12PX / MICRO METADATA
            </span>
            <div className="font-mono text-xs uppercase tracking-wider opacity-80">
              SPECIMEN ID: {fgHex.replace('#', '')}-{bgHex.replace('#', '')} · WCAG 2.1 COMPLIANT RATIO: {ratio}:1
            </div>
          </div>
        </div>
      </section>

      {/* ── 11: Real-World Editorial Preview Composition ────────── */}
      <section className="mb-20">
        <div className="mb-6">
          <span className="font-mono text-xs font-medium tracking-[0.12em] uppercase text-text-secondary block mb-2">SURFACE COMPOSITION</span>
          <h2 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
            EDITORIAL PREVIEW
          </h2>
        </div>

        <div
          className="p-8 sm:p-12 rounded-xs border border-[var(--border-subtle)] flex flex-col justify-between min-h-[300px] transition-colors duration-300"
          style={{ backgroundColor: bgHex, color: fgHex }}
        >
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest pb-6 border-b border-current/15 opacity-80">
            <span>KROMA EDITORIAL</span>
            <span>ISSUE 04</span>
          </div>

          <div className="my-8 max-w-2xl">
            <h3 className="font-sans font-bold text-3xl sm:text-4xl tracking-tight mb-3 uppercase">
              Color changes everything.
            </h3>
            <p className="font-sans text-sm sm:text-base leading-relaxed opacity-90">
              When foreground and background establish clear tonal boundaries, content becomes immediate. The relationship between these two specimens produces an evaluated contrast coefficient of {ratio}:1.
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-current/15 text-xs font-mono uppercase tracking-wider opacity-80">
            <span>Aa Bb Cc 123</span>
            <span>{ratio >= 4.5 ? 'CERTIFIED ACCESSIBLE' : 'CAUTION: LOW CONTRAST'}</span>
          </div>
        </div>
      </section>

      {/* ── 15: Quick Contrast Pairs ────────────────────────────── */}
      <section className="mb-20">
        <div className="mb-6">
          <span className="font-mono text-xs font-medium tracking-[0.12em] uppercase text-text-secondary block mb-2">INSPIRATION</span>
          <h2 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
            TRY A COMBINATION
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_PAIRS.map((pair) => {
            const pairRatio = getContrastRatio(pair.fg, pair.bg);
            const isSelected = fgHex === pair.fg && bgHex === pair.bg;

            return (
              <button
                type="button"
                key={pair.name}
                aria-pressed={isSelected}
                aria-label={`Select contrast pair: ${pair.name} (${pairRatio}:1)`}
                onClick={() => {
                  setFgHex(pair.fg);
                  setBgHex(pair.bg);
                }}
                className={`p-3 border rounded-xs cursor-pointer transition-all flex flex-col justify-between min-h-[110px] text-left bg-transparent w-full ${
                  isSelected
                    ? 'border-[var(--text-primary)] ring-1 ring-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--text-primary)]'
                }`}
              >
                {/* 2-Color Preview Swatch */}
                <div className="h-10 rounded-xs overflow-hidden flex border border-[var(--border-subtle)] mb-2 w-full">
                  <div className="w-1/2 h-full" style={{ backgroundColor: pair.bg }} title={`Background: ${pair.bg}`} />
                  <div className="w-1/2 h-full" style={{ backgroundColor: pair.fg }} title={`Foreground: ${pair.fg}`} />
                </div>

                <div>
                  <div className="font-sans text-xs font-bold uppercase truncate text-[var(--text-primary)]">
                    {pair.name}
                  </div>
                  <div className="font-mono text-xs text-[var(--text-secondary)]">
                    {pairRatio}:1
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 14: Accessibility Explanation ──────────────────────── */}
      <section className="p-8 border border-[var(--border-subtle)] rounded-xs mb-16">
        <span className="font-mono text-xs font-medium tracking-[0.12em] uppercase text-text-secondary mb-2 block">WCAG ARCHITECTURE</span>
        <h3 className="font-sans text-lg font-bold uppercase tracking-tight text-[var(--text-primary)] mb-3">
          WHAT DOES THE RATIO MEAN?
        </h3>
        <p className="font-sans text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed mb-6">
          Contrast ratio measures the difference in perceived luminance between foreground typography and its surrounding background surface on a scale from 1:1 (zero contrast) to 21:1 (pure black on pure white).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[var(--border-subtle)] font-mono text-xs">
          <div>
            <span className="font-bold text-[var(--text-primary)] block mb-1">4.5 : 1</span>
            <span className="text-[var(--text-secondary)]">
              Normal text AA threshold for all standard body typography under 18pt.
            </span>
          </div>
          <div>
            <span className="font-bold text-[var(--text-primary)] block mb-1">7.0 : 1</span>
            <span className="text-[var(--text-secondary)]">
              Normal text AAA threshold for enhanced readability and low-vision accessibility.
            </span>
          </div>
          <div>
            <span className="font-bold text-[var(--text-primary)] block mb-1">3.0 : 1</span>
            <span className="text-[var(--text-secondary)]">
              Large text AA threshold for bold headlines ≥ 14pt or regular text ≥ 18pt.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
