import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RouteType } from '../types';
import {
  AntigravityConfig,
  DEFAULT_ANTIGRAVITY_CONFIG,
  ANTIGRAVITY_PRESETS,
  serializeAntigravityConfig,
  deserializeAntigravityConfig,
  generateAgentPrompt,
  generateCssExport,
  generateJsExport,
  generateMotionTokens,
} from '../utils/antigravityEngine';
import { StudioWorkspace } from '../components/studio/StudioWorkspace';
import { StudioTopBar, StudioExportOption } from '../components/studio/StudioTopBar';
import { StudioPresetRail, StudioPresetItem } from '../components/studio/StudioPresetRail';
import { AntigravityHeroCanvas } from '../components/antigravity/AntigravityHeroCanvas';
import { AntigravityInspector } from '../components/antigravity/AntigravityInspector';
import { AntigravityBottomDock } from '../components/antigravity/AntigravityBottomDock';
import { SEOHead } from '../components/seo/SEOHead';
import { Code, FileJson, Sparkles, Compass, Play, ArrowDown, Feather } from 'lucide-react';

interface AntigravityStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialParams?: Record<string, string | undefined>;
}

export const AntigravityStudioPage: React.FC<AntigravityStudioPageProps> = ({
  onNavigate,
}) => {
  // Parse state from URL search params or fallback
  const [config, setConfig] = useState<AntigravityConfig>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return deserializeAntigravityConfig(searchParams);
  });

  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<AntigravityConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // URL state synchronization via replaceState
  useEffect(() => {
    const qs = serializeAntigravityConfig(config);
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [config]);

  const sourceUrl = useMemo(() => {
    const qs = serializeAntigravityConfig(config);
    return `https://kroma.design/antigravity${qs ? `?${qs}` : ''}`;
  }, [config]);

  const handleConfigChange = useCallback((patch: Partial<AntigravityConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      setHistory((h) => [...h.slice(0, historyIndex + 1), next]);
      setHistoryIndex((idx) => idx + 1);
      return next;
    });
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setConfig(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setConfig(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = ANTIGRAVITY_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      handleConfigChange({
        ...preset.config,
        preset: presetId,
      });
    }
  }, [handleConfigChange]);

  const handleRandomize = useCallback(() => {
    const randomPresets = ANTIGRAVITY_PRESETS.map((p) => p.id);
    const pick = randomPresets[Math.floor(Math.random() * randomPresets.length)];
    handleSelectPreset(pick);
  }, [handleSelectPreset]);

  const handleResetSettings = useCallback(() => {
    handleConfigChange({ ...DEFAULT_ANTIGRAVITY_CONFIG });
  }, [handleConfigChange]);

  const handleShareUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasCopiedShare(true);
    setTimeout(() => setHasCopiedShare(false), 2000);
  }, []);

  // Presets mapped to StudioPresetRail format with visual icons
  const presetItems: StudioPresetItem[] = useMemo(() => {
    return ANTIGRAVITY_PRESETS.map((p) => {
      let icon = <Compass size={18} className="text-[var(--color-primary)]" />;
      if (p.id.includes('float') || p.id.includes('weightless')) icon = <Feather size={18} className="text-cyan-400" />;
      if (p.id.includes('drop') || p.id.includes('heavy')) icon = <ArrowDown size={18} className="text-amber-400" />;
      if (p.id.includes('bounce') || p.id.includes('hyper')) icon = <Sparkles size={18} className="text-pink-400" />;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        previewNode: (
          <div className="flex flex-col items-center justify-center gap-1">
            {icon}
            <span className="font-mono text-[9px] text-[var(--text-tertiary)]">
              G:{p.config.gravityY ?? 0} · M:{p.config.mass ?? 1}
            </span>
          </div>
        ),
      };
    });
  }, []);

  // Export options for top bar dropdown
  const exportOptions: StudioExportOption[] = useMemo(() => [
    {
      id: 'keyframes',
      label: 'CSS @keyframes Motion',
      sublabel: 'Pure CSS',
      icon: <Code size={13} />,
      onExport: () => {
        const css = generateCssExport(config, sourceUrl);
        navigator.clipboard.writeText(css);
      },
    },
    {
      id: 'js',
      label: 'JavaScript Physics Engine',
      sublabel: 'requestAnimationFrame',
      icon: <Code size={13} />,
      onExport: () => {
        const js = generateJsExport(config, sourceUrl);
        navigator.clipboard.writeText(js);
      },
    },
    {
      id: 'dtcg',
      label: 'DTCG Motion Tokens',
      sublabel: 'W3C JSON',
      icon: <FileJson size={13} />,
      onExport: () => {
        const dtcg = JSON.stringify(generateMotionTokens(config), null, 2);
        navigator.clipboard.writeText(dtcg);
      },
    },
    {
      id: 'agent',
      label: 'Coding Agent Prompt',
      sublabel: 'LLM Context',
      icon: <Sparkles size={13} />,
      onExport: () => {
        const prompt = generateAgentPrompt(config, sourceUrl);
        navigator.clipboard.writeText(prompt);
      },
    },
  ], [config, sourceUrl]);

  return (
    <div className="w-full flex flex-col">
      <SEOHead
        title="Antigravity — Physics Motion & Token Generator"
        description="Create and tune physics-driven UI motion for the web. Experiment with gravity, velocity, bounce, damping, and inertia, then export as CSS, JavaScript, Framer Motion, and design tokens."
        canonicalPath="/antigravity"
      />

      <StudioWorkspace
        topBar={
          <StudioTopBar
            studioName="Antigravity Studio"
            documentTitle={config.preset ? config.preset.toUpperCase() : 'CUSTOM KINEMATICS'}
            badge="Physics Engine"
            onRandomize={handleRandomize}
            onReset={handleResetSettings}
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
        leftRail={
          <StudioPresetRail
            title="PHYSICS PRESETS"
            presets={presetItems}
            selectedPresetId={config.preset || undefined}
            onSelectPreset={handleSelectPreset}
          />
        }
        canvas={
          <AntigravityHeroCanvas
            config={config}
            onConfigChange={handleConfigChange}
          />
        }
        inspector={
          isInspectorOpen ? (
            <AntigravityInspector
              config={config}
              onChange={handleConfigChange}
            />
          ) : undefined
        }
        bottomBar={
          <AntigravityBottomDock config={config} />
        }
      />
    </div>
  );
};
