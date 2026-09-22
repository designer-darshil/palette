import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Layout,
  Smartphone,
  BarChart3,
  Copy,
  Check,
  Share2,
  Bookmark,
  ExternalLink,
  Code,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Bell,
  Activity,
  Sliders,
} from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import {
  getContrastRatio,
  getTextColorForBackground,
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
  auditBrandKitRoles,
  resolveAuditedBrandKitRoles,
  SemanticAuditRoleResult,
} from '../utils/brandKitStorage';
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

  // Load active brand kit
  const [brandKit, setBrandKit] = useState<BrandKitItem>(() => {
    const savedKits = getSavedBrandKits();
    if (initialId) {
      const match = savedKits.find((k) => k.id === initialId);
      if (match) return match;
    }
    return savedKits[0] || DEFAULT_BRAND_KIT;
  });

  const [previewMode, setPreviewMode] = useState<'website' | 'mobile' | 'dashboard'>('website');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'css' | 'json' | 'tailwind'>('css');
  const [isEditingIdentity, setIsEditingIdentity] = useState<boolean>(false);
  const [pickerTarget, setPickerTarget] = useState<{
    key: keyof BrandKitRoles;
    label: string;
    color: string;
  } | null>(null);

  // Strict Semantic Accessibility Audit Report
  const auditReport = useMemo(() => auditBrandKitRoles(brandKit.roles), [brandKit.roles]);

  // If initialPaletteSlug provided, map its colors into roles and auto-remediate contrast
  useEffect(() => {
    if (initialPaletteSlug) {
      const clean = initialPaletteSlug.replace(/^(palettes|palette|gen-pal|ext-pal)-/i, '');
      const hexParts = clean.match(/[0-9a-fA-F]{6}/g);
      if (hexParts && hexParts.length >= 2) {
        const hexList = hexParts.map((h) => `#${h.toUpperCase()}`);
        const rawRoles: Partial<BrandKitRoles> = {
          ...brandKit.roles,
          primary: hexList[0] || brandKit.roles.primary,
          secondary: hexList[1] || brandKit.roles.secondary,
          accent: hexList[2] || brandKit.roles.accent,
          background: hexList[3] || '#0F1117',
          surface: hexList[4] || '#1A1D27',
        };
        const resolved = resolveAuditedBrandKitRoles(rawRoles);
        setBrandKit((prev) => ({
          ...prev,
          roles: resolved,
          updatedAt: new Date().toISOString(),
        }));
        showToast('Applied palette & verified contrast', `${hexList.length} swatches mapped`);
      }
    }
  }, [initialPaletteSlug]);

  // Handle role color change
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

  // Auto-Remediate all failing roles
  const handleAutoRemediate = () => {
    const remediated = resolveAuditedBrandKitRoles(brandKit.roles);
    setBrandKit((prev) => ({
      ...prev,
      roles: remediated,
      updatedAt: new Date().toISOString(),
    }));
    showToast('Remediated Semantic Roles', 'Contrast thresholds satisfied');
  };

  // Apply single role fix
  const handleApplyRoleFix = (result: SemanticAuditRoleResult) => {
    if (!result.suggestedFg) return;
    let updated = { ...brandKit.roles };
    if (result.id === 'bodyTextOnCanvas') {
      updated.text = result.suggestedFg;
    } else if (result.id === 'primaryButtonText') {
      updated.buttonText = result.suggestedFg;
    } else if (result.id === 'cardBodyOnSurface') {
      updated.cardText = result.suggestedFg;
    } else if (result.id === 'mutedTextOnCanvas') {
      updated.mutedText = result.suggestedFg;
    }
    setBrandKit((prev) => ({
      ...prev,
      roles: updated,
      updatedAt: new Date().toISOString(),
    }));
    showToast(`Remediated ${result.label}`, `Updated foreground to ${result.suggestedFg}`);
  };

  // Quick palette loader
  const handleApplyPalette = (palette: PaletteItem) => {
    if (!palette.colors || palette.colors.length === 0) return;
    const cols = palette.colors.map((c) => c.hex);

    const rawRoles: Partial<BrandKitRoles> = {
      ...brandKit.roles,
      primary: cols[0] || brandKit.roles.primary,
      secondary: cols[1] || brandKit.roles.secondary,
      accent: cols[2] || brandKit.roles.accent,
      background: cols[3] || '#0F1117',
      surface: cols[4] || '#1A1D27',
    };
    const resolved = resolveAuditedBrandKitRoles(rawRoles);

    setBrandKit((prev) => ({
      ...prev,
      paletteSlug: palette.slug,
      paletteTitle: palette.title,
      roles: resolved,
      updatedAt: new Date().toISOString(),
    }));
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

  // Subtle inline copy handler (no large toasts)
  const handleCopyColorValue = async (key: string, value: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 1400);
    }
  };

  // Export Design Tokens
  const exportContent = useMemo(() => {
    if (exportFormat === 'css') {
      return generateBrandKitCssTokens(brandKit);
    }
    if (exportFormat === 'json') {
      return JSON.stringify(brandKit, null, 2);
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
        }
      },
      fontFamily: {
        heading: [${brandKit.typography.headingFont}],
        body: [${brandKit.typography.bodyFont}],
      }
    }
  }
};`;
  }, [brandKit, exportFormat]);

  const handleCopyTokens = async () => {
    const success = await copyToClipboard(exportContent);
    if (success) {
      showToast(`Copied ${exportFormat.toUpperCase()} Design Tokens`, brandKit.name);
    }
  };

  const primaryBtnText = brandKit.roles.buttonText || getTextColorForBackground(brandKit.roles.primary);
  const canvasContrastText = getTextColorForBackground(brandKit.roles.primary);

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
          className="brand-studio-breadcrumb-link"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium tracking-wide text-[var(--text-primary)] bg-transparent border border-[var(--border-subtle)] hover:border-[var(--text-primary)] rounded-[2px] transition-colors"
          >
            <Code size={13} />
            <span>Export Tokens</span>
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium tracking-wide text-[var(--text-primary)] bg-transparent border border-[var(--border-subtle)] hover:border-[var(--text-primary)] rounded-[2px] transition-colors"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            onClick={handleSaveBrandKit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium tracking-wide text-white bg-[#171717] hover:bg-black rounded-[2px] transition-colors shadow-sm"
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
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Sliders size={12} />
            <span>{isEditingIdentity ? 'Done Editing' : 'Edit Name & Tagline'}</span>
          </button>
        </div>

        {/* Subtle Brand Identity Inputs (Toggled or inline) */}
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
                    color: getTextColorForBackground(brandKit.roles.accent),
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
              <span>RGB {(() => {
                const rgb = hexToRgb(brandKit.roles.primary);
                return rgb ? `${rgb.r} · ${rgb.g} · ${rgb.b}` : '—';
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
                color: getTextColorForBackground(brandKit.roles.secondary),
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
                color: getTextColorForBackground(brandKit.roles.accent),
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

        {/* Start from Curated Palette Strip */}
        <div className="mt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Start from Curated Palette
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {palettes.slice(0, 6).map((pal) => (
              <button
                key={pal.id}
                onClick={() => handleApplyPalette(pal)}
                className="flex items-center gap-1 px-2 py-1 bg-transparent hover:bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] rounded-[2px] transition-colors flex-shrink-0"
                title={`Apply ${pal.title}`}
              >
                <div className="flex h-2.5 w-8 rounded-[1px] overflow-hidden">
                  {pal.colors.slice(0, 4).map((c, i) => (
                    <span key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-[var(--text-primary)] truncate max-w-[70px]">
                  {pal.title}
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
                  className="font-medium text-[var(--text-primary)] hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'prim-hex' ? (
                    <span className="text-emerald-600 font-bold">COPIED</span>
                  ) : (
                    <span>{primaryRole.hex}</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">RGB</span>
                {(() => {
                  const rgb = hexToRgb(primaryRole.hex);
                  const str = rgb ? `${rgb.r} / ${rgb.g} / ${rgb.b}` : '—';
                  return (
                    <button
                      onClick={() => handleCopyColorValue('prim-rgb', str)}
                      className="font-medium text-[var(--text-primary)] hover:underline"
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

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">HSL</span>
                {(() => {
                  const hsl = hexToHsl(primaryRole.hex);
                  const str = hsl ? `${hsl.h}° / ${hsl.s}% / ${hsl.l}%` : '—';
                  return (
                    <button
                      onClick={() => handleCopyColorValue('prim-hsl', str)}
                      className="font-medium text-[var(--text-primary)] hover:underline"
                    >
                      {copiedKey === 'prim-hsl' ? (
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
            const fg = getTextColorForBackground(role.hex);
            const rgb = hexToRgb(role.hex);
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
                    <span className="text-[var(--text-secondary)]">
                      {rgb ? `${rgb.r}·${rgb.g}·${rgb.b}` : ''}
                    </span>
                    <button
                      onClick={() => handleCopyColorValue(`role-${role.key}`, role.hex)}
                      className="text-[var(--text-primary)] hover:underline"
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
                  className="text-[9px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0"
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

          {/* Editorial Segmented Switcher */}
          <div className="inline-flex items-center p-0.5 border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)] self-start sm:self-auto">
            <button
              onClick={() => setPreviewMode('website')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wider uppercase rounded-[1px] transition-colors ${
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wider uppercase rounded-[1px] transition-colors ${
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wider uppercase rounded-[1px] transition-colors ${
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

        {/* Realistic Viewport Container */}
        <div
          className="w-full rounded-[2px] border border-[var(--border-subtle)] overflow-hidden shadow-sm transition-all duration-300"
          style={{
            backgroundColor: brandKit.roles.background,
            color: brandKit.roles.text,
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
                  backgroundColor: brandKit.roles.surface,
                  borderColor: brandKit.roles.border,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-5 h-5 rounded-[2px] flex items-center justify-center font-bold text-[11px]"
                    style={{
                      backgroundColor: brandKit.roles.primary,
                      color: primaryBtnText,
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
                    backgroundColor: brandKit.roles.primary,
                    color: primaryBtnText,
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
                    backgroundColor: brandKit.roles.surface,
                    color: brandKit.roles.accent,
                    border: `1px solid ${brandKit.roles.border}`,
                  }}
                >
                  ✦ {brandKit.tagline || 'Visual Design Platform'}
                </span>

                <h3
                  className="text-2xl sm:text-4xl font-semibold tracking-tight leading-[1.1]"
                  style={{
                    fontFamily: brandKit.typography.headingFont,
                    color: brandKit.roles.text,
                  }}
                >
                  Intelligent Architecture for Modern Digital Craft
                </h3>

                <p
                  className="text-xs sm:text-sm max-w-md leading-relaxed"
                  style={{ color: brandKit.roles.mutedText }}
                >
                  Scalable token foundations, real-time perceptual color analysis, and high-fidelity interface systems.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-2">
                  <button
                    className="px-4 py-2 rounded-[2px] text-xs font-medium tracking-wide shadow-sm"
                    style={{
                      backgroundColor: brandKit.roles.primary,
                      color: primaryBtnText,
                    }}
                  >
                    Primary Action
                  </button>
                  <button
                    className="px-4 py-2 rounded-[2px] text-xs font-medium tracking-wide border transition-colors"
                    style={{
                      backgroundColor: brandKit.roles.surface,
                      color: brandKit.roles.text,
                      borderColor: brandKit.roles.border,
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
                  backgroundColor: brandKit.roles.surface,
                  borderColor: brandKit.roles.border,
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
                      backgroundColor: brandKit.roles.background,
                      borderColor: brandKit.roles.border,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-[2px] flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: i === 0 ? brandKit.roles.primary : i === 1 ? brandKit.roles.secondary : brandKit.roles.accent,
                        color: i === 2 ? getTextColorForBackground(brandKit.roles.accent) : '#FFFFFF',
                      }}
                    >
                      0{i + 1}
                    </div>
                    <h4
                      className="text-xs font-semibold"
                      style={{ fontFamily: brandKit.typography.headingFont, color: brandKit.roles.cardText || brandKit.roles.text }}
                    >
                      {card.title}
                    </h4>
                    <p className="text-[11px] leading-relaxed" style={{ color: brandKit.roles.mutedText }}>
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
                  backgroundColor: brandKit.roles.surface,
                  borderColor: brandKit.roles.border,
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: brandKit.roles.border }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]"
                      style={{ backgroundColor: brandKit.roles.primary, color: primaryBtnText }}
                    >
                      {brandKit.name[0] || 'K'}
                    </div>
                    <span className="font-semibold text-xs truncate" style={{ fontFamily: brandKit.typography.headingFont }}>
                      {brandKit.name}
                    </span>
                  </div>
                  <Bell size={13} style={{ color: brandKit.roles.mutedText }} />
                </div>

                <div
                  className="p-4 rounded-lg border flex flex-col gap-1.5"
                  style={{
                    backgroundColor: brandKit.roles.primary,
                    color: primaryBtnText,
                    borderColor: brandKit.roles.secondary,
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
                      style={{ backgroundColor: brandKit.roles.accent, color: getTextColorForBackground(brandKit.roles.accent) }}
                    >
                      VERIFIED
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono uppercase" style={{ color: brandKit.roles.mutedText }}>
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
                        backgroundColor: brandKit.roles.background,
                        borderColor: brandKit.roles.border,
                      }}
                    >
                      <div>
                        <div className="font-medium text-[11px]">{item.name}</div>
                        <div className="text-[9px]" style={{ color: brandKit.roles.mutedText }}>{item.time}</div>
                      </div>
                      <span className="font-mono text-[11px] font-semibold">{item.val}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full py-2 rounded font-medium text-xs shadow-sm"
                  style={{
                    backgroundColor: brandKit.roles.primary,
                    color: primaryBtnText,
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
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: brandKit.roles.border }}>
                <div>
                  <h3 className="text-sm font-semibold" style={{ fontFamily: brandKit.typography.headingFont }}>
                    {brandKit.name} Telemetry
                  </h3>
                  <p className="text-[11px]" style={{ color: brandKit.roles.mutedText }}>
                    Continuous cross-gamut color synchronization.
                  </p>
                </div>
                <button
                  className="px-3 py-1 rounded-[2px] text-xs font-medium shadow-sm"
                  style={{ backgroundColor: brandKit.roles.primary, color: primaryBtnText }}
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
                      backgroundColor: brandKit.roles.surface,
                      borderColor: brandKit.roles.border,
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px]" style={{ color: brandKit.roles.mutedText }}>
                      <span>{m.label}</span>
                      <m.icon size={13} style={{ color: brandKit.roles.accent }} />
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
                  backgroundColor: brandKit.roles.surface,
                  borderColor: brandKit.roles.border,
                }}
              >
                <table className="w-full text-left text-[11px] min-w-[360px]">
                  <thead
                    className="border-b font-mono text-[9px] uppercase"
                    style={{ borderColor: brandKit.roles.border, color: brandKit.roles.mutedText }}
                  >
                    <tr>
                      <th className="p-2.5">Gamut Role</th>
                      <th className="p-2.5">Contrast</th>
                      <th className="p-2.5 text-right">WCAG Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: brandKit.roles.border }}>
                    {[
                      { role: 'Canvas Background', ratio: '14.2:1', status: 'PASS' },
                      { role: 'Primary Action', ratio: '8.4:1', status: 'PASS' },
                      { role: 'Accent Highlight', ratio: '4.8:1', status: 'ACTIVE' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-medium">{row.role}</td>
                        <td className="p-2.5 font-mono">{row.ratio}</td>
                        <td className="p-2.5 text-right">
                          <span
                            className="px-2 py-0.5 rounded-[2px] font-mono font-bold text-[9px]"
                            style={{
                              backgroundColor: i === 2 ? brandKit.roles.accent : brandKit.roles.primary,
                              color: i === 2 ? getTextColorForBackground(brandKit.roles.accent) : primaryBtnText,
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
            const fg = getTextColorForBackground(seg.hex);
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

            {/* Font Pair Controls (Preserved) */}
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
                  className="w-full bg-transparent border border-[var(--border-subtle)] rounded-[2px] px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-medium outline-none"
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
                backgroundColor: brandKit.roles.primary,
                color: canvasContrastText,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-6 h-6 rounded-[2px] flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: brandKit.roles.accent,
                    color: getTextColorForBackground(brandKit.roles.accent),
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
                backgroundColor: brandKit.roles.background,
                color: brandKit.roles.text,
              }}
            >
              <div
                className="p-2 rounded-[2px] border flex items-center justify-between text-[10px]"
                style={{
                  backgroundColor: brandKit.roles.surface,
                  borderColor: brandKit.roles.border,
                }}
              >
                <span className="font-semibold">{brandKit.name}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: brandKit.roles.accent }}
                />
              </div>

              <div className="my-auto py-2">
                <span className="text-sm font-semibold block leading-snug">
                  Precision digital interface.
                </span>
                <span className="text-[11px] block mt-1" style={{ color: brandKit.roles.mutedText }}>
                  Structured around tonal surfaces.
                </span>
              </div>

              <button
                className="w-full py-1.5 rounded-[2px] text-[11px] font-medium"
                style={{
                  backgroundColor: brandKit.roles.primary,
                  color: primaryBtnText,
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
                backgroundColor: brandKit.roles.accent,
                color: getTextColorForBackground(brandKit.roles.accent),
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
                backgroundColor: brandKit.roles.surface,
                color: brandKit.roles.cardText || brandKit.roles.text,
                borderColor: brandKit.roles.border,
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider opacity-75">
                <span>PACKAGING</span>
                <span>GRADE 01</span>
              </div>

              <div
                className="w-12 h-12 rounded-[2px] flex items-center justify-center font-bold text-lg mx-auto shadow-sm"
                style={{
                  backgroundColor: brandKit.roles.primary,
                  color: primaryBtnText,
                }}
              >
                {brandKit.name[0] || 'K'}
              </div>

              <div className="text-center">
                <span className="text-xs font-medium block">
                  {brandKit.name} Goods
                </span>
                <span className="text-[10px] opacity-75 block font-mono">
                  {brandKit.roles.border}
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

      {/* ── 09: Contrast & Accessibility + Color Details ─────────── */}
      <section aria-labelledby="accessibility-heading" className="flex flex-col gap-6">
        <div>
          <span id="accessibility-heading" className="brand-studio-section-label">
            07 — ACCESSIBILITY & TOKENS
          </span>
          <h2 className="brand-studio-section-title">Contrast Audit & Design Tokens</h2>
          <p className="brand-studio-section-desc">
            WCAG AA/AAA verification across critical touchpoints and precise token values.
          </p>
        </div>

        {/* Compact Contrast Audit Strip */}
        <div className="border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)] p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                WCAG Semantic Audit
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                ({auditReport.passingCount} of {auditReport.totalCount} pass AA)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!auditReport.overallPass && (
                <button
                  onClick={handleAutoRemediate}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-[#171717] hover:bg-black rounded-[2px] transition-colors"
                >
                  <Sparkles size={11} />
                  <span>Auto-Remediate</span>
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
                className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span>Contrast Checker</span>
                <ExternalLink size={10} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {auditReport.results.map((item) => (
              <div
                key={item.id}
                className="p-3 border border-[var(--border-subtle)] rounded-[2px] flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[var(--text-primary)] truncate">
                    {item.label}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[2px] ${
                      item.pass
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.pass ? '✓ PASS' : '✕ FAILS'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-secondary)]">Ratio</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {item.ratio}:1
                  </span>
                </div>

                {!item.pass && item.suggestedFg && (
                  <button
                    onClick={() => handleApplyRoleFix(item)}
                    className="w-full py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-medium rounded-[2px] transition-colors mt-1"
                  >
                    Apply Fix ({item.suggestedFg})
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Color Values Table */}
        <div className="border border-[var(--border-subtle)] rounded-[2px] bg-[var(--bg-surface-1)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Color Token Values
            </span>
            <span className="text-[11px] font-mono text-[var(--text-secondary)]">
              Click value to copy
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-surface-2)] border-b border-[var(--border-subtle)] text-[10px] font-mono uppercase text-[var(--text-secondary)]">
                <tr>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Swatch</th>
                  <th className="py-2.5 px-4">HEX</th>
                  <th className="py-2.5 px-4">RGB</th>
                  <th className="py-2.5 px-4">HSL</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {[
                  primaryRole,
                  ...secondaryRoles,
                  ...supportingRoles,
                ].map((row) => {
                  const rgb = hexToRgb(row.hex);
                  const hsl = hexToHsl(row.hex);
                  const rgbStr = rgb ? `${rgb.r} / ${rgb.g} / ${rgb.b}` : '—';
                  const hslStr = hsl ? `${hsl.h}° / ${hsl.s}% / ${hsl.l}%` : '—';
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
                        {rgbStr}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[var(--text-secondary)]">
                        {hslStr}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleCopyColorValue(`table-${row.key}`, row.hex)}
                          className="text-[11px] font-mono text-[var(--text-primary)] hover:underline"
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
          Kroma Brand Kit Studio • {brandKit.name}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium tracking-wide text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] rounded-[2px] transition-colors"
          >
            <Code size={13} />
            <span>Export Tokens</span>
          </button>
          <button
            onClick={handleSaveBrandKit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium tracking-wide text-white bg-[#171717] hover:bg-black rounded-[2px] transition-colors shadow-sm"
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
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                  className={`px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-[2px] transition-colors ${
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
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Close
              </button>
              <button
                onClick={handleCopyTokens}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-[#171717] hover:bg-black text-white rounded-[2px] transition-colors shadow-sm"
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
