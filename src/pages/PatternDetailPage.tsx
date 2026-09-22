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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Code,
  Layers,
  ArrowUpRight,
  ArrowRight,
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
import { PatternCard } from '../components/PatternCard';
import { KromaCard, KromaCardBody } from '../components/common/KromaCard';
import { KromaButton } from '../components/common/KromaButton';

interface PatternDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const PatternDetailPage: React.FC<PatternDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'css' | 'svg' | 'json'>('css');
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const pattern = useMemo(() => {
    const clean = slug.toLowerCase();
    return CURATED_PATTERNS.find((p) => p.slug.toLowerCase() === clean || p.id.toLowerCase() === clean);
  }, [slug]);

  if (!pattern) {
    return <NotFoundPage requestedUrl={`/patterns/${slug}`} onNavigate={onNavigate} />;
  }

  const saved = isSaved(pattern.id);

  // Live SVG code using real mathematical parameters with zoom multiplier
  const effectiveScale = Math.round(pattern.scale * zoomMultiplier);
  const effectiveDensity = Math.round(pattern.density);

  const svgCode = useMemo(() => {
    return generatePatternSvg(
      {
        type: pattern.type,
        palette: pattern.palette,
        scale: effectiveScale,
        density: effectiveDensity,
        rotation: pattern.rotation,
        strokeWidth: pattern.strokeWidth,
        opacity: pattern.opacity,
      },
      1200,
      700
    );
  }, [pattern, effectiveScale, effectiveDensity]);

  const cssCode = useMemo(() => {
    return generatePatternCss({
      type: pattern.type,
      palette: pattern.palette,
      scale: effectiveScale,
      density: effectiveDensity,
      rotation: pattern.rotation,
      strokeWidth: pattern.strokeWidth,
      opacity: pattern.opacity,
    });
  }, [pattern, effectiveScale, effectiveDensity]);

  const jsonCode = useMemo(() => {
    return JSON.stringify(
      {
        id: pattern.id,
        title: pattern.title,
        type: pattern.type,
        category: pattern.category,
        palette: pattern.palette,
        scale: pattern.scale,
        density: pattern.density,
        rotation: pattern.rotation,
        strokeWidth: pattern.strokeWidth,
        opacity: pattern.opacity,
        creator: pattern.creator,
      },
      null,
      2
    );
  }, [pattern]);

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
    saveItem({
      id: pattern.id,
      type: 'pattern',
      title: pattern.title,
      slug: pattern.slug,
      preview: pattern.palette.join(','),
      metadata: `${pattern.type.toUpperCase()} • Scale ${pattern.scale}%`,
    });
    showToast(saved ? 'Removed from saved' : 'Saved pattern specimen', pattern.title);
  };

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Specimen link copied to clipboard', pattern.title);
    }
  };

  // Curated 3 related patterns (excluding current)
  const relatedPatterns = useMemo(() => {
    return CURATED_PATTERNS.filter((p) => p.id !== pattern.id).slice(0, 3);
  }, [pattern.id]);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10 sm:gap-14 pb-20 px-4 sm:px-6">
      <SEOHead
        title={`${pattern.title} — Generative Pattern Specimen | Kroma`}
        description={pattern.description}
        canonicalPath={`/patterns/${pattern.slug}`}
        keywords={[pattern.type, 'vector pattern', 'pattern specimen', 'generative texture', 'svg pattern', ...pattern.tags]}
      />

      {/* ─── 01. EDITORIAL SPECIMEN BREADCRUMB & TOP ───────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[11px] text-[#707070] uppercase tracking-wider pt-2">
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

      {/* ─── 02. IMMERSIVE HERO PATTERN CANVAS (70–85% ATTENTION) ─── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#707070]">
            PATTERN ARTBOARD SPECIMEN • {pattern.type.toUpperCase()}
          </span>

          {/* Interactive Canvas Viewport Controls */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1 border border-black/10 dark:border-white/10 rounded-[3px] p-0.5 bg-white/40 dark:bg-white/[0.04]">
              <button
                onClick={() => setZoomMultiplier(0.5)}
                className={`px-2 py-0.5 rounded-[2px] text-[10px] font-semibold transition-colors cursor-pointer ${
                  zoomMultiplier === 0.5 ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]' : 'text-[#707070]'
                }`}
                title="Dense zoom (0.5x)"
              >
                0.5×
              </button>
              <button
                onClick={() => setZoomMultiplier(1)}
                className={`px-2 py-0.5 rounded-[2px] text-[10px] font-semibold transition-colors cursor-pointer ${
                  zoomMultiplier === 1 ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]' : 'text-[#707070]'
                }`}
                title="Natural scale (1.0x)"
              >
                1×
              </button>
              <button
                onClick={() => setZoomMultiplier(1.8)}
                className={`px-2 py-0.5 rounded-[2px] text-[10px] font-semibold transition-colors cursor-pointer ${
                  zoomMultiplier === 1.8 ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]' : 'text-[#707070]'
                }`}
                title="Expanded scale (1.8x)"
              >
                2×
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 border border-black/10 dark:border-white/10 rounded-[3px] bg-white/40 dark:bg-white/[0.04] text-[#707070] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Expand' : 'Expand Artboard'}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        </div>

        {/* Artboard Container */}
        <div
          className={`w-full rounded-[4px] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden select-none transition-all duration-300 relative shadow-sm ${
            isFullscreen ? 'h-[80vh]' : 'h-80 sm:h-[480px] md:h-[560px]'
          }`}
        >
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />

          {/* Floating Specimen Badge */}
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-black/70 text-white backdrop-blur-md border border-white/15">
            <span className="w-2 h-2 rounded-full bg-[#00AEEF] animate-pulse" />
            <span className="font-mono text-[10px] font-semibold tracking-wider uppercase">
              LIVE VECTOR SURFACE • SEED {effectiveScale}x{effectiveDensity}
            </span>
          </div>
        </div>
      </section>

      {/* ─── 03. SPECIMEN METADATA & PRIMARY ACTIONS ──────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-black/[0.08] dark:border-white/[0.08] pb-10">
        {/* Left Column: Title, Description & Parameters */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#FF9500]">
                {pattern.category}
              </span>
              {pattern.creator?.name && (
                <>
                  <span className="text-[#707070]">•</span>
                  <span className="font-mono text-[11px] text-[#707070] uppercase">
                    BY {pattern.creator.name}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#171717] dark:text-white m-0">
              {pattern.title}
            </h1>
          </div>

          <p className="font-sans text-xs sm:text-sm text-[#707070] dark:text-[#A0A0A0] leading-relaxed m-0 max-w-xl">
            {pattern.description}
          </p>

          {/* Mathematical Surface Parameters Readout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-2.5 rounded-[3px] bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.06] dark:border-white/[0.06] flex flex-col gap-0.5">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#707070]">GRID SCALE</span>
              <span className="font-mono text-xs font-bold text-[#171717] dark:text-white">{effectiveScale}px</span>
            </div>

            <div className="p-2.5 rounded-[3px] bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.06] dark:border-white/[0.06] flex flex-col gap-0.5">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#707070]">DENSITY</span>
              <span className="font-mono text-xs font-bold text-[#171717] dark:text-white">{pattern.density}%</span>
            </div>

            <div className="p-2.5 rounded-[3px] bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.06] dark:border-white/[0.06] flex flex-col gap-0.5">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#707070]">ROTATION</span>
              <span className="font-mono text-xs font-bold text-[#171717] dark:text-white">{pattern.rotation}°</span>
            </div>

            <div className="p-2.5 rounded-[3px] bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.06] dark:border-white/[0.06] flex flex-col gap-0.5">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#707070]">STROKE / OPACITY</span>
              <span className="font-mono text-xs font-bold text-[#171717] dark:text-white">{(pattern.strokeWidth ?? 2)}px · {Math.round((pattern.opacity ?? 1) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clear Action Hierarchy */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6 lg:border-l lg:border-black/[0.08] lg:dark:border-white/[0.08] lg:pl-8">
          {/* Primary Action: Launch in Studio */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#707070]">
              WORKBENCH ACTIONS
            </span>

            <KromaButton
              variant="filled"
              className="w-full justify-between"
              onClick={() =>
                onNavigate({
                  path: 'pattern-studio',
                  palette: pattern.palette.map((c) => c.replace('#', '')).join('-'),
                  type: pattern.type,
                  scale: String(pattern.scale),
                  density: String(pattern.density),
                  rotation: String(pattern.rotation),
                })
              }
              iconLeft={<Sliders size={14} />}
              iconRight={<ArrowUpRight size={14} />}
            >
              Open in Pattern Studio
            </KromaButton>
          </div>

          {/* Secondary Quiet Actions */}
          <div className="grid grid-cols-3 gap-2.5">
            <KromaButton
              variant="outline"
              size="sm"
              onClick={handleDownloadSvg}
              iconLeft={<Download size={13} />}
            >
              SVG
            </KromaButton>

            <KromaButton
              variant="outline"
              size="sm"
              onClick={handleToggleSave}
              className={saved ? '!border-[#FF9500] !text-[#FF9500] !bg-[#FF9500]/10' : ''}
              iconLeft={<Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />}
            >
              {saved ? 'Saved' : 'Save'}
            </KromaButton>

            <KromaButton
              variant="outline"
              size="sm"
              onClick={handleShare}
              iconLeft={<Share2 size={13} />}
            >
              Share
            </KromaButton>
          </div>
        </div>
      </section>

      {/* ─── 04. PALETTE COLOR STRIP SPECIMEN ─────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#707070]">
            01 • CHROMATIC ANCHORS
          </span>
          <span className="font-mono text-[10.5px] text-[#707070] uppercase">
            CLICK SWATCH TO COPY HEX
          </span>
        </div>

        {/* Visual Multi-Tone Strip */}
        <div className="w-full h-20 sm:h-24 rounded-[4px] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex select-none">
          {pattern.palette.map((hex, i) => (
            <div
              key={i}
              style={{ backgroundColor: hex }}
              onClick={() => handleCopyHex(hex)}
              className="group/swatch flex-1 h-full p-3 flex flex-col justify-between cursor-pointer transition-[flex] duration-200 hover:flex-[1.4] relative"
              title={`Click to copy ${hex}`}
            >
              <span className="font-mono text-[9px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded-[2px] w-fit">
                0{i + 1}
              </span>

              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs font-bold text-white drop-shadow-sm truncate">
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

      {/* ─── 05. TECHNICAL CODE SPECIMEN SECTION ──────────────────── */}
      <KromaCard as="section" interactive={false} variant="default">
        <KromaCardBody className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#707070]">
                02 • TECHNICAL IMPLEMENTATION
              </span>
              <h2 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
                Production Surface Code
              </h2>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center gap-1.5">
              {(['css', 'svg', 'json'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`px-3 py-1 rounded-[3px] font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeCodeTab === tab
                      ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]'
                      : 'bg-black/[0.04] dark:bg-white/[0.05] text-[#707070] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  {tab === 'css' ? 'CSS Background' : tab === 'svg' ? 'SVG Markup' : 'JSON Parameters'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 bg-white dark:bg-[#121316] border border-black/[0.08] dark:border-white/[0.08] rounded-[3px] font-mono text-xs text-[#171717] dark:text-white/90 overflow-x-auto leading-relaxed max-h-72 m-0 scrollbar-thin">
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
        </KromaCardBody>
      </KromaCard>

      {/* ─── 06. RELATED SPECIMENS ────────────────────────────────── */}
      {relatedPatterns.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2">
            <div>
              <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#707070]">
                03 • HARMONIC ARCHIVE COMPANIONS
              </span>
              <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
                Related Pattern Specimens
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPatterns.map((pat) => (
              <PatternCard key={pat.id} pattern={pat} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
