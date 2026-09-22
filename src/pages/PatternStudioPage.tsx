import React, { useState, useMemo, useRef } from 'react';
import { Download, Copy, Sparkles, Check, RotateCcw, Image, Maximize2, Palette } from 'lucide-react';
import { RouteType, PatternType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useToast } from '../context/ToastContext';
import { generatePatternSvg, generatePatternCss } from '../utils/patternEngine';
import { copyToClipboard } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { CURATED_PATTERNS } from '../data/patterns';
import { Analytics } from '../utils/analytics';

interface PatternStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialPaletteQuery?: string;
  initialType?: string;
  initialScale?: string;
  initialDensity?: string;
  initialRotation?: string;
}

const SHAPE_OPTIONS: { type: PatternType; label: string; glyph: string }[] = [
  { type: 'dots', label: 'Dots', glyph: '○' },
  { type: 'grid', label: 'Grid', glyph: '⊞' },
  { type: 'stripes', label: 'Stripes', glyph: '▥' },
  { type: 'waves', label: 'Waves', glyph: '∿' },
  { type: 'geometry', label: 'Geometry', glyph: '◇' },
  { type: 'lines', label: 'Lines', glyph: '╱' },
  { type: 'shapes', label: 'Shapes', glyph: '▲' },
  { type: 'noise', label: 'Noise', glyph: '░' },
];

export const PatternStudioPage: React.FC<PatternStudioPageProps> = ({
  onNavigate,
  initialPaletteQuery,
  initialType,
  initialScale,
  initialDensity,
  initialRotation,
}) => {
  const { palettes } = useLibraryData();
  const { showToast } = useToast();

  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [patternType, setPatternType] = useState<PatternType>((initialType as any) || 'grid');
  const [scale, setScale] = useState<number>(initialScale ? parseInt(initialScale) : 45);
  const [density, setDensity] = useState<number>(initialDensity ? parseInt(initialDensity) : 60);
  const [rotation, setRotation] = useState<number>(initialRotation ? parseInt(initialRotation) : 0);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [opacity, setOpacity] = useState<number>(0.9);
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [canvasFit, setCanvasFit] = useState<'contain' | 'cover'>('cover');
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);

  // Active palette colors
  const activePalette = useMemo(() => {
    if (initialPaletteQuery) {
      const hexes = initialPaletteQuery.split('-').map((h) => `#${h}`);
      if (hexes.length >= 2) {
        return hexes;
      }
    }
    const pal = palettes[selectedPaletteIndex] || palettes[0];
    return pal ? pal.colors.map((c) => c.hex) : ['#111215', '#E63946', '#BFA3F0', '#E9C46A'];
  }, [initialPaletteQuery, palettes, selectedPaletteIndex]);

  // Canvas background
  const currentBg = backgroundColor || activePalette[0] || '#F8F8F8';

  // Live SVG code
  const svgCode = useMemo(() => {
    return generatePatternSvg(
      {
        type: patternType,
        palette: activePalette,
        scale,
        density,
        rotation,
        strokeWidth,
        opacity,
        backgroundColor: currentBg,
      },
      900,
      560
    );
  }, [patternType, activePalette, scale, density, rotation, strokeWidth, opacity, currentBg]);

  // CSS snippet code
  const cssCode = useMemo(() => {
    return generatePatternCss({
      type: patternType,
      palette: activePalette,
      scale,
      density,
      rotation,
      strokeWidth,
      opacity,
      backgroundColor: currentBg,
    });
  }, [patternType, activePalette, scale, density, rotation, strokeWidth, opacity, currentBg]);

  // Seed / Hash
  const seedString = useMemo(() => {
    const hash = Math.abs(
      scale * 37 + density * 19 + rotation * 23 + strokeWidth * 11 + patternType.charCodeAt(0) * 41
    ) % 999999;
    return `#${hash.toString().padStart(6, '0')}`;
  }, [patternType, scale, density, rotation, strokeWidth]);

  // Copy CSS Action
  const handleCopyCss = async () => {
    const success = await copyToClipboard(cssCode);
    if (success) {
      setCopiedCss(true);
      showToast('Copied Pattern CSS', 'Ready for stylesheets');
      setTimeout(() => setCopiedCss(false), 2000);
    }
  };

  // Copy Raw SVG Action
  const handleCopySvg = async () => {
    const success = await copyToClipboard(svgCode);
    if (success) {
      setCopiedSvg(true);
      showToast('Copied SVG Code', 'Vector markup on clipboard');
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  // Download Vector SVG File
  const handleDownloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kroma-pattern-${patternType}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded SVG Pattern', 'Scalable vector asset');
  };

  // Download High-Resolution Raster PNG File
  const handleDownloadPng = () => {
    const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const URLObj = window.URL || window.webkitURL || window;
    const blobURL = URLObj.createObjectURL(svgBlob);
    const image = new window.Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 1120;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = currentBg;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URLObj.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `kroma-pattern-${patternType}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URLObj.revokeObjectURL(pngUrl);
            showToast('Downloaded High-Res PNG', '1800 × 1120px raster');
          }
        }, 'image/png');
      }
      URLObj.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  // Randomize ("Surprise me")
  const handleRandomize = () => {
    const types: PatternType[] = ['dots', 'grid', 'stripes', 'waves', 'geometry', 'lines', 'shapes'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomPaletteIdx = Math.floor(Math.random() * Math.min(palettes.length, 30));
    const randomScale = Math.floor(Math.random() * 55) + 25; // 25 to 80
    const randomDensity = Math.floor(Math.random() * 55) + 35; // 35 to 90
    const rotations = [0, 15, 30, 45, 60, 90, -45, -30];
    const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
    const randomStroke = parseFloat((Math.random() * 2.5 + 1.2).toFixed(1));

    setPatternType(randomType);
    setSelectedPaletteIndex(randomPaletteIdx);
    setScale(randomScale);
    setDensity(randomDensity);
    setRotation(randomRotation);
    setStrokeWidth(randomStroke);
    setBackgroundColor('');
    showToast('Synthesized Random Pattern', `${randomType.toUpperCase()} • ${randomScale}px`);
  };

  // Reset to clean baseline
  const handleReset = () => {
    setPatternType('grid');
    setScale(45);
    setDensity(60);
    setRotation(0);
    setStrokeWidth(2);
    setOpacity(0.9);
    setBackgroundColor('');
    showToast('Reset to Baseline Parameters');
  };

  // Apply Preset
  const handleApplyPreset = (preset: typeof CURATED_PATTERNS[0]) => {
    setPatternType(preset.type);
    setScale(preset.scale);
    setDensity(preset.density);
    setRotation(preset.rotation);
    setStrokeWidth(preset.strokeWidth || 2);
    setOpacity(preset.opacity || 0.9);
    setBackgroundColor(preset.palette[0] || '');
    showToast(`Loaded Preset: ${preset.title}`);
  };

  // Dynamic Variations derived from current configuration
  const variations = useMemo(() => {
    return [
      {
        label: 'Inverted',
        config: {
          type: patternType,
          palette: [...activePalette].reverse(),
          scale,
          density,
          rotation,
          strokeWidth,
          opacity,
          backgroundColor: activePalette[activePalette.length - 1] || currentBg,
        },
        apply: () => {
          setBackgroundColor(activePalette[activePalette.length - 1] || '');
        },
      },
      {
        label: '+45° Rotation',
        config: {
          type: patternType,
          palette: activePalette,
          scale,
          density,
          rotation: (rotation + 45) > 180 ? rotation + 45 - 360 : rotation + 45,
          strokeWidth,
          opacity,
          backgroundColor: currentBg,
        },
        apply: () => {
          setRotation((prev) => (prev + 45 > 180 ? prev + 45 - 360 : prev + 45));
        },
      },
      {
        label: 'Dense Micro',
        config: {
          type: patternType,
          palette: activePalette,
          scale: Math.max(18, Math.round(scale * 0.65)),
          density: Math.min(95, density + 25),
          rotation,
          strokeWidth: Math.max(1, strokeWidth * 0.7),
          opacity,
          backgroundColor: currentBg,
        },
        apply: () => {
          setScale((s) => Math.max(18, Math.round(s * 0.65)));
          setDensity((d) => Math.min(95, d + 25));
          setStrokeWidth((sw) => Math.max(1, sw * 0.7));
        },
      },
      {
        label: 'Macro Scale',
        config: {
          type: patternType,
          palette: activePalette,
          scale: Math.min(95, Math.round(scale * 1.5)),
          density: Math.max(25, density - 20),
          rotation,
          strokeWidth: strokeWidth + 1.2,
          opacity,
          backgroundColor: currentBg,
        },
        apply: () => {
          setScale((s) => Math.min(95, Math.round(s * 1.5)));
          setDensity((d) => Math.max(25, d - 20));
          setStrokeWidth((sw) => sw + 1.2);
        },
      },
      {
        label: 'Fine Hairline',
        config: {
          type: patternType,
          palette: activePalette,
          scale,
          density: Math.min(90, density + 15),
          rotation,
          strokeWidth: 1,
          opacity: 0.95,
          backgroundColor: currentBg,
        },
        apply: () => {
          setStrokeWidth(1);
          setDensity((d) => Math.min(90, d + 15));
        },
      },
      {
        label: 'Atmospheric',
        config: {
          type: patternType,
          palette: activePalette,
          scale,
          density: 50,
          rotation,
          strokeWidth,
          opacity: 0.45,
          backgroundColor: currentBg,
        },
        apply: () => {
          setOpacity(0.45);
          setDensity(50);
        },
      },
    ];
  }, [patternType, activePalette, scale, density, rotation, strokeWidth, opacity, currentBg]);

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 pt-8 pb-24 text-[#171717] dark:text-white">
      <SEOHead
        title="Generative Pattern Studio — Vector Surface Generator | KROMA"
        description="Synthesize repeating algorithmic patterns, vector lattices, dot matrices, and textile textures driven by harmonic color systems."
        canonicalPath="/create/pattern"
      />

      {/* ─── 1. Minimal Kroma Breadcrumb ─────────────────────────── */}
      <nav className="flex items-center gap-2 font-sans text-[11.5px] font-medium tracking-[0.04em] uppercase mb-6" aria-label="Breadcrumb">
        <button
          type="button"
          onClick={() => onNavigate({ path: 'home' })}
          className="text-[#707070] dark:text-[#8E8E93] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 font-inherit"
        >
          HOME
        </button>
        <span className="text-[#171717]/25 dark:text-white/25 font-light" aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => onNavigate({ path: 'create' })}
          className="text-[#707070] dark:text-[#8E8E93] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 font-inherit"
        >
          STUDIO
        </button>
        <span className="text-[#171717]/25 dark:text-white/25 font-light" aria-hidden="true">/</span>
        <span className="text-[#171717] dark:text-white font-semibold">PATTERN STUDIO</span>
      </nav>

      {/* ─── 2. Compact Editorial Intro ─────────────────────────── */}
      <header className="mb-10 flex flex-col gap-2">
        <div className="font-mono text-[11px] font-semibold tracking-[0.1em] uppercase text-[#707070] dark:text-[#8E8E93] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-[1px] bg-[#FF9500]" />
          <span>DIGITAL PATTERN LAB • VECTOR SURFACE INSTRUMENT</span>
        </div>
        <h1 className="font-sans text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-[-0.03em] leading-[0.98] text-[#171717] dark:text-white m-0 uppercase">
          CREATE REPEATING WORLDS.
        </h1>
        <p className="font-sans text-[14.5px] text-[#707070] dark:text-[#9A9A9E] mt-1 mb-0 max-w-[500px] leading-[1.45]">
          Build algorithmic visual rhythm from shape, color, density, and spatial repetition.
        </p>
      </header>

      {/* ─── 3. Main Workspace: Live Canvas & Control System ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start mb-20">
        {/* Left/Center: The Pattern Canvas Artboard */}
        <div className="flex flex-col gap-4">
          <div
            className="w-full min-h-[380px] sm:min-h-[520px] bg-[#F8F8F8] dark:bg-[#141518] border border-black/10 dark:border-white/10 rounded overflow-hidden relative flex items-center justify-center shadow-[0_4px_20px_-6px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-6px_rgba(0,0,0,0.35)] transition-colors [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
            style={{ backgroundColor: currentBg }}
            role="region"
            aria-label="Live pattern canvas"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />

          {/* Minimal Canvas Action Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-[#171717] dark:bg-white text-white dark:text-[#171717] border border-[#171717] dark:border-white hover:bg-black dark:hover:bg-[#E5E5E5] rounded-[2px] px-3 py-1.5 font-sans text-xs font-semibold tracking-[0.03em] cursor-pointer transition-all"
                onClick={handleRandomize}
                title="Synthesize surprise pattern parameters"
              >
                <Sparkles size={13} />
                <span>RANDOMIZE</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-transparent border border-black/12 dark:border-white/12 rounded-[2px] px-3 py-1.5 font-sans text-xs font-semibold tracking-[0.03em] text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/[0.28] dark:hover:border-white/[0.28] cursor-pointer transition-all"
                onClick={handleReset}
                title="Reset parameters to baseline defaults"
              >
                <RotateCcw size={12} />
                <span>RESET</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-transparent border border-black/12 dark:border-white/12 rounded-[2px] px-3 py-1.5 font-sans text-xs font-semibold tracking-[0.03em] text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/[0.28] dark:hover:border-white/[0.28] cursor-pointer transition-all"
                onClick={() => setCanvasFit((f) => (f === 'cover' ? 'contain' : 'cover'))}
                title="Toggle canvas view aspect"
              >
                <Maximize2 size={12} />
                <span>{canvasFit === 'cover' ? 'FIT' : 'EXPAND'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-transparent border border-black/12 dark:border-white/12 rounded-[2px] px-3 py-1.5 font-sans text-xs font-semibold tracking-[0.03em] text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/[0.28] dark:hover:border-white/[0.28] cursor-pointer transition-all"
                onClick={handleCopyCss}
                title="Copy ready CSS snippet"
              >
                {copiedCss ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copiedCss ? 'COPIED' : 'COPY CSS'}</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-transparent border border-black/12 dark:border-white/12 rounded-[2px] px-3 py-1.5 font-sans text-xs font-semibold tracking-[0.03em] text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/[0.28] dark:hover:border-white/[0.28] cursor-pointer transition-all"
                onClick={handleDownloadSvg}
                title="Download scalable SVG file"
              >
                <Download size={12} />
                <span>SVG</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-transparent border border-black/12 dark:border-white/12 rounded-[2px] px-3 py-1.5 font-sans text-xs font-semibold tracking-[0.03em] text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/[0.28] dark:hover:border-white/[0.28] cursor-pointer transition-all"
                onClick={handleDownloadPng}
                title="Download high-resolution 1800x1120 PNG"
              >
                <Image size={12} />
                <span>PNG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Compact Creative Instrument Controls */}
        <aside className="flex flex-col gap-7 bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded p-6" aria-label="Pattern controls">
          {/* Instrument 1: Geometry / Shape Picker */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#707070] dark:text-[#8E8E93]">GEOMETRY SHAPE</span>
              <span className="font-mono text-[11px] font-semibold text-[#171717] dark:text-white">{patternType.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setPatternType(opt.type)}
                  className={`flex flex-col items-center justify-center gap-1 border rounded-[2px] py-2 px-1 cursor-pointer transition-all font-mono text-[10px] font-medium uppercase ${
                    patternType === opt.type
                      ? 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] border-[#171717] dark:border-white'
                      : 'bg-transparent border-black/[0.08] dark:border-white/[0.08] text-[#707070] dark:text-[#8E8E93] hover:text-[#171717] dark:hover:text-white hover:border-black/[0.24] dark:hover:border-white/[0.24]'
                  }`}
                  title={`Shape: ${opt.label}`}
                >
                  <span className="text-sm leading-none">{opt.glyph}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Instrument 2: Scale / Tile Size */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#707070] dark:text-[#8E8E93]">SCALE / TILE</span>
              <span className="font-mono text-[11px] font-semibold text-[#171717] dark:text-white">{scale}PX</span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
              className="w-full h-1 rounded bg-black/12 dark:bg-white/15 outline-none cursor-pointer accent-[#171717] dark:accent-white"
              aria-label="Scale / Tile Size"
            />
          </div>

          {/* Instrument 3: Density / Spacing */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#707070] dark:text-[#8E8E93]">DENSITY / RHYTHM</span>
              <span className="font-mono text-[11px] font-semibold text-[#171717] dark:text-white">{density}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={density}
              onChange={(e) => setDensity(parseInt(e.target.value))}
              className="w-full h-1 rounded bg-black/12 dark:bg-white/15 outline-none cursor-pointer accent-[#171717] dark:accent-white"
              aria-label="Density / Spacing"
            />
          </div>

          {/* Instrument 4: Rotation Angle */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#707070] dark:text-[#8E8E93]">ROTATION ANGLE</span>
              <span className="font-mono text-[11px] font-semibold text-[#171717] dark:text-white">{rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-1 rounded bg-black/12 dark:bg-white/15 outline-none cursor-pointer accent-[#171717] dark:accent-white"
              aria-label="Rotation Angle"
            />
          </div>

          {/* Instrument 5: Stroke Weight */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#707070] dark:text-[#8E8E93]">STROKE WEIGHT</span>
              <span className="font-mono text-[11px] font-semibold text-[#171717] dark:text-white">{strokeWidth}PX</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
              className="w-full h-1 rounded bg-black/12 dark:bg-white/15 outline-none cursor-pointer accent-[#171717] dark:accent-white"
              aria-label="Stroke Weight"
            />
          </div>

          {/* Instrument 6: Opacity */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#707070] dark:text-[#8E8E93]">OPACITY</span>
              <span className="font-mono text-[11px] font-semibold text-[#171717] dark:text-white">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full h-1 rounded bg-black/12 dark:bg-white/15 outline-none cursor-pointer accent-[#171717] dark:accent-white"
              aria-label="Opacity"
            />
          </div>

          {/* Instrument 7: Visual Color System & Palette Assignment */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#707070] dark:text-[#8E8E93]">ASSIGNED PALETTE</span>
              <button
                type="button"
                className="text-[11px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase transition-colors"
                onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
              >
                {showPaletteDrawer ? 'HIDE' : 'CHANGE'}
              </button>
            </div>

            {/* Visual Palette Strip Preview */}
            <div
              className="flex w-full h-8 rounded-[2px] overflow-hidden border border-black/[0.08] dark:border-white/[0.08] cursor-pointer hover:scale-[1.01] transition-transform"
              onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
              title="Click to toggle palette selection"
            >
              {activePalette.map((hex, i) => (
                <span key={i} className="flex-1 h-full" style={{ backgroundColor: hex }} />
              ))}
            </div>

            {/* Palette Drawer list when opened */}
            {showPaletteDrawer && (
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                {palettes.slice(0, 24).map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`flex items-center justify-between gap-2 border border-transparent rounded-[2px] px-1.5 py-1 cursor-pointer font-sans text-[11.5px] text-left transition-all ${
                      selectedPaletteIndex === idx
                        ? 'bg-black/[0.06] dark:bg-white/10 font-semibold text-[#171717] dark:text-white'
                        : 'bg-transparent text-[#171717] dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                    }`}
                    onClick={() => {
                      setSelectedPaletteIndex(idx);
                      setShowPaletteDrawer(false);
                      showToast(`Assigned Palette: ${p.title}`);
                    }}
                  >
                    <span className="truncate">{p.title}</span>
                    <div className="flex w-14 h-3.5 rounded-[1px] overflow-hidden shrink-0">
                      {p.colors.map((c, ci) => (
                        <span key={ci} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Instrument 8: Canvas Background Color */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#707070] dark:text-[#8E8E93]">BACKGROUND TONE</span>
              <span className="font-mono text-[11px] font-semibold text-[#171717] dark:text-white">{currentBg.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {['#F8F8F8', '#141518', '#000000', ...activePalette.slice(0, 4)].map((hex, bi) => (
                <button
                  key={bi}
                  type="button"
                  className={`w-6 h-6 rounded-[2px] border border-black/15 dark:border-white/15 cursor-pointer transition-transform hover:scale-110 ${
                    currentBg.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-[#171717] dark:ring-white ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                  onClick={() => setBackgroundColor(hex)}
                  title={`Background: ${hex}`}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ─── 4. Pattern Presets ("START WITH A FORM") ────────────── */}
      <section className="mb-20">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-[-0.015em] uppercase text-[#171717] dark:text-white m-0">PATTERN PRESETS</h2>
            <p className="font-sans text-[13px] text-[#707070] dark:text-[#8E8E93] m-0 mt-1">
              Curated starting forms inspired by architectural lattices, modernist halftones, and topographical contours.
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-400 uppercase">
            {CURATED_PATTERNS.slice(0, 8).length} PRESETS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CURATED_PATTERNS.slice(0, 8).map((preset) => {
            const thumbSvg = generatePatternSvg(
              {
                type: preset.type,
                palette: preset.palette,
                scale: preset.scale,
                density: preset.density,
                rotation: preset.rotation,
                strokeWidth: preset.strokeWidth,
                opacity: preset.opacity,
                backgroundColor: preset.palette[0] || '#111215',
              },
              320,
              150
            );

            return (
              <div
                key={preset.id}
                className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded overflow-hidden cursor-pointer flex flex-col transition-all duration-200 ease-out hover:-translate-y-1 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.4)]"
                onClick={() => handleApplyPreset(preset)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyPreset(preset);
                }}
              >
                <div
                  className="w-full h-[150px] overflow-hidden bg-[#111215] [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                  dangerouslySetInnerHTML={{ __html: thumbSvg }}
                />
                <div className="p-3.5 sm:px-4 flex items-center justify-between gap-2">
                  <span className="font-sans text-[13.5px] font-semibold text-[#171717] dark:text-white truncate">{preset.title}</span>
                  <span className="font-mono text-[10.5px] text-[#707070] uppercase shrink-0">{preset.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 5. Pattern Variations ────────────────────────────────── */}
      <section className="mb-20">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-[-0.015em] uppercase text-[#171717] dark:text-white m-0">VARIATIONS</h2>
            <p className="font-sans text-[13px] text-[#707070] dark:text-[#8E8E93] m-0 mt-1">
              Algorithmic mutations derived in real time from your current active parameters.
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-400 uppercase">
            LIVE DERIVATIONS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {variations.map((v, vi) => {
            const varSvg = generatePatternSvg(v.config, 200, 110);
            return (
              <div
                key={vi}
                className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded overflow-hidden cursor-pointer flex flex-col transition-all duration-150 hover:-translate-y-0.5 hover:border-black/[0.24] dark:hover:border-white/[0.24]"
                onClick={() => {
                  v.apply();
                  showToast(`Applied Mutation: ${v.label}`);
                }}
                role="button"
                tabIndex={0}
                title={`Click to apply ${v.label}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') v.apply();
                }}
              >
                <div
                  className="w-full h-[110px] overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                  dangerouslySetInnerHTML={{ __html: varSvg }}
                />
                <div className="p-2 sm:px-2.5 font-mono text-[10.5px] font-semibold text-[#707070] dark:text-[#8E8E93] text-center uppercase">{v.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 6. Pattern Details & Export Summary ──────────────────── */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-[-0.015em] uppercase text-[#171717] dark:text-white m-0">PATTERN DETAILS &amp; CODE</h2>
            <p className="font-sans text-[13px] text-[#707070] dark:text-[#8E8E93] m-0 mt-1">
              Precision parameters, mathematical reproduction seed, and production-ready CSS snippet.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full max-w-full min-w-0 box-border">
          {/* Left: Metadata & Specs Table */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded p-4 sm:p-5 lg:p-6 flex flex-col gap-4 w-full max-w-full min-w-0 box-border">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06] min-w-0 gap-2">
              <span className="font-mono text-xs text-neutral-500 uppercase">Pattern Type</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white uppercase">
                {patternType}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06] min-w-0 gap-2">
              <span className="font-mono text-xs text-neutral-500 uppercase">Tile Size</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {scale}px ({Math.round(scale * 1.5)}px unit)
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06] min-w-0 gap-2">
              <span className="font-mono text-xs text-neutral-500 uppercase">Density Spacing</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {density}%
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06] min-w-0 gap-2">
              <span className="font-mono text-xs text-neutral-500 uppercase">Rotation Angle</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {rotation}°
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06] min-w-0 gap-2">
              <span className="font-mono text-xs text-neutral-500 uppercase">Stroke Weight</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {strokeWidth}px
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06] min-w-0 gap-2">
              <span className="font-mono text-xs text-neutral-500 uppercase">Reproduction Seed</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {seedString}
              </span>
            </div>
          </div>

          {/* Right: CSS Code Snippet & Direct Actions */}
          <div className="bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded p-4 sm:p-5 lg:p-6 flex flex-col gap-4 w-full max-w-full min-w-0 box-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 w-full max-w-full min-w-0 box-border">
              <span className="font-mono text-xs text-[#707070] dark:text-[#8E8E93] uppercase tracking-[0.04em] min-w-0 break-words">CSS Surface Declaration</span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-transparent border border-black/12 dark:border-white/12 rounded-[2px] px-2.5 py-1 font-sans text-xs font-semibold tracking-[0.03em] text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/[0.28] dark:hover:border-white/[0.28] cursor-pointer transition-all shrink-0"
                onClick={handleCopyCss}
              >
                {copiedCss ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                <span>{copiedCss ? 'COPIED' : 'COPY CSS'}</span>
              </button>
            </div>

            <pre className="font-mono text-[11.5px] bg-black/[0.03] dark:bg-white/[0.04] p-3 rounded-[2px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[#171717] dark:text-[#E0E0E0] max-h-[140px] w-full max-w-full min-w-0 box-border">
              <code className="block w-full max-w-full min-w-0 whitespace-inherit break-words [overflow-wrap:anywhere]">{cssCode}</code>
            </pre>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2 w-full max-w-full min-w-0 box-border [&>button]:min-w-0 [&>button]:box-border [&>button_span]:overflow-hidden [&>button_span]:text-ellipsis [&>button_span]:whitespace-nowrap">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 bg-[#171717] dark:bg-white text-white dark:text-[#171717] border border-[#171717] dark:border-white hover:bg-black dark:hover:bg-[#E5E5E5] rounded-[2px] px-3 py-2 font-sans text-xs font-semibold tracking-[0.03em] cursor-pointer transition-all flex-1"
                onClick={handleDownloadSvg}
              >
                <Download size={13} />
                <span>DOWNLOAD SVG VECTOR</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 bg-transparent border border-black/12 dark:border-white/12 rounded-[2px] px-3 py-2 font-sans text-xs font-semibold tracking-[0.03em] text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] hover:border-black/[0.28] dark:hover:border-white/[0.28] cursor-pointer transition-all flex-1"
                onClick={handleDownloadPng}
              >
                <Image size={13} />
                <span>DOWNLOAD 1800PX PNG</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
