import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RouteType } from '../types';
import {
  MeshGradientConfig,
  MeshPoint,
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
import { KromaButton } from '../components/common/KromaButton';
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
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-8 pb-24 text-[var(--text-primary)]">
      <SEOHead
        title="Mesh Gradient Studio — Digital Color Laboratory | KROMA"
        description="Atmospheric multi-radial generative color laboratory. Interactive color nodes, perceptual transitions, and precision token exports."
        canonicalPath="/mesh"
        jsonLd={webAppSchema}
      />

      {/* ── 1. Minimal Editorial Breadcrumb ─────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-sans text-xs font-medium tracking-wider uppercase mb-6">
        <KromaButton
          variant="ghost"
          size="sm"
          onClick={() => onNavigate({ path: 'home' })}
          className="text-kroma-muted hover:text-kroma-text dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit h-auto"
        >
          HOME
        </KromaButton>
        <span className="text-black/25 dark:text-white/25 font-light">/</span>
        <KromaButton
          variant="ghost"
          size="sm"
          onClick={() => onNavigate({ path: 'create' })}
          className="text-kroma-muted hover:text-kroma-text dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit h-auto"
        >
          STUDIO
        </KromaButton>
        <span className="text-black/25 dark:text-white/25 font-light">/</span>
        <span className="text-kroma-text dark:text-white font-semibold">MESH GRADIENT</span>
      </nav>

      {/* ── 2. Compact Editorial Intro ─────────────────────────── */}
      <header className="mb-8 flex flex-col gap-2">
        <div className="font-mono text-xs font-semibold tracking-widest uppercase text-kroma-muted dark:text-[#8E8E93] flex items-center gap-2 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-xs bg-[#BFA3F0]" />
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

        <h1 className="font-sans font-bold text-[clamp(40px,7vw,92px)] leading-[1.05] tracking-tight text-kroma-text dark:text-white uppercase select-none my-0">
          MESH GRADIENT
        </h1>

        <p className="font-sans text-[clamp(15px,1.4vw,18px)] leading-relaxed text-kroma-muted dark:text-[#8E8E93] max-w-[620px] mb-2 tracking-tight">
          Create atmospheric color fields through layered color, position and movement.
        </p>
      </header>

      {/* ── 3. Main Mesh Gradient Canvas (Digital Color Artboard) ─── */}
      <section className="w-full mb-8" aria-label="Mesh Gradient Canvas">
        <div className="w-full bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/10 rounded-sm overflow-hidden flex flex-col shadow-xs">
          {/* Top Artboard Utility Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.08] dark:border-white/[0.08] font-sans text-xs tracking-widest uppercase flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-kroma-text dark:text-white">MESH / {String(config.points.length).padStart(2, '0')}</span>
              <span className="text-black/25 dark:text-white/25 font-light">•</span>
              <span className="text-kroma-muted dark:text-[#8E8E93] font-medium">GENERATIVE FIELD</span>
              {config.preset && (
                <>
                  <span className="text-black/25 dark:text-white/25 font-light">•</span>
                  <span className="text-kroma-muted dark:text-[#8E8E93] font-medium text-[var(--text-primary)] font-semibold">
                    {config.preset.toUpperCase()}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-kroma-green inline-block" />
              <span className="font-mono text-xs font-bold text-[#34C759] tracking-wider uppercase">LIVE</span>
              <span className="text-black/25 dark:text-white/25 font-light">•</span>
              <span className="font-mono text-xs text-kroma-muted dark:text-[#8E8E93] tracking-wider uppercase">SEED #{config.seed}</span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="w-full h-[580px] lg:h-[480px] sm:h-[380px] bg-[#090A0C] relative overflow-hidden">
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
          <div className="flex items-center justify-between px-4 py-2 border-t border-black/[0.08] dark:border-white/[0.08] bg-kroma-bg dark:bg-[#141518] flex-wrap gap-3">
            <div className="flex items-center gap-1 flex-wrap">
              <KromaButton
                variant={viewMode === 'edit' ? 'filled' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                className={`px-2.5 py-1.5 font-sans text-xs font-semibold tracking-wider uppercase rounded-xs transition-colors h-auto ${
                  viewMode === 'edit'
                    ? 'text-kroma-text dark:text-white bg-black/[0.08] dark:bg-white/[0.12]'
                    : 'text-kroma-muted hover:text-kroma-text dark:text-[#8E8E93] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08]'
                }`}
                title="Toggle interactive handles"
              >
                {viewMode === 'edit' ? 'EDIT' : 'VIEW'}
              </KromaButton>

              <span className="w-px h-3 bg-black/10 dark:bg-white/10 mx-1" />

              <KromaButton
                variant={showGridLines ? 'filled' : 'ghost'}
                size="sm"
                onClick={() => setShowGridLines(!showGridLines)}
                className={`px-2.5 py-1.5 font-sans text-xs font-semibold tracking-wider uppercase rounded-xs transition-colors h-auto ${
                  showGridLines
                    ? 'text-kroma-text dark:text-white bg-black/[0.08] dark:bg-white/[0.12]'
                    : 'text-kroma-muted hover:text-kroma-text dark:text-[#8E8E93] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08]'
                }`}
                title="Toggle coordinate guide grid"
              >
                GRID {showGridLines ? 'ON' : 'OFF'}
              </KromaButton>

              <span className="w-px h-3 bg-black/10 dark:bg-white/10 mx-1" />

              <KromaButton
                variant="ghost"
                size="sm"
                onClick={handleRandomize}
                iconLeft={<Sparkles size={11} className={isGenerating ? 'animate-spin' : ''} />}
                className="px-2.5 py-1.5 font-sans text-xs font-semibold tracking-wider uppercase text-kroma-muted hover:text-kroma-text dark:text-[#8E8E93] dark:hover:text-white rounded-xs transition-colors hover:bg-black/5 dark:hover:bg-white/[0.08] h-auto"
                title="Generate fresh random gradient mesh"
              >
                RANDOMIZE
              </KromaButton>

              <span className="w-px h-3 bg-black/10 dark:bg-white/10 mx-1" />

              <KromaButton
                variant="ghost"
                size="sm"
                onClick={() => handleAddPoint(50, 50)}
                iconLeft={<Plus size={11} />}
                className="px-2.5 py-1.5 font-sans text-xs font-semibold tracking-wider uppercase text-kroma-muted hover:text-kroma-text dark:text-[#8E8E93] dark:hover:text-white rounded-xs transition-colors hover:bg-black/5 dark:hover:bg-white/[0.08] h-auto"
                title="Add new color node to center"
              >
                ADD NODE
              </KromaButton>
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-mono text-xs text-kroma-muted dark:text-[#8E8E93] tracking-wider uppercase mr-1">
                {config.points.length} NODES · {config.rows}×{config.columns} LATTICE
              </span>

              <span className="w-px h-3 bg-black/10 dark:bg-white/10 mx-1" />

              {/* Undo / Redo */}
              <KromaButton
                variant="ghost"
                size="icon"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 font-sans text-xs text-kroma-muted hover:text-kroma-text dark:text-[#8E8E93] dark:hover:text-white rounded-xs transition-colors hover:bg-black/5 dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed h-auto w-auto min-h-0"
                aria-label="Undo"
                title="Undo"
              >
                <RotateCcw size={12} />
              </KromaButton>

              <KromaButton
                variant="ghost"
                size="icon"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 font-sans text-xs text-kroma-muted hover:text-kroma-text dark:text-[#8E8E93] dark:hover:text-white rounded-xs transition-colors hover:bg-black/5 dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed h-auto w-auto min-h-0"
                aria-label="Redo"
                title="Redo"
              >
                <RotateCw size={12} />
              </KromaButton>

              <span className="w-px h-3 bg-black/10 dark:bg-white/10 mx-1" />

              <KromaButton
                variant="ghost"
                size="sm"
                onClick={handleShareUrl}
                iconLeft={<Share2 size={11} />}
                className="px-2.5 py-1.5 font-sans text-xs font-semibold tracking-wider uppercase text-kroma-muted hover:text-kroma-text dark:text-[#8E8E93] dark:hover:text-white rounded-xs transition-colors hover:bg-black/5 dark:hover:bg-white/[0.08] h-auto"
                title="Copy shareable URL"
              >
                {hasCopiedShare ? 'COPIED' : 'SHARE'}
              </KromaButton>

              <span className="w-px h-3 bg-black/10 dark:bg-white/10 mx-1" />

              <KromaButton
                variant="ghost"
                size="sm"
                onClick={handleSaveGradient}
                iconLeft={<Bookmark size={11} />}
                className="px-2.5 py-1.5 font-sans text-xs font-semibold tracking-wider uppercase text-kroma-text dark:text-white rounded-xs transition-colors hover:bg-black/5 dark:hover:bg-white/[0.08] h-auto"
                title="Save to Studio Library"
              >
                {isCurrentSaved ? 'SAVED' : 'SAVE'}
              </KromaButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Interactive Node Swatch Rail ─────────────────────── */}
      <div className="flex items-center gap-2.5 flex-wrap px-4 py-3 bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm mb-12" aria-label="Color Nodes Rail">
        <span className="font-mono text-xs font-bold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider mr-1">
          ACTIVE NODES:
        </span>

        {config.points.map((pt, idx) => {
          const isSelected = pt.id === activeSpecimen.id;
          return (
            <div
              key={pt.id}
              className={`flex items-center gap-2 px-2 py-1 bg-black/[0.04] dark:bg-white/[0.04] border rounded-xs transition-all ${
                isSelected
                  ? 'border-kroma-text dark:border-white ring-1 ring-kroma-text dark:ring-white bg-black/[0.07] dark:bg-white/[0.08]'
                  : 'border-black/[0.08] dark:border-white/[0.08] hover:border-black/25 dark:hover:border-white/25'
              }`}
            >
              <div
                className="w-4 h-4 rounded-xs border border-black/15 flex-shrink-0 relative overflow-hidden"
                style={{ backgroundColor: pt.color }}
              >
                <input
                  type="color"
                  value={pt.color}
                  onChange={(e) => handleUpdatePoint(pt.id, { color: e.target.value.toUpperCase() })}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Pick color"
                  aria-label={`Pick color for node ${idx + 1}`}
                />
              </div>

              <button
                type="button"
                onClick={() => setSelectedPointId(pt.id)}
                aria-pressed={isSelected}
                aria-label={`Select node ${idx + 1}: ${pt.color} at (${pt.x}%, ${pt.y}%)`}
                className="font-mono text-xs font-medium text-kroma-text dark:text-white uppercase border-0 bg-transparent p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary-500"
              >
                {pt.color}
              </button>

              {config.points.length > 2 && (
                <KromaButton
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePoint(pt.id);
                  }}
                  className="text-kroma-muted dark:text-[#8E8E93] hover:text-kroma-red p-0.5 ml-0.5 transition-colors h-auto w-auto min-h-0"
                  title="Delete node"
                >
                  <Trash2 size={11} />
                </KromaButton>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 5. Precision Gradient Controls Grid ─────────────────── */}
      <section className="mb-12" aria-label="Precision Instruments">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-kroma-text dark:text-white uppercase my-0">GRADIENT PARAMETERS</h2>
            <p className="font-sans text-sm text-kroma-muted dark:text-[#8E8E93] max-w-[560px] my-1">
              Atmospheric diffusion, falloff curvature, optical grain, and spatial transformations.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
            OPTICAL ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column A: Atmosphere & Blend */}
          <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-kroma-text dark:text-white tracking-wider uppercase border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
              <span>ATMOSPHERE &amp; BLEND</span>
              <Sliders size={12} />
            </div>

            {/* Softness */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-xs uppercase">
                <span className="text-kroma-muted dark:text-[#8E8E93] font-semibold">SOFTNESS</span>
                <span className="text-kroma-text dark:text-white font-bold">{config.softness.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.1"
                value={config.softness}
                onChange={(e) => handleConfigChange({ softness: parseFloat(e.target.value) })}
                className="w-full accent-kroma-text dark:accent-white h-1 bg-black/10 dark:bg-white/10 rounded-sm cursor-pointer"
              />
            </div>

            {/* Intensity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-xs uppercase">
                <span className="text-kroma-muted dark:text-[#8E8E93] font-semibold">INTENSITY</span>
                <span className="text-kroma-text dark:text-white font-bold">{config.intensity.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.1"
                value={config.intensity}
                onChange={(e) => handleConfigChange({ intensity: parseFloat(e.target.value) })}
                className="w-full accent-kroma-text dark:accent-white h-1 bg-black/10 dark:bg-white/10 rounded-sm cursor-pointer"
              />
            </div>

            {/* Optical Grain */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-xs uppercase">
                <span className="text-kroma-muted dark:text-[#8E8E93] font-semibold">ORGANIC GRAIN</span>
                <span className="text-kroma-text dark:text-white font-bold">{config.grain}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={config.grain}
                onChange={(e) => handleConfigChange({ grain: parseInt(e.target.value) })}
                className="w-full accent-kroma-text dark:accent-white h-1 bg-black/10 dark:bg-white/10 rounded-sm cursor-pointer"
              />
            </div>

            {/* Optical Blur */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-xs uppercase">
                <span className="text-kroma-muted dark:text-[#8E8E93] font-semibold">GAUSSIAN BLUR</span>
                <span className="text-kroma-text dark:text-white font-bold">{config.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="2"
                value={config.blur}
                onChange={(e) => handleConfigChange({ blur: parseInt(e.target.value) })}
                className="w-full accent-kroma-text dark:accent-white h-1 bg-black/10 dark:bg-white/10 rounded-sm cursor-pointer"
              />
            </div>
          </div>

          {/* Column B: Spatial Geometry & Background */}
          <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-kroma-text dark:text-white tracking-wider uppercase border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
              <span>KINEMATICS &amp; CANVAS</span>
              <Maximize2 size={12} />
            </div>

            {/* Rotation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-xs uppercase">
                <span className="text-kroma-muted dark:text-[#8E8E93] font-semibold">FIELD ROTATION</span>
                <span className="text-kroma-text dark:text-white font-bold">{config.rotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={config.rotation}
                onChange={(e) => handleConfigChange({ rotation: parseInt(e.target.value) })}
                className="w-full accent-kroma-text dark:accent-white h-1 bg-black/10 dark:bg-white/10 rounded-sm cursor-pointer"
              />
            </div>

            {/* Scale */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-xs uppercase">
                <span className="text-kroma-muted dark:text-[#8E8E93] font-semibold">CANVAS SCALE</span>
                <span className="text-kroma-text dark:text-white font-bold">{config.scale.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.05"
                value={config.scale}
                onChange={(e) => handleConfigChange({ scale: parseFloat(e.target.value) })}
                className="w-full accent-kroma-text dark:accent-white h-1 bg-black/10 dark:bg-white/10 rounded-sm cursor-pointer"
              />
            </div>

            {/* Background Mode */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-xs uppercase">
                <span className="text-kroma-muted dark:text-[#8E8E93] font-semibold">BASE CANVAS</span>
                <span className="text-kroma-text dark:text-white font-bold uppercase">{config.background}</span>
              </div>
              <div className="flex gap-2">
                {(['canvas', 'solid', 'transparent'] as const).map((bg) => (
                  <KromaButton
                    key={bg}
                    variant={config.background === bg ? 'filled' : 'ghost'}
                    size="sm"
                    onClick={() => handleConfigChange({ background: bg })}
                    className={`flex-1 py-1.5 font-mono text-xs uppercase tracking-wider rounded-xs border transition-colors h-auto ${
                      config.background === bg
                        ? 'border-[#171717] dark:border-white font-bold bg-[#171717] text-white dark:bg-white dark:text-[#171717]'
                        : 'border-transparent text-[#707070] hover:text-[#171717] dark:hover:text-white bg-black/5 dark:bg-white/5'
                    }`}
                  >
                    {bg}
                  </KromaButton>
                ))}
              </div>
            </div>

            {config.background === 'solid' && (
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-xs text-[#707070] uppercase">SOLID HEX</span>
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
          <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-kroma-text dark:text-white tracking-wider uppercase border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
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
                    <span className="font-mono text-xs text-[#707070]">
                      {selectedPoint.color} · ({selectedPoint.x}%, {selectedPoint.y}%)
                    </span>
                  </div>
                </div>

                {/* Node Influence / Radius Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-mono text-xs uppercase">
                    <span className="text-kroma-muted dark:text-[#8E8E93] font-semibold">NODE INFLUENCE</span>
                    <span className="text-kroma-text dark:text-white font-bold">{(selectedPoint.influence || 1.0).toFixed(1)}×</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.1"
                    value={selectedPoint.influence || 1.0}
                    onChange={(e) => handleUpdatePoint(selectedPoint.id, { influence: parseFloat(e.target.value) })}
                    className="w-full accent-kroma-text dark:accent-white h-1 bg-black/10 dark:bg-white/10 rounded-sm cursor-pointer"
                  />
                </div>

                {/* Lattice Matrix Generation */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <span className="font-mono text-xs text-[#707070] uppercase font-bold">
                    GENERATE REGULAR LATTICE:
                  </span>
                  <div className="flex gap-2">
                    {[
                      { r: 2, c: 2, label: '2×2' },
                      { r: 2, c: 3, label: '2×3' },
                      { r: 3, c: 3, label: '3×3' },
                    ].map((g) => (
                      <KromaButton
                        key={g.label}
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateGrid(g.r, g.c)}
                        className="flex-1 py-1 font-mono text-xs uppercase rounded-xs h-auto"
                      >
                        {g.label}
                      </KromaButton>
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
      <section className="mb-12" aria-label="Presets Gallery">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-kroma-text dark:text-white uppercase my-0">PRESET EXPLORATION</h2>
            <p className="font-sans text-sm text-kroma-muted dark:text-[#8E8E93] max-w-[560px] my-1">
              Curated master color fields balancing organic temperature, lightness, and atmospheric depth.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
            {MESH_PRESETS.length} COMPOSITIONS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {MESH_PRESETS.map((p, idx) => {
            const isActive = config.preset === p.id;
            const bgCss = p.colors.length >= 2
              ? `linear-gradient(135deg, ${p.colors.slice(0, 4).join(', ')})`
              : '#090A0C';

            return (
              <button
                type="button"
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                aria-pressed={isActive}
                aria-label={`Load preset ${p.name}`}
                className={`bg-kroma-bg dark:bg-[#141518] border rounded-sm overflow-hidden p-2 cursor-pointer transition-all duration-150 flex flex-col gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                  isActive
                    ? 'border-kroma-text dark:border-white ring-1 ring-kroma-text dark:ring-white scale-[1.02]'
                    : 'border-black/[0.08] dark:border-white/[0.08] hover:border-black/25 dark:hover:border-white/25'
                }`}
              >
                <div
                  className="w-full h-14 rounded-xs border border-black/10 dark:border-white/10 pointer-events-none"
                  style={{ background: bgCss }}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs font-bold text-kroma-muted dark:text-[#8E8E93]">0{idx + 1}</span>
                  <span className="font-sans text-xs font-bold uppercase tracking-tight text-kroma-text dark:text-white truncate">{p.name}</span>
                  <span className="font-sans text-xs text-kroma-muted dark:text-[#8E8E93] truncate">{p.tagline}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 7. Chromatic Specimen Archive (Contemporary Color Catalog) ── */}
      <section className="mb-12" aria-label="Chromatic Specimen">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-kroma-text dark:text-white uppercase my-0">CHROMATIC SPECIMEN</h2>
            <p className="font-sans text-sm text-kroma-muted dark:text-[#8E8E93] max-w-[560px] my-1">
              Archival color study, typographic contrast verification, and photometric analysis.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
            ARCHIVE / 04
          </span>
        </div>

        <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm overflow-hidden flex flex-col">
          {/* Top Archive Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.08] dark:border-white/[0.08] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#171717] dark:text-white uppercase tracking-wider">
                SPECIMEN Nº {String(selectedPointIndex + 1 || 1).padStart(2, '0')}
              </span>
              <span className="text-black/25 dark:text-white/25 font-light">•</span>
              <span className="font-sans text-xs text-[#707070] uppercase tracking-wider">
                {specimenName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#707070] tracking-wider uppercase">
                {config.points.length} ACTIVE SPECIMEN NODES
              </span>
            </div>
          </div>

          {/* Node Navigation Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-black/[0.08] dark:border-white/[0.08] overflow-x-auto" aria-label="Specimen Selector">
            {config.points.map((pt, idx) => {
              const isSelected = pt.id === activeSpecimen.id;
              return (
                <KromaButton
                  key={pt.id}
                  variant={isSelected ? 'filled' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPointId(pt.id)}
                  className={`inline-flex items-center gap-2 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider rounded-xs border transition-all whitespace-nowrap cursor-pointer h-auto ${
                    isSelected
                      ? 'border-kroma-text dark:border-white bg-black/[0.07] dark:bg-white/[0.1] text-kroma-text dark:text-white'
                      : 'border-transparent text-kroma-muted dark:text-[#8E8E93] hover:text-kroma-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title={`Inspect node ${idx + 1}: ${pt.color}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/20 flex-shrink-0"
                    style={{ backgroundColor: pt.color }}
                  />
                  <span>0{idx + 1} {pt.color}</span>
                </KromaButton>
              );
            })}
          </div>

          {/* Specimen Body (Left: Massive Color Field / Right: Typographic & Tech Record) */}
          <div className="flex flex-col lg:flex-row min-h-[460px]">
            {/* Left Column: Massive Architectural Color Field (35–55%) */}
            <div
              className="w-full lg:w-[42%] min-h-[340px] p-6 lg:p-8 flex flex-col justify-between transition-colors duration-200 relative"
              style={{
                backgroundColor: activeSpecimen.color,
                color: bestTextColor,
              }}
            >
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider font-semibold opacity-90 gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-xs bg-black/25 backdrop-blur-xs text-white border border-white/15 shadow-xs">
                  NODE 0{selectedPointIndex + 1 || 1} • X: {activeSpecimen.x}% Y: {activeSpecimen.y}%
                </span>

                <span className="px-2 py-0.5 rounded-xs bg-black/25 backdrop-blur-xs text-white border border-white/15 shadow-xs">
                  INFLUENCE {(activeSpecimen.influence || 1.0).toFixed(1)}×
                </span>
              </div>

              <div className="flex flex-col gap-2 mt-12">
                <span
                  className="font-sans text-2xl lg:text-3xl font-extrabold uppercase tracking-tight"
                  style={{
                    textShadow: bestTextColor === '#FFFFFF'
                      ? '0 2px 8px rgba(0,0,0,0.45)'
                      : '0 1px 3px rgba(255,255,255,0.4)',
                  }}
                >
                  {specimenName}
                </span>

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <span
                    className="font-mono text-lg lg:text-xl font-bold tracking-wider"
                    style={{
                      textShadow: bestTextColor === '#FFFFFF'
                        ? '0 2px 8px rgba(0,0,0,0.45)'
                        : '0 1px 3px rgba(255,255,255,0.4)',
                    }}
                  >
                    {activeSpecimen.color}
                  </span>

                  <KromaButton
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await copyToClipboard(activeSpecimen.color);
                      setCopiedSpecimenHex(activeSpecimen.color);
                      showToast(`Copied ${activeSpecimen.color}`, specimenName, activeSpecimen.color);
                      setTimeout(() => setCopiedSpecimenHex(null), 1200);
                    }}
                    iconLeft={<Copy size={11} />}
                    className={`px-3 py-1.5 bg-black/30 hover:bg-black/45 backdrop-blur-xs text-white border border-white/25 rounded-xs font-mono text-xs font-bold tracking-wider uppercase cursor-pointer transition-all shadow-xs active:scale-95 h-auto ${
                      copiedSpecimenHex === activeSpecimen.color ? 'bg-[#34C759]! border-[#34C759]!' : ''
                    }`}
                  >
                    {copiedSpecimenHex === activeSpecimen.color ? 'COPIED' : 'COPY HEX'}
                  </KromaButton>
                </div>
              </div>
            </div>

            {/* Right Column: Typographic Study & Technical Color Record */}
            <div className="flex-1 flex flex-col border-t lg:border-t-0 lg:border-l border-black/[0.08] dark:border-white/[0.08] bg-transparent">
              {/* Typographic Study */}
              <div className="p-6 border-b border-black/[0.08] dark:border-white/[0.08] flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-xs font-bold text-[#707070] uppercase tracking-wider">
                    TYPOGRAPHIC SPECIMEN • GENERAL SANS
                  </span>
                  <span
                    className="font-mono text-xs font-bold uppercase tracking-wider"
                    style={{ color: activeSpecimen.color }}
                  >
                    PRIMARY SPECIMEN
                  </span>
                </div>

                <div className="flex items-baseline gap-4">
                  <span
                    className="font-sans text-5xl sm:text-6xl font-extrabold leading-none tracking-tighter select-none"
                    style={{ color: activeSpecimen.color }}
                  >
                    Aa
                  </span>
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-bold tracking-tight uppercase text-[#171717] dark:text-white">
                      {specimenName}
                    </span>
                    <span className="font-mono text-xs text-[#707070]">
                      KROMA CALIBRATED ARCHIVE SPECIMEN
                    </span>
                  </div>
                </div>

                <div className="font-sans text-sm sm:text-base font-semibold text-kroma-muted dark:text-[#8E8E93] tracking-widest leading-relaxed uppercase">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  <br />
                  abcdefghijklmnopqrstuvwxyz
                </div>

                <div className="font-mono text-xs text-kroma-muted dark:text-[#8E8E93] tracking-wider">
                  0123456789 • !@#$%&amp;*()_+-=~
                </div>
              </div>

              {/* Technical Color Record Grid */}
              <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
                <span className="font-mono text-xs font-bold text-[#707070] uppercase tracking-wider">
                  TECHNICAL COLOR RECORD
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-black/[0.08] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] rounded-xs overflow-hidden">
                  <div className="bg-kroma-bg dark:bg-[#141518] p-3 flex flex-col gap-1 min-w-0">
                    <span className="font-mono text-xs font-semibold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider truncate">HEX VALUE</span>
                    <span className="font-mono text-xs font-bold text-kroma-text dark:text-white truncate">{activeSpecimen.color}</span>
                  </div>

                  <div className="bg-kroma-bg dark:bg-[#141518] p-3 flex flex-col gap-1 min-w-0">
                    <span className="font-mono text-xs font-semibold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider truncate">RGB CHANNELS</span>
                    <span className="font-mono text-xs font-bold text-kroma-text dark:text-white truncate">
                      {specimenRgb ? `${specimenRgb.r} · ${specimenRgb.g} · ${specimenRgb.b}` : '—'}
                    </span>
                  </div>

                  <div className="bg-kroma-bg dark:bg-[#141518] p-3 flex flex-col gap-1 min-w-0">
                    <span className="font-mono text-xs font-semibold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider truncate">HSL SPECS</span>
                    <span className="font-mono text-xs font-bold text-kroma-text dark:text-white truncate">
                      {specimenHsl ? `${specimenHsl.h}° · ${specimenHsl.s}% · ${specimenHsl.l}%` : '—'}
                    </span>
                  </div>

                  <div className="bg-kroma-bg dark:bg-[#141518] p-3 flex flex-col gap-1 min-w-0">
                    <span className="font-mono text-xs font-semibold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider truncate">OKLCH PERCEPTUAL</span>
                    <span className="font-mono text-xs font-bold text-kroma-text dark:text-white truncate" title={specimenOklch}>
                      {specimenOklch}
                    </span>
                  </div>

                  <div className="bg-kroma-bg dark:bg-[#141518] p-3 flex flex-col gap-1 min-w-0">
                    <span className="font-mono text-xs font-semibold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider truncate">PHOTOMETRIC LUMINANCE</span>
                    <span className="font-mono text-xs font-bold text-kroma-text dark:text-white truncate">{specimenLum}</span>
                  </div>

                  <div className="bg-kroma-bg dark:bg-[#141518] p-3 flex flex-col gap-1 min-w-0">
                    <span className="font-mono text-xs font-semibold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider truncate">WCAG COMPLIANCE</span>
                    <span className="font-mono text-xs font-bold text-[#34C759] truncate">
                      {wcagRating}
                    </span>
                  </div>

                  <div className="bg-kroma-bg dark:bg-[#141518] p-3 flex flex-col gap-1 min-w-0">
                    <span className="font-mono text-xs font-semibold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider truncate">CONTRAST (WHITE / BLACK)</span>
                    <span className="font-mono text-xs font-bold text-kroma-text dark:text-white truncate">
                      {contrastWhite}:1 / {contrastBlack}:1
                    </span>
                  </div>

                  <div className="bg-kroma-bg dark:bg-[#141518] p-3 flex flex-col gap-1 min-w-0">
                    <span className="font-mono text-xs font-semibold text-kroma-muted dark:text-[#8E8E93] uppercase tracking-wider truncate">RECOMMENDED FOREGROUND</span>
                    <span className="font-mono text-xs font-bold text-kroma-text dark:text-white truncate">
                      {bestTextColor === '#FFFFFF' ? '#FFFFFF (PURE WHITE)' : '#090A0C (PURE BLACK)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeSpecimen.color}
                      onChange={(e) => handleUpdatePoint(activeSpecimen.id, { color: e.target.value.toUpperCase() })}
                      className="w-7 h-7 rounded-xs border border-black/15 cursor-pointer bg-transparent"
                      title="Adjust specimen color"
                    />
                    <span className="font-mono text-xs text-[#707070] uppercase">
                      CALIBRATE TONE
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <KromaButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleRandomizePointColor(activeSpecimen.id)}
                      iconLeft={<RefreshCw size={11} />}
                      className="rounded-xs px-2.5 py-1 font-sans text-xs font-semibold tracking-wider text-kroma-text dark:text-white"
                      title="Randomize this node's color"
                    >
                      RANDOMIZE TONE
                    </KromaButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Live Applications & Surfaces ("USE IT") ───────────── */}
      <section className="mb-12" aria-label="Live Applications">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-kroma-text dark:text-white uppercase my-0">SURFACES &amp; APPLICATIONS</h2>
            <p className="font-sans text-sm text-kroma-muted dark:text-[#8E8E93] max-w-[560px] my-1">
              Real-time generative projection across editorial, UI product, and architectural surfaces.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
            LIVE PREVIEW
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-full min-w-0 box-border">
          {/* Surface 1: Editorial Cover */}
          <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm overflow-hidden flex flex-col">
            <div
              className="h-60 w-full relative overflow-hidden flex items-center justify-center bg-[#090A0C]"
              style={{
                background: activeMeshCss ? undefined : '#090A0C',
                backgroundImage: activeMeshCss.includes('background-image:')
                  ? activeMeshCss.split('background-image:')[1]?.split(';')[0]?.trim()
                  : undefined,
              }}
            >
              <div className="border border-white/30 p-4 w-4/5 h-4/5 flex flex-col justify-between text-white drop-shadow-sm">
                <div>
                  <span className="font-mono text-xs font-bold tracking-widest uppercase">
                    KROMA MONOGRAPH • VOL. 04
                  </span>
                  <div className="font-sans text-xl font-extrabold tracking-tight mt-1">
                    ATMOSPHERICS
                  </div>
                </div>
                <div className="font-mono text-xs flex justify-between">
                  <span>SEED #{config.seed}</span>
                  <span>2026 EDITION</span>
                </div>
              </div>
            </div>
            <div className="px-3.5 py-3 font-mono text-xs font-bold text-kroma-muted dark:text-[#8E8E93] tracking-wider uppercase border-t border-black/[0.06] dark:border-white/[0.06]">
              SURFACE 01 — EDITORIAL COVER
            </div>
          </div>

          {/* Surface 2: Digital Device Glass Screen */}
          <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm overflow-hidden flex flex-col">
            <div
              className="h-60 w-full relative overflow-hidden flex items-center justify-center bg-[#090A0C]"
              style={{
                background: activeMeshCss ? undefined : '#090A0C',
                backgroundImage: activeMeshCss.includes('background-image:')
                  ? activeMeshCss.split('background-image:')[1]?.split(';')[0]?.trim()
                  : undefined,
              }}
            >
              <div className="w-3/4 h-[85%] rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 p-4 flex flex-col justify-between text-white">
                <div className="flex justify-between items-center font-mono text-xs opacity-80">
                  <span>9:41 AM</span>
                  <span>5G • 100%</span>
                </div>
                <div className="text-center my-auto">
                  <div className="font-sans text-2xl font-bold tracking-tight">KROMA</div>
                  <div className="font-mono text-xs opacity-75 mt-1">
                    {config.preset ? config.preset.toUpperCase() : `SEED #${config.seed}`}
                  </div>
                </div>
                <div className="font-mono text-xs text-center opacity-60">
                  SWIPE UP TO UNLOCK
                </div>
              </div>
            </div>
            <div className="px-3.5 py-3 font-mono text-xs font-bold text-kroma-muted dark:text-[#8E8E93] tracking-wider uppercase border-t border-black/[0.06] dark:border-white/[0.06]">
              SURFACE 02 — DIGITAL INTERFACE
            </div>
          </div>

          {/* Surface 3: Brand Identity Card */}
          <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm overflow-hidden flex flex-col">
            <div
              className="h-60 w-full relative overflow-hidden flex items-center justify-center bg-[#090A0C]"
              style={{
                background: activeMeshCss ? undefined : '#090A0C',
                backgroundImage: activeMeshCss.includes('background-image:')
                  ? activeMeshCss.split('background-image:')[1]?.split(';')[0]?.trim()
                  : undefined,
              }}
            >
              <div className="w-[82%] h-[70%] rounded-md bg-white text-kroma-text p-4 shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="font-sans text-xs font-black tracking-wider">KROMA LAB</span>
                  <span className="font-mono text-xs text-[#707070]">#4829-SPEC</span>
                </div>
                <div className="font-mono text-xs text-[#707070] flex flex-col gap-0.5">
                  <span className="font-bold text-[#171717]">CHROMATIC EMITTER</span>
                  <span>{config.points.length} RADIAL MATRIX STEPS</span>
                </div>
              </div>
            </div>
            <div className="px-3.5 py-3 font-mono text-xs font-bold text-kroma-muted dark:text-[#8E8E93] tracking-wider uppercase border-t border-black/[0.06] dark:border-white/[0.06]">
              SURFACE 03 — BRAND IDENTITY
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Code Export & Tokens Area ────────────────────────── */}
      <section className="mb-12" aria-label="Export Code">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-kroma-text dark:text-white uppercase my-0">EXPORT YOUR GRADIENT</h2>
            <p className="font-sans text-sm text-kroma-muted dark:text-[#8E8E93] max-w-[560px] my-1">
              Production-ready radial CSS declaration, standalone SVG vector, DTCG tokens, and LLM prompt.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
            TOKENS &amp; CODE
          </span>
        </div>

        <div className="bg-kroma-bg dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-sm p-6 flex flex-col gap-4 w-full max-w-full min-w-0 box-border">
          {/* Format Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {(
              [
                { id: 'css', label: 'CSS RADIAL', icon: <Code size={12} /> },
                { id: 'svg', label: 'SVG VECTOR', icon: <Code size={12} /> },
                { id: 'dtcg', label: 'DTCG JSON', icon: <FileJson size={12} /> },
                { id: 'agent', label: 'AGENT PROMPT', icon: <Cpu size={12} /> },
              ] as const
            ).map((t) => (
              <KromaButton
                key={t.id}
                variant={activeExportTab === t.id ? 'filled' : 'ghost'}
                size="sm"
                onClick={() => setActiveExportTab(t.id)}
                iconLeft={t.icon}
                className={`px-3.5 py-1.5 font-mono text-xs font-semibold uppercase border rounded-xs transition-colors cursor-pointer h-auto ${
                  activeExportTab === t.id
                    ? 'bg-kroma-text! text-white! border-kroma-text! dark:bg-white! dark:text-kroma-text! dark:border-white!'
                    : 'border-black/15 dark:border-white/15 bg-transparent text-kroma-muted hover:text-kroma-text dark:text-[#8E8E93] dark:hover:text-white'
                }`}
              >
                {t.label}
              </KromaButton>
            ))}
          </div>

          {/* Code Viewer Block */}
          <pre className="font-mono text-xs bg-black/[0.03] dark:bg-white/[0.04] p-3.5 rounded-xs overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words text-kroma-text dark:text-[#E0E0E0] max-h-40 w-full max-w-full min-w-0 box-border border border-black/5 dark:border-white/5">
            <code>{exportCodes[activeExportTab]}</code>
          </pre>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <KromaButton
              variant="filled"
              size="md"
              onClick={() => handleCopyExport(activeExportTab)}
              iconLeft={copiedCodeFormat === activeExportTab ? <Check size={13} /> : <Copy size={13} />}
              className="rounded-xs px-6 py-2.5 font-sans text-sm font-semibold tracking-wider uppercase active:scale-98"
            >
              {copiedCodeFormat === activeExportTab ? 'COPIED TO CLIPBOARD' : 'COPY CODE'}
            </KromaButton>

            {activeExportTab === 'svg' && (
              <KromaButton
                variant="outline"
                size="sm"
                onClick={handleDownloadSvgFile}
                iconLeft={<Download size={13} />}
                className="rounded-xs px-3.5 py-2 font-sans text-xs font-semibold tracking-wider text-kroma-text dark:text-white"
                title="Download .svg file"
              >
                DOWNLOAD .SVG
              </KromaButton>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
