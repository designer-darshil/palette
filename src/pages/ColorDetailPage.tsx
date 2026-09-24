import React, { useMemo } from 'react';
import {
  Copy,
  Bookmark,
  Share2,
  Check,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { RouteType, ColorItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { copyToClipboard, calculateHarmonies, assessPracticalUi } from '../utils/colorUtils';
import { createColorItemFromHex } from '../utils/canonicalResourceUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { ColorCard } from '../components/ColorCard';
import { PaletteCard } from '../components/PaletteCard';
import { ComboCard } from '../components/ComboCard';
import { GradientCard } from '../components/GradientCard';
import { NotFoundPage } from './NotFoundPage';
import { SEOHead } from '../components/seo/SEOHead';
import { generateColorSchema } from '../utils/schemaGenerator';
import { KromaButton } from '../components/common/KromaButton';
import { Link } from '../components/common/Link';
import { Analytics } from '../utils/analytics';

interface ColorDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const ColorDetailPage: React.FC<ColorDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem, savedItems } = useSaved();
  const { colors, palettes, combos, gradients } = useLibraryData();

  const color: ColorItem | null = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase();

    // 1. Check Library Data (Curated + Custom + Admin)
    const matchLib = colors.find(
      (c) => c.slug.toLowerCase() === cleanSlug || c.id.toLowerCase() === cleanSlug
    );
    if (matchLib) return matchLib;

    // 2. Check Saved Items
    const matchSaved = savedItems.find(
      (s) => s.type === 'color' && (s.slug.toLowerCase() === cleanSlug || s.id.toLowerCase() === cleanSlug)
    );
    if (matchSaved && matchSaved.preview) {
      const hex = matchSaved.preview.startsWith('#')
        ? matchSaved.preview.toUpperCase()
        : `#${matchSaved.preview.toUpperCase()}`;
      return createColorItemFromHex(hex, matchSaved.title);
    }

    // 3. Dynamic HEX Slug Support (e.g. /colors/E9C46A or /colors/10288C)
    if (/^[0-9A-Fa-f]{6}$/.test(cleanSlug)) {
      const hex = `#${cleanSlug.toUpperCase()}`;
      return createColorItemFromHex(hex);
    }

    return null;
  }, [slug, colors, savedItems]);

  if (!color) {
    return <NotFoundPage requestedUrl={`/colors/${slug}`} onNavigate={onNavigate} />;
  }
  const saved = isSaved(color.id);

  const calculatedHarmonies = calculateHarmonies(color.hex);
  const practicalUi = assessPracticalUi(color.hex);

  const colorSchema = useMemo(() => {
    return generateColorSchema(color);
  }, [color]);

  const handleCopyValue = async (value: string, format: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      Analytics.trackColorCopy(value, format, color.name);
      showToast(`Copied ${format}`, color.name, value);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const success = await copyToClipboard(url);
    if (success) {
      showToast('Specimen link copied to clipboard', color.name);
    }
  };

  const handleToggleSave = () => {
    saveItem({
      id: color.id,
      type: 'color',
      title: color.name,
      slug: color.slug,
      preview: color.hex,
      metadata: `${color.family} • ${color.hex}`,
    });
    if (!saved) {
      Analytics.trackSpecimenSave('color', color.id, color.name);
    }
    showToast(
      saved ? 'Removed from saved' : 'Saved to specimen library',
      color.name,
      color.hex
    );
  };

  const findMatchingColor = (hex: string) => {
    return colors.find((c: ColorItem) => c.hex.toLowerCase() === hex.toLowerCase());
  };

  // Connected Resource Network
  const relatedColors = colors
    .filter(
      (c: ColorItem) => c.id !== color.id && (c.family === color.family || c.hueGroup === color.hueGroup)
    )
    .slice(0, 4);

  const relatedPalettes = palettes
    .filter(
      (p) =>
        p.colors.some((c) => c.hex.toLowerCase() === color.hex.toLowerCase()) ||
        (color.family && p.tags && p.tags.includes(color.family)) ||
        (color.hueGroup && p.tags && p.tags.includes(color.hueGroup))
    )
    .slice(0, 3);

  const relatedCombos = combos
    .filter(
      (cb) =>
        cb.colors.some((c) => c.hex.toLowerCase() === color.hex.toLowerCase()) ||
        (color.family && cb.tags && cb.tags.includes(color.family))
    )
    .slice(0, 3);

  const relatedGradients = gradients
    .filter(
      (g) =>
        g.stops.some((s) => s.color.toLowerCase() === color.hex.toLowerCase()) ||
        (color.family && g.tags && g.tags.includes(color.family)) ||
        (color.hueGroup && g.tags && g.tags.includes(color.hueGroup))
    )
    .slice(0, 3);

  // Technical specifications ledger data
  const specLedger = [
    { label: 'HEX CANONICAL', value: color.hex, format: 'HEX' },
    { label: 'sRGB SPACE', value: color.rgb, format: 'RGB' },
    { label: 'HSL METRICS', value: color.hsl, format: 'HSL' },
    { label: 'OKLCH PERCEPTUAL', value: color.oklch, format: 'OKLCH' },
    { label: 'WCAG ON WHITE (#FFFFFF)', value: `${practicalUi.onWhiteRatio}:1 (${practicalUi.onWhiteRating.label})`, format: 'RATIO' },
    { label: 'WCAG ON DARK (#111215)', value: `${practicalUi.onBlackRatio}:1 (${practicalUi.onBlackRating.label})`, format: 'RATIO' },
    { label: 'RECOMMENDED FOREGROUND', value: color.bestTextColor, format: 'HEX' },
    { label: 'SPECTRAL GAMUT', value: `${color.family.toUpperCase()} · ${color.hueGroup || color.tone || 'BALANCED'}`, format: 'GAMUT' },
  ];

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 pb-20 box-border text-[#171717] dark:text-white flex flex-col gap-10 sm:gap-14">
      <SEOHead
        title={`Inspect Specimen: ${color.name} (${color.hex}) | KROMA`}
        description={`${color.description} Calibrated color specimen values: HEX ${color.hex}, ${color.rgb}, ${color.hsl}, OKLCH ${color.oklch}. Contrast with White: ${color.contrastWithWhite}:1.`}
        canonicalPath={`/colors/${color.slug}`}
        jsonLd={colorSchema}
        keywords={[color.name, color.hex, color.family, color.hueGroup, ...(color.tags || [])]}
      />

      {/* ── 01: Compact Editorial Header ────────────────────────────── */}
      <header className="pb-6 border-b border-black/[0.08] dark:border-white/[0.08]">
        {/* Editorial Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#707070] dark:text-[#909090] mb-3">
          <Link
            to={{ path: 'colors' }}
            className="hover:text-[#171717] dark:hover:text-white cursor-pointer transition-colors p-0 font-mono text-xs uppercase tracking-wider text-[#707070] dark:text-[#909090] no-underline"
          >
            COLOURS
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-[#171717] dark:text-white font-semibold">{color.family.toUpperCase()}</span>
          <span className="opacity-40">/</span>
          <span className="opacity-70">{color.name.toUpperCase()}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-xs font-semibold tracking-wider uppercase text-[#707070] dark:text-[#909090] mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-[1px] bg-[#00AEEF]" />
              <span>INSPECT SPECIMEN • Nº {color.id.toUpperCase()}</span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[1.08] text-[#171717] dark:text-white m-0">
              INSPECT SPECIMENS
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#707070] dark:text-[#A0A0A0] max-w-xl m-0 mt-2 leading-[1.5]">
              Study colour relationships, values, typography, and visual behaviour in detail.
            </p>
          </div>

          {/* Action Toolbar — Kroma Button System (ONE ACTION = ONE VISUAL ICON) */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <KromaButton
              variant="filled"
              size="sm"
              iconLeft={<Copy size={13} />}
              onClick={() => handleCopyValue(color.hex, 'HEX')}
            >
              Copy HEX
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              iconLeft={<Sparkles size={13} />}
              onClick={() => onNavigate({ path: 'color-relationships', slug: color.slug })}
              title="View Harmonic Relationships"
            >
              Harmonics
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              iconLeft={<ShieldCheck size={13} />}
              onClick={() =>
                onNavigate({
                  path: 'contrast-checker',
                  fg: color.hex.replace('#', ''),
                  bg: 'FFFFFF',
                })
              }
              title="Test in Contrast Checker"
            >
              Contrast
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              iconLeft={<Wand2 size={13} />}
              onClick={() =>
                onNavigate({
                  path: 'palette-generator',
                  colors: color.hex.replace('#', ''),
                })
              }
              title="Generate Harmonic Palette"
            >
              Generate Palette
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              iconLeft={<Share2 size={13} />}
              onClick={handleShare}
              title="Share Specimen URL"
            >
              Share
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              iconLeft={<Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />}
              onClick={handleToggleSave}
            >
              {saved ? 'Saved' : 'Save'}
            </KromaButton>
          </div>
        </div>
      </header>

      {/* ── 02: Primary Specimen Canvas (The Hero) ──────────────────── */}
      <section aria-label="Primary Specimen Canvas" className="flex flex-col gap-4">
        <div
          className="w-full min-h-[300px] sm:min-h-[380px] md:min-h-[440px] rounded-[3px] p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden transition-all duration-200 border border-black/[0.08] dark:border-white/[0.08] select-none"
          style={{ backgroundColor: color.hex, color: color.bestTextColor || '#FFFFFF' }}
        >
          {/* Top Bar inside Specimen */}
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider opacity-90 gap-4">
            <span className="font-semibold drop-shadow-xs">
              SPECIMEN Nº {color.id.toUpperCase()} • {color.family.toUpperCase()} GAMUT
            </span>
            <KromaButton
              variant="ghost"
              size="sm"
              iconLeft={<Copy size={12} />}
              onClick={() => handleCopyValue(color.hex, 'HEX')}
              className="bg-black/35 hover:bg-black/55 text-white font-mono text-xs font-semibold py-1.5 px-3 rounded-[2px] inline-flex items-center gap-1.5 backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer shadow-xs border-0"
              title="Click to copy HEX"
            >
              COPY HEX
            </KromaButton>
          </div>

          {/* Bottom Title & Dominant Callout */}
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider opacity-85 block mb-1">
              CANONICAL PIGMENT STUDY
            </span>
            <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-none m-0 drop-shadow-xs">
              {color.name}
            </h2>
            <div className="font-mono text-xl sm:text-2xl font-bold mt-2 opacity-95 tracking-wide drop-shadow-xs">
              {color.hex}
            </div>
          </div>
        </div>
      </section>

      {/* ── 03: Technical Specification Ledger (Print Specification Sheet) ─ */}
      <section aria-label="Technical Specifications Ledger" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#707070] dark:text-[#909090]">
            01 — TECHNICAL SPECIFICATION LEDGER
          </span>
          <span className="font-mono text-xs text-[#707070] dark:text-[#909090] uppercase">
            CALIBRATED COLOR VALUES • CLICK VALUE TO COPY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {specLedger.map((spec) => (
            <button
              key={spec.label}
              type="button"
              onClick={() => handleCopyValue(spec.value, spec.format)}
              className="p-3.5 bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[2px] flex flex-col justify-between gap-2 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 select-none group text-left"
              title={`Click to copy ${spec.label}`}
              aria-label={`Copy ${spec.label}: ${spec.value}`}
            >
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#707070] dark:text-[#909090] w-full">
                <span>{spec.label}</span>
                <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-mono text-sm sm:text-base font-bold text-[#171717] dark:text-white truncate">
                {spec.value}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── 04: Authentic Typography Specimen Sheet ─────────────────── */}
      <section aria-label="Typography Specimen Sheet" className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#707070] dark:text-[#909090]">
            02 — TYPOGRAPHY SPECIMEN SHEET
          </span>
          <span className="font-mono text-xs text-[#707070] dark:text-[#909090] uppercase">
            GENERAL SANS SPECIMEN RENDERED IN {color.name.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Specimen Rendered on Pure Light Canvas */}
          <div
            className="p-6 sm:p-8 rounded-[3px] border border-black/10 flex flex-col justify-between min-h-[300px]"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <div>
              <div className="flex items-center justify-between font-mono text-xs uppercase text-[#707070] mb-4 pb-2 border-b border-black/[0.08]">
                <span>ON WHITE CANVAS (#FFFFFF)</span>
                <span className="font-bold text-[#171717]">WCAG {practicalUi.onWhiteRatio}:1 · {practicalUi.onWhiteRating.label}</span>
              </div>
              <div className="font-sans text-5xl sm:text-6xl font-extrabold mb-3 leading-none" style={{ color: color.hex }}>
                Aa
              </div>
              <div className="font-sans text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 break-all" style={{ color: color.hex }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </div>
              <div className="font-sans text-xs sm:text-sm font-normal tracking-wide lowercase mb-3 break-all" style={{ color: color.hex }}>
                abcdefghijklmnopqrstuvwxyz
              </div>
              <div className="font-mono text-xs font-bold tracking-widest mb-4" style={{ color: color.hex }}>
                0123456789 • !@#$%&amp;*()_+-=
              </div>
              <p className="font-sans text-sm sm:text-base font-semibold leading-relaxed m-0" style={{ color: color.hex }}>
                Harmonic resonance calibrated against pure architectural daylight.
              </p>
            </div>
            <div className="font-mono text-xs text-[#707070] pt-3 border-t border-black/[0.06] flex items-center justify-between">
              <span>CONTRAST EVALUATION</span>
              <span>{practicalUi.onWhiteRating.passAA ? 'PASSES WCAG AA' : 'REQUIRES ADJUSTMENT'}</span>
            </div>
          </div>

          {/* Specimen Rendered on Pure Dark Canvas */}
          <div
            className="p-6 sm:p-8 rounded-[3px] border border-white/10 flex flex-col justify-between min-h-[300px]"
            style={{ backgroundColor: '#111215' }}
          >
            <div>
              <div className="flex items-center justify-between font-mono text-xs uppercase text-[#909090] mb-4 pb-2 border-b border-white/[0.08]">
                <span>ON DARK CANVAS (#111215)</span>
                <span className="font-bold text-white">WCAG {practicalUi.onBlackRatio}:1 · {practicalUi.onBlackRating.label}</span>
              </div>
              <div className="font-sans text-5xl sm:text-6xl font-extrabold mb-3 leading-none" style={{ color: color.hex }}>
                Aa
              </div>
              <div className="font-sans text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 break-all" style={{ color: color.hex }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </div>
              <div className="font-sans text-xs sm:text-sm font-normal tracking-wide lowercase mb-3 break-all" style={{ color: color.hex }}>
                abcdefghijklmnopqrstuvwxyz
              </div>
              <div className="font-mono text-xs font-bold tracking-widest mb-4" style={{ color: color.hex }}>
                0123456789 • !@#$%&amp;*()_+-=
              </div>
              <p className="font-sans text-sm sm:text-base font-semibold leading-relaxed m-0" style={{ color: color.hex }}>
                Chromatically stable luminance balanced for deep OLED interface surfaces.
              </p>
            </div>
            <div className="font-mono text-xs text-[#909090] pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span>CONTRAST EVALUATION</span>
              <span>{practicalUi.onBlackRating.passAA ? 'PASSES WCAG AA' : 'REQUIRES ADJUSTMENT'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05: Visual Colour Relationships (Actual Color Fields) ──── */}
      <section aria-label="Visual Colour Relationships" className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#707070] dark:text-[#909090]">
            03 — CALCULATED RELATIONAL HARMONIES
          </span>
          <span className="font-mono text-xs text-[#707070] dark:text-[#909090] uppercase">
            MATHEMATICAL COLOR WHEEL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Complementary (180°) */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[2px] overflow-hidden flex flex-col justify-between min-h-[160px]">
            <button
              type="button"
              className="w-full h-24 cursor-pointer relative group flex items-end p-2 border-0"
              style={{ backgroundColor: calculatedHarmonies.complementary }}
              onClick={() => {
                const match = findMatchingColor(calculatedHarmonies.complementary);
                if (match) onNavigate({ path: 'color-detail', slug: match.slug });
                else handleCopyValue(calculatedHarmonies.complementary, 'Complementary HEX');
              }}
              title="Click to inspect or copy"
              aria-label={`Inspect or copy complementary color ${calculatedHarmonies.complementary}`}
            >
              <span className="font-mono text-xs font-bold text-white bg-black/50 px-1.5 py-0.5 rounded-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
                {calculatedHarmonies.complementary}
              </span>
            </button>
            <div className="p-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#707070] dark:text-[#909090] block">
                COMPLEMENTARY (180°)
              </span>
              <div className="font-sans text-xs font-bold text-[#171717] dark:text-white uppercase truncate mt-0.5">
                {findMatchingColor(calculatedHarmonies.complementary)?.name || 'Direct Complement'}
              </div>
            </div>
          </div>

          {/* Analogous (±30°) */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[2px] overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="w-full h-24 flex">
              {calculatedHarmonies.analogous.map((hex, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex-1 h-full cursor-pointer relative group flex items-end p-2 border-0"
                  style={{ backgroundColor: hex }}
                  onClick={() => {
                    const match = findMatchingColor(hex);
                    if (match) onNavigate({ path: 'color-detail', slug: match.slug });
                    else handleCopyValue(hex, 'Analogous HEX');
                  }}
                  title={`Analogous ${hex}`}
                  aria-label={`Inspect or copy analogous color ${hex}`}
                >
                  <span className="font-mono text-xs font-bold text-white bg-black/50 px-1 py-0.5 rounded-[1px] opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {hex}
                  </span>
                </button>
              ))}
            </div>
            <div className="p-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#707070] dark:text-[#909090] block">
                ANALOGOUS (±30°)
              </span>
              <div className="font-sans text-xs font-bold text-[#171717] dark:text-white uppercase truncate mt-0.5">
                Adjacent Spectrum Pair
              </div>
            </div>
          </div>

          {/* Triadic (±120°) */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[2px] overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="w-full h-24 flex">
              {calculatedHarmonies.triadic.map((hex, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex-1 h-full cursor-pointer relative group flex items-end p-2 border-0"
                  style={{ backgroundColor: hex }}
                  onClick={() => {
                    const match = findMatchingColor(hex);
                    if (match) onNavigate({ path: 'color-detail', slug: match.slug });
                    else handleCopyValue(hex, 'Triadic HEX');
                  }}
                  title={`Triadic ${hex}`}
                  aria-label={`Inspect or copy triadic color ${hex}`}
                >
                  <span className="font-mono text-xs font-bold text-white bg-black/50 px-1 py-0.5 rounded-[1px] opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {hex}
                  </span>
                </button>
              ))}
            </div>
            <div className="p-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#707070] dark:text-[#909090] block">
                TRIADIC (±120°)
              </span>
              <div className="font-sans text-xs font-bold text-[#171717] dark:text-white uppercase truncate mt-0.5">
                Equilateral Harmony
              </div>
            </div>
          </div>

          {/* Split Complementary (180° ±30°) */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[2px] overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="w-full h-24 flex">
              {calculatedHarmonies.splitComplementary.map((hex, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex-1 h-full cursor-pointer relative group flex items-end p-2 border-0"
                  style={{ backgroundColor: hex }}
                  onClick={() => {
                    const match = findMatchingColor(hex);
                    if (match) onNavigate({ path: 'color-detail', slug: match.slug });
                    else handleCopyValue(hex, 'Split Complementary HEX');
                  }}
                  title={`Split Complementary ${hex}`}
                  aria-label={`Inspect or copy split complementary color ${hex}`}
                >
                  <span className="font-mono text-xs font-bold text-white bg-black/50 px-1 py-0.5 rounded-[1px] opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {hex}
                  </span>
                </button>
              ))}
            </div>
            <div className="p-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#707070] dark:text-[#909090] block">
                SPLIT COMPLEMENTARY
              </span>
              <div className="font-sans text-xs font-bold text-[#171717] dark:text-white uppercase truncate mt-0.5">
                Compound Harmonic
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 06: Tonal Step Matrix (100–950) ─────────────────────────── */}
      <section aria-label="Tonal Step Matrix" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#707070] dark:text-[#909090]">
            04 — TONAL STEP MATRIX (100–950)
          </span>
          <span className="font-mono text-xs text-[#707070] dark:text-[#909090] uppercase">
            CLICK STEP TO COPY HEX
          </span>
        </div>

        <div className="w-full overflow-x-auto pb-1.5 scrollbar-none">
          <div className="flex min-w-[620px] rounded-[2px] overflow-hidden border border-black/[0.08] dark:border-white/[0.08]">
            {color.shades.map((shade, idx) => (
              <button
                key={idx}
                type="button"
                className="flex-1 h-20 p-2.5 flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.02] hover:z-10 select-none border-0 text-left"
                style={{
                  backgroundColor: shade.hex,
                  color: idx < 3 ? '#111111' : '#FFFFFF',
                }}
                onClick={() => handleCopyValue(shade.hex, `Shade ${shade.level}`)}
                title={`Copy Shade ${shade.level}: ${shade.hex}`}
                aria-label={`Copy shade ${shade.level}: ${shade.hex}`}
              >
                <span className="font-mono text-xs font-bold opacity-80">{shade.level}</span>
                <span className="font-mono text-xs font-bold truncate">{shade.hex}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07: Connected Resource Network (Palettes, Combos, Gradients) */}
      {relatedPalettes.length > 0 && (
        <section aria-label="Related Palette Systems" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#707070] dark:text-[#909090]">
              PALETTE SYSTEMS FEATURING {color.name.toUpperCase()}
            </span>
            <KromaButton
              variant="ghost"
              size="sm"
              iconRight={<ArrowUpRight size={12} />}
              onClick={() => onNavigate({ path: 'palettes' })}
              className="text-xs font-mono uppercase text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white cursor-pointer p-0 h-auto"
            >
              EXPLORE ALL
            </KromaButton>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedPalettes.map((p) => (
              <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {relatedCombos.length > 0 && (
        <section aria-label="Related Color Combos" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#707070] dark:text-[#909090]">
              TWO-COLOR RELATIONS IN THIS GAMUT
            </span>
            <KromaButton
              variant="ghost"
              size="sm"
              iconRight={<ArrowUpRight size={12} />}
              onClick={() => onNavigate({ path: 'combos' })}
              className="text-xs font-mono uppercase text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white cursor-pointer p-0 h-auto"
            >
              EXPLORE ALL
            </KromaButton>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedCombos.map((cb) => (
              <ComboCard key={cb.id} combo={cb} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {relatedGradients.length > 0 && (
        <section aria-label="Related Gradients" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#707070] dark:text-[#909090]">
              CURATED GRADIENTS IN THIS COLORWAY
            </span>
            <KromaButton
              variant="ghost"
              size="sm"
              iconRight={<ArrowUpRight size={12} />}
              onClick={() => onNavigate({ path: 'gradients' })}
              className="text-xs font-mono uppercase text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white cursor-pointer p-0 h-auto"
            >
              EXPLORE ALL
            </KromaButton>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedGradients.map((g) => (
              <GradientCard key={g.id} gradient={g} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {relatedColors.length > 0 && (
        <section aria-label="Related Specimens" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#707070] dark:text-[#909090]">
              RELATED {color.family.toUpperCase()} SPECIMENS
            </span>
            <KromaButton
              variant="ghost"
              size="sm"
              iconRight={<ArrowUpRight size={12} />}
              onClick={() => onNavigate({ path: 'colors' })}
              className="text-xs font-mono uppercase text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white cursor-pointer p-0 h-auto"
            >
              ALL SPECIMENS
            </KromaButton>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedColors.map((c) => (
              <ColorCard key={c.id} color={c} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
