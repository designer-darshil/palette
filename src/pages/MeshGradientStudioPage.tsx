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
  hslToHex,
} from '../utils/meshEngine';
import { MeshCanvas } from '../components/mesh/MeshCanvas';
import { MeshInspector } from '../components/mesh/MeshInspector';
import { MeshPresetRail } from '../components/mesh/MeshPresetRail';
import { MeshToolbar } from '../components/mesh/MeshToolbar';
import { MeshCodeExport } from '../components/mesh/MeshCodeExport';
import { MeshApiDocs } from '../components/mesh/MeshApiDocs';
import { RampsStudioFamily } from '../components/ramps/RampsStudioFamily';
import { StudioIntro } from '../components/studio/StudioIntro';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SEOHead } from '../components/seo/SEOHead';

interface MeshGradientStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialParams?: Record<string, string | undefined>;
}

export const MeshGradientStudioPage: React.FC<MeshGradientStudioPageProps> = ({
  onNavigate,
}) => {
  // Parse state from URL search params
  const [config, setConfig] = useState<MeshGradientConfig>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return deserializeMeshConfig(searchParams);
  });

  // Undo / Redo History Stack
  const [history, setHistory] = useState<MeshGradientConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Selected Point ID
  const [selectedPointId, setSelectedPointId] = useState<string | null>(() => {
    return config.points[0]?.id || null;
  });

  // Canvas View Mode & Grid Guidelines
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showGridLines, setShowGridLines] = useState(true);

  // Share & Prompt Copy Feedback
  const [hasCopiedPrompt, setHasCopiedPrompt] = useState(false);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  // Synchronize state changes to URL query parameters
  useEffect(() => {
    const qs = serializeMeshConfig(config);
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [config]);

  const sourceUrl = useMemo(() => {
    const qs = serializeMeshConfig(config);
    return `https://kroma.design/mesh${qs ? `?${qs}` : ''}`;
  }, [config]);

  // Push new state to undo/redo history
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

  // Patch Config
  const handleConfigChange = useCallback((patch: Partial<MeshGradientConfig>) => {
    const updated = { ...config, ...patch };
    pushState(updated);
  }, [config, pushState]);

  // Point Manipulation Handlers
  const handleUpdatePoint = useCallback((id: string, patch: Partial<MeshPoint>) => {
    const updatedPoints = config.points.map((p) => (p.id === id ? { ...p, ...patch } : p));
    const updated = { ...config, points: updatedPoints, preset: null };
    setConfig(updated); // direct update for smooth dragging
  }, [config]);

  const handleAddPoint = useCallback((x: number, y: number) => {
    const randomHue = Math.floor(Math.random() * 360);
    const randomHex = hslToHex(randomHue, 75, 55);
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
  }, [config, pushState]);

  const handleDeletePoint = useCallback((id: string) => {
    if (config.points.length <= 2) return;
    const remaining = config.points.filter((p) => p.id !== id);
    const updated = { ...config, points: remaining, preset: null };
    pushState(updated);
    if (selectedPointId === id) {
      setSelectedPointId(remaining[0]?.id || null);
    }
  }, [config, pushState, selectedPointId]);

  const handleDuplicatePoint = useCallback((id: string) => {
    const target = config.points.find((p) => p.id === id);
    if (!target) return;
    const duplicate: MeshPoint = {
      ...target,
      id: `pt-${Date.now()}`,
      x: Math.min(95, target.x + 6),
      y: Math.min(95, target.y + 6),
    };
    const updated = {
      ...config,
      points: [...config.points, duplicate],
      preset: null,
    };
    pushState(updated);
    setSelectedPointId(duplicate.id);
  }, [config, pushState]);

  const handleRandomizePointColor = useCallback((id: string) => {
    const randomHue = Math.floor(Math.random() * 360);
    const randomHex = hslToHex(randomHue, 80, 50);
    handleUpdatePoint(id, { color: randomHex });
  }, [handleUpdatePoint]);

  // Preset Selection
  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = MESH_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const updated: MeshGradientConfig = {
        ...config,
        ...preset.config,
        preset: presetId,
      };
      pushState(updated);
      if (updated.points.length > 0) {
        setSelectedPointId(updated.points[0].id);
      }
    }
  }, [config, pushState]);

  // Seed & Randomize
  const handleRandomize = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 90000) + 10000;
    const count = config.points.length >= 3 ? config.points.length : 6;
    const newPoints = generateRandomMesh(newSeed, count);
    const updated: MeshGradientConfig = {
      ...config,
      seed: newSeed,
      points: newPoints,
      preset: null,
    };
    pushState(updated);
    if (newPoints.length > 0) {
      setSelectedPointId(newPoints[0].id);
    }
  }, [config, pushState]);

  const handleSeedChange = useCallback((seed: number) => {
    const count = config.points.length >= 3 ? config.points.length : 6;
    const newPoints = generateRandomMesh(seed, count);
    const updated: MeshGradientConfig = {
      ...config,
      seed,
      points: newPoints,
      preset: null,
    };
    pushState(updated);
  }, [config, pushState]);

  // Grid Generation
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
  }, [config, pushState]);

  const handleReset = useCallback(() => {
    pushState({ ...DEFAULT_MESH_CONFIG });
    setSelectedPointId(DEFAULT_MESH_CONFIG.points[0].id);
  }, [pushState]);

  const handleCopyPrompt = useCallback(() => {
    const prompt = generateMeshAgentPrompt(config, sourceUrl);
    navigator.clipboard.writeText(prompt);
    setHasCopiedPrompt(true);
    setTimeout(() => setHasCopiedPrompt(false), 2000);
  }, [config, sourceUrl]);

  const handleShareUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasCopiedShare(true);
    setTimeout(() => setHasCopiedShare(false), 2000);
  }, []);

  // Selected Point Object & Index
  const selectedPoint = useMemo(() => {
    return config.points.find((p) => p.id === selectedPointId) || null;
  }, [config.points, selectedPointId]);

  const selectedPointIndex = useMemo(() => {
    return config.points.findIndex((p) => p.id === selectedPointId);
  }, [config.points, selectedPointId]);

  return (
    <div className="flex flex-col gap-8">
      <SEOHead
        title="Mesh Gradient Studio — Interactive Gradient Editor"
        description="Create, edit, and experiment with multi-point radial mesh gradients. Directly manipulate color nodes on canvas, adjust softness, and export to CSS, SVG, PNG, and design tokens."
        canonicalPath="/mesh"
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Library Home', to: { path: 'home' } },
          { label: 'Studio Tools' },
          { label: 'Mesh Gradient Studio', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Studio Header & Top Action Toolbar */}
      <StudioIntro
        category="Studio Creative"
        badge="Multi-Point Mesh Generator"
        title="Mesh Gradient Studio"
        description="A visual editor for multi-point mesh gradients. Directly drag nodes on canvas, fine-tune individual colors and falloff dynamics, and export clean CSS, SVG vectors, and DTCG design tokens."
        onRandomize={handleRandomize}
        onReset={handleReset}
        onCopyPrompt={handleCopyPrompt}
        hasCopiedPrompt={hasCopiedPrompt}
        onShareUrl={handleShareUrl}
        hasCopiedShare={hasCopiedShare}
      />

      {/* Studio Secondary Toolbar (Undo, Redo, Seed, Reset, Share) */}
      <MeshToolbar
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        seed={config.seed}
        onSeedChange={handleSeedChange}
        onRandomize={handleRandomize}
        onReset={handleReset}
        onShareUrl={handleShareUrl}
        hasCopiedShare={hasCopiedShare}
        onCopyPrompt={handleCopyPrompt}
        hasCopiedPrompt={hasCopiedPrompt}
      />

      {/* PRIMARY STUDIO WORKSPACE (Split Canvas & Inspector) */}
      <section id="mesh-studio-workspace" className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Hero Canvas & Preset Rail (8 Cols on Desktop) */}
        <div className="w-full lg:col-span-8 flex flex-col gap-4">
          <MeshCanvas
            config={config}
            selectedPointId={selectedPointId}
            onSelectPoint={setSelectedPointId}
            onUpdatePoint={handleUpdatePoint}
            onAddPoint={handleAddPoint}
            onDeletePoint={handleDeletePoint}
            onRandomize={handleRandomize}
            viewMode={viewMode}
            showGridLines={showGridLines}
            onToggleGridLines={() => setShowGridLines(!showGridLines)}
            onToggleViewMode={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
          />

          {/* Curated Presets Horizontal Rail */}
          <MeshPresetRail
            activePreset={config.preset}
            onSelectPreset={handleSelectPreset}
          />
        </div>

        {/* Right Column: Unified Inspector Sidebar (4 Cols on Desktop) */}
        <div className="w-full lg:col-span-4 flex flex-col gap-4">
          <MeshInspector
            config={config}
            selectedPoint={selectedPoint}
            selectedPointIndex={selectedPointIndex}
            onSelectPoint={setSelectedPointId}
            onUpdatePoint={handleUpdatePoint}
            onDuplicatePoint={handleDuplicatePoint}
            onDeletePoint={handleDeletePoint}
            onRandomizePointColor={handleRandomizePointColor}
            onChangeConfig={handleConfigChange}
            onGenerateGrid={handleGenerateGrid}
            onAddPoint={handleAddPoint}
          />
        </div>
      </section>

      {/* Code, Vector & Image Export Panel */}
      <MeshCodeExport config={config} sourceUrl={sourceUrl} />

      {/* Developer REST API Documentation */}
      <MeshApiDocs config={config} />

      {/* Studio Tools Ecosystem Sibling Hub */}
      <RampsStudioFamily onNavigate={onNavigate} currentTool="mesh" />
    </div>
  );
};
