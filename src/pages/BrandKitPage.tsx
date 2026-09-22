import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Layout,
  Smartphone,
  BarChart3,
  Copy,
  Share2,
  Bookmark,
  ExternalLink,
  Code,
  Sliders,
  TrendingUp,
  CreditCard,
  Bell,
  Activity,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import {
  copyToClipboard,
  hexToRgb,
  hexToHsl,
} from '../utils/colorUtils';
import { findClosestColorName } from '../utils/paletteGenerator';
import {
  BrandKitItem,
  BrandKitRoles,
  DEFAULT_BRAND_KIT,
  FONT_OPTIONS,
  getSavedBrandKits,
  saveBrandKitToStorage,
  generateBrandKitCssTokens,
} from '../utils/brandKitStorage';
import {
  auditBrandKitIntelligence,
  mapPaletteToSemanticRoles,
  calculateWcagRatio,
  formatContrastRatio,
  hexToOklch,
  oklchToCssString,
  getSmartForeground,
  adjustColorForContrast,
  SemanticRolesModel,
  SemanticRelationshipCheck,
} from '../utils/oklchColorSystem';
import { ColorPickerModal } from '../components/ColorPickerModal';
import { ColorSwatchPicker } from '../components/common/ColorSwatchPicker';
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebApplicationSchema } from '../utils/schemaGenerator';

interface BrandKitPageProps {
  initialId?: string;
  initialPaletteSlug?: string;
  onNavigate: (route: RouteType) => void;
}

export const BrandKitPage: React.FC<BrandKitPageProps> = ({
  initialId,
  initialPaletteSlug,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem } = useSaved();
  const { palettes } = useLibraryData();

  // Load active brand kit (holds original user colors)
  const [brandKit, setBrandKit] = useState<BrandKitItem>(() => {
    const savedKits = getSavedBrandKits();
    if (initialId) {
      const match = savedKits.find((k) => k.id === initialId);
      if (match) return match;
    }
    return savedKits[0] || DEFAULT_BRAND_KIT;
  });

  const [previewMode, setPreviewMode] = useState<'website' | 'mobile' | 'dashboard'>('website');
  const [previewColorMode, setPreviewColorMode] = useState<'accessible' | 'original'>('accessible');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'css' | 'json' | 'tailwind'>('css');
  const [isEditingIdentity, setIsEditingIdentity] = useState<boolean>(false);
  const [pickerTarget, setPickerTarget] = useState<{
    key: keyof BrandKitRoles;
    label: string;
    color: string;
  } | null>(null);

  // ── WCAG 2.2 + OKLCH Color Intelligence Engine ─────────────────────
  // Evaluates every semantic relationship and derives accessible variants using OKLCH
  const intelligenceReport = useMemo(() => {
    return auditBrandKitIntelligence(brandKit.roles);
  }, [brandKit.roles]);

  // The active roles used in previews: defaults to accessible OKLCH variants so preview is always readable
  const activePreviewRoles = useMemo(() => {
    return previewColorMode === 'accessible'
      ? intelligenceReport.accessibleRoles
      : (brandKit.roles as unknown as SemanticRolesModel);
  }, [previewColorMode, intelligenceReport.accessibleRoles, brandKit.roles]);

  // Pre-calculate curated presets quality status for subtle badges
  const curatedQualityMap = useMemo(() => {
    const map: Record<string, 'AAA ✓' | 'AA ✓' | 'AA NEEDS ADJ'> = {};
    palettes.slice(0, 8).forEach((p) => {
      const res = mapPaletteToSemanticRoles(p.colors.map((c) => c.hex));
      map[p.id] =
        res.quality === 'WCAG AAA READY'
          ? 'AAA ✓'
          : res.quality === 'WCAG AA READY'
          ? 'AA ✓'
          : 'AA NEEDS ADJ';
    });
    return map;
  }, [palettes]);

  // If initialPaletteSlug provided, map its colors into roles intelligently
  useEffect(() => {
    if (initialPaletteSlug) {
      const clean = initialPaletteSlug.replace(/^(palettes|palette|gen-pal|ext-pal)-/i, '');
      const hexParts = clean.match(/[0-9a-fA-F]{6}/g);
      if (hexParts && hexParts.length >= 2) {
        const hexList = hexParts.map((h) => `#${h.toUpperCase()}`);
        const mapped = mapPaletteToSemanticRoles(hexList);
        setBrandKit((prev) => ({
          ...prev,
          roles: {
            ...prev.roles,
            ...mapped.original,
          },
          updatedAt: new Date().toISOString(),
        }));
        showToast('Applied palette & verified contrast', `${hexList.length} swatches mapped`);
      }
    }
  }, [initialPaletteSlug]);

  // Handle role color change (always modifies original color; OKLCH variant recalculated reactively)
  const handleRoleColorChange = (roleKey: keyof BrandKitRoles, newHex: string) => {
    const clean = newHex.startsWith('#') ? newHex.toUpperCase() : `#${newHex.toUpperCase()}`;
    if (/^#[0-9A-F]{0,6}$/i.test(clean)) {
      setBrandKit((prev) => {
        const updatedRoles = {
          ...prev.roles,
          [roleKey]: clean,
        };
        return {
          ...prev,
          roles: updatedRoles,
          updatedAt: new Date().toISOString(),
        };
      });
    }
  };

  // Auto-Remediate all failing roles using minimal OKLCH adjustments
  const handleAutoRemediateOklch = () => {
    const accessible = intelligenceReport.accessibleRoles;
    setBrandKit((prev) => ({
      ...prev,
      roles: {
        ...prev.roles,
        text: accessible.text,
        buttonText: accessible.buttonText,
        cardText: accessible.cardText,
        mutedText: accessible.mutedText,
        border: accessible.border,
        button: accessible.button,
      },
      updatedAt: new Date().toISOString(),
    }));
    showToast('Applied OKLCH Accessible Adjustments', 'All WCAG thresholds satisfied');
  };

  // Apply single OKLCH role fix
  const handleApplySingleCheckFix = (check: SemanticRelationshipCheck) => {
    if (!check.suggestedFg) return;
    setBrandKit((prev) => {
      const updated = { ...prev.roles };
      if (check.id === 'bg-text') updated.text = check.suggestedFg!;
      else if (check.id === 'bg-muted') updated.mutedText = check.suggestedFg!;
      else if (check.id === 'surface-text') updated.cardText = check.suggestedFg!;
      else if (check.id === 'button-text') updated.buttonText = check.suggestedFg!;
      else if (check.id === 'border-bg') updated.border = check.suggestedFg!;
      return {
        ...prev,
        roles: updated,
        updatedAt: new Date().toISOString(),
      };
    });
    showToast(`Remediated ${check.label}`, `Updated to ${check.suggestedFg}`);
  };

  // Intelligent palette loader with semantic role assignment
  const handleApplyPalette = (palette: PaletteItem) => {
    if (!palette.colors || palette.colors.length === 0) return;
    const cols = palette.colors.map((c) => c.hex);
    const mapped = mapPaletteToSemanticRoles(cols);

    setBrandKit((prev) => ({
      ...prev,
      paletteSlug: palette.slug,
      paletteTitle: palette.title,
      roles: {
        ...prev.roles,
        ...mapped.original,
      },
      updatedAt: new Date().toISOString(),
    }));
    showToast(`Loaded ${palette.title}`, `Semantic roles mapped • ${mapped.quality}`);
  };

  // Save Brand Kit
  const handleSaveBrandKit = () => {
    saveBrandKitToStorage(brandKit);
    saveItem({
      id: brandKit.id,
      type: 'palette',
      title: `${brandKit.name} Brand System`,
      slug: brandKit.id,
      preview: `${brandKit.roles.primary},${brandKit.roles.secondary},${brandKit.roles.accent},${brandKit.roles.background}`,
      metadata: `Brand Kit • ${brandKit.name}`,
    });
    showToast('Saved Brand Kit to Workspace', brandKit.name);
  };

  // Share action
  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Brand Kit link copied', brandKit.name);
    }
  };

  // Subtle inline copy handler
  const handleCopyColorValue = async (key: string, value: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 1400);
    }
  };

  // Export Design Tokens (supports CSS custom properties, Tailwind, JSON)
  const exportContent = useMemo(() => {
    if (exportFormat === 'css') {
      return generateBrandKitCssTokens(brandKit);
    }
    if (exportFormat === 'json') {
      return JSON.stringify({
        ...brandKit,
        accessibleVariants: intelligenceReport.accessibleRoles,
        wcagAssessment: intelligenceReport.overallQuality,
      }, null, 2);
    }
    return `module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '${brandKit.roles.primary}',
          secondary: '${brandKit.roles.secondary}',
          accent: '${brandKit.roles.accent}',
          background: '${brandKit.roles.background}',
          surface: '${brandKit.roles.surface}',
          text: '${brandKit.roles.text}',
          muted: '${brandKit.roles.mutedText}',
          buttonText: '${brandKit.roles.buttonText}',
          cardText: '${brandKit.roles.cardText}',
          border: '${brandKit.roles.border}',
          // OKLCH Accessible Variants
          accessible: {
            text: '${intelligenceReport.accessibleRoles.text}',
            buttonText: '${intelligenceReport.accessibleRoles.buttonText}',
            cardText: '${intelligenceReport.accessibleRoles.cardText}',
            mutedText: '${intelligenceReport.accessibleRoles.mutedText}',
            border: '${intelligenceReport.accessibleRoles.border}',
          }
        }
      },
      fontFamily: {
        heading: [${brandKit.typography.headingFont}],
        body: [${brandKit.typography.bodyFont}],
      }
    }
  }
};`;
  }, [brandKit, exportFormat, intelligenceReport]);

  const handleCopyTokens = async () => {
    const success = await copyToClipboard(exportContent);
    if (success) {
      showToast(`Copied ${exportFormat.toUpperCase()} Design Tokens`, brandKit.name);
    }
  };

  // Smart foregrounds for active preview surfaces
  const canvasContrastText = getSmartForeground(activePreviewRoles.primary, 4.5).color;
  const secondaryContrastText = getSmartForeground(activePreviewRoles.secondary, 4.5).color;
  const accentContrastText = getSmartForeground(activePreviewRoles.accent, 4.5).color;

  const brandKitSchema = useMemo(() => {
    return generateWebApplicationSchema({
      name: 'Brand Kit Studio & Design System Generator',
      description:
        'Interactive design system builder and brand token workspace with real-time web, mobile app, and dashboard UI live preview testing.',
      url: '/brand-kit',
      applicationCategory: 'DesignApplication',
    });
  }, []);

  // Ordered semantic roles for display
  const primaryRole = { key: 'primary' as const, label: 'Primary Brand Color', roleId: '01 — PRIMARY', hex: brandKit.roles.primary, desc: 'Dominant identity tone used across core touchpoints and actions' };
  const secondaryRoles = [
    { key: 'secondary' as const, label: 'Secondary Tone', roleId: '02 — SECONDARY', hex: brandKit.roles.secondary, desc: 'Supporting chromatic depth and structural hierarchy' },
    { key: 'accent' as const, label: 'Accent Highlight', roleId: '03 — ACCENT', hex: brandKit.roles.accent, desc: 'Vibrant highlight for callouts, tags, and focal points' },
    { key: 'background' as const, label: 'Canvas Background', roleId: '04 — BACKGROUND', hex: brandKit.roles.background, desc: 'Main canvas environment foundation' },
    { key: 'surface' as const, label: 'Card / Surface', roleId: '05 — SURFACE', hex: brandKit.roles.surface, desc: 'Elevated surface container background' },
  ];
  const supportingRoles = [
    { key: 'text' as const, label: 'Body Text', roleId: '06 — TEXT', hex: brandKit.roles.text, desc: 'Primary typography on canvas background' },
    { key: 'buttonText' as const, label: 'Button Text', roleId: '07 — BUTTON TEXT', hex: brandKit.roles.buttonText, desc: 'Foreground typography on primary actions' },
    { key: 'cardText' as const, label: 'Card Text', roleId: '08 — CARD TEXT', hex: brandKit.roles.cardText, desc: 'Foreground typography on elevated surfaces' },
    { key: 'mutedText' as const, label: 'Muted Text', roleId: '09 — MUTED TEXT', hex: brandKit.roles.mutedText, desc: 'Subdued secondary captions and descriptors' },
    { key: 'border' as const, label: 'UI Border', roleId: '10 — BORDER', hex: brandKit.roles.border, desc: 'Structural dividers and component boundaries' },
  ];

  return (
    <div className="brand-studio-workspace">
      <SEOHead
        title="Brand Kit Studio — Visual Identity & Color Workspace | KROMA"
        description="Build a sophisticated brand identity from color with semantic role hierarchy, live multi-surface UI previews, and design token exports."
        canonicalPath="/brand-kit"
        jsonLd={brandKitSchema}
        keywords={['brand kit studio', 'visual identity workspace', 'design system tokens', 'brand color hierarchy', 'WCAG color preview']}
      />

      {/* ── 01: Minimal Editorial Breadcrumb ─────────────────────── */}
      <nav aria-label="Breadcrumb" className="brand-studio-breadcrumb">
        <button
          onClick={() => onNavigate({ path: 'create' })}
          className="brand-studio-breadcrumb-link focus-visible:ring-1 focus-visible:ring-[#171717] outline-none"
        >
          STUDIO
        </button>
        <span className="brand-studio-breadcrumb-sep">/</span>
        <span className="brand-studio-breadcrumb-current">BRAND KIT</span>
      </nav>

      {/* ── 02: Intro Header ──────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <span className="brand-studio-section-label">BRAND KIT</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-primary)] leading-[1.08] m-0">
            Your brand, in color.
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl leading-relaxed">
            Collect, refine, and preview the colors that define your brand.
          </p>
        </div>

        {/* Global Workspace Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium tracking-wide text-[var(--text-primary)] bg-transparent border border-[var(--border-subtle)] hover:border-[var(--text-primary)] focus-visible:ring-1 focus-visible:ring-[#171717] rounded-[2px] transition-colors outline-none"
          >
            <Code size={13} />
            <span>Export Tokens</span>
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium tracking-wide text-[var(--text-primary)] bg-transparent border border-[var(--border-subtle)] hover:border-[var(--text-primary)] focus-visible:ring-1 focus-visible:ring-[#171717] rounded-[2px] transition-colors outline-none"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            onClick={handleSaveBrandKit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium tracking-wide text-white bg-[#171717] hover:bg-black focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#171717] rounded-[2px] transition-colors shadow-sm outline-none"
          >
            <Bookmark size={13} />
            <span>Save Brand Kit</span>
          </button>
        </div>
      </header>

      {/* ── 03: Centerpiece Brand Canvas ─────────────────────────── */}
      <section aria-labelledby="canvas-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span id="canvas-heading" className="brand-studio-section-label !mb-0">
              01 — BRAND IDENTITY CANVAS
            </span>
          </div>

          <button
            onClick={() => setIsEditingIdentity((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-1 focus-visible:ring-[#171717] transition-colors outline-none"
          >
            <Sliders size={12} />
            <span>{isEditingIdentity ? 'Done Editing' : 'Edit Name & Tagline'}</span>
          </button>
        </div>

        {/* Subtle Brand Identity Inputs */}
        {isEditingIdentity && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[2px] transition-all">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brandKit.name}
                onChange={(e) => setBrandKit({ ...brandKit, name: e.target.value })}
                placeholder="e.g. Nexus Studio"
                className="w-full bg-transparent border border-[var(--border-subtle)] focus:border-[var(--text-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] outline-none rounded-[2px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                Tagline / Statement
              </label>
              <input
                type="text"
                value={brandKit.tagline}
                onChange={(e) => setBrandKit({ ...brandKit, tagline: e.target.value })}
                placeholder="e.g. A visual identity built around color."
                className="w-full bg-transparent border border-[var(--border-subtle)] focus:border-[var(--text-primary)] px-3 py-1.5 text-xs text-[var(--text-secondary)] outline-none rounded-[2px]"
              />
            </div>
          </div>
        )}

        {/* Large Visual Composition: The Canvas */}
        <div className="brand-canvas-frame shadow-sm">
          {/* Top Primary Color Field */}
          <div
            className="p-8 sm:p-12 md:p-16 flex flex-col justify-between min-h-[260px] sm:min-h-[320px] transition-colors duration-300"
            style={{
              backgroundColor: brandKit.roles.primary,
              color: canvasContrastText,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-[2px] flex items-center justify-center font-bold text-sm tracking-wider shadow-sm transition-colors"
                  style={{
                    backgroundColor: brandKit.roles.accent,
                    color: getSmartForeground(brandKit.roles.accent, 4.5).color,
                  }}
                >
                  {(brandKit.name && brandKit.name[0]) || 'K'}
                </div>
                <span className="text-xs tracking-[0.15em] uppercase opacity-85 font-mono">
                  BRAND KIT
                </span>
              </div>

              <span className="text-[11px] font-mono uppercase tracking-wider opacity-75">
                PRIMARY • {brandKit.roles.primary}
              </span>
            </div>

            <div className="my-auto py-6">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.02] max-w-2xl m-0">
                {brandKit.name || 'Brand Identity'}
              </h2>
              <p className="text-sm sm:text-base md:text-lg mt-3 opacity-85 max-w-xl font-normal leading-relaxed">
                {brandKit.tagline || 'A visual identity built around color.'}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono opacity-80 pt-4 border-t border-current/15">
              <span>{(() => {
                const oklch = hexToOklch(brandKit.roles.primary);
                return oklchToCssString(oklch.L, oklch.C, oklch.H);
              })()}</span>
              <span>{findClosestColorName(brandKit.roles.primary)}</span>
            </div>
          </div>

          {/* Bottom Split: Secondary Color Field + Accent Color Field */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-t border-[var(--border-subtle)]">
            {/* Secondary Field (7 cols) */}
            <div
              className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between min-h-[160px] transition-colors duration-300"
              style={{
                backgroundColor: brandKit.roles.secondary,
                color: secondaryContrastText,
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider opacity-85">
                <span>02 — SECONDARY FIELD</span>
                <span>{brandKit.roles.secondary}</span>
              </div>
              <div className="py-3">
                <span className="text-base sm:text-lg font-medium block">
                  Harmonic Balance
                </span>
                <span className="text-xs opacity-80 mt-1 block">
                  Grounding surfaces, complementary textures, and visual structure.
                </span>
              </div>
              <div className="text-[10px] font-mono opacity-75">
                {findClosestColorName(brandKit.roles.secondary)}
              </div>
            </div>

            {/* Accent Field (5 cols) */}
            <div
              className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between min-h-[160px] md:border-l border-t md:border-t-0 border-[var(--border-subtle)] transition-colors duration-300"
              style={{
                backgroundColor: brandKit.roles.accent,
                color: accentContrastText,
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider opacity-85">
                <span>03 — ACCENT FIELD</span>
                <span>{brandKit.roles.accent}</span>
              </div>
              <div className="py-3">
                <span className="text-base sm:text-lg font-medium block">
                  Active Contrast
                </span>
                <span className="text-xs opacity-80 mt-1 block">
                  Action triggers, focal highlights, and editorial emphasis.
                </span>
              </div>
              <div className="text-[10px] font-mono opacity-75">
                {findClosestColorName(brandKit.roles.accent)}
              </div>
            </div>
          </div>
        </div>

        {/* Start from Curated Palette Strip with Subtle Accessibility Indicator */}
        <div className="mt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Start from Curated Palette
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {palettes.slice(0, 6).map((pal) => (
              <button
                key={pal.id}
                onClick={() => handleApplyPalette(pal)}
                className="flex items-center gap-1.5 px-2 py-1 bg-transparent hover:bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] focus-visible:ring-1 focus-visible:ring-[#171717] rounded-[2px] transition-colors flex-shrink-0 outline-none"
                title={`Apply ${pal.title} (${curatedQualityMap[pal.id] || 'AA ✓'})`}
              >
                <div className="flex h-2.5 w-8 rounded-[1px] overflow-hidden">
                  {pal.colors.slice(0, 4).map((c, i) => (
                    <span key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-[var(--text-primary)] truncate max-w-[65px]">
                  {pal.title}
                </span>
                <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded-[2px] bg-neutral-100 text-[var(--text-secondary)] border border-neutral-200">
                  {curatedQualityMap[pal.id] || 'AA ✓'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04: Color System (Asymmetric Hierarchy) ─────────────── */}
      <section aria-labelledby="color-system-heading" className="flex flex-col gap-4">
        <div>
          <span id="color-system-heading" className="brand-studio-section-label">
            02 — COLOR SYSTEM
          </span>
          <h2 className="brand-studio-section-title">Hierarchy & Semantic Roles</h2>
          <p className="brand-studio-section-desc">
            Visual roles define identity. Large swatches dominate, communicating priority over raw data.
          </p>
        </div>

        {/* Primary Swatch Dominance (Hero Block) */}
        <div className="border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)] p-4 sm:p-6 flex flex-col md:flex-row items-stretch gap-6 shadow-sm">
          {/* Large Color Swatch Block */}
          <div
            className="w-full md:w-3/5 h-44 sm:h-52 rounded-[2px] p-5 flex flex-col justify-between shadow-inner transition-colors duration-300 relative group cursor-pointer"
            style={{
              backgroundColor: primaryRole.hex,
              color: canvasContrastText,
            }}
            onClick={() => setPickerTarget({ key: 'primary', label: 'Primary Brand Color', color: primaryRole.hex })}
            title="Click to edit Primary Color"
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider opacity-85">
              <span>{primaryRole.roleId}</span>
              <span className="group-hover:underline flex items-center gap-1">Edit Swatch →</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight block">
                {primaryRole.hex}
              </span>
              <span className="text-xs opacity-85 mt-0.5 block">
                {findClosestColorName(primaryRole.hex)}
              </span>
            </div>
          </div>

          {/* Primary Role Info & Values */}
          <div className="w-full md:w-2/5 flex flex-col justify-between gap-4 py-1">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Core Identity Tone
              </span>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-1">
                Primary Brand Color
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                {primaryRole.desc}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-subtle)] text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">HEX</span>
                <button
                  onClick={() => handleCopyColorValue('prim-hex', primaryRole.hex)}
                  className="font-medium text-[var(--text-primary)] hover:underline flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-[#171717] outline-none"
                >
                  {copiedKey === 'prim-hex' ? (
                    <span className="text-emerald-600 font-bold">COPIED</span>
                  ) : (
                    <span>{primaryRole.hex}</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">OKLCH</span>
                {(() => {
                  const oklch = hexToOklch(primaryRole.hex);
                  const str = oklchToCssString(oklch.L, oklch.C, oklch.H);
                  return (
                    <button
                      onClick={() => handleCopyColorValue('prim-oklch', str)}
                      className="font-medium text-[var(--text-primary)] hover:underline focus-visible:ring-1 focus-visible:ring-[#171717] outline-none"
                    >
                      {copiedKey === 'prim-oklch' ? (
                        <span className="text-emerald-600 font-bold">COPIED</span>
                      ) : (
                        <span>{str}</span>
                      )}
                    </button>
                  );
                })()}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">RGB</span>
                {(() => {
                  const rgb = hexToRgb(primaryRole.hex);
                  const str = rgb ? `${rgb.r} / ${rgb.g} / ${rgb.b}` : '—';
                  return (
                    <button
                      onClick={() => handleCopyColorValue('prim-rgb', str)}
                      className="font-medium text-[var(--text-primary)] hover:underline focus-visible:ring-1 focus-visible:ring-[#171717] outline-none"
                    >
                      {copiedKey === 'prim-rgb' ? (
                        <span className="text-emerald-600 font-bold">COPIED</span>
                      ) : (
                        <span>{str}</span>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <ColorSwatchPicker
                value={primaryRole.hex}
                onChange={(newHex) => handleRoleColorChange('primary', newHex)}
                showLabel={false}
                size="md"
              />
              <span className="text-[11px] text-[var(--text-secondary)]">
                Interactive swatch picker
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Roles Grid (4 Asymmetric Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {secondaryRoles.map((role) => {
            const fg = getSmartForeground(role.hex, 4.5).color;
            const oklch = hexToOklch(role.hex);
            const oklchStr = oklchToCssString(oklch.L, oklch.C, oklch.H);
            return (
              <div
                key={role.key}
                className="border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)] overflow-hidden flex flex-col justify-between shadow-sm transition-all"
              >
                {/* Visual Swatch Dominance */}
                <div
                  className="h-28 p-3 flex flex-col justify-between transition-colors duration-300 cursor-pointer group"
                  style={{ backgroundColor: role.hex, color: fg }}
                  onClick={() => setPickerTarget({ key: role.key, label: role.label, color: role.hex })}
                  title={`Edit ${role.label}`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider opacity-85">
                    <span>{role.roleId}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Edit →</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold tracking-tight block">{role.hex}</span>
                    <span className="text-[10px] opacity-80 block truncate">
                      {findClosestColorName(role.hex)}
                    </span>
                  </div>
                </div>

                {/* Role Details */}
                <div className="p-3 flex flex-col justify-between gap-2.5 flex-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                        {role.label}
                      </h4>
                      <ColorSwatchPicker
                        value={role.hex}
                        onChange={(newHex) => handleRoleColorChange(role.key, newHex)}
                        showLabel={false}
                        size="sm"
                      />
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-normal line-clamp-2">
                      {role.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono">
                    <span className="text-[var(--text-secondary)] truncate max-w-[100px]">
                      {oklchStr}
                    </span>
                    <button
                      onClick={() => handleCopyColorValue(`role-${role.key}`, role.hex)}
                      className="text-[var(--text-primary)] hover:underline focus-visible:ring-1 focus-visible:ring-[#171717] outline-none"
                    >
                      {copiedKey === `role-${role.key}` ? (
                        <span className="text-emerald-600 font-bold">COPIED</span>
                      ) : (
                        <span>COPY HEX</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Supporting UI Roles Strip */}
        <div className="border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)] p-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-3">
            Supporting UI & Contrast Roles
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {supportingRoles.map((role) => (
              <div
                key={role.key}
                className="p-2.5 bg-transparent border border-[var(--border-subtle)] rounded-[2px] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ColorSwatchPicker
                    value={role.hex}
                    onChange={(newHex) => handleRoleColorChange(role.key, newHex)}
                    showLabel={false}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-[var(--text-primary)] truncate">
                      {role.label}
                    </div>
                    <div className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {role.hex}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyColorValue(`sup-${role.key}`, role.hex)}
                  className="text-[9px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0 focus-visible:ring-1 focus-visible:ring-[#171717] outline-none"
                >
                  {copiedKey === `sup-${role.key}` ? '✓' : 'COPY'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05: Live Brand Preview ───────────────────────────────── */}
      <section aria-labelledby="live-preview-heading" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span id="live-preview-heading" className="brand-studio-section-label">
              03 — LIVE BRAND PREVIEW
            </span>
            <h2 className="brand-studio-section-title">Real-World Surface Proof</h2>
            <p className="brand-studio-section-desc">
              Experience how your palette actually performs across full digital product touchpoints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Intelligent OKLCH Accessible Variant Toggle */}
            <div className="inline-flex items-center p-0.5 border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)]">
              <button
                onClick={() => setPreviewColorMode('accessible')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-[1px] transition-colors outline-none ${
                  previewColorMode === 'accessible'
                    ? 'bg-[#171717] text-white font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Renders using OKLCH contrast-safe variants so text is guaranteed legible"
              >
                <ShieldCheck size={11} />
                <span>Accessible UI (OKLCH)</span>
              </button>
              <button
                onClick={() => setPreviewColorMode('original')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-[1px] transition-colors outline-none ${
                  previewColorMode === 'original'
                    ? 'bg-[#171717] text-white font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Renders using raw original preset colors directly"
              >
                <span>Original Palette</span>
              </button>
            </div>

            {/* Segmented Switcher for Viewports */}
            <div className="inline-flex items-center p-0.5 border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)]">
              <button
                onClick={() => setPreviewMode('website')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wider uppercase rounded-[1px] transition-colors outline-none ${
                  previewMode === 'website'
                    ? 'bg-[#171717] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Layout size={12} />
                <span>Website</span>
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wider uppercase rounded-[1px] transition-colors outline-none ${
                  previewMode === 'mobile'
                    ? 'bg-[#171717] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Smartphone size={12} />
                <span>Mobile App</span>
              </button>
              <button
                onClick={() => setPreviewMode('dashboard')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wider uppercase rounded-[1px] transition-colors outline-none ${
                  previewMode === 'dashboard'
                    ? 'bg-[#171717] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <BarChart3 size={12} />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Informative subtle banner if OKLCH variants are currently active */}
        {intelligenceReport.hasAdjustments && previewColorMode === 'accessible' && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-[2px] text-xs font-mono text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-[var(--text-primary)]" />
              <span>
                OKLCH Accessible variants active ({intelligenceReport.adjustedRolesCount} roles optimized for guaranteed WCAG AA readability)
              </span>
            </div>
            <button
              onClick={handleAutoRemediateOklch}
              className="text-[11px] font-bold text-[var(--text-primary)] hover:underline"
            >
              Apply to Kit →
            </button>
          </div>
        )}

        {/* Realistic Viewport Container */}
        <div
          className="w-full rounded-[2px] border border-[var(--border-subtle)] overflow-hidden shadow-sm transition-all duration-300"
          style={{
            backgroundColor: activePreviewRoles.background,
            color: activePreviewRoles.text,
            fontFamily: brandKit.typography.bodyFont,
          }}
        >
          {previewMode === 'website' && (
            /* WEBSITE VIEWPORT */
            <div className="flex flex-col min-h-[460px] sm:min-h-[520px]">
              {/* Minimal Web Nav */}
              <header
                className="px-6 py-3.5 flex items-center justify-between border-b gap-3"
                style={{
                  backgroundColor: activePreviewRoles.surface,
                  borderColor: activePreviewRoles.border,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-5 h-5 rounded-[2px] flex items-center justify-center font-bold text-[11px]"
                    style={{
                      backgroundColor: activePreviewRoles.button,
                      color: activePreviewRoles.buttonText,
                    }}
                  >
                    {brandKit.name[0] || 'K'}
                  </span>
                  <span
                    className="font-semibold text-xs tracking-tight"
                    style={{ fontFamily: brandKit.typography.headingFont }}
                  >
                    {brandKit.name}
                  </span>
                </div>

                <nav className="hidden sm:flex items-center gap-5 text-xs opacity-80">
                  <span>Product</span>
                  <span>Systems</span>
                  <span>Manifesto</span>
                </nav>

                <button
                  className="px-3 py-1.5 rounded-[2px] text-xs font-medium tracking-wide transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: activePreviewRoles.button,
                    color: activePreviewRoles.buttonText,
                  }}
                >
                  Explore Studio →
                </button>
              </header>

              {/* Web Hero Section */}
              <div className="p-8 sm:p-14 flex flex-col items-center text-center gap-4 max-w-xl mx-auto my-auto w-full">
                <span
                  className="px-2.5 py-1 rounded-[2px] text-[10px] font-mono uppercase tracking-widest"
                  style={{
                    backgroundColor: activePreviewRoles.surface,
                    color: activePreviewRoles.accent,
                    border: `1px solid ${activePreviewRoles.border}`,
                  }}
                >
                  ✦ {brandKit.tagline || 'Visual Design Platform'}
                </span>

                <h3
                  className="text-2xl sm:text-4xl font-semibold tracking-tight leading-[1.1]"
                  style={{
                    fontFamily: brandKit.typography.headingFont,
                    color: activePreviewRoles.text,
                  }}
                >
                  Intelligent Architecture for Modern Digital Craft
                </h3>

                <p
                  className="text-xs sm:text-sm max-w-md leading-relaxed"
                  style={{ color: activePreviewRoles.mutedText }}
                >
                  Scalable token foundations, real-time perceptual color analysis, and high-fidelity interface systems.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-2">
                  <button
                    className="px-4 py-2 rounded-[2px] text-xs font-medium tracking-wide shadow-sm"
                    style={{
                      backgroundColor: activePreviewRoles.button,
                      color: activePreviewRoles.buttonText,
                    }}
                  >
                    Primary Action
                  </button>
                  <button
                    className="px-4 py-2 rounded-[2px] text-xs font-medium tracking-wide border transition-colors"
                    style={{
                      backgroundColor: activePreviewRoles.surface,
                      color: activePreviewRoles.text,
                      borderColor: activePreviewRoles.border,
                    }}
                  >
                    Documentation
                  </button>
                </div>
              </div>

              {/* Feature Cards Grid */}
              <div
                className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3 border-t"
                style={{
                  backgroundColor: activePreviewRoles.surface,
                  borderColor: activePreviewRoles.border,
                }}
              >
                {[
                  { title: 'Perceptual Harmony', desc: 'Continuous gamut calculation with delta-E metrics.' },
                  { title: 'Semantic Tokens', desc: 'Drop-in Tailwind & CSS variable architectures.' },
                  { title: 'WCAG AAA Compliance', desc: 'Automated remediation for guaranteed accessibility.' },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-[2px] border flex flex-col gap-1.5"
                    style={{
                      backgroundColor: activePreviewRoles.background,
                      borderColor: activePreviewRoles.border,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-[2px] flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: i === 0 ? activePreviewRoles.primary : i === 1 ? activePreviewRoles.secondary : activePreviewRoles.accent,
                        color: i === 2 ? getSmartForeground(activePreviewRoles.accent, 4.5).color : '#FFFFFF',
                      }}
                    >
                      0{i + 1}
                    </div>
                    <h4
                      className="text-xs font-semibold"
                      style={{ fontFamily: brandKit.typography.headingFont, color: activePreviewRoles.cardText }}
                    >
                      {card.title}
                    </h4>
                    <p className="text-[11px] leading-relaxed" style={{ color: activePreviewRoles.mutedText }}>
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {previewMode === 'mobile' && (
            /* MOBILE VIEWPORT */
            <div className="p-6 sm:p-10 flex justify-center w-full">
              <div
                className="w-full max-w-xs rounded-xl border p-4 flex flex-col gap-4 shadow-md"
                style={{
                  backgroundColor: activePreviewRoles.surface,
                  borderColor: activePreviewRoles.border,
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: activePreviewRoles.border }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]"
                      style={{ backgroundColor: activePreviewRoles.button, color: activePreviewRoles.buttonText }}
                    >
                      {brandKit.name[0] || 'K'}
                    </div>
                    <span className="font-semibold text-xs truncate" style={{ fontFamily: brandKit.typography.headingFont }}>
                      {brandKit.name}
                    </span>
                  </div>
                  <Bell size={13} style={{ color: activePreviewRoles.mutedText }} />
                </div>

                <div
                  className="p-4 rounded-lg border flex flex-col gap-1.5"
                  style={{
                    backgroundColor: activePreviewRoles.button,
                    color: activePreviewRoles.buttonText,
                    borderColor: activePreviewRoles.secondary,
                  }}
                >
                  <span className="text-[9px] uppercase font-mono tracking-wider opacity-85">
                    Active Workspace Balance
                  </span>
                  <div className="text-xl font-semibold" style={{ fontFamily: brandKit.typography.headingFont }}>
                    $148,200.00
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span>+12.4% this cycle</span>
                    <span
                      className="px-1.5 py-0.5 rounded-[2px] font-bold text-[9px]"
                      style={{
                        backgroundColor: activePreviewRoles.accent,
                        color: getSmartForeground(activePreviewRoles.accent, 4.5).color,
                      }}
                    >
                      VERIFIED
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono uppercase" style={{ color: activePreviewRoles.mutedText }}>
                    Recent Transactions
                  </span>
                  {[
                    { name: 'Color Engine API', time: '5m ago', val: '+$3,400' },
                    { name: 'Tokens Deployed', time: '2h ago', val: 'Sync' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-2 rounded border flex items-center justify-between text-xs"
                      style={{
                        backgroundColor: activePreviewRoles.background,
                        borderColor: activePreviewRoles.border,
                      }}
                    >
                      <div>
                        <div className="font-medium text-[11px]">{item.name}</div>
                        <div className="text-[9px]" style={{ color: activePreviewRoles.mutedText }}>{item.time}</div>
                      </div>
                      <span className="font-mono text-[11px] font-semibold">{item.val}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full py-2 rounded font-medium text-xs shadow-sm"
                  style={{
                    backgroundColor: activePreviewRoles.button,
                    color: activePreviewRoles.buttonText,
                  }}
                >
                  Confirm Action
                </button>
              </div>
            </div>
          )}

          {previewMode === 'dashboard' && (
            /* DASHBOARD VIEWPORT */
            <div className="p-6 sm:p-8 flex flex-col gap-5 min-h-[460px] sm:min-h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: activePreviewRoles.border }}>
                <div>
                  <h3 className="text-sm font-semibold" style={{ fontFamily: brandKit.typography.headingFont }}>
                    {brandKit.name} Telemetry
                  </h3>
                  <p className="text-[11px]" style={{ color: activePreviewRoles.mutedText }}>
                    Continuous cross-gamut color synchronization.
                  </p>
                </div>
                <button
                  className="px-3 py-1 rounded-[2px] text-xs font-medium shadow-sm"
                  style={{ backgroundColor: activePreviewRoles.button, color: activePreviewRoles.buttonText }}
                >
                  Generate Report
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Active Gamuts', value: '1,428', change: '+12.4%', icon: Activity },
                  { label: 'Harmonic Score', value: '99.2%', change: '+4.1%', icon: TrendingUp },
                  { label: 'Design Tokens', value: '84,920', change: '+32.8%', icon: CreditCard },
                ].map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[2px] border flex flex-col gap-1"
                    style={{
                      backgroundColor: activePreviewRoles.surface,
                      borderColor: activePreviewRoles.border,
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px]" style={{ color: activePreviewRoles.mutedText }}>
                      <span>{m.label}</span>
                      <m.icon size={13} style={{ color: activePreviewRoles.accent }} />
                    </div>
                    <div className="text-lg font-semibold" style={{ fontFamily: brandKit.typography.headingFont }}>
                      {m.value}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-500 font-semibold">
                      {m.change} vs cycle
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-[2px] border overflow-x-auto"
                style={{
                  backgroundColor: activePreviewRoles.surface,
                  borderColor: activePreviewRoles.border,
                }}
              >
                <table className="w-full text-left text-[11px] min-w-[360px]">
                  <thead
                    className="border-b font-mono text-[9px] uppercase"
                    style={{ borderColor: activePreviewRoles.border, color: activePreviewRoles.mutedText }}
                  >
                    <tr>
                      <th className="p-2.5">Gamut Role</th>
                      <th className="p-2.5">Contrast</th>
                      <th className="p-2.5 text-right">WCAG Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: activePreviewRoles.border }}>
                    {[
                      { role: 'Canvas Background', ratio: '14.2:1', status: 'AA PASS' },
                      { role: 'Primary Action', ratio: '8.4:1', status: 'AAA PASS' },
                      { role: 'Accent Highlight', ratio: '4.8:1', status: 'AA PASS' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-medium">{row.role}</td>
                        <td className="p-2.5 font-mono">{row.ratio}</td>
                        <td className="p-2.5 text-right">
                          <span
                            className="px-2 py-0.5 rounded-[2px] font-mono font-bold text-[9px]"
                            style={{
                              backgroundColor: i === 2 ? activePreviewRoles.accent : activePreviewRoles.button,
                              color: i === 2 ? getSmartForeground(activePreviewRoles.accent, 4.5).color : activePreviewRoles.buttonText,
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 06: Color Relationship ───────────────────────────────── */}
      <section aria-labelledby="relationship-heading" className="flex flex-col gap-3">
        <div>
          <span id="relationship-heading" className="brand-studio-section-label">
            04 — COLOR RELATIONSHIP
          </span>
          <h2 className="brand-studio-section-title">Harmonic Flow & Proportions</h2>
          <p className="brand-studio-section-desc">
            Visual hierarchy across connected chromatic planes. Demonstrates tonal balance without abstract charts.
          </p>
        </div>

        <div className="brand-relationship-strip">
          {[
            { key: 'primary', label: 'PRIMARY', hex: brandKit.roles.primary, flex: '4' },
            { key: 'secondary', label: 'SECONDARY', hex: brandKit.roles.secondary, flex: '2.5' },
            { key: 'accent', label: 'ACCENT', hex: brandKit.roles.accent, flex: '1.5' },
            { key: 'surface', label: 'SURFACE', hex: brandKit.roles.surface, flex: '2' },
            { key: 'background', label: 'CANVAS', hex: brandKit.roles.background, flex: '2' },
          ].map((seg) => {
            const fg = getSmartForeground(seg.hex, 4.5).color;
            return (
              <div
                key={seg.key}
                className="brand-relationship-segment"
                style={{
                  flex: seg.flex,
                  backgroundColor: seg.hex,
                  color: fg,
                }}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold opacity-90 truncate">
                  {seg.label}
                </span>
                <span className="text-[11px] font-mono truncate">
                  {seg.hex}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 07: Typography Preview ───────────────────────────────── */}
      <section aria-labelledby="typography-heading" className="flex flex-col gap-4">
        <div>
          <span id="typography-heading" className="brand-studio-section-label">
            05 — TYPOGRAPHY SYSTEM
          </span>
          <h2 className="brand-studio-section-title">Restrained Typographic Scale</h2>
          <p className="brand-studio-section-desc">
            Set in General Sans. Clean, neutral, precise, editorial.
          </p>
        </div>

        <div className="border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)] p-6 sm:p-8 flex flex-col md:flex-row items-start gap-8 shadow-sm">
          {/* Specimen Left */}
          <div className="w-full md:w-1/3 flex flex-col gap-3">
            <span className="text-6xl sm:text-7xl font-medium tracking-tight text-[var(--text-primary)] leading-none">
              Aa
            </span>
            <div>
              <span className="text-sm font-semibold text-[var(--text-primary)] tracking-wide uppercase">
                GENERAL SANS
              </span>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Precision neo-grotesque font balancing human warmth with geometric discipline.
              </p>
            </div>

            {/* Font Pair Controls */}
            <div className="flex flex-col gap-2 pt-2">
              <div>
                <label className="text-[10px] font-mono text-[var(--text-secondary)] uppercase block mb-1">
                  Heading Family
                </label>
                <select
                  value={brandKit.typography.headingFont}
                  onChange={(e) =>
                    setBrandKit({
                      ...brandKit,
                      typography: { ...brandKit.typography, headingFont: e.target.value },
                    })
                  }
                  className="w-full bg-transparent border border-[var(--border-subtle)] rounded-[2px] px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-medium outline-none focus-visible:ring-1 focus-visible:ring-[#171717]"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.name} value={f.value}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Type Samples Right */}
          <div className="w-full md:w-2/3 flex flex-col gap-6 md:border-l border-[var(--border-subtle)] md:pl-8">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">
                Display Headline
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight m-0">
                Your brand starts with a clear point of view.
              </h3>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">
                Editorial Body Copy
              </span>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0 max-w-xl">
                Simple, readable, consistent. Typography is the armature upon which color breathes. Consistent typographic hierarchy maintains brand clarity across every customer touchpoint.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 08: Brand In Use ─────────────────────────────────────── */}
      <section aria-labelledby="brand-in-use-heading" className="flex flex-col gap-4">
        <div>
          <span id="brand-in-use-heading" className="brand-studio-section-label">
            06 — BRAND IN USE
          </span>
          <h2 className="brand-studio-section-title">Touchpoint Versatility</h2>
          <p className="brand-studio-section-desc">
            Compact digital and physical applications demonstrating how your palette flexes.
          </p>
        </div>

        <div className="brand-in-use-grid">
          {/* 01 — SOCIAL POST */}
          <div className="brand-mockup-card shadow-sm">
            <div
              className="aspect-square p-5 flex flex-col justify-between transition-colors duration-300"
              style={{
                backgroundColor: activePreviewRoles.primary,
                color: canvasContrastText,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-6 h-6 rounded-[2px] flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: activePreviewRoles.accent,
                    color: getSmartForeground(activePreviewRoles.accent, 4.5).color,
                  }}
                >
                  {brandKit.name[0] || 'K'}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-75">
                  EDITORIAL
                </span>
              </div>

              <div>
                <span className="text-lg font-semibold leading-tight block">
                  {brandKit.name}
                </span>
                <span className="text-xs opacity-80 mt-1 block">
                  {brandKit.tagline || 'Visual design identity'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono opacity-80 pt-2 border-t border-current/20">
                <span>01 — SOCIAL</span>
                <span>KROMA STUDIO</span>
              </div>
            </div>
            <div className="p-3 bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)]">
              <span className="text-xs font-medium text-[var(--text-primary)] block">
                Social Feed Card
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Square format for Instagram and editorial releases.
              </span>
            </div>
          </div>

          {/* 02 — WEB FRAGMENT */}
          <div className="brand-mockup-card shadow-sm">
            <div
              className="aspect-square p-4 flex flex-col justify-between transition-colors duration-300"
              style={{
                backgroundColor: activePreviewRoles.background,
                color: activePreviewRoles.text,
              }}
            >
              <div
                className="p-2 rounded-[2px] border flex items-center justify-between text-[10px]"
                style={{
                  backgroundColor: activePreviewRoles.surface,
                  borderColor: activePreviewRoles.border,
                }}
              >
                <span className="font-semibold">{brandKit.name}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: activePreviewRoles.accent }}
                />
              </div>

              <div className="my-auto py-2">
                <span className="text-sm font-semibold block leading-snug">
                  Precision digital interface.
                </span>
                <span className="text-[11px] block mt-1" style={{ color: activePreviewRoles.mutedText }}>
                  Structured around tonal surfaces.
                </span>
              </div>

              <button
                className="w-full py-1.5 rounded-[2px] text-[11px] font-medium"
                style={{
                  backgroundColor: activePreviewRoles.button,
                  color: activePreviewRoles.buttonText,
                }}
              >
                Get Started
              </button>
            </div>
            <div className="p-3 bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)]">
              <span className="text-xs font-medium text-[var(--text-primary)] block">
                Web Interface Fragment
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Responsive web and landing page component.
              </span>
            </div>
          </div>

          {/* 03 — CAMPAIGN BANNER */}
          <div className="brand-mockup-card shadow-sm">
            <div
              className="aspect-square p-5 flex flex-col justify-between transition-colors duration-300"
              style={{
                backgroundColor: activePreviewRoles.accent,
                color: getSmartForeground(activePreviewRoles.accent, 4.5).color,
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider opacity-85">
                <span>LIMITED RUN</span>
                <span>VOL. 04</span>
              </div>

              <div>
                <span className="text-xl font-bold tracking-tight block">
                  ACCENT POWER
                </span>
                <span className="text-xs opacity-90 mt-1 block">
                  High-energy contrast for seasonal marketing and drops.
                </span>
              </div>

              <span className="text-[10px] font-mono uppercase tracking-widest pt-2 border-t border-current/20">
                03 — CAMPAIGN
              </span>
            </div>
            <div className="p-3 bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)]">
              <span className="text-xs font-medium text-[var(--text-primary)] block">
                Campaign Banner
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Promotional surface with high chromatic contrast.
              </span>
            </div>
          </div>

          {/* 04 — PRODUCT SURFACE */}
          <div className="brand-mockup-card shadow-sm">
            <div
              className="aspect-square p-5 flex flex-col justify-between border-b transition-colors duration-300"
              style={{
                backgroundColor: activePreviewRoles.surface,
                color: activePreviewRoles.cardText,
                borderColor: activePreviewRoles.border,
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider opacity-75">
                <span>PACKAGING</span>
                <span>GRADE 01</span>
              </div>

              <div
                className="w-12 h-12 rounded-[2px] flex items-center justify-center font-bold text-lg mx-auto shadow-sm"
                style={{
                  backgroundColor: activePreviewRoles.button,
                  color: activePreviewRoles.buttonText,
                }}
              >
                {brandKit.name[0] || 'K'}
              </div>

              <div className="text-center">
                <span className="text-xs font-medium block">
                  {brandKit.name} Goods
                </span>
                <span className="text-[10px] opacity-75 block font-mono">
                  {activePreviewRoles.border}
                </span>
              </div>
            </div>
            <div className="p-3 bg-[var(--bg-surface-1)]">
              <span className="text-xs font-medium text-[var(--text-primary)] block">
                Product Packaging
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Physical stationery and minimal tactile hardware.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 09: WCAG 2.2 + OKLCH Contrast Audit & Tokens ─────────── */}
      <section aria-labelledby="accessibility-heading" className="flex flex-col gap-6">
        <div>
          <span id="accessibility-heading" className="brand-studio-section-label">
            07 — WCAG 2.2 + OKLCH AUDIT & TOKENS
          </span>
          <h2 className="brand-studio-section-title">Contrast Verification & Semantic Tokens</h2>
          <p className="brand-studio-section-desc">
            Exact WCAG 2.2 verification across every actual UI combination. When contrast fails, OKLCH adjusts lightness while strictly preserving hue and chroma.
          </p>
        </div>

        {/* Semantic Contrast Audit Strip */}
        <div className="border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)] p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                WCAG 2.2 Semantic Report
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] border ${
                  intelligenceReport.overallQuality === 'WCAG AAA READY'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : intelligenceReport.overallQuality === 'WCAG AA READY'
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                STATUS: {intelligenceReport.overallQuality}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                ({intelligenceReport.passingChecks} of {intelligenceReport.totalChecks} pass AA)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {intelligenceReport.overallQuality === 'WCAG AA NEEDS ADJUSTMENT' && (
                <button
                  onClick={handleAutoRemediateOklch}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-[#171717] hover:bg-black focus-visible:ring-1 focus-visible:ring-[#171717] rounded-[2px] transition-colors outline-none"
                  title="Applies minimal OKLCH adjustments that preserve hue & chroma while satisfying contrast"
                >
                  <Sparkles size={11} />
                  <span>Auto-Remediate (OKLCH)</span>
                </button>
              )}
              <button
                onClick={() =>
                  onNavigate({
                    path: 'contrast-checker',
                    fg: brandKit.roles.text,
                    bg: brandKit.roles.background,
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-1 focus-visible:ring-[#171717] transition-colors outline-none"
              >
                <span>Contrast Checker</span>
                <ExternalLink size={10} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {intelligenceReport.checks.map((check) => (
              <div
                key={check.id}
                className="p-3 border border-[var(--border-subtle)] rounded-[2px] flex flex-col justify-between gap-2.5 bg-[var(--bg-canvas)]"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-[var(--text-primary)] truncate">
                    {check.label}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] flex items-center gap-1 ${
                      check.isCompliant
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {check.isCompliant ? '✓ PASS' : '✕ FAIL'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-secondary)]">Contrast Ratio</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {check.rating.formattedRatio}:1
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
                  <span>Normal Text: {check.rating.normalTextAA ? 'AA ✓' : 'AA ✕'}</span>
                  <span>Large: {check.rating.largeTextAA ? 'AA ✓' : 'AA ✕'}</span>
                  <span>AAA: {check.rating.normalTextAAA ? 'AAA ✓' : 'AAA ✕'}</span>
                </div>

                {!check.isCompliant && check.suggestedFg && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-rose-100 text-[10px] font-mono">
                    <span className="text-rose-800">
                      OKLCH: <strong>{check.suggestedFg}</strong> ({formatContrastRatio(check.suggestedRatio || 4.5)}:1)
                    </span>
                    <button
                      onClick={() => handleApplySingleCheckFix(check)}
                      className="px-2 py-0.5 bg-[#171717] hover:bg-black text-white rounded-[2px] font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Color Values & OKLCH Coordinates Table */}
        <div className="border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-semibold text-[var(--text-primary)] block">
                Color Tokens & OKLCH Accessible Variants
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Original preset colors are preserved. Accessible variants provide UI-safe alternatives.
              </span>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-secondary)]">
              Click value to copy
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-surface-2)] border-b border-[var(--border-subtle)] text-[10px] font-mono uppercase text-[var(--text-secondary)]">
                <tr>
                  <th className="py-2.5 px-4">Semantic Role</th>
                  <th className="py-2.5 px-4">Original</th>
                  <th className="py-2.5 px-4">HEX</th>
                  <th className="py-2.5 px-4">OKLCH Value</th>
                  <th className="py-2.5 px-4">Accessible Variant</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {[
                  primaryRole,
                  ...secondaryRoles,
                  ...supportingRoles,
                ].map((row) => {
                  const oklch = hexToOklch(row.hex);
                  const oklchStr = oklchToCssString(oklch.L, oklch.C, oklch.H);
                  const accessibleHex = intelligenceReport.accessibleRoles[row.key as keyof SemanticRolesModel] || row.hex;
                  const isAdjusted = accessibleHex.toUpperCase() !== row.hex.toUpperCase();
                  const targetBg = row.key === 'buttonText' ? brandKit.roles.primary : row.key === 'cardText' ? brandKit.roles.surface : brandKit.roles.background;
                  const currentRatio = calculateWcagRatio(row.hex, targetBg);
                  const passAA = currentRatio >= 4.5;

                  return (
                    <tr key={row.key} className="hover:bg-[var(--bg-surface-2)] transition-colors">
                      <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">
                        {row.label}
                      </td>
                      <td className="py-2.5 px-4">
                        <div
                          className="w-5 h-5 rounded-[2px] border border-black/10 shadow-xs"
                          style={{ backgroundColor: row.hex }}
                        />
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium">
                        {row.hex}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[var(--text-secondary)]">
                        {oklchStr}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        {isAdjusted ? (
                          <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-[2px] border border-blue-200">
                            <span
                              className="w-2.5 h-2.5 rounded-[1px] border border-black/20"
                              style={{ backgroundColor: accessibleHex }}
                            />
                            <span>{accessibleHex} (OKLCH)</span>
                          </span>
                        ) : (
                          <span className="text-[var(--text-secondary)]">Identical</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold ${
                            passAA
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {passAA ? 'AA PASS' : 'AA ADJUSTED'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleCopyColorValue(`table-${row.key}`, row.hex)}
                          className="text-[11px] font-mono text-[var(--text-primary)] hover:underline focus-visible:ring-1 focus-visible:ring-[#171717] outline-none"
                        >
                          {copiedKey === `table-${row.key}` ? (
                            <span className="text-emerald-600 font-bold">COPIED</span>
                          ) : (
                            <span>COPY</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 10: Final Action Bar ─────────────────────────────────── */}
      <footer className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[var(--text-secondary)]">
          Kroma Brand Kit Studio • {brandKit.name} • {intelligenceReport.overallQuality}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium tracking-wide text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] focus-visible:ring-1 focus-visible:ring-[#171717] rounded-[2px] transition-colors outline-none"
          >
            <Code size={13} />
            <span>Export Tokens</span>
          </button>
          <button
            onClick={handleSaveBrandKit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium tracking-wide text-white bg-[#171717] hover:bg-black focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#171717] rounded-[2px] transition-colors shadow-sm outline-none"
          >
            <Bookmark size={13} />
            <span>Save Brand Kit</span>
          </button>
        </div>
      </footer>

      {/* ── Export Design Tokens Modal ────────────────────────────── */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[2px] w-full max-w-xl p-6 shadow-xl flex flex-col gap-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                Export Design Tokens
              </span>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-1 focus-visible:ring-[#171717] outline-none"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-1 border-b border-[var(--border-subtle)] pb-2">
              {(['css', 'tailwind', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-[2px] transition-colors outline-none ${
                    exportFormat === fmt
                      ? 'bg-[#171717] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <pre className="p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-[2px] font-mono text-xs text-[var(--text-primary)] overflow-x-auto max-h-64">
              {exportContent}
            </pre>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-1 focus-visible:ring-[#171717] outline-none"
              >
                Close
              </button>
              <button
                onClick={handleCopyTokens}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-[#171717] hover:bg-black text-white rounded-[2px] transition-colors shadow-sm outline-none"
              >
                <Copy size={13} />
                <span>Copy Tokens</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Color Picker Modal ────────────────────────────────────── */}
      {pickerTarget && (
        <ColorPickerModal
          isOpen={!!pickerTarget}
          initialColor={pickerTarget.color}
          paletteColors={palettes.flatMap((p) => p.colors.map((c) => c.hex)).slice(0, 8)}
          title={`SELECT ${pickerTarget.label.toUpperCase()}`}
          onApply={(hex) => {
            handleRoleColorChange(pickerTarget.key, hex);
          }}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
};
