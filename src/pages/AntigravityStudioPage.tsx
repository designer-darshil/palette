import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RouteType } from '../types';
import {
  AntigravityConfig,
  DEFAULT_ANTIGRAVITY_CONFIG,
  ANTIGRAVITY_PRESETS,
  SimulationState,
  serializeAntigravityConfig,
  deserializeAntigravityConfig,
  generateAgentPrompt,
} from '../utils/antigravityEngine';
import { PhysicsStage } from '../components/antigravity/PhysicsStage';
import { PhysicsControls } from '../components/antigravity/PhysicsControls';
import { PresetSelector } from '../components/antigravity/PresetSelector';
import { AntigravityCodeExport } from '../components/antigravity/AntigravityCodeExport';
import { AntigravityApiDocs } from '../components/antigravity/AntigravityApiDocs';
import { RampsStudioFamily } from '../components/ramps/RampsStudioFamily';
import { StudioIntro } from '../components/studio/StudioIntro';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SEOHead } from '../components/seo/SEOHead';

interface AntigravityStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialParams?: Record<string, string | undefined>;
}

export const AntigravityStudioPage: React.FC<AntigravityStudioPageProps> = ({
  onNavigate,
}) => {
  // Parse state from URL search params or fallback props
  const [config, setConfig] = useState<AntigravityConfig>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return deserializeAntigravityConfig(searchParams);
  });

  const [hasCopiedPrompt, setHasCopiedPrompt] = useState(false);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

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
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = ANTIGRAVITY_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setConfig((prev) => ({
        ...prev,
        ...preset.config,
        preset: presetId,
      }));
    }
  }, []);

  const handleRandomize = useCallback(() => {
    const randomPresets = ANTIGRAVITY_PRESETS.map((p) => p.id);
    const pick = randomPresets[Math.floor(Math.random() * randomPresets.length)];
    handleSelectPreset(pick);
  }, [handleSelectPreset]);

  const handleResetSettings = useCallback(() => {
    setConfig({ ...DEFAULT_ANTIGRAVITY_CONFIG });
  }, []);

  const handleCopyPrompt = useCallback(() => {
    const prompt = generateAgentPrompt(config, sourceUrl);
    navigator.clipboard.writeText(prompt);
    setHasCopiedPrompt(true);
    setTimeout(() => setHasCopiedPrompt(false), 2000);
  }, [config, sourceUrl]);

  const handleShareUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasCopiedShare(true);
    setTimeout(() => setHasCopiedShare(false), 2000);
  }, []);

  // Inject agent-readable JSON script tag for headless crawlers
  useEffect(() => {
    let scriptTag = document.getElementById('antigravity-studio-motion') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'antigravity-studio-motion';
      scriptTag.type = 'application/json';
      document.body.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(
      {
        version: '1.0',
        tool: 'antigravity',
        source: sourceUrl,
        config,
      },
      null,
      2
    );
  }, [config, sourceUrl]);

  return (
    <div className="flex flex-col gap-8">
      <SEOHead
        title="Antigravity — Physics Motion & Token Generator"
        description="Create and tune physics-driven UI motion for the web. Experiment with gravity, velocity, bounce, damping, and inertia, then export as CSS, JavaScript, Framer Motion, and design tokens."
        canonicalPath="/antigravity"
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Library Home', to: { path: 'home' } },
          { label: 'Studio Tools' },
          { label: 'Antigravity Studio', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Studio Header & Top Action Toolbar */}
      <StudioIntro
        category="Studio Utility"
        badge="Kinematics & Motion Engine"
        title="Antigravity Studio"
        description="A physics and motion playground for frontend architects. Experiment with gravity, inertia, damping, and bounce, then export directly to CSS keyframes, JavaScript, and DTCG design tokens."
        onRandomize={handleRandomize}
        onReset={handleResetSettings}
        onCopyPrompt={handleCopyPrompt}
        hasCopiedPrompt={hasCopiedPrompt}
        onShareUrl={handleShareUrl}
        hasCopiedShare={hasCopiedShare}
      />

      {/* 1. Dominant Hero Playground with Integrated Controls & Telemetry */}
      <section id="antigravity-playground" className="w-full flex flex-col gap-6">
        <PhysicsStage config={config} />

        {/* 2. Sleek Horizontal Presets Rail */}
        <PresetSelector activePreset={config.preset} onSelectPreset={handleSelectPreset} />

        {/* 3. Streamlined Parameter Inspector */}
        <PhysicsControls
          config={config}
          onChange={handleConfigChange}
        />
      </section>

      {/* 4. Developer Code & Design Token Export */}
      <AntigravityCodeExport config={config} sourceUrl={sourceUrl} />

      {/* 5. Machine Contract & API Documentation */}
      <AntigravityApiDocs config={config} />

      {/* 6. Studio Tools Ecosystem Sibling Hub */}
      <RampsStudioFamily onNavigate={onNavigate} currentTool="antigravity" />
    </div>
  );
};
