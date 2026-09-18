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
} from '../utils/meshEngine';
import { StudioWorkspace } from '../components/studio/StudioWorkspace';
import { StudioTopBar, StudioExportOption } from '../components/studio/StudioTopBar';
import { MeshHeroCanvas } from '../components/mesh/MeshHeroCanvas';
import { MeshContextualInspector } from '../components/mesh/MeshContextualInspector';
import { SEOHead } from '../components/seo/SEOHead';
import { Code, FileJson, Sparkles, Palette } from 'lucide-react';

interface MeshGradientStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialParams?: Record<string, string | undefined>;
}

export const MeshGradientStudioPage: React.FC<MeshGradientStudioPageProps> = ({
  onNavigate,
}) => {
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
  const [showGridLines, setShowGridLines] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  useEffect(() => {
    const qs = serializeMeshConfig(config);
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [config]);

  const sourceUrl = useMemo(() => {
    const qs = serializeMeshConfig(config);
    return `https://kroma.design/mesh${qs ? `?${qs}` : ''}`;
  }, [config]);

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
    const updated = { ...config, ...patch };
    pushState(updated);
  }, [config, pushState]);

  const handleUpdatePoint = useCallback((id: string, patch: Partial<MeshPoint>) => {
    const updatedPoints = config.points.map((p) => (p.id === id ? { ...p, ...patch } : p));
    const updated = { ...config, points: updatedPoints, preset: null };
    setConfig(updated);
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

  const handleShareUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasCopiedShare(true);
    setTimeout(() => setHasCopiedShare(false), 2000);
  }, []);

  const selectedPoint = useMemo(() => {
    return config.points.find((p) => p.id === selectedPointId) || null;
  }, [config.points, selectedPointId]);

  const selectedPointIndex = useMemo(() => {
    return config.points.findIndex((p) => p.id === selectedPointId);
  }, [config.points, selectedPointId]);

  const exportOptions: StudioExportOption[] = useMemo(() => [
    {
      id: 'css',
      label: 'CSS Radial Gradients',
      sublabel: 'background-image',
      icon: <Code size={13} />,
      onExport: () => {
        const css = generateMeshCss(config);
        navigator.clipboard.writeText(css);
      },
    },
    {
      id: 'svg',
      label: 'SVG Vector Specimen',
      sublabel: '<svg> radial',
      icon: <Code size={13} />,
      onExport: () => {
        const svg = generateMeshSvg(config, 1200, 800);
        navigator.clipboard.writeText(svg);
      },
    },
    {
      id: 'dtcg',
      label: 'DTCG Design Tokens',
      sublabel: 'W3C JSON',
      icon: <FileJson size={13} />,
      onExport: () => {
        const dtcg = generateMeshTokensJson(config, sourceUrl);
        navigator.clipboard.writeText(dtcg);
      },
    },
    {
      id: 'agent',
      label: 'Coding Agent Prompt',
      sublabel: 'LLM Context',
      icon: <Sparkles size={13} />,
      onExport: () => {
        const prompt = generateMeshAgentPrompt(config, sourceUrl);
        navigator.clipboard.writeText(prompt);
      },
    },
  ], [config, sourceUrl]);

  return (
    <div className="w-full flex flex-col">
      <SEOHead
        title="Mesh Gradient Studio — Interactive Gradient Editor"
        description="Create, edit, and experiment with multi-point radial mesh gradients. Directly manipulate color nodes on canvas, adjust softness, and export to CSS, SVG, PNG, and design tokens."
        canonicalPath="/mesh"
      />

      <StudioWorkspace
        topBar={
          <StudioTopBar
            studioName="Mesh Gradient"
            documentTitle={config.preset ? config.preset : `Seed #${config.seed}`}
            onRandomize={handleRandomize}
            onReset={handleReset}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onShareUrl={handleShareUrl}
            hasCopiedShare={hasCopiedShare}
            exportOptions={exportOptions}
            toggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
            isInspectorOpen={isInspectorOpen}
          />
        }
        canvas={
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
        }
        inspector={
          isInspectorOpen ? (
            <MeshContextualInspector
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
              onSelectPreset={handleSelectPreset}
              sourceUrl={sourceUrl}
            />
          ) : undefined
        }
        statusBar={
          <div className="flex items-center gap-2 w-full">
            <Palette size={11} className="text-[var(--color-primary)]" />
            <span>{config.points.length} nodes · Seed #{config.seed} · {viewMode === 'edit' ? 'Editing' : 'Preview'}</span>
          </div>
        }
      />
    </div>
  );
};
