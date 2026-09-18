import React, { useState, useMemo } from 'react';
import { Download, Copy, RefreshCw, Sparkles, Check, Sliders } from 'lucide-react';
import { RouteType, PatternType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useToast } from '../context/ToastContext';
import { generatePatternSvg, generatePatternCss } from '../utils/patternEngine';
import { copyToClipboard } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface PatternStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialPaletteQuery?: string;
  initialType?: string;
  initialScale?: string;
  initialDensity?: string;
  initialRotation?: string;
}

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
  const [copiedCss, setCopiedCss] = useState(false);

  // Active palette
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

  const svgCode = useMemo(() => {
    return generatePatternSvg({
      type: patternType,
      palette: activePalette,
      scale,
      density,
      rotation,
      strokeWidth,
      opacity,
    }, 800, 500);
  }, [patternType, activePalette, scale, density, rotation, strokeWidth, opacity]);

  const cssCode = useMemo(() => {
    return generatePatternCss({
      type: patternType,
      palette: activePalette,
      scale,
      density,
      rotation,
      strokeWidth,
      opacity,
    });
  }, [patternType, activePalette, scale, density, rotation, strokeWidth, opacity]);

  const handleCopyCss = async () => {
    const success = await copyToClipboard(cssCode);
    if (success) {
      setCopiedCss(true);
      showToast('Copied Pattern CSS');
      setTimeout(() => setCopiedCss(false), 2000);
    }
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `palette-pattern-${patternType}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded SVG Pattern');
  };

  return (
    <div className="detail-container w-full max-w-7xl mx-auto flex flex-col gap-8">
      <SEOHead
        title="Generative Pattern Studio — Vector Surface Generator"
        description="Design seamless SVG patterns, dot matrices, geometric lattices, and textures from your favorite color systems."
        canonicalPath="/create/pattern"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Patterns', to: { path: 'patterns' } },
          { label: 'Pattern Studio', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sliders size={16} className="text-[var(--color-primary)]" />
            <span className="page-category-label">GENERATIVE VECTOR STUDIO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Pattern Studio
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Synthesize algorithmic surface patterns, geometric lattices, and vector textures driven by palette tokens.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyCss}
            className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            {copiedCss ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedCss ? 'Copied CSS' : 'Copy CSS'}</span>
          </button>
          <button
            onClick={handleDownloadSvg}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Download SVG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Panel */}
        <div className="lg:col-span-4 p-5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col gap-5 shadow-sm">
          {/* Pattern Type Picker */}
          <div>
            <label className="text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase block mb-2">
              Pattern Geometry Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['dots', 'grid', 'stripes', 'waves', 'geometry', 'lines', 'shapes', 'noise'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPatternType(t)}
                  className={`filter-pill text-xs py-1.5 text-center ${patternType === t ? 'active' : ''}`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Palette Selector */}
          <div>
            <label className="text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase block mb-2">
              Assigned Palette
            </label>
            <select
              value={selectedPaletteIndex}
              onChange={(e) => setSelectedPaletteIndex(parseInt(e.target.value))}
              className="w-full text-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xs px-3 py-2"
            >
              {palettes.slice(0, 20).map((p, idx) => (
                <option key={p.id} value={idx}>
                  {p.title} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-4 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Scale / Tile Size</span>
                <span className="font-bold text-[var(--text-primary)]">{scale}px</span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                value={scale}
                onChange={(e) => setScale(parseInt(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Density / Spacing</span>
                <span className="font-bold text-[var(--text-primary)]">{density}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={density}
                onChange={(e) => setDensity(parseInt(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Angle Rotation</span>
                <span className="font-bold text-[var(--text-primary)]">{rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Stroke Weight</span>
                <span className="font-bold text-[var(--text-primary)]">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Live Vector Stage & Preview */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div
            className="w-full h-96 sm:h-[480px] rounded-md overflow-hidden border border-[var(--border-subtle)] shadow-2xl"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />

          <div className="p-4 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md">
            <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase block mb-1">
              CSS Background Snippet
            </span>
            <pre className="text-xs font-mono text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap">
              <code>{cssCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
