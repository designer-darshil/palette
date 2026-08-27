import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette,
  Sparkles,
  Layout,
  Smartphone,
  BarChart3,
  Copy,
  Check,
  Share2,
  Bookmark,
  ShieldCheck,
  ExternalLink,
  Plus,
  Trash2,
  Code,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Bell,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import {
  getContrastRatio,
  getTextColorForBackground,
  copyToClipboard,
} from '../utils/colorUtils';
import { findClosestColorName } from '../utils/paletteGenerator';
import {
  BrandKitItem,
  BrandKitRoles,
  DEFAULT_BRAND_KIT,
  FONT_OPTIONS,
  getSavedBrandKits,
  saveBrandKitToStorage,
  deleteBrandKitFromStorage,
  generateBrandKitCssTokens,
  auditBrandKitRoles,
  autoRemediateBrandKitRoles,
  resolveAuditedBrandKitRoles,
  SemanticAuditRoleResult,
} from '../utils/brandKitStorage';

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

  // Strict Semantic Accessibility Audit Report (Single source of truth)
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
    showToast('Remediated All Semantic Roles', 'Contrast thresholds satisfied');
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

  // Quick palette loader with strict semantic role assignment
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
    showToast(`Loaded ${palette.title}`, 'Brand roles remapped & contrast verified');
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
      showToast('Brand Kit link copied to clipboard', brandKit.name);
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

  const primaryBtnText = brandKit.roles.buttonText;
  const cardBodyText = brandKit.roles.cardText || brandKit.roles.text;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 flex flex-col gap-6 sm:gap-8 min-w-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <span className="font-mono text-[10px] sm:text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
            SYSTEM DESIGN &amp; BRAND IDENTITY STUDIO
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
            Brand Kit Studio
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed">
            Translate color palettes into interactive, production-ready mini design systems with real-time website, mobile app, and dashboard UI previews.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Export Tokens"
          >
            <Code size={13} />
            <span>Export Tokens</span>
          </button>
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Share Brand Kit"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            onClick={handleSaveBrandKit}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] text-[var(--accent-gold)] border border-[var(--accent-gold)] rounded-xs transition-colors whitespace-nowrap"
            title="Save Brand Kit"
          >
            <Bookmark size={13} />
            <span>Save Brand Kit</span>
          </button>
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start min-w-0">
        {/* Left Column: Brand Configuration, Palette Mapper, Typography & WCAG (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6 min-w-0">
          {/* Brand Info Card */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-3 sm:gap-4">
            <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              BRAND IDENTITY
            </span>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] sm:text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                  BRAND NAME
                </label>
                <input
                  type="text"
                  value={brandKit.name}
                  onChange={(e) => setBrandKit({ ...brandKit, name: e.target.value })}
                  placeholder="e.g. Nexus Intelligence"
                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs px-3 py-2 text-xs font-bold text-[var(--text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                  TAGLINE / SLOGAN
                </label>
                <input
                  type="text"
                  value={brandKit.tagline}
                  onChange={(e) => setBrandKit({ ...brandKit, tagline: e.target.value })}
                  placeholder="e.g. Precision AI & Generative Color"
                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs px-3 py-2 text-xs text-[var(--text-secondary)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Starting Palette Loader */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-3">
            <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              START FROM CURATED PALETTE
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {palettes.slice(0, 5).map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => handleApplyPalette(pal)}
                  className="flex-shrink-0 p-2 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] rounded-xs text-left transition-colors"
                >
                  <div className="flex h-3 w-16 rounded-xs overflow-hidden mb-1.5">
                    {pal.colors.map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
                    ))}
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text-primary)] truncate max-w-[80px]">
                    {pal.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Semantic Color Role Mapper */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-3 sm:gap-4">
            <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              SEMANTIC COLOR ROLES
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {(
                [
                  ['primary', 'Primary Hero', brandKit.roles.primary],
                  ['secondary', 'Secondary Tone', brandKit.roles.secondary],
                  ['accent', 'Accent Highlight', brandKit.roles.accent],
                  ['background', 'Canvas Background', brandKit.roles.background],
                  ['surface', 'Card / Surface', brandKit.roles.surface],
                  ['text', 'Body Text (Canvas)', brandKit.roles.text],
                  ['buttonText', 'Primary Button Text', brandKit.roles.buttonText],
                  ['cardText', 'Card Body Text', brandKit.roles.cardText],
                  ['mutedText', 'Muted Text (Canvas)', brandKit.roles.mutedText],
                  ['border', 'UI Border', brandKit.roles.border],
                ] as const
              ).map(([key, label, hex]) => (
                <div
                  key={key}
                  className="p-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs flex items-center justify-between gap-2 min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => handleRoleColorChange(key, e.target.value)}
                      className="w-7 h-7 border border-[var(--border-medium)] rounded-xs p-0 bg-transparent cursor-pointer flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                        {label}
                      </div>
                      <div className="font-mono text-[10px] text-[var(--text-tertiary)] truncate">
                        {findClosestColorName(hex)}
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => handleRoleColorChange(key, e.target.value)}
                    className="w-16 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-[10px] font-mono px-1.5 py-1 text-right text-[var(--text-primary)] rounded-xs flex-shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Typography Pairings */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-3 sm:gap-4">
            <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              TYPOGRAPHY SYSTEM
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] sm:text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                  HEADING FONT
                </label>
                <select
                  value={brandKit.typography.headingFont}
                  onChange={(e) =>
                    setBrandKit({
                      ...brandKit,
                      typography: { ...brandKit.typography, headingFont: e.target.value },
                    })
                  }
                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs p-2 text-xs text-[var(--text-primary)] font-semibold"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.name} value={f.value}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                  BODY FONT
                </label>
                <select
                  value={brandKit.typography.bodyFont}
                  onChange={(e) =>
                    setBrandKit({
                      ...brandKit,
                      typography: { ...brandKit.typography, bodyFont: e.target.value },
                    })
                  }
                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs p-2 text-xs text-[var(--text-primary)] font-semibold"
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

          {/* Strict Semantic Accessibility Audit Card */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-lg flex flex-col gap-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-mono text-[10px] sm:text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
                  SEMANTIC ACCESSIBILITY AUDIT
                </span>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {auditReport.passingCount} of {auditReport.totalCount} core semantic roles pass WCAG AA thresholds
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!auditReport.overallPass && (
                  <button
                    onClick={handleAutoRemediate}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold uppercase bg-[var(--accent-gold)] text-black rounded-xs shadow-sm transition-opacity hover:opacity-90"
                    title="Auto-Fix all failing contrast roles"
                  >
                    <Sparkles size={11} />
                    <span>Auto-Fix</span>
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
                  className="text-[11px] font-mono text-[var(--accent-gold)] hover:underline flex items-center gap-1"
                >
                  <span>Full Engine</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>

            {/* The 4 Strict Audited Roles */}
            <div className="flex flex-col gap-2.5">
              {auditReport.results.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xs border flex flex-col gap-2 transition-all ${
                    item.pass
                      ? 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)]'
                      : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-[var(--text-primary)] tracking-wide">
                      {item.label}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs flex items-center gap-1 ${
                        item.pass
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {item.pass ? '✓ PASS' : '✕ FAILS AA'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px] pt-1 border-t border-[var(--border-subtle)]/60 text-[var(--text-secondary)]">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[var(--text-tertiary)] uppercase">Foreground</span>
                      <div className="flex items-center gap-1 font-bold text-[var(--text-primary)] mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs border border-white/20 flex-shrink-0"
                          style={{ backgroundColor: item.fg }}
                        />
                        <span>{item.fg}</span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[9px] text-[var(--text-tertiary)] uppercase">Background</span>
                      <div className="flex items-center gap-1 font-bold text-[var(--text-primary)] mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs border border-white/20 flex-shrink-0"
                          style={{ backgroundColor: item.bg }}
                        />
                        <span>{item.bg}</span>
                      </div>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-[9px] text-[var(--text-tertiary)] uppercase">Contrast</span>
                      <span
                        className={`font-bold mt-0.5 ${
                          item.pass ? 'text-emerald-400 font-extrabold' : 'text-rose-400 font-extrabold'
                        }`}
                      >
                        {item.ratio}:1
                      </span>
                    </div>
                  </div>

                  {/* Remediation suggestion if failing */}
                  {!item.pass && item.suggestedFg && (
                    <div className="flex items-center justify-between pt-2 border-t border-rose-800/30 text-[10px] font-mono">
                      <span className="text-rose-300">
                        Suggested: <strong className="text-white">{item.suggestedFg}</strong> ({item.suggestedRatio}:1)
                      </span>
                      <button
                        onClick={() => handleApplyRoleFix(item)}
                        className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xs font-bold transition-colors"
                      >
                        Apply Fix
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live UI Preview Studio (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-6 min-w-0 w-full">
          {/* Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-2 shadow-sm gap-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
              <button
                onClick={() => setPreviewMode('website')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-all whitespace-nowrap flex-1 sm:flex-initial ${
                  previewMode === 'website'
                    ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Layout size={13} />
                <span>Website</span>
              </button>

              <button
                onClick={() => setPreviewMode('mobile')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-all whitespace-nowrap flex-1 sm:flex-initial ${
                  previewMode === 'mobile'
                    ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Smartphone size={13} />
                <span>Mobile App</span>
              </button>

              <button
                onClick={() => setPreviewMode('dashboard')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-all whitespace-nowrap flex-1 sm:flex-initial ${
                  previewMode === 'dashboard'
                    ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <BarChart3 size={13} />
                <span>Dashboard</span>
              </button>
            </div>

            <span className="font-mono text-[9px] sm:text-[10px] text-[var(--text-tertiary)] uppercase text-center sm:text-right pr-1">
              LIVE DESIGN SYSTEM PROOF
            </span>
          </div>

          {/* Interactive Live Viewport Frame */}
          <div
            className="w-full rounded-md border border-[var(--border-strong)] overflow-hidden shadow-2xl transition-all"
            style={{
              backgroundColor: brandKit.roles.background,
              color: brandKit.roles.text,
              fontFamily: brandKit.typography.bodyFont,
            }}
          >
            {previewMode === 'website' && (
              /* WEBSITE PREVIEW MOCKUP */
              <div className="flex flex-col min-h-[480px] sm:min-h-[560px] w-full">
                {/* Site Header */}
                <header
                  className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b gap-2"
                  style={{
                    backgroundColor: brandKit.roles.surface,
                    borderColor: brandKit.roles.border,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-6 h-6 rounded-xs flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{
                        backgroundColor: brandKit.roles.primary,
                        color: primaryBtnText,
                      }}
                    >
                      {brandKit.name[0] || 'N'}
                    </span>
                    <span
                      className="font-bold text-xs sm:text-sm truncate"
                      style={{ fontFamily: brandKit.typography.headingFont }}
                    >
                      {brandKit.name}
                    </span>
                  </div>

                  <nav className="hidden sm:flex items-center gap-4 text-xs font-medium opacity-85">
                    <span>Products</span>
                    <span>Solutions</span>
                    <span>Docs</span>
                  </nav>

                  <button
                    className="px-3 sm:px-3.5 py-1.5 rounded-xs text-[11px] sm:text-xs font-bold shadow-md transition-opacity hover:opacity-90 flex-shrink-0"
                    style={{
                      backgroundColor: brandKit.roles.primary,
                      color: primaryBtnText,
                    }}
                  >
                    Get Started
                  </button>
                </header>

                {/* Hero Section */}
                <div className="p-5 sm:p-8 md:p-12 flex flex-col items-center text-center gap-3 sm:gap-4 max-w-2xl mx-auto my-auto w-full">
                  <span
                    className="px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider max-w-full truncate"
                    style={{
                      backgroundColor: brandKit.roles.surface,
                      color: brandKit.roles.accent,
                      border: `1px solid ${brandKit.roles.border}`,
                    }}
                  >
                    ✦ {brandKit.tagline || 'Next-Gen Platform'}
                  </span>

                  <h2
                    className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
                    style={{
                      fontFamily: brandKit.typography.headingFont,
                      color: brandKit.roles.text,
                    }}
                  >
                    Intelligent Architecture for Modern Digital Craft
                  </h2>

                  <p
                    className="text-xs sm:text-sm max-w-lg leading-relaxed"
                    style={{ color: brandKit.roles.mutedText }}
                  >
                    Scalable token foundations, real-time perceptual color analysis, and high-fidelity interface systems built for high-performance teams.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mt-2 w-full sm:w-auto">
                    <button
                      className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xs text-xs font-bold shadow-lg"
                      style={{
                        backgroundColor: brandKit.roles.primary,
                        color: primaryBtnText,
                      }}
                    >
                      Explore Solutions
                    </button>
                    <button
                      className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xs text-xs font-bold border transition-colors"
                      style={{
                        backgroundColor: brandKit.roles.surface,
                        color: brandKit.roles.text,
                        borderColor: brandKit.roles.border,
                      }}
                    >
                      Live Documentation
                    </button>
                  </div>
                </div>

                {/* Feature Cards Grid */}
                <div
                  className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 border-t"
                  style={{
                    backgroundColor: brandKit.roles.surface,
                    borderColor: brandKit.roles.border,
                  }}
                >
                  {[
                    { title: 'Perceptual Harmonies', desc: 'Continuous gamut calculation with delta-E metrics.' },
                    { title: 'Semantic Token Export', desc: 'Drop-in Tailwind & CSS variable architectures.' },
                    { title: 'WCAG AAA Accessibility', desc: 'Automated remediation for guaranteed compliance.' },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="p-3 sm:p-4 rounded-xs border flex flex-col gap-1.5"
                      style={{
                        backgroundColor: brandKit.roles.background,
                        borderColor: brandKit.roles.border,
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-xs flex items-center justify-center text-xs font-bold mb-1"
                        style={{
                          backgroundColor: i === 0 ? brandKit.roles.primary : i === 1 ? brandKit.roles.secondary : brandKit.roles.accent,
                          color: i === 2 ? '#111111' : '#FFFFFF',
                        }}
                      >
                        0{i + 1}
                      </div>
                      <h4
                        className="text-xs font-bold"
                        style={{ fontFamily: brandKit.typography.headingFont }}
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
              /* MOBILE APP PREVIEW MOCKUP */
              <div className="p-4 sm:p-6 flex justify-center w-full">
                <div
                  className="w-full max-w-sm rounded-2xl border-2 p-3.5 sm:p-4 flex flex-col gap-3.5 sm:gap-4 shadow-2xl"
                  style={{
                    backgroundColor: brandKit.roles.surface,
                    borderColor: brandKit.roles.border,
                  }}
                >
                  {/* Mobile App Bar */}
                  <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: brandKit.roles.border }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                        style={{ backgroundColor: brandKit.roles.primary, color: primaryBtnText }}
                      >
                        {brandKit.name[0]}
                      </div>
                      <span className="font-bold text-xs truncate" style={{ fontFamily: brandKit.typography.headingFont }}>
                        {brandKit.name}
                      </span>
                    </div>
                    <Bell size={14} style={{ color: brandKit.roles.mutedText }} className="flex-shrink-0" />
                  </div>

                  {/* Highlight Hero Card */}
                  <div
                    className="p-3.5 sm:p-4 rounded-xl border flex flex-col gap-2"
                    style={{
                      backgroundColor: brandKit.roles.primary,
                      color: primaryBtnText,
                      borderColor: brandKit.roles.secondary,
                    }}
                  >
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-85">
                      ACTIVE SPECTRUM GAMUT
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold" style={{ fontFamily: brandKit.typography.headingFont }}>
                      $284,950.00
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span>+18.4% this cycle</span>
                      <span
                        className="px-2 py-0.5 rounded-xs font-bold text-[10px]"
                        style={{ backgroundColor: brandKit.roles.accent, color: '#111111' }}
                      >
                        VERIFIED
                      </span>
                    </div>
                  </div>

                  {/* Action Feed */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono uppercase" style={{ color: brandKit.roles.mutedText }}>
                      RECENT OPERATIONS
                    </span>
                    {[
                      { name: 'Palette Engine Deployment', amount: '+$4,200', time: '2m ago' },
                      { name: 'Token System Synced', amount: '-$120', time: '1h ago' },
                      { name: 'WCAG AAA Audit Passed', amount: 'Audit', time: '4h ago' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border flex items-center justify-between text-xs gap-2"
                        style={{
                          backgroundColor: brandKit.roles.background,
                          borderColor: brandKit.roles.border,
                        }}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] truncate">{item.name}</div>
                          <div className="text-[10px]" style={{ color: brandKit.roles.mutedText }}>
                            {item.time}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-[11px] flex-shrink-0">{item.amount}</span>
                      </div>
                    ))}
                  </div>

                  {/* Primary CTA Button */}
                  <button
                    className="w-full py-2.5 rounded-lg font-bold text-xs shadow-md mt-1"
                    style={{
                      backgroundColor: brandKit.roles.primary,
                      color: primaryBtnText,
                    }}
                  >
                    Execute Command
                  </button>
                </div>
              </div>
            )}

            {previewMode === 'dashboard' && (
              /* DASHBOARD PREVIEW MOCKUP */
              <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 min-h-[480px] sm:min-h-[560px] w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2.5" style={{ borderColor: brandKit.roles.border }}>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold" style={{ fontFamily: brandKit.typography.headingFont }}>
                      {brandKit.name} Analytics Engine
                    </h3>
                    <p className="text-[10px] sm:text-[11px]" style={{ color: brandKit.roles.mutedText }}>
                      Real-time cross-platform chromatic telemetries.
                    </p>
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-xs text-xs font-bold shadow-sm self-start sm:self-auto"
                    style={{ backgroundColor: brandKit.roles.primary, color: primaryBtnText }}
                  >
                    Export Report
                  </button>
                </div>

                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {[
                    { label: 'Active Gamuts', value: '1,428', change: '+12.4%', icon: Activity },
                    { label: 'Harmonic Score', value: '99.2%', change: '+4.1%', icon: TrendingUp },
                    { label: 'Design Tokens', value: '84,920', change: '+32.8%', icon: CreditCard },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 sm:p-3.5 rounded-xs border flex flex-col gap-1"
                      style={{
                        backgroundColor: brandKit.roles.surface,
                        borderColor: brandKit.roles.border,
                      }}
                    >
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px]" style={{ color: brandKit.roles.mutedText }}>
                        <span>{m.label}</span>
                        <m.icon size={13} style={{ color: brandKit.roles.accent }} />
                      </div>
                      <div className="text-base sm:text-lg font-bold" style={{ fontFamily: brandKit.typography.headingFont }}>
                        {m.value}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                        {m.change} vs previous cycle
                      </div>
                    </div>
                  ))}
                </div>

                {/* Data Table Container */}
                <div
                  className="rounded-xs border overflow-x-auto w-full"
                  style={{
                    backgroundColor: brandKit.roles.surface,
                    borderColor: brandKit.roles.border,
                  }}
                >
                  <table className="w-full text-left text-[11px] min-w-[380px]">
                    <thead
                      className="border-b font-mono text-[10px] uppercase"
                      style={{ borderColor: brandKit.roles.border, color: brandKit.roles.mutedText }}
                    >
                      <tr>
                        <th className="p-2.5">Spectrum Channel</th>
                        <th className="p-2.5">Gamut Role</th>
                        <th className="p-2.5">Compliance</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: brandKit.roles.border }}>
                      {[
                        { name: 'Core Canvas Light', role: 'Background', ratio: '14.2:1', status: 'PASS' },
                        { name: 'Dominant Structural', role: 'Primary', ratio: '8.4:1', status: 'PASS' },
                        { name: 'Vibrant Accentuation', role: 'Accent', ratio: '4.8:1', status: 'ACTIVE' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:opacity-90">
                          <td className="p-2.5 font-bold truncate max-w-[120px]">{row.name}</td>
                          <td className="p-2.5" style={{ color: brandKit.roles.mutedText }}>{row.role}</td>
                          <td className="p-2.5 font-mono">{row.ratio}</td>
                          <td className="p-2.5 text-right">
                            <span
                              className="px-2 py-0.5 rounded-xs font-mono font-bold text-[9px]"
                              style={{
                                backgroundColor: i === 2 ? brandKit.roles.accent : brandKit.roles.primary,
                                color: i === 2 ? '#111111' : primaryBtnText,
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
        </div>
      </div>

      {/* Export Design Tokens Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-md w-full max-w-xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
                EXPORT DESIGN SYSTEM TOKENS
              </span>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
                aria-label="Close export modal"
              >
                ✕
              </button>
            </div>

            {/* Format Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {(['css', 'tailwind', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-all flex-1 sm:flex-initial text-center ${
                    exportFormat === fmt
                      ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]'
                      : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Code Output Viewport */}
            <pre className="p-3 sm:p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs font-mono text-[11px] sm:text-xs text-[var(--text-primary)] overflow-x-auto max-h-60">
              {exportContent}
            </pre>

            <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]"
              >
                Close
              </button>
              <button
                onClick={handleCopyTokens}
                className="btn-primary inline-flex items-center gap-1.5 text-xs"
              >
                <Copy size={13} />
                <span>Copy Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
