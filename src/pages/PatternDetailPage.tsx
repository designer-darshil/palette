import React, { useMemo, useState } from 'react';
import {
  Copy,
  Download,
  Sliders,
  Share2,
  Bookmark,
  Check,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Code,
  Layers,
  ArrowUpRight,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PATTERNS } from '../data/patterns';
import { generatePatternSvg, generatePatternCss } from '../utils/patternEngine';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { SEOHead } from '../components/seo/SEOHead';
import { NotFoundPage } from './NotFoundPage';
import { Link } from '../components/common/Link';
import { KromaButton } from '../components/common/KromaButton';

interface PatternDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const PatternDetailPage: React.FC<PatternDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem, removeItem } = useSaved();

  const pattern = useMemo(() => {
    const clean = slug.toLowerCase();
    return CURATED_PATTERNS.find((p) => p.slug.toLowerCase() === clean || p.id.toLowerCase() === clean);
  }, [slug]);

  // Interactive Creative Instrument States (allowing designer exploration of scale, density, rotation)
  const [scale, setScale] = useState<number>(pattern ? pattern.scale : 45);
  const [density, setDensity] = useState<number>(pattern ? pattern.density : 60);
  const [rotation, setRotation] = useState<number>(pattern ? pattern.rotation : 0);
  const [strokeWidth, setStrokeWidth] = useState<number>(pattern?.strokeWidth ?? 2);
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'css' | 'svg' | 'json'>('css');

  if (!pattern) {
    return <NotFoundPage requestedUrl={`/patterns/${slug}`} onNavigate={onNavigate} />;
  }

  const saved = isSaved(pattern.id);

  // Live SVG code using real mathematical parameters with interactive scale and zoom
  const effectiveScale = Math.round(scale * zoomMultiplier);

  const svgCode = useMemo(() => {
    return generatePatternSvg(
      {
        type: pattern.type,
        palette: pattern.palette,
        scale: effectiveScale,
        density,
        rotation,
        strokeWidth,
        opacity: pattern.opacity ?? 0.9,
      },
      1440,
      800
    );
  }, [pattern, effectiveScale, density, rotation, strokeWidth]);

  const cssCode = useMemo(() => {
    return generatePatternCss({
      type: pattern.type,
      palette: pattern.palette,
      scale: effectiveScale,
      density,
      rotation,
      strokeWidth,
      opacity: pattern.opacity ?? 0.9,
    });
  }, [pattern, effectiveScale, density, rotation, strokeWidth]);

  const jsonCode = useMemo(() => {
    return JSON.stringify(
      {
        id: pattern.id,
        title: pattern.title,
        type: pattern.type,
        category: pattern.category,
        palette: pattern.palette,
        scale,
        density,
        rotation,
        strokeWidth,
        opacity: pattern.opacity ?? 0.9,
        system: 'continuous-svg-tessellation',
        creator: pattern.creator,
      },
      null,
      2
    );
  }, [pattern, scale, density, rotation, strokeWidth]);

  const currentCode =
    activeCodeTab === 'css' ? cssCode : activeCodeTab === 'svg' ? svgCode : jsonCode;

  const handleCopyCode = async () => {
    const success = await copyToClipboard(currentCode);
    if (success) {
      setCopiedCode(true);
      showToast(`Copied Pattern ${activeCodeTab.toUpperCase()}`, pattern.title);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyHex = async (hex: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      showToast(`Copied ${hex}`, pattern.title, hex);
      setTimeout(() => setCopiedHex(null), 1800);
    }
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pattern.slug}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded Pattern SVG', pattern.title);
  };

  const handleToggleSave = () => {
    if (saved) {
      removeItem(pattern.id);
      showToast('Removed from saved collection', pattern.title);
      return;
    }

    saveItem({
      id: pattern.id,
      type: 'pattern',
      title: pattern.title,
      slug: pattern.slug,
      preview: pattern.palette.join(','),
      metadata: `${pattern.type.toUpperCase()} • Scale ${scale}%`,
    });
    showToast('Saved pattern specimen', pattern.title);
  };

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Specimen link copied to clipboard', pattern.title);
    }
  };

  const handleResetControls = () => {
    setScale(pattern.scale);
    setDensity(pattern.density);
    setRotation(pattern.rotation);
    setStrokeWidth(pattern.strokeWidth ?? 2);
    setZoomMultiplier(1);
    showToast('Reset to original parameters');
  };

  // Curated 4 related patterns (excluding current)
  const relatedPatterns = useMemo(() => {
    return CURATED_PATTERNS.filter((p) => p.id !== pattern.id).slice(0, 4);
  }, [pattern.id]);

  // Pattern index number formatting
  const patternIndex = useMemo(() => {
    const idx = CURATED_PATTERNS.findIndex((p) => p.id === pattern.id);
    return idx >= 0 ? String(idx + 1).padStart(3, '0') : '001';
  }, [pattern.id]);

  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-10 sm:gap-14 pb-24 px-4 sm:px-6 md:px-8">
      <SEOHead
        title={`${pattern.title} — Generative Pattern Specimen | Kroma`}
        description={pattern.description}
        canonicalPath={`/patterns/${pattern.slug}`}
        keywords={[pattern.type, 'vector pattern', 'pattern specimen', 'generative texture', 'svg pattern', ...pattern.tags]}
      />

      {/* ─── 01. TOP AREA: MINIMAL SPECIMEN HEADER ─────────────────── */}
      <header className="flex flex-col gap-3 pt-3">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[11px] text-[#707070] uppercase tracking-wider">
          <Link to={{ path: 'home' }} onNavigate={onNavigate} className="hover:text-[#171717] dark:hover:text-white transition-colors">
            HOME
          </Link>
          <span>/</span>
          <Link to={{ path: 'patterns' }} onNavigate={onNavigate} className="hover:text-[#171717] dark:hover:text-white transition-colors">
            PATTERNS
          </Link>
          <span>/</span>
          <span className="text-[#171717] dark:text-white font-semibold truncate">{pattern.title}</span>
        </nav>

        {/* Minimal Specimen Header: Artwork Appears Immediately */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-black/[0.08] dark:border-white/[0.08] pb-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs font-bold text-[#FF9500] uppercase tracking-wider">
              PATTERN {patternIndex}
            </span>
            <span className="text-[#707070]">•</span>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
              {pattern.title}
            </h1>
            <span className="text-[#707070]">•</span>
            <span className="font-sans text-xs text-[#707070] uppercase tracking-wide">
              {pattern.category} repetition study
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <KromaButton
              variant="outline"
              size="sm"
              onClick={handleShare}
              iconLeft={<Share2 size={13} />}
            >
              Share
            </KromaButton>

            <KromaButton
              variant={saved ? 'filled' : 'outline'}
              size="sm"
              onClick={handleToggleSave}
              iconLeft={<Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />}
            >
              {saved ? 'Saved' : 'Save'}
            </KromaButton>

            <KromaButton
              variant="filled"
              size="sm"
              onClick={() =>
                onNavigate({
                  path: 'pattern-studio',
                  palette: pattern.palette.map((c) => c.replace('#', '')).join('-'),
                  type: pattern.type,
                  scale: String(scale),
                  density: String(density),
                  rotation: String(rotation),
                })
              }
              iconLeft={<Sliders size={13} />}
            >
              Studio
            </KromaButton>
          </div>
        </div>
      </header>

      {/* ─── 02. MAIN PATTERN CANVAS: HUGE VISUAL HERO (70–90% VIEWPORT) ── */}
      <section className="flex flex-col gap-3">
        {/* Canvas Toolbar & Metric Readout */}
        <div className="flex items-center justify-between font-mono text-[10.5px] text-[#707070] uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            <span className="font-semibold tracking-wider text-[#171717] dark:text-white">
              LIVE CONTINUOUS ARTBOARD
            </span>
            <span>•</span>
            <span>{pattern.type.toUpperCase()}</span>
          </div>

          {/* Viewport Zoom & Expand */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-black/10 dark:border-white/10 rounded-[3px] p-0.5 bg-black/[0.02] dark:bg-white/[0.04]">
              {[0.5, 1.0, 1.8].map((z) => (
                <KromaButton
                  key={z}
                  variant={zoomMultiplier === z ? 'filled' : 'ghost'}
                  size="sm"
                  onClick={() => setZoomMultiplier(z)}
                  className={`px-2 py-0.5 rounded-[2px] text-[10px] font-semibold transition-colors cursor-pointer h-auto min-h-0 border-0 ${
                    zoomMultiplier === z
                      ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]'
                      : 'text-[#707070] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  {z === 0.5 ? '0.5×' : z === 1.0 ? '1.0×' : '2.0×'}
                </KromaButton>
              ))}
            </div>

            <KromaButton
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 border border-black/10 dark:border-white/10 rounded-[3px] text-[#707070] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer bg-transparent h-auto"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Canvas'}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </KromaButton>
          </div>
        </div>

        {/* Large Pattern Canvas Viewport */}
        <div
          className={`w-full rounded-[4px] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden select-none transition-all duration-300 relative ${
            isFullscreen ? 'h-[85vh]' : 'h-80 sm:h-[480px] md:h-[620px] lg:h-[680px]'
          }`}
        >
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />

          {/* Floating Subtle Coordinate Pill */}
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-[3px] bg-black/80 text-white backdrop-blur-md border border-white/15 font-mono text-[10.5px]">
            <span className="font-semibold text-[#00AEEF]">{pattern.type.toUpperCase()}</span>
            <span>•</span>
            <span>SCALE {effectiveScale}PX</span>
            <span>•</span>
            <span>ROTATION {rotation}°</span>
          </div>

          <div className="absolute bottom-4 right-4">
            <KromaButton
              variant="ghost"
              size="sm"
              iconLeft={<Download size={12} />}
              onClick={handleDownloadSvg}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-black/80 hover:bg-black text-white text-xs font-mono font-medium backdrop-blur-md border border-white/15 cursor-pointer transition-all"
            >
              EXPORT SVG
            </KromaButton>
          </div>
        </div>
      </section>

      {/* ─── 03. COMPACT CREATIVE INSTRUMENT CONTROLS ──────────────── */}
      <section className="p-4 sm:p-6 rounded-[4px] border border-black/[0.08] dark:border-white/[0.08] bg-[#F8F8F8] dark:bg-[#141518] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-[#171717] dark:text-white uppercase tracking-wider">
            <SlidersHorizontal size={13} className="text-[#00AEEF]" />
            <span>CREATIVE INSTRUMENT CONTROLS</span>
          </div>

          {(scale !== pattern.scale || density !== pattern.density || rotation !== pattern.rotation) && (
            <KromaButton
              variant="ghost"
              size="sm"
              iconLeft={<RotateCcw size={11} />}
              onClick={handleResetControls}
              className="inline-flex items-center gap-1 font-mono text-xs text-[#FF3B30] hover:underline cursor-pointer bg-transparent border-0 p-0 h-auto"
            >
              Reset
            </KromaButton>
          )}
        </div>

        {/* Horizontal Instrument Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Instrument 1: Scale */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-mono text-xs text-[#707070]">
              <span className="uppercase font-semibold text-[#171717] dark:text-white">SCALE</span>
              <span>{scale}px</span>
            </div>
            <input
              type="range"
              min="15"
              max="95"
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
              className="w-full accent-[#171717] dark:accent-white cursor-pointer"
            />
          </div>

          {/* Instrument 2: Density */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-mono text-xs text-[#707070]">
              <span className="uppercase font-semibold text-[#171717] dark:text-white">DENSITY</span>
              <span>{density}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={density}
              onChange={(e) => setDensity(parseInt(e.target.value))}
              className="w-full accent-[#171717] dark:accent-white cursor-pointer"
            />
          </div>

          {/* Instrument 3: Rotation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-mono text-xs text-[#707070]">
              <span className="uppercase font-semibold text-[#171717] dark:text-white">ROTATION</span>
              <span>{rotation}°</span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              step="5"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full accent-[#171717] dark:accent-white cursor-pointer"
            />
          </div>

          {/* Instrument 4: Stroke Weight */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-mono text-xs text-[#707070]">
              <span className="uppercase font-semibold text-[#171717] dark:text-white">STROKE</span>
              <span>{strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
              className="w-full accent-[#171717] dark:accent-white cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* ─── 04. COLOR STRIP SPECIMEN ─────────────────────────────── */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between font-mono text-[10.5px] text-[#707070] uppercase">
          <span className="font-semibold tracking-[0.14em]">
            CALIBRATED CHROMATIC SYSTEM
          </span>
          <span>CLICK SWATCH TO COPY HEX</span>
        </div>

        {/* Visual Horizontal Color Strip */}
        <div className="w-full h-16 sm:h-20 rounded-[4px] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex select-none">
          {pattern.palette.map((hex, i) => (
            <div
              key={i}
              style={{ backgroundColor: hex }}
              onClick={() => handleCopyHex(hex)}
              className="group/swatch flex-1 h-full p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer transition-[flex] duration-200 hover:flex-[1.4] relative"
              title={`Click to copy ${hex}`}
            >
              <span className="font-mono text-[9px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded-[2px] w-fit">
                0{i + 1}
              </span>

              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] sm:text-xs font-bold text-white drop-shadow-sm truncate">
                  {hex}
                </span>
                {copiedHex === hex && (
                  <span className="font-mono text-[9px] font-bold text-[#34C759] bg-black/80 px-1.5 py-0.5 rounded-[2px]">
                    COPIED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 05. PATTERN SPECIFICATION & DESCRIPTION ───────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-black/[0.08] dark:border-white/[0.08] pt-8">
        {/* Left Column: Architectural Metadata */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#707070]">
            PATTERN SPECIFICATION
          </div>

          <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-mono text-xs border-y border-black/[0.06] dark:border-white/[0.06] py-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#707070] uppercase">PATTERN ID</span>
              <span className="font-bold text-[#171717] dark:text-white uppercase">{pattern.id}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#707070] uppercase">CATEGORY</span>
              <span className="font-bold text-[#171717] dark:text-white uppercase">{pattern.category}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#707070] uppercase">FAMILY TYPE</span>
              <span className="font-bold text-[#171717] dark:text-white uppercase">{pattern.type}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#707070] uppercase">REPEAT SYSTEM</span>
              <span className="font-bold text-[#171717] dark:text-white uppercase">UserSpaceOnUse</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#707070] uppercase">TILE RESOLUTION</span>
              <span className="font-bold text-[#171717] dark:text-white">{effectiveScale * 2}px × {effectiveScale * 2}px</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#707070] uppercase">CHROMATIC COUNT</span>
              <span className="font-bold text-[#171717] dark:text-white">{pattern.palette.length} Colors</span>
            </div>
          </div>

          {pattern.creator && (
            <div className="font-mono text-[11px] text-[#707070] uppercase">
              CURATED BY <span className="font-bold text-[#171717] dark:text-white">{pattern.creator.name}</span> (@{pattern.creator.username})
            </div>
          )}
        </div>

        {/* Right Column: Narrative Notes & Intent */}
        <div className="lg:col-span-6 flex flex-col gap-3 justify-between">
          <div className="flex flex-col gap-2">
            <div className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#707070]">
              DESIGN INTENT & SURFACE NOTES
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#707070] dark:text-[#A0A0A0] leading-relaxed m-0">
              {pattern.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {pattern.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-[2px] bg-black/[0.04] dark:bg-white/[0.06] font-mono text-[10px] text-[#707070] uppercase"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
            <KromaButton
              variant="filled"
              size="sm"
              onClick={() =>
                onNavigate({
                  path: 'pattern-studio',
                  palette: pattern.palette.map((c) => c.replace('#', '')).join('-'),
                  type: pattern.type,
                  scale: String(scale),
                  density: String(density),
                  rotation: String(rotation),
                })
              }
              iconRight={<ArrowUpRight size={13} />}
            >
              Tune in Studio
            </KromaButton>

            <KromaButton
              variant="outline"
              size="sm"
              onClick={handleDownloadSvg}
              iconLeft={<Download size={13} />}
            >
              Download SVG
            </KromaButton>
          </div>
        </div>
      </section>

      {/* ─── 06. CSS & CODE SPECIMEN (GUARANTEED ZERO OVERFLOW) ─────── */}
      <section className="flex flex-col gap-3 rounded-[4px] border border-black/[0.08] dark:border-white/[0.08] bg-[#F8F8F8] dark:bg-[#141518] p-5 sm:p-6 min-w-0 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#707070]">
              CODE SPECIMEN
            </span>
            <h2 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
              Production Implementation
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['css', 'svg', 'json'] as const).map((tab) => (
              <KromaButton
                key={tab}
                variant={activeCodeTab === tab ? 'filled' : 'ghost'}
                size="sm"
                onClick={() => setActiveCodeTab(tab)}
                className={`px-3 py-1 rounded-[3px] font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer h-auto min-h-0 border-0 ${
                  activeCodeTab === tab
                    ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]'
                    : 'bg-black/[0.04] dark:bg-white/[0.05] text-[#707070] hover:text-[#171717] dark:hover:text-white'
                }`}
              >
                {tab === 'css' ? 'CSS' : tab === 'svg' ? 'SVG' : 'JSON'}
              </KromaButton>
            ))}
          </div>
        </div>

        {/* Code Viewport with Guaranteed No-Overflow */}
        <div className="relative min-w-0 max-w-full">
          <pre className="p-4 bg-white dark:bg-[#121316] border border-black/[0.08] dark:border-white/[0.08] rounded-[3px] font-mono text-xs text-[#171717] dark:text-white/90 overflow-x-auto leading-relaxed max-h-72 m-0 min-w-0 max-w-full">
            <code>{currentCode}</code>
          </pre>

          <div className="absolute top-3 right-3">
            <KromaButton
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              iconLeft={copiedCode ? <Check size={12} className="text-[#34C759]" /> : <Copy size={12} />}
            >
              {copiedCode ? 'Copied' : 'Copy'}
            </KromaButton>
          </div>
        </div>
      </section>

      {/* ─── 07. MORE PATTERNS: COMPACT EDITORIAL VISUAL ARCHIVE ───── */}
      {relatedPatterns.length > 0 && (
        <section className="flex flex-col gap-4 border-t border-black/[0.08] dark:border-white/[0.08] pt-8">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#707070]">
                MORE PATTERNS
              </span>
              <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
                Related Specimens
              </h2>
            </div>

            <Link
              to={{ path: 'patterns' }}
              onNavigate={onNavigate}
              className="font-mono text-xs text-[#707070] hover:text-[#171717] dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>View Full Archive</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Compact 4-Card Horizontal Visual Archive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedPatterns.map((pat) => {
              const previewSvg = generatePatternSvg(
                {
                  type: pat.type,
                  palette: pat.palette,
                  scale: pat.scale,
                  density: pat.density,
                  rotation: pat.rotation,
                  strokeWidth: pat.strokeWidth,
                  opacity: pat.opacity,
                },
                320,
                200
              );

              return (
                <div
                  key={pat.id}
                  onClick={() => onNavigate({ path: 'pattern-detail', slug: pat.slug })}
                  className="group/rel rounded-[3px] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden bg-[#F8F8F8] dark:bg-[#141518] cursor-pointer flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-black/25 dark:hover:border-white/25 hover:shadow-xs select-none"
                  role="button"
                  tabIndex={0}
                >
                  <div className="w-full h-40 relative overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06]">
                    <div
                      className="w-full h-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/rel:scale-105"
                      dangerouslySetInnerHTML={{ __html: previewSvg }}
                    />
                    <span className="absolute top-2 right-2 font-mono text-[8.5px] uppercase font-bold px-1.5 py-0.5 rounded-[2px] bg-black/75 text-white backdrop-blur-xs">
                      {pat.type}
                    </span>
                  </div>

                  <div className="p-3 flex flex-col justify-between gap-1">
                    <span className="font-mono text-[9px] text-[#707070] uppercase truncate">
                      {pat.category} • {pat.scale}PX
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans text-xs font-bold text-[#171717] dark:text-white uppercase truncate group-hover/rel:text-[#00AEEF] transition-colors">
                        {pat.title}
                      </span>
                      <ArrowUpRight size={12} className="text-[#707070] group-hover/rel:text-[#00AEEF] group-hover/rel:translate-x-0.5 group-hover/rel:-translate-y-0.5 transition-transform shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
