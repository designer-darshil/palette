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
import { RampsHeader } from '../components/ramps/RampsHeader';
import { RampsGeneratorControls } from '../components/ramps/RampsGeneratorControls';
import { RampsPaletteGrid } from '../components/ramps/RampsPaletteGrid';
import { RampsSemanticTokensTable } from '../components/ramps/RampsSemanticTokensTable';
import { RampsLiveUiPreview } from '../components/ramps/RampsLiveUiPreview';
import { RampsCodeExport } from '../components/ramps/RampsCodeExport';
import { RampsApiDocs } from '../components/ramps/RampsApiDocs';
import { RampsStudioFamily } from '../components/ramps/RampsStudioFamily';
import { SEOHead } from '../components/seo/SEOHead';
import {
  Sparkles,
  ShieldCheck,
  Code2,
  Terminal,
  Layers,
  ArrowRight,
  Info,
  Check,
  Share2,
  BookOpen,
} from 'lucide-react';

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

  // Inject agent-readable JSON script tag into head/body for headless crawlers
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

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col antialiased selection:bg-[var(--text-primary)] selection:text-[var(--text-inverse)]">
      <SEOHead
        title="Ramps Studio — OKLCH Color Scales & Semantic Design Tokens"
        description="Perceptually-even OKLCH color ramp generator and usage-first semantic tokens with enforced WCAG AA/AAA contrast. Export to CSS, Tailwind v4, DTCG JSON, and coding agent prompts."
        canonicalPath="/ramps"
      />

      {/* Compact Studio Header */}
      <RampsHeader
        onNavigate={onNavigate}
        onCopyPrompt={handleCopyPrompt}
        hasCopiedPrompt={hasCopiedPrompt}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-10">
        {/* Intro / Hero Statement */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Deterministic OKLCH Generator</span>
            <span>·</span>
            <span>Agent &amp; LLM Readable</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-3xl leading-[1.15]">
            Color ramps and semantic tokens your agent can read.
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
            Generate an entire accessible color system from one brand color anchor: perceptually-even OKLCH scales (50–950), scheme-derived accents, a chroma-matched neutral, collision-avoided status tones, and usage-first semantic tokens with enforced WCAG {config.wcag}.
          </p>
        </section>

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
        <section className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <h3 className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)] flex items-center gap-2">
            <Info size={16} className="text-blue-400" />
            <span>Architectural Guarantees &amp; Implementation Notes</span>
          </h3>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[var(--text-secondary)] leading-relaxed list-disc list-inside">
            {paletteResult.notes.map((note, idx) => (
              <li key={idx} className="marker:text-[var(--text-tertiary)]">
                {note}
              </li>
            ))}
          </ul>
        </section>

        {/* 8. Studio Tools Family Ecosystem */}
        <RampsStudioFamily onNavigate={onNavigate} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-surface-1)] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-tertiary)]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--text-primary)]">Ramps Studio</span>
            <span>·</span>
            <span>Part of the KROMA Design System</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] underline">
              /llms.txt
            </a>
            <button onClick={() => onNavigate({ path: 'home' })} className="hover:text-[var(--text-primary)]">
              Library Home
            </button>
            <button onClick={() => onNavigate({ path: 'colors' })} className="hover:text-[var(--text-primary)]">
              Specimens
            </button>
            <button onClick={() => onNavigate({ path: 'contrast-checker' })} className="hover:text-[var(--text-primary)]">
              Contrast Checker
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
