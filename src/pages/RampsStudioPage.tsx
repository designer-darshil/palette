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
import { StudioWorkspace } from '../components/studio/StudioWorkspace';
import { StudioTopBar, StudioExportOption } from '../components/studio/StudioTopBar';
import { RampsInstrumentCanvas } from '../components/ramps/RampsInstrumentCanvas';
import { RampsInspector } from '../components/ramps/RampsInspector';
import { SEOHead } from '../components/seo/SEOHead';
import { Code, FileJson, Sparkles, Activity } from 'lucide-react';

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

  const [selectedRampKey, setSelectedRampKey] = useState<string>('brand');
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  const [history, setHistory] = useState<RampsConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

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

  const paletteResult = useMemo(() => {
    return generateFullRampsSystem(config);
  }, [config]);

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

  const handleRandomize = useCallback(() => {
    const randomHexes = [
      '3d7dff', 'e63946', '2a9d8f', '7b2cbf', 'f77f00',
      '06d6a0', '118ab2', 'e76f51', '4361ee', '3a0ca3',
      '7209b7', 'f72585', '00b4d8', '38b000', 'ffb703',
    ];
    const pick = randomHexes[Math.floor(Math.random() * randomHexes.length)];
    handleConfigChange({
      brand: pick,
      accent: null,
      accent2: null,
    });
  }, [handleConfigChange]);

  const handleReset = useCallback(() => {
    handleConfigChange({
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
  }, [handleConfigChange]);

  const handleShareUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasCopiedShare(true);
    setTimeout(() => setHasCopiedShare(false), 2000);
  }, []);

  const toggleExcludeToken = (tokenName: string) => {
    handleConfigChange({
      excludedTokens: config.excludedTokens.includes(tokenName)
        ? config.excludedTokens.filter((t) => t !== tokenName)
        : [...config.excludedTokens, tokenName],
    });
  };

  const exportOptions: StudioExportOption[] = useMemo(() => [
    {
      id: 'css',
      label: 'CSS Custom Properties',
      sublabel: ':root {}',
      icon: <Code size={13} />,
      onExport: () => {
        let css = ':root {\n';
        Object.values(paletteResult.ramps).forEach((r) => {
          Object.entries(r.steps).forEach(([stepKey, c]) => {
            css += `  --color-${r.name.toLowerCase()}-${stepKey}: ${c.oklch};\n`;
          });
        });
        css += '}';
        navigator.clipboard.writeText(css);
      },
    },
    {
      id: 'dtcg',
      label: 'DTCG Token Format',
      sublabel: 'W3C JSON',
      icon: <FileJson size={13} />,
      onExport: () => {
        navigator.clipboard.writeText(JSON.stringify(paletteResult.rawJson, null, 2));
      },
    },
    {
      id: 'agent',
      label: 'Coding Agent Prompt',
      sublabel: 'LLM Context',
      icon: <Sparkles size={13} />,
      onExport: () => {
        const prompt = exportToAgentPrompt(paletteResult);
        navigator.clipboard.writeText(prompt);
      },
    },
  ], [paletteResult]);

  return (
    <div className="w-full flex flex-col">
      <SEOHead
        title="Ramps Studio — OKLCH Color Scales & Semantic Design Tokens"
        description="Perceptually-even OKLCH color ramp generator and usage-first semantic tokens with enforced WCAG AA/AAA contrast. Export to CSS, Tailwind v4, DTCG JSON, and coding agent prompts."
        canonicalPath="/ramps"
      />

      <StudioWorkspace
        topBar={
          <StudioTopBar
            studioName="Ramps Studio"
            documentTitle={`#${config.brand.toUpperCase()} · ${config.scheme}`}
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
          <RampsInstrumentCanvas
            paletteResult={paletteResult}
            notation={config.notation}
            selectedRampKey={selectedRampKey}
            onSelectRampKey={setSelectedRampKey}
            selectedStep={selectedStep}
            onSelectStep={setSelectedStep}
            onBrandColorSelect={(brand) => handleConfigChange({ brand })}
          />
        }
        inspector={
          isInspectorOpen ? (
            <RampsInspector
              config={config}
              onChange={handleConfigChange}
              paletteResult={paletteResult}
              selectedRampKey={selectedRampKey}
              selectedStep={selectedStep}
              wcagLevel={config.wcag}
              onToggleExcludeToken={toggleExcludeToken}
              excludedTokens={config.excludedTokens}
            />
          ) : undefined
        }
        statusBar={
          <div className="flex items-center gap-2 w-full">
            <Activity size={11} className="text-[var(--color-primary)]" />
            <span>{Object.keys(paletteResult.ramps).length} ramps · {paletteResult.tokens.length} tokens · OKLCH engine</span>
          </div>
        }
      />
    </div>
  );
};
