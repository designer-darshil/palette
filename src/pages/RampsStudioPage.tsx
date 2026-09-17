import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RouteType } from '../types';
import {
  RampsConfig,
  RampsScope,
  RampsScheme,
  RampsWcag,
  RampsNotation,
  RampsVividness,
  generateFullRampsSystem,
  normalizeHex,
  isValidHex,
  exportToAgentPrompt,
} from '../utils/rampsEngine';
import { RampsGeneratorControls } from '../components/ramps/RampsGeneratorControls';
import { RampsPaletteGrid } from '../components/ramps/RampsPaletteGrid';
import { RampsSemanticTokensTable } from '../components/ramps/RampsSemanticTokensTable';
import { RampsLiveUiPreview } from '../components/ramps/RampsLiveUiPreview';
import { RampsCodeExport } from '../components/ramps/RampsCodeExport';
import { RampsApiDocs } from '../components/ramps/RampsApiDocs';
import { RampsStudioFamily } from '../components/ramps/RampsStudioFamily';
import { StudioIntro } from '../components/studio/StudioIntro';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SEOHead } from '../components/seo/SEOHead';
import { Info } from 'lucide-react';

interface RampsStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialParams?: {
    b?: string;
    a?: string;
    a2?: string;
    m?: string;
    s?: string;
    c?: string;
    f?: string;
    v?: string;
    xr?: string;
    xt?: string;
  };
}

export const RampsStudioPage: React.FC<RampsStudioPageProps> = ({ onNavigate, initialParams }) => {
  // Parse initial state from URL or props
  const [config, setConfig] = useState<RampsConfig>(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const b = searchParams.get('b') || initialParams?.b || '3d7dff';
    const a = searchParams.get('a') || initialParams?.a || null;
    const a2 = searchParams.get('a2') || initialParams?.a2 || null;
    const m = (searchParams.get('m') || initialParams?.m || 'full') as RampsScope;
    const s = (searchParams.get('s') || initialParams?.s || 'complementary') as RampsScheme;
    const c = (searchParams.get('c') || initialParams?.c || 'AA') as RampsWcag;
    const f = (searchParams.get('f') || initialParams?.f || 'oklch') as RampsNotation;
    const v = (searchParams.get('v') || initialParams?.v || 'natural') as RampsVividness;
    const xr = (searchParams.get('xr') || initialParams?.xr || '').split('.').filter(Boolean);
    const xt = (searchParams.get('xt') || initialParams?.xt || '').split('.').filter(Boolean);

    return {
      brand: normalizeHex(b) || '3d7dff',
      accent: a && isValidHex(a) ? normalizeHex(a) : null,
      accent2: a2 && isValidHex(a2) ? normalizeHex(a2) : null,
      scope: m === 'basic' ? 'basic' : 'full',
      scheme: ['complementary', 'analogous', 'triadic', 'split', 'monochromatic'].includes(s) ? s : 'complementary',
      wcag: c === 'AAA' ? 'AAA' : 'AA',
      notation: ['oklch', 'hex', 'rgb', 'hsl'].includes(f) ? f : 'oklch',
      vividness: v === 'bold' ? 'bold' : 'natural',
      excludedRamps: xr,
      excludedTokens: xt,
    };
  });

  const [hasCopiedPrompt, setHasCopiedPrompt] = useState(false);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  // Synchronize state with URL parameters using replaceState (preserves history stack)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('b', config.brand);
    if (config.accent) params.set('a', config.accent);
    if (config.accent2) params.set('a2', config.accent2);
    if (config.scope !== 'full') params.set('m', config.scope);
    if (config.scheme !== 'complementary') params.set('s', config.scheme);
    if (config.wcag !== 'AA') params.set('c', config.wcag);
    if (config.notation !== 'oklch') params.set('f', config.notation);
    if (config.vividness !== 'natural') params.set('v', config.vividness);
    if (config.excludedRamps.length > 0) params.set('xr', config.excludedRamps.join('.'));
    if (config.excludedTokens.length > 0) params.set('xt', config.excludedTokens.join('.'));

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [config]);

  // Compute full deterministic palette result via OKLCH engine
  const paletteResult = useMemo(() => {
    return generateFullRampsSystem(config);
  }, [config]);

  // Inject agent-readable JSON script tag for headless crawlers
  useEffect(() => {
    let scriptTag = document.getElementById('ramps-studio-palette') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'ramps-studio-palette';
      scriptTag.type = 'application/json';
      document.body.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(paletteResult.rawJson, null, 2);
  }, [paletteResult]);

  const handleConfigChange = useCallback((patch: Partial<RampsConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleRandomize = useCallback(() => {
    const randomHexes = [
      '3d7dff', 'e63946', '2a9d8f', '7b2cbf', 'f77f00',
      '06d6a0', '118ab2', 'e76f51', '4361ee', '3a0ca3',
      '7209b7', 'f72585', '00b4d8', '38b000', 'ffb703',
    ];
    const pick = randomHexes[Math.floor(Math.random() * randomHexes.length)];
    setConfig((prev) => ({
      ...prev,
      brand: pick,
      accent: null,
      accent2: null,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig({
      brand: '3d7dff',
      accent: null,
      accent2: null,
      scope: 'full',
      scheme: 'complementary',
      wcag: 'AA',
      notation: 'oklch',
      vividness: 'natural',
      excludedRamps: [],
      excludedTokens: [],
    });
  }, []);

  const handleCopyPrompt = useCallback(() => {
    const prompt = exportToAgentPrompt(paletteResult);
    navigator.clipboard.writeText(prompt);
    setHasCopiedPrompt(true);
    setTimeout(() => setHasCopiedPrompt(false), 2000);
  }, [paletteResult]);

  const handleShareUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasCopiedShare(true);
    setTimeout(() => setHasCopiedShare(false), 2000);
  }, []);

  const toggleExcludeRamp = (rampName: string) => {
    setConfig((prev) => {
      const exists = prev.excludedRamps.includes(rampName);
      return {
        ...prev,
        excludedRamps: exists
          ? prev.excludedRamps.filter((r) => r !== rampName)
          : [...prev.excludedRamps, rampName],
      };
    });
  };

  const toggleExcludeToken = (tokenName: string) => {
    setConfig((prev) => {
      const exists = prev.excludedTokens.includes(tokenName);
      return {
        ...prev,
        excludedTokens: exists
          ? prev.excludedTokens.filter((t) => t !== tokenName)
          : [...prev.excludedTokens, tokenName],
      };
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <SEOHead
        title="Ramps Studio — OKLCH Color Scales & Semantic Design Tokens"
        description="Perceptually-even OKLCH color ramp generator and usage-first semantic tokens with enforced WCAG AA/AAA contrast. Export to CSS, Tailwind v4, DTCG JSON, and coding agent prompts."
        canonicalPath="/ramps"
      />

      {/* Breadcrumb Hierarchy */}
      <Breadcrumbs
        items={[
          { label: 'Library Home', to: { path: 'home' } },
          { label: 'Studio Tools' },
          { label: 'Ramps Studio', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Compact Studio Header & Intro */}
      <StudioIntro
        category="Studio Utility"
        badge="Deterministic OKLCH Generator"
        title="Ramps Studio"
        description="Build balanced, perceptually-even color scales (50–950), scheme-derived accents, and role-mapped semantic tokens from a single color anchor."
        onRandomize={handleRandomize}
        onReset={handleReset}
        onCopyPrompt={handleCopyPrompt}
        hasCopiedPrompt={hasCopiedPrompt}
        onShareUrl={handleShareUrl}
        hasCopiedShare={hasCopiedShare}
      />

      {/* 1. Generator Controls */}
      <RampsGeneratorControls
        config={config}
        onChange={handleConfigChange}
        onRandomize={handleRandomize}
        onReset={handleReset}
        onShareUrl={handleShareUrl}
        hasCopiedShare={hasCopiedShare}
      />

      {/* 2. Main Color Ramps Display */}
      <RampsPaletteGrid
        ramps={paletteResult.ramps}
        notation={config.notation}
        onToggleExcludeRamp={toggleExcludeRamp}
        excludedRamps={config.excludedRamps}
      />

      {/* 3. Semantic Tokens Table */}
      <RampsSemanticTokensTable
        tokens={paletteResult.tokens}
        wcagLevel={config.wcag}
        onToggleExcludeToken={toggleExcludeToken}
        excludedTokens={config.excludedTokens}
      />

      {/* 4. Live UI Interface Simulation */}
      <RampsLiveUiPreview paletteResult={paletteResult} />

      {/* 5. Developer Code & Token Export Hub */}
      <RampsCodeExport paletteResult={paletteResult} />

      {/* 6. Machine Contract & API Documentation */}
      <RampsApiDocs paletteResult={paletteResult} />

      {/* 7. Engineering Notes & Architectural Principles */}
      <section
        className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 flex flex-col gap-3 shadow-xs"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        <h3 className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)] flex items-center gap-2">
          <Info size={16} className="text-[var(--accent-blue)]" />
          <span>Architectural Guarantees &amp; Mathematical Notes</span>
        </h3>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed list-disc list-inside">
          {paletteResult.notes.map((note, idx) => (
            <li key={idx} className="marker:text-[var(--text-tertiary)]">
              {note}
            </li>
          ))}
        </ul>
      </section>

      {/* 8. Studio Tools Sibling Ecosystem */}
      <RampsStudioFamily onNavigate={onNavigate} currentTool="ramps" />
    </div>
  );
};
