import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RouteType } from '../types';
import {
  MeshGradientConfig,
  MeshPoint,
  DEFAULT_MESH_CONFIG,
  MESH_PRESETS,
  serializeMeshConfig,
  deserializeMeshConfig,
  generateRandomMesh,
  generateGridMesh,
  generateMeshAgentPrompt,
  generateMeshCss,
  generateMeshSvg,
  generateMeshTokensJson,
  hslToHex,
  isValidHex,
} from '../utils/meshEngine';
import { MeshHeroCanvas } from '../components/mesh/MeshHeroCanvas';
import { SEOHead } from '../components/seo/SEOHead';
import {
  Sparkles,
  RotateCcw,
  RotateCw,
  Bookmark,
  Share2,
  Code,
  Copy,
  Download,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Layers,
  Sliders,
  Maximize2,
  FileJson,
  Cpu,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import { findClosestColorName } from '../utils/paletteGenerator';
import {
  hexToRgb,
  hexToHsl,
  hexToOklch,
  copyToClipboard,
  getLuminance,
  getContrastRatio,
  getTextColorForBackground,
} from '../utils/colorUtils';
import { generateWebApplicationSchema } from '../utils/schemaGenerator';

interface MeshGradientStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialParams?: Record<string, string | undefined>;
}

export const MeshGradientStudioPage: React.FC<MeshGradientStudioPageProps> = ({
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved } = useSaved();
  const { addGradient } = useLibraryData();

  // Mesh Configuration State
  const [config, setConfig] = useState<MeshGradientConfig>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return deserializeMeshConfig(searchParams);
  });

  const [history, setHistory] = useState<MeshGradientConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(() => {
    return config.points[0]?.id || null;
  });

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showGridLines, setShowGridLines] = useState(false);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCodeFormat, setCopiedCodeFormat] = useState<string | null>(null);
  const [copiedSpecimenHex, setCopiedSpecimenHex] = useState<string | null>(null);
  const [activeExportTab, setActiveExportTab] = useState<'css' | 'svg' | 'dtcg' | 'agent'>('css');

  // Sync state to URL search parameters
  useEffect(() => {
    const qs = serializeMeshConfig(config);
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    if (window.location.search !== (qs ? `?${qs}` : '')) {
      window.history.replaceState({}, '', newUrl);
    }
  }, [config]);

  const sourceUrl = useMemo(() => {
    const qs = serializeMeshConfig(config);
    return `https://kroma.design/mesh${qs ? `?${qs}` : ''}`;
  }, [config]);

  // History tracking for undo / redo
  const pushState = useCallback((newConfig: MeshGradientConfig) => {
    setConfig(newConfig);
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newConfig].slice(-30);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setConfig(history[prevIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setConfig(history[nextIndex]);
    }
  }, [historyIndex, history]);

  const handleConfigChange = useCallback((patch: Partial<MeshGradientConfig>) => {
    const updated = { ...config, ...patch, preset: null };
    pushState(updated);
  }, [config, pushState]);

  const handleUpdatePoint = useCallback((id: string, patch: Partial<MeshPoint>) => {
    const updatedPoints = config.points.map((p) => (p.id === id ? { ...p, ...patch } : p));
    const updated = { ...config, points: updatedPoints, preset: null };
    setConfig(updated);
  }, [config]);

  const handleRandomizePointColor = useCallback((id: string) => {
    const randomHue = Math.floor(Math.random() * 360);
    const randomHex = hslToHex(randomHue, 80, 50);
    handleUpdatePoint(id, { color: randomHex });
    showToast('Calibrated node color', randomHex);
  }, [handleUpdatePoint, showToast]);

  const handleAddPoint = useCallback((x = 50, y = 50) => {
    const randomHue = Math.floor(Math.random() * 360);
    const randomHex = hslToHex(randomHue, 80, 55);
    const newPoint: MeshPoint = {
      id: `pt-${Date.now()}`,
      x,
      y,
      color: randomHex,
      influence: 1.1,
    };
    const updated = {
      ...config,
      points: [...config.points, newPoint],
      preset: null,
    };
    pushState(updated);
    setSelectedPointId(newPoint.id);
    showToast('Added color node to mesh', randomHex);
  }, [config, pushState, showToast]);

  const handleDeletePoint = useCallback((id: string) => {
    if (config.points.length <= 2) {
      showToast('Mesh requires at least 2 nodes');
      return;
    }
    const remaining = config.points.filter((p) => p.id !== id);
    const updated = { ...config, points: remaining, preset: null };
    pushState(updated);
    if (selectedPointId === id) {
      setSelectedPointId(remaining[0]?.id || null);
    }
    showToast('Removed node from mesh');
  }, [config, pushState, selectedPointId, showToast]);

  const handleRandomize = useCallback(() => {
    setIsGenerating(true);
    const newSeed = Math.floor(Math.random() * 90000) + 10000;
    const count = Math.max(4, Math.min(8, config.points.length));
    const newPoints = generateRandomMesh(newSeed, count);
    const updated: MeshGradientConfig = {
      ...config,
      seed: newSeed,
      points: newPoints,
      preset: null,
    };
    setTimeout(() => {
      pushState(updated);
      if (newPoints.length > 0) {
        setSelectedPointId(newPoints[0].id);
      }
      setIsGenerating(false);
      showToast('Generated fresh harmonic mesh', `Seed #${newSeed}`);
    }, 150);
  }, [config, pushState, showToast]);

  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = MESH_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const updated: MeshGradientConfig = {
        ...config,
        ...preset.config,
        preset: presetId,
      };
      pushState(updated);
      if (updated.points && updated.points.length > 0) {
        setSelectedPointId(updated.points[0].id);
      }
      showToast(`Loaded ${preset.name} preset`);
    }
  }, [config, pushState, showToast]);

  const handleGenerateGrid = useCallback((rows: number, cols: number) => {
    const newPoints = generateGridMesh(rows, cols, config.seed);
    const updated: MeshGradientConfig = {
      ...config,
      rows,
      columns: cols,
      points: newPoints,
      preset: null,
    };
    pushState(updated);
    if (newPoints.length > 0) {
      setSelectedPointId(newPoints[0].id);
    }
    showToast(`Applied ${rows}×${cols} lattice grid`);
  }, [config, pushState, showToast]);

  // Saving Gradient
  const handleSaveGradient = () => {
    const title = config.preset
      ? MESH_PRESETS.find((p) => p.id === config.preset)?.name || 'Custom Mesh'
      : `Mesh Specimen #${config.seed}`;
    const slug = `mesh-${config.seed}`;
    const css = generateMeshCss(config);

    saveItem({
      id: slug,
      type: 'gradient',
      title,
      slug,
      preview: css,
      metadata: `${config.points.length} Nodes • Seed #${config.seed}`,
    });

    addGradient({
      id: slug,
      slug,
      title,
      type: 'mesh',
      stops: config.points.map((pt, i) => ({
        color: pt.color,
        position: i / Math.max(1, config.points.length - 1),
        name: findClosestColorName(pt.color),
      })),
      css,
      category: 'Mesh Studio',
      tags: ['mesh', 'generative', 'studio'],
      likes: 0,
    });

    showToast('Saved mesh gradient to studio collection', title);
  };

  const currentSlug = `mesh-${config.seed}`;
  const isCurrentSaved = isSaved(currentSlug);

  const handleShareUrl = useCallback(async () => {
    await copyToClipboard(window.location.href);
    setHasCopiedShare(true);
    showToast('Copied shareable studio link');
    setTimeout(() => setHasCopiedShare(false), 2000);
  }, [showToast]);

  // Code Export Strings
  const exportCodes = useMemo(() => {
    return {
      css: generateMeshCss(config),
      svg: generateMeshSvg(config, 1200, 800),
      dtcg: generateMeshTokensJson(config, sourceUrl),
      agent: generateMeshAgentPrompt(config, sourceUrl),
    };
  }, [config, sourceUrl]);

  const handleCopyExport = async (format: 'css' | 'svg' | 'dtcg' | 'agent') => {
    const code = exportCodes[format];
    await copyToClipboard(code);
    setCopiedCodeFormat(format);
    showToast(`Copied ${format.toUpperCase()} declaration to clipboard`);
    setTimeout(() => setCopiedCodeFormat(null), 1500);
  };

  const handleDownloadSvgFile = () => {
    const svg = exportCodes.svg;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kroma-mesh-${config.seed}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded SVG vector specimen');
  };

  // Selected Node Calculations
  const selectedPoint = useMemo(() => {
    return config.points.find((p) => p.id === selectedPointId) || null;
  }, [config.points, selectedPointId]);

  const selectedPointIndex = useMemo(() => {
    return config.points.findIndex((p) => p.id === (selectedPoint?.id || config.points[0]?.id));
  }, [config.points, selectedPoint]);

  const activeSpecimen = selectedPoint || config.points[0] || { id: 'p1', x: 50, y: 50, color: '#7000FF', influence: 1.0 };
  const specimenName = findClosestColorName(activeSpecimen.color);
  const specimenRgb = hexToRgb(activeSpecimen.color);
  const specimenHsl = hexToHsl(activeSpecimen.color);
  const specimenOklch = hexToOklch(activeSpecimen.color);
  const specimenLum = specimenRgb ? getLuminance(specimenRgb.r, specimenRgb.g, specimenRgb.b).toFixed(3) : '—';
  const contrastWhite = getContrastRatio(activeSpecimen.color, '#FFFFFF');
  const contrastBlack = getContrastRatio(activeSpecimen.color, '#090A0C');
  const bestTextColor = getTextColorForBackground(activeSpecimen.color);
  const wcagRating = contrastWhite >= 7.0 || contrastBlack >= 7.0
    ? 'AAA READY (7.0+)'
    : contrastWhite >= 4.5 || contrastBlack >= 4.5
    ? 'AA READY (4.5+)'
    : 'NEEDS ADJUSTMENT';

  const webAppSchema = generateWebApplicationSchema({
    name: 'KROMA Mesh Gradient Studio',
    applicationCategory: 'DesignApplication',
    url: '/mesh',
    description: 'Art-directed 2D generative mesh gradient laboratory with interactive chromatic nodes, atmospheric blending, and production token export.',
  });

  const activeMeshCss = useMemo(() => generateMeshCss(config), [config]);

  return (
    <div className="mesh-studio-page">
      <SEOHead
        title="Mesh Gradient Studio — Digital Color Laboratory | KROMA"
        description="Atmospheric multi-radial generative color laboratory. Interactive color nodes, perceptual transitions, and precision token exports."
        canonicalPath="/mesh"
        jsonLd={webAppSchema}
      />

      {/* ── 1. Minimal Editorial Breadcrumb ─────────────────────── */}
      <nav aria-label="Breadcrumb" className="mesh-breadcrumb">
        <button
          onClick={() => onNavigate({ path: 'home' })}
          className="mesh-breadcrumb__link"
        >
          HOME
        </button>
        <span className="mesh-breadcrumb__separator">/</span>
        <button
          onClick={() => onNavigate({ path: 'create' })}
          className="mesh-breadcrumb__link"
        >
          STUDIO
        </button>
        <span className="mesh-breadcrumb__separator">/</span>
        <span className="mesh-breadcrumb__current">MESH GRADIENT</span>
      </nav>

      {/* ── 2. Compact Editorial Intro ─────────────────────────── */}
      <header className="mesh-intro">
        <div className="mesh-intro__eyebrow">
          <span className="mesh-intro__eyebrow-dot" />
          <span>STUDIO / GENERATIVE COLOR</span>
          <span className="text-[var(--text-tertiary)]">•</span>
          <span>SEED #{config.seed}</span>
          <span className="text-[var(--text-tertiary)]">•</span>
          <span>{config.points.length} NODES</span>
          {config.preset && (
            <>
              <span className="text-[var(--text-tertiary)]">•</span>
              <span className="text-[var(--text-primary)] font-semibold">{config.preset.toUpperCase()}</span>
            </>
          )}
        </div>

        <h1 className="mesh-intro__title">
          MESH GRADIENT
        </h1>

        <p className="mesh-intro__lead">
          Create atmospheric color fields through layered color, position and movement.
        </p>
      </header>

      {/* ── 3. Main Mesh Gradient Canvas (Digital Color Artboard) ─── */}
      <section className="mesh-canvas-wrapper" aria-label="Mesh Gradient Canvas">
        <div className="mesh-artboard-frame">
          {/* Top Artboard Utility Header */}
          <div className="mesh-artboard-header">
            <div className="flex items-center gap-2">
              <span className="mesh-artboard-id">MESH / {String(config.points.length).padStart(2, '0')}</span>
              <span className="mesh-artboard-sep">•</span>
              <span className="mesh-artboard-tag">GENERATIVE FIELD</span>
              {config.preset && (
                <>
                  <span className="mesh-artboard-sep">•</span>
                  <span className="mesh-artboard-tag text-[var(--text-primary)] font-semibold">
                    {config.preset.toUpperCase()}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="mesh-artboard-status-dot" />
              <span className="font-mono text-[10px] font-bold text-[#34C759] tracking-wider uppercase">LIVE</span>
              <span className="mesh-artboard-sep">•</span>
              <span className="font-mono text-[10px] text-[#707070] tracking-wider uppercase">SEED #{config.seed}</span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="mesh-artboard-stage">
            <MeshHeroCanvas
              config={config}
              selectedPointId={selectedPointId}
              onSelectPoint={setSelectedPointId}
              onUpdatePoint={handleUpdatePoint}
              onAddPoint={handleAddPoint}
              onDeletePoint={handleDeletePoint}
              onRandomizePointColor={handleRandomizePointColor}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              showGridLines={showGridLines}
              onToggleGridLines={() => setShowGridLines(!showGridLines)}
            />
          </div>

          {/* Bottom Artboard Control Strip */}
          <div className="mesh-artboard-footer">
            <div className="mesh-artboard-tool-group">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                className={`mesh-artboard-tool-btn ${viewMode === 'edit' ? 'mesh-artboard-tool-btn--active' : ''}`}
                title="Toggle interactive handles"
              >
                <span>{viewMode === 'edit' ? 'EDIT' : 'VIEW'}</span>
              </button>

              <span className="mesh-artboard-tool-divider" />

              <button
                type="button"
                onClick={() => setShowGridLines(!showGridLines)}
                className={`mesh-artboard-tool-btn ${showGridLines ? 'mesh-artboard-tool-btn--active' : ''}`}
                title="Toggle coordinate guide grid"
              >
                <span>GRID {showGridLines ? 'ON' : 'OFF'}</span>
              </button>

              <span className="mesh-artboard-tool-divider" />

              <button
                type="button"
                onClick={handleRandomize}
                className="mesh-artboard-tool-btn"
                title="Generate fresh random gradient mesh"
              >
                <Sparkles size={11} className={isGenerating ? 'animate-spin' : ''} />
                <span>RANDOMIZE</span>
              </button>

              <span className="mesh-artboard-tool-divider" />

              <button
                type="button"
                onClick={() => handleAddPoint(50, 50)}
                className="mesh-artboard-tool-btn"
                title="Add new color node to center"
              >
                <Plus size={11} />
                <span>ADD NODE</span>
              </button>
            </div>

            <div className="mesh-artboard-tool-group">
              <span className="font-mono text-[10.5px] text-[#707070] tracking-wider uppercase mr-1">
                {config.points.length} NODES · {config.rows}×{config.columns} LATTICE
              </span>

              <span className="mesh-artboard-tool-divider" />

              {/* Undo / Redo */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="mesh-artboard-tool-btn p-1.5"
                aria-label="Undo"
                title="Undo"
              >
                <RotateCcw size={12} />
              </button>

              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="mesh-artboard-tool-btn p-1.5"
                aria-label="Redo"
                title="Redo"
              >
                <RotateCw size={12} />
              </button>

              <span className="mesh-artboard-tool-divider" />

              <button
                type="button"
                onClick={handleShareUrl}
                className="mesh-artboard-tool-btn"
                title="Copy shareable URL"
              >
                <Share2 size={11} />
                <span>{hasCopiedShare ? 'COPIED' : 'SHARE'}</span>
              </button>

              <span className="mesh-artboard-tool-divider" />

              <button
                type="button"
                onClick={handleSaveGradient}
                className="mesh-artboard-tool-btn font-semibold"
                title="Save to Studio Library"
              >
                <Bookmark size={11} />
                <span>{isCurrentSaved ? 'SAVED' : 'SAVE'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Interactive Node Swatch Rail ─────────────────────── */}
      <div className="mesh-nodes-bar" aria-label="Color Nodes Rail">
        <span className="font-mono text-[10.5px] font-bold text-[#707070] uppercase tracking-wider mr-1">
          ACTIVE NODES:
        </span>

        {config.points.map((pt, idx) => {
          const isSelected = pt.id === activeSpecimen.id;
          return (
            <div
              key={pt.id}
              onClick={() => setSelectedPointId(pt.id)}
              className={`mesh-node-pill ${isSelected ? 'mesh-node-pill--active' : ''}`}
              title={`Node ${idx + 1}: ${pt.color} at (${pt.x}%, ${pt.y}%)`}
            >
              <div
                className="mesh-node-swatch"
                style={{ backgroundColor: pt.color }}
              >
                <input
                  type="color"
                  value={pt.color}
                  onChange={(e) => handleUpdatePoint(pt.id, { color: e.target.value.toUpperCase() })}
                  onClick={(e) => e.stopPropagation()}
                  className="mesh-node-color-input"
                  title="Pick color"
                />
              </div>

              <span className="mesh-node-label">{pt.color}</span>

              {config.points.length > 2 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePoint(pt.id);
                  }}
                  className="text-[#707070] hover:text-[#FF3B30] p-0.5 ml-0.5 transition-colors"
                  title="Delete node"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 5. Precision Gradient Controls Grid ─────────────────── */}
      <section className="mesh-section" aria-label="Precision Instruments">
        <div className="mesh-section__header">
          <div>
            <h2 className="mesh-section__title">GRADIENT PARAMETERS</h2>
            <p className="mesh-section__desc">
              Atmospheric diffusion, falloff curvature, optical grain, and spatial transformations.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
            OPTICAL ENGINE
          </span>
        </div>

        <div className="mesh-controls-grid">
          {/* Column A: Atmosphere & Blend */}
          <div className="mesh-control-card">
            <div className="mesh-card-title">
              <span>ATMOSPHERE &amp; BLEND</span>
              <Sliders size={12} />
            </div>

            {/* Softness */}
            <div className="mesh-slider-row">
              <div className="mesh-slider-header">
                <span className="mesh-slider-label">SOFTNESS</span>
                <span className="mesh-slider-val">{config.softness.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.1"
                value={config.softness}
                onChange={(e) => handleConfigChange({ softness: parseFloat(e.target.value) })}
                className="mesh-slider-input"
              />
            </div>

            {/* Intensity */}
            <div className="mesh-slider-row">
              <div className="mesh-slider-header">
                <span className="mesh-slider-label">INTENSITY</span>
                <span className="mesh-slider-val">{config.intensity.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.1"
                value={config.intensity}
                onChange={(e) => handleConfigChange({ intensity: parseFloat(e.target.value) })}
                className="mesh-slider-input"
              />
            </div>

            {/* Optical Grain */}
            <div className="mesh-slider-row">
              <div className="mesh-slider-header">
                <span className="mesh-slider-label">ORGANIC GRAIN</span>
                <span className="mesh-slider-val">{config.grain}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={config.grain}
                onChange={(e) => handleConfigChange({ grain: parseInt(e.target.value) })}
                className="mesh-slider-input"
              />
            </div>

            {/* Optical Blur */}
            <div className="mesh-slider-row">
              <div className="mesh-slider-header">
                <span className="mesh-slider-label">GAUSSIAN BLUR</span>
                <span className="mesh-slider-val">{config.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="2"
                value={config.blur}
                onChange={(e) => handleConfigChange({ blur: parseInt(e.target.value) })}
                className="mesh-slider-input"
              />
            </div>
          </div>

          {/* Column B: Spatial Geometry & Background */}
          <div className="mesh-control-card">
            <div className="mesh-card-title">
              <span>KINEMATICS &amp; CANVAS</span>
              <Maximize2 size={12} />
            </div>

            {/* Rotation */}
            <div className="mesh-slider-row">
              <div className="mesh-slider-header">
                <span className="mesh-slider-label">FIELD ROTATION</span>
                <span className="mesh-slider-val">{config.rotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={config.rotation}
                onChange={(e) => handleConfigChange({ rotation: parseInt(e.target.value) })}
                className="mesh-slider-input"
              />
            </div>

            {/* Scale */}
            <div className="mesh-slider-row">
              <div className="mesh-slider-header">
                <span className="mesh-slider-label">CANVAS SCALE</span>
                <span className="mesh-slider-val">{config.scale.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.05"
                value={config.scale}
                onChange={(e) => handleConfigChange({ scale: parseFloat(e.target.value) })}
                className="mesh-slider-input"
              />
            </div>

            {/* Background Mode */}
            <div className="mesh-slider-row">
              <div className="mesh-slider-header">
                <span className="mesh-slider-label">BASE CANVAS</span>
                <span className="mesh-slider-val uppercase">{config.background}</span>
              </div>
              <div className="flex gap-2">
                {(['canvas', 'solid', 'transparent'] as const).map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => handleConfigChange({ background: bg })}
                    className={`flex-1 py-1.5 font-mono text-[11px] uppercase tracking-wider rounded-xs border transition-colors ${
                      config.background === bg
                        ? 'border-[#171717] dark:border-white font-bold bg-[#171717] text-white dark:bg-white dark:text-[#171717]'
                        : 'border-transparent text-[#707070] hover:text-[#171717] dark:hover:text-white bg-black/5 dark:bg-white/5'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {config.background === 'solid' && (
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-[11px] text-[#707070] uppercase">SOLID HEX</span>
                <input
                  type="text"
                  value={config.solidColor}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (isValidHex(val)) {
                      handleConfigChange({ solidColor: val.toUpperCase() });
                    }
                  }}
                  className="font-mono text-xs px-2 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xs w-28 uppercase font-semibold text-center"
                />
              </div>
            )}
          </div>

          {/* Column C: Node Inspector & Grid Matrix */}
          <div className="mesh-control-card">
            <div className="mesh-card-title">
              <span>SELECTED NODE SPECS</span>
              <Layers size={12} />
            </div>

            {selectedPoint ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xs border border-black/15 flex-shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: selectedPoint.color }}
                  >
                    <input
                      type="color"
                      value={selectedPoint.color}
                      onChange={(e) => handleUpdatePoint(selectedPoint.id, { color: e.target.value.toUpperCase() })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-bold text-[#171717] dark:text-white uppercase tracking-wider">
                      {findClosestColorName(selectedPoint.color)}
                    </span>
                    <span className="font-mono text-[11px] text-[#707070]">
                      {selectedPoint.color} · ({selectedPoint.x}%, {selectedPoint.y}%)
                    </span>
                  </div>
                </div>

                {/* Node Influence / Radius Slider */}
                <div className="mesh-slider-row">
                  <div className="mesh-slider-header">
                    <span className="mesh-slider-label">NODE INFLUENCE</span>
                    <span className="mesh-slider-val">{(selectedPoint.influence || 1.0).toFixed(1)}×</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.1"
                    value={selectedPoint.influence || 1.0}
                    onChange={(e) => handleUpdatePoint(selectedPoint.id, { influence: parseFloat(e.target.value) })}
                    className="mesh-slider-input"
                  />
                </div>

                {/* Lattice Matrix Generation */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <span className="font-mono text-[10.5px] text-[#707070] uppercase font-bold">
                    GENERATE REGULAR LATTICE:
                  </span>
                  <div className="flex gap-2">
                    {[
                      { r: 2, c: 2, label: '2×2' },
                      { r: 2, c: 3, label: '2×3' },
                      { r: 3, c: 3, label: '3×3' },
                    ].map((g) => (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => handleGenerateGrid(g.r, g.c)}
                        className="flex-1 py-1 font-mono text-[11px] uppercase border border-black/10 dark:border-white/10 rounded-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[#707070] font-sans text-xs py-8 text-center">
                Click any node on the canvas to inspect its parameters.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 6. Curated Presets Gallery ───────────────────────────── */}
      <section className="mesh-section" aria-label="Presets Gallery">
        <div className="mesh-section__header">
          <div>
            <h2 className="mesh-section__title">PRESET EXPLORATION</h2>
            <p className="mesh-section__desc">
              Curated master color fields balancing organic temperature, lightness, and atmospheric depth.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
            {MESH_PRESETS.length} COMPOSITIONS
          </span>
        </div>

        <div className="mesh-presets-grid">
          {MESH_PRESETS.map((p, idx) => {
            const isActive = config.preset === p.id;
            const bgCss = p.colors.length >= 2
              ? `linear-gradient(135deg, ${p.colors.slice(0, 4).join(', ')})`
              : '#090A0C';

            return (
              <div
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`mesh-preset-card ${isActive ? 'mesh-preset-card--active' : ''}`}
                title={`Load ${p.name}`}
              >
                <div
                  className="mesh-preset-thumb"
                  style={{ background: bgCss }}
                />
                <div className="mesh-preset-info">
                  <span className="mesh-preset-num">0{idx + 1}</span>
                  <span className="mesh-preset-name">{p.name}</span>
                  <span className="mesh-preset-tagline">{p.tagline}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 7. Chromatic Specimen Archive (Contemporary Color Catalog) ── */}
      <section className="mesh-section" aria-label="Chromatic Specimen">
        <div className="mesh-section__header">
          <div>
            <h2 className="mesh-section__title">CHROMATIC SPECIMEN</h2>
            <p className="mesh-section__desc">
              Archival color study, typographic contrast verification, and photometric analysis.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
            ARCHIVE / 04
          </span>
        </div>

        <div className="mesh-specimen-archive">
          {/* Top Archive Header */}
          <div className="mesh-specimen-archive-header">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-[#171717] dark:text-white uppercase tracking-wider">
                SPECIMEN Nº {String(selectedPointIndex + 1 || 1).padStart(2, '0')}
              </span>
              <span className="mesh-artboard-sep">•</span>
              <span className="font-sans text-[11px] text-[#707070] uppercase tracking-wider">
                {specimenName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[10.5px] text-[#707070] tracking-wider uppercase">
                {config.points.length} ACTIVE SPECIMEN NODES
              </span>
            </div>
          </div>

          {/* Node Navigation Bar */}
          <div className="mesh-specimen-node-nav" aria-label="Specimen Selector">
            {config.points.map((pt, idx) => {
              const isSelected = pt.id === activeSpecimen.id;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setSelectedPointId(pt.id)}
                  className={`mesh-specimen-nav-btn ${isSelected ? 'mesh-specimen-nav-btn--active' : ''}`}
                  title={`Inspect node ${idx + 1}: ${pt.color}`}
                >
                  <span
                    className="mesh-specimen-nav-dot"
                    style={{ backgroundColor: pt.color }}
                  />
                  <span>0{idx + 1} {pt.color}</span>
                </button>
              );
            })}
          </div>

          {/* Specimen Body (Left: Massive Color Field / Right: Typographic & Tech Record) */}
          <div className="mesh-specimen-body">
            {/* Left Column: Massive Architectural Color Field (35–55%) */}
            <div
              className="mesh-specimen-color-field"
              style={{
                backgroundColor: activeSpecimen.color,
                color: bestTextColor,
              }}
            >
              <div className="mesh-specimen-field-header">
                <span className="mesh-specimen-field-badge">
                  NODE 0{selectedPointIndex + 1 || 1} • X: {activeSpecimen.x}% Y: {activeSpecimen.y}%
                </span>

                <span className="mesh-specimen-field-badge">
                  INFLUENCE {(activeSpecimen.influence || 1.0).toFixed(1)}×
                </span>
              </div>

              <div className="mesh-specimen-field-footer">
                <span
                  className="mesh-specimen-color-name"
                  style={{
                    textShadow: bestTextColor === '#FFFFFF'
                      ? '0 2px 8px rgba(0,0,0,0.45)'
                      : '0 1px 3px rgba(255,255,255,0.4)',
                  }}
                >
                  {specimenName}
                </span>

                <div className="mesh-specimen-hex-row">
                  <span
                    className="mesh-specimen-hex-val"
                    style={{
                      textShadow: bestTextColor === '#FFFFFF'
                        ? '0 2px 8px rgba(0,0,0,0.45)'
                        : '0 1px 3px rgba(255,255,255,0.4)',
                    }}
                  >
                    {activeSpecimen.color}
                  </span>

                  <button
                    type="button"
                    onClick={async () => {
                      await copyToClipboard(activeSpecimen.color);
                      setCopiedSpecimenHex(activeSpecimen.color);
                      showToast(`Copied ${activeSpecimen.color}`, specimenName, activeSpecimen.color);
                      setTimeout(() => setCopiedSpecimenHex(null), 1200);
                    }}
                    className={`mesh-specimen-copy-btn ${
                      copiedSpecimenHex === activeSpecimen.color ? 'mesh-specimen-copy-btn--copied' : ''
                    }`}
                  >
                    <Copy size={11} />
                    <span>{copiedSpecimenHex === activeSpecimen.color ? 'COPIED' : 'COPY HEX'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Typographic Study & Technical Color Record */}
            <div className="mesh-specimen-details-col">
              {/* Typographic Study */}
              <div className="mesh-specimen-typo-study">
                <div className="mesh-specimen-typo-heading">
                  <span className="font-mono text-[10px] font-bold text-[#707070] uppercase tracking-wider">
                    TYPOGRAPHIC SPECIMEN • GENERAL SANS
                  </span>
                  <span
                    className="font-mono text-[10.5px] font-bold uppercase tracking-wider"
                    style={{ color: activeSpecimen.color }}
                  >
                    PRIMARY SPECIMEN
                  </span>
                </div>

                <div className="flex items-baseline gap-4">
                  <span
                    className="mesh-specimen-glyph-display"
                    style={{ color: activeSpecimen.color }}
                  >
                    Aa
                  </span>
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-bold tracking-tight uppercase text-[#171717] dark:text-white">
                      {specimenName}
                    </span>
                    <span className="font-mono text-[11px] text-[#707070]">
                      KROMA CALIBRATED ARCHIVE SPECIMEN
                    </span>
                  </div>
                </div>

                <div className="mesh-specimen-alphabet">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  <br />
                  abcdefghijklmnopqrstuvwxyz
                </div>

                <div className="mesh-specimen-numerals">
                  0123456789 • !@#$%&amp;*()_+-=~
                </div>
              </div>

              {/* Technical Color Record Grid */}
              <div className="mesh-specimen-tech-record">
                <span className="font-mono text-[10px] font-bold text-[#707070] uppercase tracking-wider">
                  TECHNICAL COLOR RECORD
                </span>

                <div className="mesh-specimen-tech-grid">
                  <div className="mesh-specimen-tech-cell">
                    <span className="mesh-specimen-tech-label">HEX VALUE</span>
                    <span className="mesh-specimen-tech-val">{activeSpecimen.color}</span>
                  </div>

                  <div className="mesh-specimen-tech-cell">
                    <span className="mesh-specimen-tech-label">RGB CHANNELS</span>
                    <span className="mesh-specimen-tech-val">
                      {specimenRgb ? `${specimenRgb.r} · ${specimenRgb.g} · ${specimenRgb.b}` : '—'}
                    </span>
                  </div>

                  <div className="mesh-specimen-tech-cell">
                    <span className="mesh-specimen-tech-label">HSL SPECS</span>
                    <span className="mesh-specimen-tech-val">
                      {specimenHsl ? `${specimenHsl.h}° · ${specimenHsl.s}% · ${specimenHsl.l}%` : '—'}
                    </span>
                  </div>

                  <div className="mesh-specimen-tech-cell">
                    <span className="mesh-specimen-tech-label">OKLCH PERCEPTUAL</span>
                    <span className="mesh-specimen-tech-val truncate" title={specimenOklch}>
                      {specimenOklch}
                    </span>
                  </div>

                  <div className="mesh-specimen-tech-cell">
                    <span className="mesh-specimen-tech-label">PHOTOMETRIC LUMINANCE</span>
                    <span className="mesh-specimen-tech-val">{specimenLum}</span>
                  </div>

                  <div className="mesh-specimen-tech-cell">
                    <span className="mesh-specimen-tech-label">WCAG COMPLIANCE</span>
                    <span className="mesh-specimen-tech-val font-bold text-[#34C759]">
                      {wcagRating}
                    </span>
                  </div>

                  <div className="mesh-specimen-tech-cell">
                    <span className="mesh-specimen-tech-label">CONTRAST (WHITE / BLACK)</span>
                    <span className="mesh-specimen-tech-val">
                      {contrastWhite}:1 / {contrastBlack}:1
                    </span>
                  </div>

                  <div className="mesh-specimen-tech-cell">
                    <span className="mesh-specimen-tech-label">RECOMMENDED FOREGROUND</span>
                    <span className="mesh-specimen-tech-val">
                      {bestTextColor === '#FFFFFF' ? '#FFFFFF (PURE WHITE)' : '#090A0C (PURE BLACK)'}
                    </span>
                  </div>
                </div>

                <div className="mesh-specimen-actions-row">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeSpecimen.color}
                      onChange={(e) => handleUpdatePoint(activeSpecimen.id, { color: e.target.value.toUpperCase() })}
                      className="w-7 h-7 rounded-xs border border-black/15 cursor-pointer bg-transparent"
                      title="Adjust specimen color"
                    />
                    <span className="font-mono text-[11px] text-[#707070] uppercase">
                      CALIBRATE TONE
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRandomizePointColor(activeSpecimen.id)}
                      className="mesh-btn-subtle text-xs py-1 px-2.5"
                      title="Randomize this node's color"
                    >
                      <RefreshCw size={11} />
                      <span>RANDOMIZE TONE</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Live Applications & Surfaces ("USE IT") ───────────── */}
      <section className="mesh-section" aria-label="Live Applications">
        <div className="mesh-section__header">
          <div>
            <h2 className="mesh-section__title">SURFACES &amp; APPLICATIONS</h2>
            <p className="mesh-section__desc">
              Real-time generative projection across editorial, UI product, and architectural surfaces.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
            LIVE PREVIEW
          </span>
        </div>

        <div className="mesh-use-cases-grid">
          {/* Surface 1: Editorial Cover */}
          <div className="mesh-use-case">
            <div
              className="mesh-mockup-frame"
              style={{
                background: activeMeshCss ? undefined : '#090A0C',
                backgroundImage: activeMeshCss.includes('background-image:')
                  ? activeMeshCss.split('background-image:')[1]?.split(';')[0]?.trim()
                  : undefined,
              }}
            >
              <div className="mesh-poster-overlay">
                <div>
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                    KROMA MONOGRAPH • VOL. 04
                  </span>
                  <div className="font-sans text-xl font-extrabold tracking-tight mt-1">
                    ATMOSPHERICS
                  </div>
                </div>
                <div className="font-mono text-[10px] flex justify-between">
                  <span>SEED #{config.seed}</span>
                  <span>2026 EDITION</span>
                </div>
              </div>
            </div>
            <div className="mesh-mockup-label">
              SURFACE 01 — EDITORIAL COVER
            </div>
          </div>

          {/* Surface 2: Digital Device Glass Screen */}
          <div className="mesh-use-case">
            <div
              className="mesh-mockup-frame"
              style={{
                background: activeMeshCss ? undefined : '#090A0C',
                backgroundImage: activeMeshCss.includes('background-image:')
                  ? activeMeshCss.split('background-image:')[1]?.split(';')[0]?.trim()
                  : undefined,
              }}
            >
              <div className="mesh-device-overlay">
                <div className="flex justify-between items-center font-mono text-[10px] opacity-80">
                  <span>9:41 AM</span>
                  <span>5G • 100%</span>
                </div>
                <div className="text-center my-auto">
                  <div className="font-sans text-2xl font-bold tracking-tight">KROMA</div>
                  <div className="font-mono text-[11px] opacity-75 mt-1">
                    {config.preset ? config.preset.toUpperCase() : `SEED #${config.seed}`}
                  </div>
                </div>
                <div className="font-mono text-[9px] text-center opacity-60">
                  SWIPE UP TO UNLOCK
                </div>
              </div>
            </div>
            <div className="mesh-mockup-label">
              SURFACE 02 — DIGITAL INTERFACE
            </div>
          </div>

          {/* Surface 3: Brand Identity Card */}
          <div className="mesh-use-case">
            <div
              className="mesh-mockup-frame"
              style={{
                background: activeMeshCss ? undefined : '#090A0C',
                backgroundImage: activeMeshCss.includes('background-image:')
                  ? activeMeshCss.split('background-image:')[1]?.split(';')[0]?.trim()
                  : undefined,
              }}
            >
              <div className="mesh-brand-card">
                <div className="flex justify-between items-start">
                  <span className="font-sans text-xs font-black tracking-wider">KROMA LAB</span>
                  <span className="font-mono text-[9px] text-[#707070]">#4829-SPEC</span>
                </div>
                <div className="font-mono text-[10px] text-[#707070] flex flex-col gap-0.5">
                  <span className="font-bold text-[#171717]">CHROMATIC EMITTER</span>
                  <span>{config.points.length} RADIAL MATRIX STEPS</span>
                </div>
              </div>
            </div>
            <div className="mesh-mockup-label">
              SURFACE 03 — BRAND IDENTITY
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Code Export & Tokens Area ────────────────────────── */}
      <section className="mesh-section" aria-label="Export Code">
        <div className="mesh-section__header">
          <div>
            <h2 className="mesh-section__title">EXPORT YOUR GRADIENT</h2>
            <p className="mesh-section__desc">
              Production-ready radial CSS declaration, standalone SVG vector, DTCG tokens, and LLM prompt.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
            TOKENS &amp; CODE
          </span>
        </div>

        <div className="mesh-export-box">
          {/* Format Tabs */}
          <div className="mesh-export-tabs">
            {(
              [
                { id: 'css', label: 'CSS RADIAL', icon: <Code size={12} /> },
                { id: 'svg', label: 'SVG VECTOR', icon: <Code size={12} /> },
                { id: 'dtcg', label: 'DTCG JSON', icon: <FileJson size={12} /> },
                { id: 'agent', label: 'AGENT PROMPT', icon: <Cpu size={12} /> },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveExportTab(t.id)}
                className={`mesh-export-tab flex items-center gap-1.5 ${
                  activeExportTab === t.id ? 'mesh-export-tab--active' : ''
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer Block */}
          <pre className="mesh-code-block">
            <code>{exportCodes[activeExportTab]}</code>
          </pre>

          {/* Action Buttons */}
          <div className="mesh-export-actions">
            <button
              onClick={() => handleCopyExport(activeExportTab)}
              className="mesh-primary-btn"
            >
              {copiedCodeFormat === activeExportTab ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedCodeFormat === activeExportTab ? 'COPIED TO CLIPBOARD' : 'COPY CODE'}</span>
            </button>

            {activeExportTab === 'svg' && (
              <button
                onClick={handleDownloadSvgFile}
                className="mesh-btn-subtle"
                title="Download .svg file"
              >
                <Download size={13} />
                <span>DOWNLOAD .SVG</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
