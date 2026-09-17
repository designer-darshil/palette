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
import { SimulationInspector } from '../components/antigravity/SimulationInspector';
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
  initialParams,
}) => {
  // Parse state from URL search params or fallback props
  const [config, setConfig] = useState<AntigravityConfig>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return deserializeAntigravityConfig(searchParams);
  });

  const [hasCopiedPrompt, setHasCopiedPrompt] = useState(false);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  // Telemetry HUD data from PhysicsStage
  const [telemetry, setTelemetry] = useState<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    state: SimulationState;
  }>({
    x: 300,
    y: 200,
    vx: 25,
    vy: 0,
    speed: 25,
    state: 'playing',
  });

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

      {/* Studio Header & Intro */}
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

      {/* Primary Interactive Playground & Controls Grid */}
      <section id="antigravity-playground" className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
        {/* Stage & Live Telemetry Inspector */}
        <div className="order-1 lg:order-2 lg:col-span-7 w-full flex flex-col gap-4">
          <PhysicsStage config={config} onStateUpdate={setTelemetry} />
          <SimulationInspector config={config} telemetry={telemetry} />
        </div>

        {/* Physics Sliders & Shape Controls */}
        <div className="order-2 lg:order-1 lg:col-span-5 w-full flex flex-col gap-4">
          <PhysicsControls
            config={config}
            onChange={handleConfigChange}
            onRandomize={handleRandomize}
            onResetSettings={handleResetSettings}
            onShareUrl={handleShareUrl}
            hasCopiedShare={hasCopiedShare}
          />
        </div>
      </section>

      {/* 2. Curated Presets Gallery */}
      <PresetSelector activePreset={config.preset} onSelectPreset={handleSelectPreset} />

      {/* 3. Developer Code & Design Token Export */}
      <AntigravityCodeExport config={config} sourceUrl={sourceUrl} />

      {/* 4. Machine Contract & API Documentation */}
      <AntigravityApiDocs config={config} />

      {/* 5. Studio Tools Ecosystem Sibling Hub */}
      <RampsStudioFamily onNavigate={onNavigate} currentTool="antigravity" />
    </div>
  );
};
