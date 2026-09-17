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
import { RampsHeader } from '../components/ramps/RampsHeader';
import { PhysicsStage } from '../components/antigravity/PhysicsStage';
import { PhysicsControls } from '../components/antigravity/PhysicsControls';
import { PresetSelector } from '../components/antigravity/PresetSelector';
import { SimulationInspector } from '../components/antigravity/SimulationInspector';
import { AntigravityCodeExport } from '../components/antigravity/AntigravityCodeExport';
import { AntigravityApiDocs } from '../components/antigravity/AntigravityApiDocs';
import { RampsStudioFamily } from '../components/ramps/RampsStudioFamily';
import { SEOHead } from '../components/seo/SEOHead';
import { Sparkles, Activity, ShieldCheck, Terminal, Layers } from 'lucide-react';

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

  // Inject agent-readable JSON script tag into head/body for headless crawlers
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

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col antialiased selection:bg-[var(--text-primary)] selection:text-[var(--text-inverse)]">
      <SEOHead
        title="Antigravity — Physics Motion &amp; Token Generator"
        description="Create and tune physics-driven UI motion for the web. Experiment with gravity, velocity, bounce, damping, and inertia, then export as CSS, JavaScript, Framer Motion, and design tokens."
        canonicalPath="/antigravity"
      />

      {/* Studio Header */}
      <RampsHeader
        onNavigate={onNavigate}
        onCopyPrompt={handleCopyPrompt}
        hasCopiedPrompt={hasCopiedPrompt}
        onScrollToSection={handleScrollToSection}
        currentTool="antigravity"
      />

      {/* Main Content Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-10">
        {/* Intro Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse" />
            <span>Deterministic Physics Generator</span>
            <span>·</span>
            <span>Studio Tools Ecosystem</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-3xl leading-[1.15]">
            Create physics-driven motion for the web.
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
            Tune acceleration, upward buoyancy, mass, restitution bounce, and fluid damping in real-time. Export motion profiles to pure CSS animations, standalone JavaScript simulation loops, and W3C DTCG tokens.
          </p>
        </section>

        {/* Primary Interactive Playground & Controls Grid */}
        <section id="antigravity-playground" className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
          {/* Mobile Preview First / Desktop Right Column: Physics Stage */}
          <div className="order-1 lg:order-2 lg:col-span-7 w-full flex flex-col gap-4">
            <PhysicsStage config={config} onStateUpdate={setTelemetry} />
            <SimulationInspector config={config} telemetry={telemetry} />
          </div>

          {/* Mobile Controls Second / Desktop Left Column: Parameters */}
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
        <RampsStudioFamily onNavigate={onNavigate} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-surface-1)] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-tertiary)]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--text-primary)]">Antigravity Studio</span>
            <span>·</span>
            <span>Studio Tools Ecosystem</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] underline">
              /llms.txt
            </a>
            <button onClick={() => onNavigate({ path: 'ramps' })} className="hover:text-[var(--text-primary)]">
              Ramps (Colors)
            </button>
            <button onClick={() => onNavigate({ path: 'home' })} className="hover:text-[var(--text-primary)]">
              Library Home
            </button>
            <button onClick={() => onNavigate({ path: 'palette-generator' })} className="hover:text-[var(--text-primary)]">
              Generator
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
