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
    <div className="pattern-studio">
      <SEOHead
        title="Generative Pattern Studio — Vector Surface Generator | KROMA"
        description="Synthesize repeating algorithmic patterns, vector lattices, dot matrices, and textile textures driven by harmonic color systems."
        canonicalPath="/create/pattern"
      />

      {/* ─── 1. Minimal Kroma Breadcrumb ─────────────────────────── */}
      <nav className="pattern-breadcrumb" aria-label="Breadcrumb">
        <button
          type="button"
          onClick={() => onNavigate({ path: 'home' })}
          className="pattern-breadcrumb__link"
        >
          HOME
        </button>
        <span className="pattern-breadcrumb__separator" aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => onNavigate({ path: 'create' })}
          className="pattern-breadcrumb__link"
        >
          STUDIO
        </button>
        <span className="pattern-breadcrumb__separator" aria-hidden="true">/</span>
        <span className="pattern-breadcrumb__current">PATTERN STUDIO</span>
      </nav>

      {/* ─── 2. Compact Editorial Intro ─────────────────────────── */}
      <header className="pattern-intro">
        <div className="pattern-intro__eyebrow">
          <span className="pattern-intro__eyebrow-dot" />
          <span>DIGITAL PATTERN LAB • VECTOR SURFACE INSTRUMENT</span>
        </div>
        <h1 className="pattern-intro__title">
          CREATE REPEATING WORLDS.
        </h1>
        <p className="pattern-intro__lead">
          Build algorithmic visual rhythm from shape, color, density, and spatial repetition.
        </p>
      </header>

      {/* ─── 3. Main Workspace: Live Canvas & Control System ────── */}
      <div className="pattern-workspace">
        {/* Left/Center: The Pattern Canvas Artboard */}
        <div className="pattern-canvas-col">
          <div
            className="pattern-canvas-frame"
            style={{ backgroundColor: currentBg }}
            role="region"
            aria-label="Live pattern canvas"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />

          {/* Minimal Canvas Action Toolbar */}
          <div className="pattern-canvas-toolbar">
            <div className="pattern-toolbar-group">
              <button
                type="button"
                className="pattern-toolbar-btn pattern-toolbar-btn--accent"
                onClick={handleRandomize}
                title="Synthesize surprise pattern parameters"
              >
                <Sparkles size={13} />
                <span>RANDOMIZE</span>
              </button>

              <button
                type="button"
                className="pattern-toolbar-btn"
                onClick={handleReset}
                title="Reset parameters to baseline defaults"
              >
                <RotateCcw size={12} />
                <span>RESET</span>
              </button>

              <button
                type="button"
                className="pattern-toolbar-btn"
                onClick={() => setCanvasFit((f) => (f === 'cover' ? 'contain' : 'cover'))}
                title="Toggle canvas view aspect"
              >
                <Maximize2 size={12} />
                <span>{canvasFit === 'cover' ? 'FIT' : 'EXPAND'}</span>
              </button>
            </div>

            <div className="pattern-toolbar-group">
              <button
                type="button"
                className="pattern-toolbar-btn"
                onClick={handleCopyCss}
                title="Copy ready CSS snippet"
              >
                {copiedCss ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copiedCss ? 'COPIED' : 'COPY CSS'}</span>
              </button>

              <button
                type="button"
                className="pattern-toolbar-btn"
                onClick={handleDownloadSvg}
                title="Download scalable SVG file"
              >
                <Download size={12} />
                <span>SVG</span>
              </button>

              <button
                type="button"
                className="pattern-toolbar-btn"
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
        <aside className="pattern-instruments-col" aria-label="Pattern controls">
          {/* Instrument 1: Geometry / Shape Picker */}
          <div className="pattern-instrument-group">
            <div className="pattern-instrument-header">
              <span className="pattern-instrument-label">GEOMETRY SHAPE</span>
              <span className="pattern-instrument-value">{patternType.toUpperCase()}</span>
            </div>
            <div className="pattern-shape-grid">
              {SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setPatternType(opt.type)}
                  className={`pattern-shape-btn ${
                    patternType === opt.type ? 'pattern-shape-btn--active' : ''
                  }`}
                  title={`Shape: ${opt.label}`}
                >
                  <span className="pattern-shape-icon">{opt.glyph}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Instrument 2: Scale / Tile Size */}
          <div className="pattern-instrument-group">
            <div className="pattern-instrument-header">
              <span className="pattern-instrument-label">SCALE / TILE</span>
              <span className="pattern-instrument-value">{scale}PX</span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
              className="pattern-slider"
              aria-label="Scale / Tile Size"
            />
          </div>

          {/* Instrument 3: Density / Spacing */}
          <div className="pattern-instrument-group">
            <div className="pattern-instrument-header">
              <span className="pattern-instrument-label">DENSITY / RHYTHM</span>
              <span className="pattern-instrument-value">{density}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={density}
              onChange={(e) => setDensity(parseInt(e.target.value))}
              className="pattern-slider"
              aria-label="Density / Spacing"
            />
          </div>

          {/* Instrument 4: Rotation Angle */}
          <div className="pattern-instrument-group">
            <div className="pattern-instrument-header">
              <span className="pattern-instrument-label">ROTATION ANGLE</span>
              <span className="pattern-instrument-value">{rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="pattern-slider"
              aria-label="Rotation Angle"
            />
          </div>

          {/* Instrument 5: Stroke Weight */}
          <div className="pattern-instrument-group">
            <div className="pattern-instrument-header">
              <span className="pattern-instrument-label">STROKE WEIGHT</span>
              <span className="pattern-instrument-value">{strokeWidth}PX</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
              className="pattern-slider"
              aria-label="Stroke Weight"
            />
          </div>

          {/* Instrument 6: Opacity */}
          <div className="pattern-instrument-group">
            <div className="pattern-instrument-header">
              <span className="pattern-instrument-label">OPACITY</span>
              <span className="pattern-instrument-value">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="pattern-slider"
              aria-label="Opacity"
            />
          </div>

          {/* Instrument 7: Visual Color System & Palette Assignment */}
          <div className="pattern-instrument-group">
            <div className="pattern-instrument-header">
              <span className="pattern-instrument-label">ASSIGNED PALETTE</span>
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
              className="pattern-palette-bar"
              onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
              title="Click to toggle palette selection"
            >
              {activePalette.map((hex, i) => (
                <span key={i} style={{ backgroundColor: hex }} />
              ))}
            </div>

            {/* Palette Drawer list when opened */}
            {showPaletteDrawer && (
              <div className="pattern-palette-quicklist">
                {palettes.slice(0, 24).map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`pattern-palette-option ${
                      selectedPaletteIndex === idx ? 'pattern-palette-option--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedPaletteIndex(idx);
                      setShowPaletteDrawer(false);
                      showToast(`Assigned Palette: ${p.title}`);
                    }}
                  >
                    <span className="truncate">{p.title}</span>
                    <div className="pattern-mini-swatches">
                      {p.colors.map((c, ci) => (
                        <span key={ci} style={{ backgroundColor: c.hex }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Instrument 8: Canvas Background Color */}
          <div className="pattern-instrument-group">
            <div className="pattern-instrument-header">
              <span className="pattern-instrument-label">BACKGROUND TONE</span>
              <span className="pattern-instrument-value">{currentBg.toUpperCase()}</span>
            </div>
            <div className="pattern-bg-swatches">
              {['#F8F8F8', '#141518', '#000000', ...activePalette.slice(0, 4)].map((hex, bi) => (
                <button
                  key={bi}
                  type="button"
                  className={`pattern-bg-swatch ${
                    currentBg.toLowerCase() === hex.toLowerCase() ? 'pattern-bg-swatch--active' : ''
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
      <section className="pattern-section">
        <div className="pattern-section__header">
          <div>
            <h2 className="pattern-section__title">PATTERN PRESETS</h2>
            <p className="pattern-section__desc">
              Curated starting forms inspired by architectural lattices, modernist halftones, and topographical contours.
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-400 uppercase">
            {CURATED_PATTERNS.slice(0, 8).length} PRESETS
          </span>
        </div>

        <div className="pattern-presets-grid">
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
                className="pattern-preset-card"
                onClick={() => handleApplyPreset(preset)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyPreset(preset);
                }}
              >
                <div
                  className="pattern-preset-thumb"
                  dangerouslySetInnerHTML={{ __html: thumbSvg }}
                />
                <div className="pattern-preset-info">
                  <span className="pattern-preset-title">{preset.title}</span>
                  <span className="pattern-preset-tag">{preset.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 5. Pattern Variations ────────────────────────────────── */}
      <section className="pattern-section">
        <div className="pattern-section__header">
          <div>
            <h2 className="pattern-section__title">VARIATIONS</h2>
            <p className="pattern-section__desc">
              Algorithmic mutations derived in real time from your current active parameters.
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-400 uppercase">
            LIVE DERIVATIONS
          </span>
        </div>

        <div className="pattern-variations-grid">
          {variations.map((v, vi) => {
            const varSvg = generatePatternSvg(v.config, 200, 110);
            return (
              <div
                key={vi}
                className="pattern-variation-card"
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
                  className="pattern-variation-thumb"
                  dangerouslySetInnerHTML={{ __html: varSvg }}
                />
                <div className="pattern-variation-label">{v.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 6. Pattern Details & Export Summary ──────────────────── */}
      <section className="pattern-section">
        <div className="pattern-section__header">
          <div>
            <h2 className="pattern-section__title">PATTERN DETAILS &amp; CODE</h2>
            <p className="pattern-section__desc">
              Precision parameters, mathematical reproduction seed, and production-ready CSS snippet.
            </p>
          </div>
        </div>

        <div className="pattern-footer-grid">
          {/* Left: Metadata & Specs Table */}
          <div className="pattern-detail-box">
            <div className="pattern-detail-row">
              <span className="font-mono text-xs text-neutral-500 uppercase">Pattern Type</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white uppercase">
                {patternType}
              </span>
            </div>
            <div className="pattern-detail-row">
              <span className="font-mono text-xs text-neutral-500 uppercase">Tile Size</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {scale}px ({Math.round(scale * 1.5)}px unit)
              </span>
            </div>
            <div className="pattern-detail-row">
              <span className="font-mono text-xs text-neutral-500 uppercase">Density Spacing</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {density}%
              </span>
            </div>
            <div className="pattern-detail-row">
              <span className="font-mono text-xs text-neutral-500 uppercase">Rotation Angle</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {rotation}°
              </span>
            </div>
            <div className="pattern-detail-row">
              <span className="font-mono text-xs text-neutral-500 uppercase">Stroke Weight</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {strokeWidth}px
              </span>
            </div>
            <div className="pattern-detail-row">
              <span className="font-mono text-xs text-neutral-500 uppercase">Reproduction Seed</span>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {seedString}
              </span>
            </div>
          </div>

          {/* Right: CSS Code Snippet & Direct Actions */}
          <div className="pattern-detail-box">
            <div className="pattern-declaration-header">
              <span className="pattern-declaration-title">CSS Surface Declaration</span>
              <button
                type="button"
                className="pattern-toolbar-btn text-xs py-1 shrink-0"
                onClick={handleCopyCss}
              >
                {copiedCss ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                <span>{copiedCss ? 'COPIED' : 'COPY CSS'}</span>
              </button>
            </div>

            <pre className="pattern-code-snippet">
              <code>{cssCode}</code>
            </pre>

            <div className="pattern-declaration-actions">
              <button
                type="button"
                className="pattern-toolbar-btn pattern-toolbar-btn--accent flex-1 justify-center py-2"
                onClick={handleDownloadSvg}
              >
                <Download size={13} />
                <span>DOWNLOAD SVG VECTOR</span>
              </button>

              <button
                type="button"
                className="pattern-toolbar-btn flex-1 justify-center py-2"
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
