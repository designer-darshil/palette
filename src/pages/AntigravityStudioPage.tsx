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
import { AntigravityHeroCanvas } from '../components/antigravity/AntigravityHeroCanvas';
import { AntigravityInspector } from '../components/antigravity/AntigravityInspector';
import { SEOHead } from '../components/seo/SEOHead';
import { Code, FileJson, Sparkles, Activity } from 'lucide-react';

interface AntigravityStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialParams?: Record<string, string | undefined>;
}

export const AntigravityStudioPage: React.FC<AntigravityStudioPageProps> = ({
  onNavigate,
}) => {
  const [config, setConfig] = useState<AntigravityConfig>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return deserializeAntigravityConfig(searchParams);
  });

  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  const [history, setHistory] = useState<AntigravityConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

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
            studioName="Antigravity"
            documentTitle={config.preset ? config.preset.replace('-', ' ') : 'Custom Kinematics'}
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
              onSelectPreset={handleSelectPreset}
              sourceUrl={sourceUrl}
            />
          ) : undefined
        }
        statusBar={
          <div className="flex items-center gap-2 w-full">
            <Activity size={11} className="text-[var(--color-primary)]" />
            <span>Mass: {config.mass}kg · G: ({config.gravityX}, {config.gravityY}) · Bounce: {Math.round(config.restitution * 100)}%</span>
          </div>
        }
      />
    </div>
  );
};
