import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { RouteType } from '../types';
import {
  RampsConfig,
  RampsScope,
  RampsScheme,
  RampsWcag,
  RampsNotation,
  RampsVividness,
  StepKey,
  STEP_KEYS,
  ColorRamp,
  generateFullRampsSystem,
  normalizeHex,
  isValidHex,
  hexToOklchValues,
  oklchToCssString,
  rgbToCssString,
  rgbToHslString,
  hexToRgbValues,
  fitOklchToSrgb,
  rgbToHexValues,
  calculateWcagContrast,
  exportToAgentPrompt,
} from '../utils/rampsEngine';
import { hexToHsl, hslToHex } from '../utils/colorUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { KromaButton } from '../components/common/KromaButton';
import { RampsSemanticTokensTable } from '../components/ramps/RampsSemanticTokensTable';
import { RampsLiveUiPreview } from '../components/ramps/RampsLiveUiPreview';
import { RampsApiDocs } from '../components/ramps/RampsApiDocs';
import {
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Undo2,
  Redo2,
  Share2,
  Sliders,
  Table,
  Eye,
  FileCode,
  FileText,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Layers,
  ArrowRight,
  Activity,
  SlidersHorizontal,
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

interface InteractiveColorStop {
  id: string;
  pos: number; // 0 to 100
  hex: string;
  isLocked: boolean;
}

type InterpolationModel = 'oklch' | 'srgb' | 'hsl';
type RampDirection = 'horizontal' | 'vertical' | 'diagonal' | 'radial';
type ViewDisplayMode = 'continuous' | 'stepped' | 'curve';

interface LaboratoryPreset {
  id: string;
  name: string;
  brand: string;
  accent: string | null;
  scheme: RampsScheme;
  description: string;
  stops: { pos: number; hex: string }[];
}

const LAB_PRESETS: LaboratoryPreset[] = [
  {
    id: 'sunset-horizon',
    name: 'Sunset Horizon',
    brand: 'ff5e36',
    accent: '7b2cbf',
    scheme: 'split',
    description: 'High-chroma solar warmth transitioning to ultraviolet twilight.',
    stops: [
      { pos: 0, hex: '#FF5E36' },
      { pos: 48, hex: '#FF9500' },
      { pos: 100, hex: '#7B2CBF' },
    ],
  },
  {
    id: 'ocean-depth',
    name: 'Ocean Depth',
    brand: '0072ff',
    accent: '00c6ff',
    scheme: 'analogous',
    description: 'Bioluminescent cyan cascading down into abyssal sapphire.',
    stops: [
      { pos: 0, hex: '#00C6FF' },
      { pos: 50, hex: '#0072FF' },
      { pos: 100, hex: '#091A3E' },
    ],
  },
  {
    id: 'neo-prism',
    name: 'Neo Prism',
    brand: '4facfe',
    accent: 'f355da',
    scheme: 'triadic',
    description: 'Optical spectral dispersion across neon cyan and electric magenta.',
    stops: [
      { pos: 0, hex: '#00F2FE' },
      { pos: 52, hex: '#4FACFE' },
      { pos: 100, hex: '#F355DA' },
    ],
  },
  {
    id: 'forest-canopy',
    name: 'Forest Canopy',
    brand: '2a9d8f',
    accent: 'a8ff78',
    scheme: 'analogous',
    description: 'Chlorophyll emerald rising from deep moss undergrowth.',
    stops: [
      { pos: 0, hex: '#A8FF78' },
      { pos: 45, hex: '#2A9D8F' },
      { pos: 100, hex: '#0F3443' },
    ],
  },
  {
    id: 'ember-glow',
    name: 'Ember Glow',
    brand: 'e63946',
    accent: 'ffb703',
    scheme: 'complementary',
    description: 'Incandescent molten magma cooling to dark obsidian ash.',
    stops: [
      { pos: 0, hex: '#FFB703' },
      { pos: 46, hex: '#E63946' },
      { pos: 100, hex: '#250B1B' },
    ],
  },
  {
    id: 'monochrome-slate',
    name: 'Monochrome Slate',
    brand: '6c757d',
    accent: null,
    scheme: 'monochromatic',
    description: 'Neutral tonal stepping with pure perceptual luminance pacing.',
    stops: [
      { pos: 0, hex: '#F8F9FA' },
      { pos: 50, hex: '#6C757D' },
      { pos: 100, hex: '#151719' },
    ],
  },
];

export const RampsStudioPage: React.FC<RampsStudioPageProps> = ({ onNavigate, initialParams }) => {
  // ─── 1. Core Ramps Configuration State ───────────────────────────
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

  // ─── 2. Laboratory Interactive State ─────────────────────────────
  const [selectedRampKey, setSelectedRampKey] = useState<string>('brand');
  const [selectedStep, setSelectedStep] = useState<StepKey>('500');
  const [interpolationModel, setInterpolationModel] = useState<InterpolationModel>('oklch');
  const [rampDirection, setRampDirection] = useState<RampDirection>('horizontal');
  const [viewDisplayMode, setViewDisplayMode] = useState<ViewDisplayMode>('continuous');
  const [activeCurveTab, setActiveCurveTab] = useState<'l' | 'c' | 'h'>('l');

  // Interactive specimen stops
  const [stops, setStops] = useState<InteractiveColorStop[]>([
    { id: 'stop-1', pos: 0, hex: '#F0F5FF', isLocked: false },
    { id: 'stop-2', pos: 50, hex: '#3D7DFF', isLocked: false },
    { id: 'stop-3', pos: 100, hex: '#0B1C4D', isLocked: false },
  ]);
  const [selectedStopId, setSelectedStopId] = useState<string>('stop-2');

  // Secondary drawers & tabs
  const [activeLabTab, setActiveLabTab] = useState<'controls' | 'tokens' | 'preview' | 'code' | 'api'>('controls');
  const [copiedCodeType, setCopiedCodeType] = useState<string | null>(null);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  // History for Undo/Redo
  const [history, setHistory] = useState<RampsConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Canvas element ref for drag interaction
  const stopTrackRef = useRef<HTMLDivElement>(null);
  const [draggingStopId, setDraggingStopId] = useState<string | null>(null);

  // ─── 3. Full Semantic Ramps Calculation ──────────────────────────
  const paletteResult = useMemo(() => {
    return generateFullRampsSystem(config);
  }, [config]);

  // Sync JSON script tag for tool interoperability
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

  // Sync URL query params
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

  // Synchronize interactive stops when active ramp or brand changes
  const activeRamp: ColorRamp = useMemo(() => {
    return paletteResult.ramps[selectedRampKey] || paletteResult.ramps['brand'] || Object.values(paletteResult.ramps)[0];
  }, [paletteResult, selectedRampKey]);

  useEffect(() => {
    if (!activeRamp) return;
    setStops((prev) => {
      const s0 = activeRamp.steps['50']?.hex || '#ffffff';
      const s500 = activeRamp.steps['500']?.hex || `#${config.brand}`;
      const s950 = activeRamp.steps['950']?.hex || '#000000';

      return [
        { id: 'stop-1', pos: 0, hex: prev[0]?.isLocked ? prev[0].hex : s0, isLocked: prev[0]?.isLocked || false },
        { id: 'stop-2', pos: 50, hex: prev[1]?.isLocked ? prev[1].hex : s500, isLocked: prev[1]?.isLocked || false },
        { id: 'stop-3', pos: 100, hex: prev[2]?.isLocked ? prev[2].hex : s950, isLocked: prev[2]?.isLocked || false },
      ];
    });
  }, [activeRamp, config.brand]);

  // Selected stop data
  const selectedStop = useMemo(() => {
    return stops.find((s) => s.id === selectedStopId) || stops[0] || null;
  }, [stops, selectedStopId]);

  // Selected step data from active ramp
  const activeStepData = useMemo(() => {
    return activeRamp?.steps[selectedStep] || activeRamp?.steps['500'];
  }, [activeRamp, selectedStep]);

  // ─── 4. Handlers ────────────────────────────────────────────────
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
      'ff5e36', '00c6ff', '4facfe', 'a8ff78', 'ff416c',
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
    setSelectedRampKey('brand');
    setSelectedStep('500');
    setInterpolationModel('oklch');
    setRampDirection('horizontal');
  }, [handleConfigChange]);

  const handleShareUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasCopiedShare(true);
    setTimeout(() => setHasCopiedShare(false), 2000);
  }, []);

  const handleCopyCode = useCallback((code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeType(type);
    setTimeout(() => setCopiedCodeType(null), 1800);
  }, []);

  // Stop management
  const handleUpdateStopColor = (id: string, hex: string) => {
    const clean = normalizeHex(hex);
    if (!clean) return;
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hex: `#${clean}` } : s))
    );
    if (id === 'stop-2' || id === selectedStopId) {
      handleConfigChange({ brand: clean });
    }
  };

  const handleToggleLockStop = (id: string) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isLocked: !s.isLocked } : s))
    );
  };

  const handleAddStop = () => {
    if (stops.length >= 6) return;
    const sorted = [...stops].sort((a, b) => a.pos - b.pos);
    let maxGap = 0;
    let insertAt = 50;
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].pos - sorted[i].pos;
      if (gap > maxGap) {
        maxGap = gap;
        insertAt = Math.round(sorted[i].pos + gap / 2);
      }
    }
    const newStop: InteractiveColorStop = {
      id: `stop-${Date.now()}`,
      pos: insertAt,
      hex: activeRamp?.steps['400']?.hex || '#7B2CBF',
      isLocked: false,
    };
    const nextStops = [...stops, newStop].sort((a, b) => a.pos - b.pos);
    setStops(nextStops);
    setSelectedStopId(newStop.id);
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length <= 2) return;
    const nextStops = stops.filter((s) => s.id !== id);
    setStops(nextStops);
    if (selectedStopId === id) {
      setSelectedStopId(nextStops[0].id);
    }
  };

  // Dragging stop positions along the track
  const handleTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>, stopId: string) => {
    e.stopPropagation();
    setDraggingStopId(stopId);
    setSelectedStopId(stopId);
  };

  useEffect(() => {
    if (!draggingStopId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!stopTrackRef.current) return;
      const rect = stopTrackRef.current.getBoundingClientRect();
      const rawPos = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(0, Math.min(100, Math.round(rawPos)));
      setStops((prev) =>
        prev.map((s) => (s.id === draggingStopId ? { ...s, pos: clamped } : s))
      );
    };

    const handleMouseUp = () => {
      setDraggingStopId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingStopId]);

  // Apply laboratory preset
  const handleApplyPreset = (preset: LaboratoryPreset) => {
    handleConfigChange({
      brand: preset.brand,
      accent: preset.accent,
      scheme: preset.scheme,
    });
    setStops(
      preset.stops.map((st, idx) => ({
        id: `stop-${idx + 1}`,
        pos: st.pos,
        hex: st.hex,
        isLocked: false,
      }))
    );
    setSelectedStopId('stop-2');
  };

  // ─── 5. Mathematical Interpolation Visuals ────────────────────────
  const sortedStops = useMemo(() => {
    return [...stops].sort((a, b) => a.pos - b.pos);
  }, [stops]);

  // Generate CSS gradient strings for each interpolation model
  const interpolationGradients = useMemo(() => {
    const stopsStr = sortedStops.map((s) => `${s.hex} ${s.pos}%`).join(', ');
    const angleStr =
      rampDirection === 'horizontal'
        ? 'to right'
        : rampDirection === 'vertical'
        ? 'to bottom'
        : rampDirection === 'diagonal'
        ? '135deg'
        : 'circle at center';

    const isRadial = rampDirection === 'radial';

    return {
      oklch: isRadial
        ? `radial-gradient(circle in oklch at center, ${stopsStr})`
        : `linear-gradient(in oklch ${angleStr}, ${stopsStr})`,
      srgb: isRadial
        ? `radial-gradient(circle at center, ${stopsStr})`
        : `linear-gradient(${angleStr}, ${stopsStr})`,
      hsl: isRadial
        ? `radial-gradient(circle in hsl longer hue at center, ${stopsStr})`
        : `linear-gradient(in hsl longer hue ${angleStr}, ${stopsStr})`,
      stepped: isRadial
        ? `radial-gradient(circle at center, ${STEP_KEYS.map((k, i) => {
            const hex = activeRamp?.steps[k]?.hex || '#000';
            const p1 = (i / STEP_KEYS.length) * 100;
            const p2 = ((i + 1) / STEP_KEYS.length) * 100;
            return `${hex} ${p1}%, ${hex} ${p2}%`;
          }).join(', ')})`
        : `linear-gradient(to right, ${STEP_KEYS.map((k, i) => {
            const hex = activeRamp?.steps[k]?.hex || '#000';
            const p1 = (i / STEP_KEYS.length) * 100;
            const p2 = ((i + 1) / STEP_KEYS.length) * 100;
            return `${hex} ${p1}%, ${hex} ${p2}%`;
          }).join(', ')})`,
    };
  }, [sortedStops, rampDirection, activeRamp]);

  const primaryHeroBackground = useMemo(() => {
    if (viewDisplayMode === 'stepped') {
      return interpolationGradients.stepped;
    }
    if (interpolationModel === 'oklch') return interpolationGradients.oklch;
    if (interpolationModel === 'hsl') return interpolationGradients.hsl;
    return interpolationGradients.srgb;
  }, [viewDisplayMode, interpolationModel, interpolationGradients]);

  const cssCustomPropertiesString = useMemo(() => {
    let css = ':root {\n';
    Object.values(paletteResult.ramps).forEach((r) => {
      Object.entries(r.steps).forEach(([stepKey, c]) => {
        css += `  --color-${r.name.toLowerCase()}-${stepKey}: ${c.oklch};\n`;
      });
    });
    css += '}';
    return css;
  }, [paletteResult]);

  const cssGradientString = useMemo(() => {
    return `background: ${primaryHeroBackground};`;
  }, [primaryHeroBackground]);

  return (
    <div className="w-full bg-[#F8F8F8] dark:bg-[#121212] text-[#171717] dark:text-[#EAEAEA] font-sans antialiased min-h-screen">
      <SEOHead
        title="Ramps Studio — OKLCH Color Scales & Semantic Design Tokens"
        description="Perceptually-even OKLCH color ramp generator and usage-first semantic tokens with enforced WCAG AA/AAA contrast. Export to CSS, Tailwind v4, DTCG JSON, and coding agent prompts."
        canonicalPath="/ramps"
      />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 flex flex-col gap-8">
        {/* ─── 1. Page Opening & Compact Editorial Intro ───────────── */}
        <section className="flex flex-col gap-3">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-[#707070] uppercase tracking-wider">
            <KromaButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate({ path: 'home' })}
              className="hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer p-0 h-auto font-inherit"
            >
              HOME
            </KromaButton>
            <span className="opacity-40">/</span>
            <KromaButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate({ path: 'create' })}
              className="hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer p-0 h-auto font-inherit"
            >
              STUDIO
            </KromaButton>
            <span className="opacity-40">/</span>
            <span className="text-[#171717] dark:text-white font-semibold">COLOR RAMPS</span>
          </nav>

          {/* Compact Headline */}
          <div className="flex flex-col justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-4">
            <div>
              <span className="font-mono text-xs font-semibold text-text-tertiary uppercase tracking-wider block mb-1">
                COLOR RAMPS · SPECIMEN INSTRUMENT
              </span>
              <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight text-text-primary uppercase m-0">
                BUILD COLOR IN MOTION.
              </h1>
            </div>

            <p className="max-w-2xl text-sm sm:text-base text-text-secondary leading-relaxed">
              Explore continuous transitions between colors and build precise ramps for interfaces,
              artwork, gradients, and visual systems in uniform OKLCH space.
            </p>
          </div>
        </section>

        {/* ─── 2. PRIMARY RAMP CANVAS (THE HERO) ───────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-[#171717] dark:text-white font-bold">
                {activeRamp?.label || 'BRAND'} RAMP
              </span>
              <span className="font-mono text-xs text-[#707070] uppercase">
                ({interpolationModel.toUpperCase()} · {rampDirection})
              </span>
            </div>

            {/* Canvas View Toggles */}
            <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-sm">
              <KromaButton
                variant={viewDisplayMode === 'continuous' ? 'filled' : 'ghost'}
                size="sm"
                onClick={() => setViewDisplayMode('continuous')}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs transition-colors cursor-pointer h-auto ${
                  viewDisplayMode === 'continuous'
                    ? 'bg-white dark:bg-[#202020] text-[#171717] dark:text-white font-bold shadow-xs'
                    : 'text-[#707070] hover:text-[#171717] dark:hover:text-white'
                }`}
              >
                CONTINUOUS
              </KromaButton>
              <KromaButton
                variant={viewDisplayMode === 'stepped' ? 'filled' : 'ghost'}
                size="sm"
                onClick={() => setViewDisplayMode('stepped')}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs transition-colors cursor-pointer h-auto ${
                  viewDisplayMode === 'stepped'
                    ? 'bg-white dark:bg-[#202020] text-[#171717] dark:text-white font-bold shadow-xs'
                    : 'text-[#707070] hover:text-[#171717] dark:hover:text-white'
                }`}
              >
                STEPPED (11)
              </KromaButton>
              <KromaButton
                variant={viewDisplayMode === 'curve' ? 'filled' : 'ghost'}
                size="sm"
                onClick={() => setViewDisplayMode('curve')}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs transition-colors cursor-pointer h-auto ${
                  viewDisplayMode === 'curve'
                    ? 'bg-white dark:bg-[#202020] text-[#171717] dark:text-white font-bold shadow-xs'
                    : 'text-[#707070] hover:text-[#171717] dark:hover:text-white'
                }`}
              >
                CURVE GRAPH
              </KromaButton>
            </div>
          </div>

          {/* Dominant Hero Canvas Container */}
          <div className="relative w-full h-48 sm:h-64 md:h-72 rounded-sm overflow-hidden border border-black/[0.1] dark:border-white/[0.1] shadow-sm transition-all duration-300">
            {viewDisplayMode === 'curve' ? (
              <div className="w-full h-full bg-[#171717] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={13} className="text-white" />
                    <span className="font-mono text-xs font-semibold text-white tracking-wider uppercase">
                      OKLCH Mathematical Trajectory
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(['l', 'c', 'h'] as const).map((tab) => (
                      <KromaButton
                        key={tab}
                        variant={activeCurveTab === tab ? 'filled' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveCurveTab(tab)}
                        className={`px-2 py-0.5 rounded-xs font-mono text-xs font-semibold transition-colors cursor-pointer h-auto ${
                          activeCurveTab === tab
                            ? 'bg-white text-black font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {tab === 'l' ? 'LIGHTNESS' : tab === 'c' ? 'CHROMA' : 'HUE'}
                      </KromaButton>
                    ))}
                  </div>
                </div>

                {/* SVG Curve Canvas */}
                <div className="flex-1 w-full relative pt-2">
                  <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="primaryCurveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        {STEP_KEYS.map((k, i) => (
                          <stop
                            key={k}
                            offset={`${(i / (STEP_KEYS.length - 1)) * 100}%`}
                            stopColor={activeRamp?.steps[k]?.hex || '#ffffff'}
                          />
                        ))}
                      </linearGradient>
                    </defs>

                    <line x1="0" y1="20" x2="500" y2="20" stroke="#333333" strokeDasharray="3,3" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#333333" strokeDasharray="3,3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#333333" strokeDasharray="3,3" />

                    {(() => {
                      const points = STEP_KEYS.map((k, i) => {
                        const c = activeRamp?.steps[k];
                        const x = (i / (STEP_KEYS.length - 1)) * 500;
                        let y = 60;
                        if (c) {
                          if (activeCurveTab === 'l') y = 14 + (1 - c.lightness) * 92;
                          else if (activeCurveTab === 'c') y = 106 - (c.chroma / 0.35) * 92;
                          else y = 106 - (c.hue / 360) * 92;
                        }
                        return { x, y, k, hex: c?.hex || '#ffffff' };
                      });

                      const d = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x},${p.y}`, '');

                      return (
                        <>
                          <path d={d} fill="none" stroke="url(#primaryCurveGradient)" strokeWidth="3" strokeLinecap="round" />
                          {points.map((p) => {
                            const isSelected = selectedStep === p.k;
                            return (
                              <circle
                                key={p.k}
                                cx={p.x}
                                cy={p.y}
                                r={isSelected ? 6 : 3.5}
                                fill={p.hex}
                                stroke="#000000"
                                strokeWidth="2"
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                aria-label={`Select step ${p.k} on lightness curve: ${p.hex}`}
                                className="cursor-pointer transition-transform hover:scale-125 focus-visible:outline-none"
                                onClick={() => setSelectedStep(p.k as StepKey)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedStep(p.k as StepKey);
                                  }
                                }}
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                <div className="flex justify-between font-mono text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                  <span>STEP 50 · TINT</span>
                  <span>STEP 500 · BASE ANCHOR</span>
                  <span>STEP 950 · SHADE</span>
                </div>
              </div>
            ) : (
              <div
                className="w-full h-full relative"
                style={{ background: primaryHeroBackground }}
              >
                {/* Stepped Overlay labels if in stepped mode */}
                {viewDisplayMode === 'stepped' && (
                  <div className="w-full h-full flex">
                    {STEP_KEYS.map((k) => {
                      const c = activeRamp?.steps[k];
                      if (!c) return null;
                      const isSelected = selectedStep === k;
                      return (
                        <button
                          type="button"
                          key={k}
                          onClick={() => setSelectedStep(k)}
                          aria-pressed={isSelected}
                          aria-label={`Select step ${k}: ${c.hex}`}
                          className={`flex-1 h-full flex flex-col justify-between p-2 cursor-pointer transition-all border-0 text-left focus-visible:outline-2 focus-visible:outline-white ${
                            isSelected ? 'ring-2 ring-white z-10' : 'hover:brightness-105'
                          }`}
                        >
                          <span
                            className="font-mono text-xs font-bold self-start px-1 py-0.5 rounded-xs"
                            style={{
                              backgroundColor: c.contrastWithWhite < 4.5 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
                              color: c.contrastWithWhite < 4.5 ? '#FFFFFF' : '#000000',
                            }}
                          >
                            {k}
                          </span>
                          <span
                            className="font-mono text-xs self-end opacity-80"
                            style={{ color: c.contrastWithWhite < 4.5 ? '#FFFFFF' : '#000000' }}
                          >
                            {c.hex}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stop Track (●────────●────────●) */}
          <div className="flex flex-col gap-2 pt-1">
            <div
              ref={stopTrackRef}
              className="relative h-7 w-full flex items-center cursor-pointer select-none"
            >
              {/* Central Track Line */}
              <div className="absolute inset-x-0 h-[2px] bg-black/[0.15] dark:bg-white/[0.2]" />

              {/* Stop Markers */}
              {stops.map((st, idx) => {
                const isSelected = st.id === selectedStopId;
                return (
                  <div
                    key={st.id}
                    onMouseDown={(e) => handleTrackMouseDown(e, st.id)}
                    className={`absolute -translate-x-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing transition-transform ${
                      isSelected ? 'z-20 scale-110' : 'z-10 hover:scale-105'
                    }`}
                    style={{ left: `${st.pos}%` }}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 shadow-sm transition-all flex items-center justify-center ${
                        isSelected ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20' : 'border-white'
                      }`}
                      style={{ backgroundColor: st.hex }}
                    >
                      {st.isLocked && <Lock size={8} className="text-black drop-shadow-xs" />}
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090] mt-1 whitespace-nowrap">
                      {idx + 1} · {st.pos}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#707070] dark:text-[#909090] px-1">
              <span>0% · ORIGIN</span>
              <span>DRAG STOPS TO REFINE POSITION</span>
              <span>100% · TERMINUS</span>
            </div>
          </div>
        </section>

        {/* ─── 3. COLOR STOP SYSTEM (SPECIMEN TILES) ───────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090] uppercase tracking-wider">
              COLOR STOPS ({stops.length}/6)
            </span>
            <div className="flex items-center gap-2">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={handleAddStop}
                disabled={stops.length >= 6}
                iconLeft={<Plus size={12} />}
              >
                ADD STOP
              </KromaButton>
            </div>
          </div>

          {/* Interactive Specimen Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {stops.map((st, idx) => {
              const isSelected = st.id === selectedStopId;
              return (
                <div
                  key={st.id}
                  className={`p-2.5 rounded-sm border transition-all flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'border-[#171717] dark:border-white bg-white dark:bg-[#1A1A1A] shadow-sm ring-1 ring-black/5'
                      : 'border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedStopId(st.id)}
                      aria-pressed={isSelected}
                      aria-label={`Select STOP 0${idx + 1}: ${st.hex}`}
                      className="font-mono text-xs font-bold uppercase text-[#707070] dark:text-[#888888] hover:text-[#171717] dark:hover:text-white text-left cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-primary-500"
                    >
                      STOP 0{idx + 1}
                    </button>
                    <KromaButton
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLockStop(st.id);
                      }}
                      className="text-[#707070] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer p-0.5 h-auto w-auto min-h-0"
                      title={st.isLocked ? 'Unlock Stop Color' : 'Lock Stop Color'}
                    >
                      {st.isLocked ? <Lock size={11} className="text-amber-500" /> : <Unlock size={11} />}
                    </KromaButton>
                  </div>

                  {/* Swatch & Hex */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-xs border border-black/10 dark:border-white/10 flex-shrink-0 relative overflow-hidden"
                      style={{ backgroundColor: st.hex }}
                    >
                      <input
                        type="color"
                        value={st.hex}
                        onChange={(e) => handleUpdateStopColor(st.id, e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        title="Pick Color"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs font-bold text-[#171717] dark:text-white uppercase truncate">
                        {st.hex}
                      </span>
                      <span className="font-mono text-xs text-[#707070] dark:text-[#888888]">
                        POS: {st.pos}%
                      </span>
                    </div>
                  </div>

                  {/* Tile Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <KromaButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(st.hex);
                        setCopiedCodeType(st.hex);
                        setTimeout(() => setCopiedCodeType(null), 1500);
                      }}
                      className="font-mono text-xs uppercase text-[#707070] hover:text-[#171717] dark:hover:text-white flex items-center gap-1 cursor-pointer p-0 h-auto"
                    >
                      {copiedCodeType === st.hex ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      <span>{copiedCodeType === st.hex ? 'COPIED' : 'COPY'}</span>
                    </KromaButton>

                    {stops.length > 2 && (
                      <KromaButton
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStop(st.id);
                        }}
                        className="text-[#707070] hover:text-red-500 transition-colors p-0.5 cursor-pointer h-auto w-auto min-h-0"
                        title="Remove Stop"
                      >
                        <Trash2 size={11} />
                      </KromaButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 4. RAMP INSTRUMENT (COMPACT LABORATORY CONTROLS) ────── */}
        <section className="p-4 sm:p-5 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#171717] dark:text-white" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#171717] dark:text-white">
                RAMP INSTRUMENT CONTROLS
              </span>
            </div>

            {/* Action Buttons with Strict ONE ACTION = ONE VISUAL ICON rule */}
            <div className="flex items-center gap-2 flex-wrap">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                iconLeft={<Undo2 size={12} />}
              >
                UNDO
              </KromaButton>
              <KromaButton
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                iconLeft={<Redo2 size={12} />}
              >
                REDO
              </KromaButton>
              <KromaButton
                variant="outline"
                size="sm"
                onClick={handleRandomize}
                iconLeft={<Sparkles size={12} />}
              >
                RANDOMIZE
              </KromaButton>
              <KromaButton
                variant="outline"
                size="sm"
                onClick={handleReset}
                iconLeft={<RotateCcw size={12} />}
              >
                RESET
              </KromaButton>
              <KromaButton
                variant="filled"
                size="sm"
                onClick={handleShareUrl}
                iconLeft={hasCopiedShare ? <Check size={12} /> : <Share2 size={12} />}
              >
                {hasCopiedShare ? 'COPIED LINK' : 'SHARE'}
              </KromaButton>
            </div>
          </div>

          {/* Grid of Precision Laboratory Sliders / Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {/* Interpolation Space */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
                INTERPOLATION MODEL
              </span>
              <div className="grid grid-cols-3 gap-1 bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-xs">
                {(['oklch', 'srgb', 'hsl'] as const).map((model) => (
                  <KromaButton
                    key={model}
                    variant={interpolationModel === model ? 'filled' : 'ghost'}
                    size="sm"
                    onClick={() => setInterpolationModel(model)}
                    className={`py-1.5 text-center rounded-xs transition-colors uppercase font-semibold cursor-pointer text-xs h-auto ${
                      interpolationModel === model
                        ? 'bg-white dark:bg-[#252525] text-[#171717] dark:text-white shadow-xs font-bold'
                        : 'text-[#707070] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    {model}
                  </KromaButton>
                ))}
              </div>
            </div>

            {/* Direction */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
                DIRECTION
              </span>
              <div className="grid grid-cols-4 gap-1 bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-xs">
                {(
                  [
                    { id: 'horizontal', label: '90°' },
                    { id: 'vertical', label: '180°' },
                    { id: 'diagonal', label: '45°' },
                    { id: 'radial', label: 'RAD' },
                  ] as const
                ).map((d) => (
                  <KromaButton
                    key={d.id}
                    variant={rampDirection === d.id ? 'filled' : 'ghost'}
                    size="sm"
                    onClick={() => setRampDirection(d.id)}
                    className={`py-1.5 text-center rounded-xs transition-colors uppercase font-semibold cursor-pointer text-xs h-auto ${
                      rampDirection === d.id
                        ? 'bg-white dark:bg-[#252525] text-[#171717] dark:text-white shadow-xs font-bold'
                        : 'text-[#707070] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    {d.label}
                  </KromaButton>
                ))}
              </div>
            </div>

            {/* Harmony Scheme */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
                HARMONIC SCHEME
              </span>
              <select
                value={config.scheme}
                onChange={(e) => handleConfigChange({ scheme: e.target.value as RampsScheme })}
                className="w-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xs px-2.5 py-1.5 font-mono text-xs text-[#171717] dark:text-white uppercase outline-none cursor-pointer"
              >
                <option value="complementary">Complementary (180°)</option>
                <option value="analogous">Analogous (±35°)</option>
                <option value="triadic">Triadic (120° / 240°)</option>
                <option value="split">Split Complementary</option>
                <option value="monochromatic">Monochromatic</option>
              </select>
            </div>

            {/* Accessibility Contrast Enforcement */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
                WCAG TARGET
              </span>
              <div className="grid grid-cols-2 gap-1 bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-xs">
                {(['AA', 'AAA'] as const).map((lvl) => (
                  <KromaButton
                    key={lvl}
                    variant={config.wcag === lvl ? 'filled' : 'ghost'}
                    size="sm"
                    onClick={() => handleConfigChange({ wcag: lvl })}
                    className={`py-1.5 text-center rounded-xs transition-colors uppercase font-semibold cursor-pointer text-xs h-auto ${
                      config.wcag === lvl
                        ? 'bg-white dark:bg-[#252525] text-[#171717] dark:text-white shadow-xs font-bold'
                        : 'text-[#707070] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    {lvl} ({lvl === 'AA' ? '4.5:1' : '7.0:1'})
                  </KromaButton>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. INTERPOLATION VISUALIZATION STRIP ────────────────── */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090] uppercase tracking-wider">
              INTERPOLATION COMPARISON · COLOR SCIENCE SPECIMEN
            </span>
            <span className="font-mono text-xs text-[#707070] dark:text-[#888888]">
              LIVE COMPARISON ACROSS COLOR SPACES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* OKLCH Preview */}
            <button
              type="button"
              onClick={() => setInterpolationModel('oklch')}
              aria-pressed={interpolationModel === 'oklch'}
              aria-label="Select OKLCH Perceptual interpolation model"
              className={`p-3 rounded-sm border transition-all cursor-pointer flex flex-col gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                interpolationModel === 'oklch'
                  ? 'border-[#171717] dark:border-white bg-white dark:bg-[#1A1A1A] shadow-sm'
                  : 'border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#171717] dark:text-white">
                  OKLCH · PERCEPTUAL
                </span>
                {interpolationModel === 'oklch' && (
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xs font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <div
                className="h-10 w-full rounded-xs shadow-inner"
                style={{ background: interpolationGradients.oklch }}
              />
              <span className="text-xs text-[#707070] dark:text-[#888888] leading-tight">
                Uniform lightness & chromatic preservation. Eliminates the gray muddy dead-zone.
              </span>
            </button>

            {/* RGB Preview */}
            <button
              type="button"
              onClick={() => setInterpolationModel('srgb')}
              aria-pressed={interpolationModel === 'srgb'}
              aria-label="Select RGB Linear interpolation model"
              className={`p-3 rounded-sm border transition-all cursor-pointer flex flex-col gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                interpolationModel === 'srgb'
                  ? 'border-[#171717] dark:border-white bg-white dark:bg-[#1A1A1A] shadow-sm'
                  : 'border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#171717] dark:text-white">
                  RGB · LINEAR
                </span>
                {interpolationModel === 'srgb' && (
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xs font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <div
                className="h-10 w-full rounded-xs shadow-inner"
                style={{ background: interpolationGradients.srgb }}
              />
              <span className="text-xs text-[#707070] dark:text-[#888888] leading-tight">
                Standard CSS sRGB interpolation. Prone to desaturated intermediate midtones.
              </span>
            </button>

            {/* HSL Preview */}
            <button
              type="button"
              onClick={() => setInterpolationModel('hsl')}
              aria-pressed={interpolationModel === 'hsl'}
              aria-label="Select HSL Cylindrical interpolation model"
              className={`p-3 rounded-sm border transition-all cursor-pointer flex flex-col gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                interpolationModel === 'hsl'
                  ? 'border-[#171717] dark:border-white bg-white dark:bg-[#1A1A1A] shadow-sm'
                  : 'border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#171717] dark:text-white">
                  HSL · CYLINDRICAL
                </span>
                {interpolationModel === 'hsl' && (
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xs font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <div
                className="h-10 w-full rounded-xs shadow-inner"
                style={{ background: interpolationGradients.hsl }}
              />
              <span className="text-xs text-[#707070] dark:text-[#888888] leading-tight">
                Traverses hue wheel angles. Creates intense rainbow shifts across stops.
              </span>
            </button>
          </div>
        </section>

        {/* ─── 6. COLOR RAMP SCALE (PHYSICAL SPECIMEN SHEET) ───────── */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090] uppercase tracking-wider block">
                RAMP SCALE SHEET · 11 SPECIMEN STEPS
              </span>
              <span className="text-xs text-[#707070] dark:text-[#888888]">
                Perceptually calibrated lightness steps from 50 (tint) to 950 (shade)
              </span>
            </div>

            {/* Notation selector */}
            <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-xs">
              {(['oklch', 'hex', 'rgb', 'hsl'] as const).map((not) => (
                <KromaButton
                  key={not}
                  variant={config.notation === not ? 'filled' : 'ghost'}
                  size="sm"
                  onClick={() => handleConfigChange({ notation: not })}
                  className={`px-2 py-0.5 font-mono text-xs rounded-xs uppercase font-semibold transition-colors cursor-pointer h-auto ${
                    config.notation === not
                      ? 'bg-white dark:bg-[#202020] text-[#171717] dark:text-white font-bold shadow-xs'
                      : 'text-[#707070] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  {not}
                </KromaButton>
              ))}
            </div>
          </div>

          {/* Scale Swatches Table / Specimen Sheet */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
            {STEP_KEYS.map((k) => {
              const c = activeRamp?.steps[k];
              if (!c) return null;
              const isSelected = selectedStep === k;
              const displayVal =
                config.notation === 'oklch'
                  ? c.oklch
                  : config.notation === 'rgb'
                  ? c.rgb
                  : config.notation === 'hsl'
                  ? c.hsl
                  : c.hex;

              return (
                <div
                  key={k}
                  className={`p-2 rounded-sm border transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'border-[#171717] dark:border-white bg-white dark:bg-[#1E1E1E] ring-1 ring-black/10 shadow-sm'
                      : 'border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedStep(k)}
                    aria-pressed={isSelected}
                    aria-label={`Select step ${k} (${c.hex})`}
                    className="flex items-center justify-between font-mono text-xs font-bold text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white border-0 bg-transparent p-0 cursor-pointer w-full text-left focus-visible:outline-2 focus-visible:outline-primary-500"
                  >
                    <span>{k}</span>
                    <span className="text-xs font-normal">{(c.lightness * 100).toFixed(0)}%L</span>
                  </button>

                  <div
                    className="h-12 w-full rounded-xs border border-black/10 dark:border-white/10 relative group flex items-center justify-center"
                    style={{ backgroundColor: c.hex }}
                  >
                    <KromaButton
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(displayVal);
                        setCopiedCodeType(displayVal);
                        setTimeout(() => setCopiedCodeType(null), 1500);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/60 text-white rounded-xs text-xs flex items-center gap-1 cursor-pointer h-auto w-auto min-h-0"
                      title="Copy Value"
                    >
                      {copiedCodeType === displayVal ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    </KromaButton>
                  </div>

                  <div className="flex flex-col font-mono text-xs text-[#707070] dark:text-[#909090] min-w-0">
                    <span className="font-bold text-[#171717] dark:text-white truncate">
                      {c.hex}
                    </span>
                    <span className="truncate opacity-75">
                      W:{c.contrastWithWhite.toFixed(1)} · B:{c.contrastWithBlack.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 7. LARGE COLOR SPECIMEN (SELECTED STOP DETAIL) ───────── */}
        {activeStepData && (
          <section className="p-5 sm:p-6 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] flex flex-col lg:flex-row items-stretch gap-6">
            {/* Massive Color Field */}
            <div
              className="w-full lg:w-72 h-40 lg:h-auto rounded-sm border border-black/10 dark:border-white/10 flex flex-col justify-between p-4 shadow-sm"
              style={{ backgroundColor: activeStepData.hex }}
            >
              <span
                className="font-mono text-xs font-bold uppercase px-2 py-1 rounded-xs w-fit"
                style={{
                  backgroundColor: activeStepData.contrastWithWhite < 4.5 ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)',
                  color: activeStepData.contrastWithWhite < 4.5 ? '#FFFFFF' : '#000000',
                }}
              >
                {activeRamp?.label} · STEP {selectedStep}
              </span>

              <div
                className="font-mono text-xl sm:text-2xl font-bold tracking-tight uppercase"
                style={{ color: activeStepData.contrastWithWhite < 4.5 ? '#FFFFFF' : '#000000' }}
              >
                {activeStepData.hex}
              </div>
            </div>

            {/* Technical Typography & Coordinates */}
            <div className="flex-1 flex flex-col justify-between gap-4 font-mono min-w-0">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#707070] dark:text-[#909090] uppercase tracking-wider">
                  CHROMATIC COORDINATES & COLOR SPACE MAPPINGS
                </span>
                <h3 className="text-xl font-bold text-[#171717] dark:text-white">
                  {activeRamp?.label}-{selectedStep}
                </h3>
              </div>

              {/* Data Values Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                  <span className="text-xs text-[#707070] dark:text-[#909090] uppercase block">OKLCH</span>
                  <span className="font-bold text-[#171717] dark:text-white text-xs truncate block">
                    {activeStepData.oklch}
                  </span>
                </div>
                <div className="p-2.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                  <span className="text-xs text-[#707070] dark:text-[#909090] uppercase block">RGB (sRGB)</span>
                  <span className="font-bold text-[#171717] dark:text-white text-xs truncate block">
                    {activeStepData.rgb}
                  </span>
                </div>
                <div className="p-2.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                  <span className="text-xs text-[#707070] dark:text-[#909090] uppercase block">HSL</span>
                  <span className="font-bold text-[#171717] dark:text-white text-xs truncate block">
                    {activeStepData.hsl}
                  </span>
                </div>
                <div className="p-2.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                  <span className="text-xs text-[#707070] dark:text-[#909090] uppercase block">LIGHTNESS</span>
                  <span className="font-bold text-[#171717] dark:text-white text-xs block">
                    {(activeStepData.lightness * 100).toFixed(1)}% (L: {activeStepData.lightness.toFixed(3)})
                  </span>
                </div>
              </div>

              {/* Contrast & Accessibility Badges */}
              <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#707070] dark:text-[#909090] uppercase">CONTRAST:</span>
                  <span className="px-2 py-0.5 rounded-xs bg-black/5 dark:bg-white/10 text-xs font-bold">
                    WHITE: {activeStepData.contrastWithWhite.toFixed(2)}:1
                  </span>
                  <span className="px-2 py-0.5 rounded-xs bg-black/5 dark:bg-white/10 text-xs font-bold">
                    BLACK: {activeStepData.contrastWithBlack.toFixed(2)}:1
                  </span>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {activeStepData.contrastWithWhite >= 4.5 || activeStepData.contrastWithBlack >= 4.5 ? (
                    <span className="px-2 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      WCAG AA PASS
                    </span>
                  ) : null}
                  {activeStepData.contrastWithWhite >= 7.0 || activeStepData.contrastWithBlack >= 7.0 ? (
                    <span className="px-2 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      WCAG AAA PASS
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── 8. RAMP PRESETS (MINIATURE RAMP STRIPS) ─────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090] uppercase tracking-wider">
              CURATED LABORATORY PRESETS
            </span>
            <span className="font-mono text-xs text-[#707070] dark:text-[#888888]">
              ONE-CLICK APPLIED HARMONIES
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LAB_PRESETS.map((preset) => {
              const bg = `linear-gradient(to right, ${preset.stops.map((s) => `${s.hex} ${s.pos}%`).join(', ')})`;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  aria-label={`Apply ${preset.name} preset`}
                  className="p-3 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] hover:border-black/30 dark:hover:border-white/30 transition-all cursor-pointer flex flex-col gap-2 group shadow-2xs text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-[#171717] dark:text-white group-hover:text-emerald-500 transition-colors">
                      {preset.name}
                    </span>
                    <span className="text-xs text-[#707070] dark:text-[#888888] uppercase">
                      #{preset.brand.toUpperCase()}
                    </span>
                  </div>

                  {/* Miniature ramp strip */}
                  <div
                    className="h-8 w-full rounded-xs shadow-inner transition-transform group-hover:scale-[1.01]"
                    style={{ background: bg }}
                  />

                  <p className="text-xs text-[#707070] dark:text-[#909090] leading-snug line-clamp-1">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── 9. SIBLING RAMPS COLLECTION (VISUAL ARCHIVE) ────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090] uppercase tracking-wider">
              DERIVED SYSTEM RAMPS ARCHIVE ({Object.keys(paletteResult.ramps).length})
            </span>
            <span className="font-mono text-xs text-[#707070] dark:text-[#888888]">
              SELECT A RAMP TO FOCUS IN INSTRUMENT
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {Object.entries(paletteResult.ramps).map(([key, ramp]) => {
              const isSelected = key === selectedRampKey;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setSelectedRampKey(key)}
                  aria-pressed={isSelected}
                  aria-label={`Select ramp ${ramp.label}`}
                  className={`p-3 rounded-sm border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                    isSelected
                      ? 'border-[#171717] dark:border-white bg-white dark:bg-[#1A1A1A] shadow-sm'
                      : 'border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 w-44">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ramp.steps['500']?.hex }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs font-bold text-[#171717] dark:text-white uppercase truncate">
                        {ramp.label}
                      </span>
                      <span className="font-mono text-xs text-[#707070] dark:text-[#888888]">
                        HUE: {ramp.baseHue.toFixed(0)}° · C: {ramp.baseChroma.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal step strip */}
                  <div className="flex-1 h-7 rounded-xs overflow-hidden flex shadow-inner">
                    {STEP_KEYS.map((k) => {
                      const c = ramp.steps[k];
                      return (
                        <div
                          key={k}
                          className="flex-1 h-full hover:brightness-110 transition-all"
                          style={{ backgroundColor: c?.hex }}
                          title={`${ramp.label}-${k}: ${c?.hex}`}
                        />
                      );
                    })}
                  </div>

                  <div className="font-mono text-xs text-[#707070] dark:text-[#888888] sm:w-20 text-right">
                    {isSelected ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">FOCUSED</span>
                    ) : (
                      <span>FOCUS →</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── 10. CSS & TOKEN OUTPUT SPECIMEN ─────────────────────── */}
        <section className="p-5 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] flex flex-col gap-4 min-w-0 max-w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-3 min-w-0">
            <div className="flex items-center gap-2">
              <FileCode size={14} className="text-[#171717] dark:text-white" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#171717] dark:text-white">
                TECHNICAL CODE SPECIMEN & TOKENS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => handleCopyCode(cssGradientString, 'gradient')}
                iconLeft={copiedCodeType === 'gradient' ? <Check size={11} /> : <Copy size={11} />}
              >
                {copiedCodeType === 'gradient' ? 'COPIED CSS' : 'COPY CSS GRADIENT'}
              </KromaButton>
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => handleCopyCode(cssCustomPropertiesString, 'properties')}
                iconLeft={copiedCodeType === 'properties' ? <Check size={11} /> : <Copy size={11} />}
              >
                {copiedCodeType === 'properties' ? 'COPIED :ROOT' : 'COPY :ROOT TOKENS'}
              </KromaButton>
              <KromaButton
                variant="filled"
                size="sm"
                onClick={() => handleCopyCode(JSON.stringify(paletteResult.rawJson, null, 2), 'dtcg')}
                iconLeft={copiedCodeType === 'dtcg' ? <Check size={11} /> : <FileCode size={11} />}
              >
                {copiedCodeType === 'dtcg' ? 'COPIED JSON' : 'EXPORT DTCG JSON'}
              </KromaButton>
            </div>
          </div>

          {/* Strictly Contained Code Block */}
          <div className="w-full min-w-0 max-w-full overflow-x-auto bg-[#181818] p-4 rounded-xs border border-white/10 font-mono text-xs text-neutral-300 leading-relaxed">
            <pre className="min-w-0 max-w-full overflow-x-auto whitespace-pre">
              <code>{`/* ─── KROMA COLOR RAMP TECHNICAL SPECIMEN ─── */
${cssGradientString}

/* ─── OKLCH PERCEPTUALLY-CALIBRATED TOKENS ─── */
${cssCustomPropertiesString.slice(0, 720)}
  /* ... ${paletteResult.tokens.length} total semantic tokens generated */
}`}</code>
            </pre>
          </div>
        </section>

        {/* ─── 11. DEEP SYSTEM EXPLORATION (TOKENS, PREVIEW, API) ──── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-black/[0.08] dark:border-white/[0.08] pb-2 overflow-x-auto">
            <span className="font-mono text-xs font-bold text-[#707070] dark:text-[#909090] uppercase mr-2">
              SYSTEM DRAWERS:
            </span>
            <KromaButton
              variant={activeLabTab === 'tokens' ? 'filled' : 'ghost'}
              size="sm"
              onClick={() => setActiveLabTab(activeLabTab === 'tokens' ? 'controls' : 'tokens')}
              iconLeft={<Table size={12} />}
              className={`px-3 py-1.5 rounded-xs font-mono text-xs uppercase font-semibold transition-colors cursor-pointer h-auto ${
                activeLabTab === 'tokens'
                  ? 'bg-black dark:bg-white text-white dark:text-black font-bold'
                  : 'bg-black/[0.04] dark:bg-white/[0.04] text-[#707070] hover:text-[#171717] dark:hover:text-white'
              }`}
            >
              SEMANTIC TOKENS TABLE ({paletteResult.tokens.length})
            </KromaButton>
            <KromaButton
              variant={activeLabTab === 'preview' ? 'filled' : 'ghost'}
              size="sm"
              onClick={() => setActiveLabTab(activeLabTab === 'preview' ? 'controls' : 'preview')}
              iconLeft={<Eye size={12} />}
              className={`px-3 py-1.5 rounded-xs font-mono text-xs uppercase font-semibold transition-colors cursor-pointer h-auto ${
                activeLabTab === 'preview'
                  ? 'bg-black dark:bg-white text-white dark:text-black font-bold'
                  : 'bg-black/[0.04] dark:bg-white/[0.04] text-[#707070] hover:text-[#171717] dark:hover:text-white'
              }`}
            >
              LIVE UI APPLICATION PREVIEW
            </KromaButton>
            <KromaButton
              variant={activeLabTab === 'api' ? 'filled' : 'ghost'}
              size="sm"
              onClick={() => setActiveLabTab(activeLabTab === 'api' ? 'controls' : 'api')}
              iconLeft={<FileText size={12} />}
              className={`px-3 py-1.5 rounded-xs font-mono text-xs uppercase font-semibold transition-colors cursor-pointer h-auto ${
                activeLabTab === 'api'
                  ? 'bg-black dark:bg-white text-white dark:text-black font-bold'
                  : 'bg-black/[0.04] dark:bg-white/[0.04] text-[#707070] hover:text-[#171717] dark:hover:text-white'
              }`}
            >
              API DOCUMENTATION
            </KromaButton>
          </div>

          {/* Drawer Content */}
          {activeLabTab === 'tokens' && (
            <div className="p-4 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616]">
              <RampsSemanticTokensTable
                tokens={paletteResult.tokens}
                wcagLevel={config.wcag}
                onToggleExcludeToken={(tok) => {
                  handleConfigChange({
                    excludedTokens: config.excludedTokens.includes(tok)
                      ? config.excludedTokens.filter((t) => t !== tok)
                      : [...config.excludedTokens, tok],
                  });
                }}
                excludedTokens={config.excludedTokens}
              />
            </div>
          )}

          {activeLabTab === 'preview' && (
            <div className="p-4 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616]">
              <RampsLiveUiPreview paletteResult={paletteResult} />
            </div>
          )}

          {activeLabTab === 'api' && (
            <div className="p-4 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616]">
              <RampsApiDocs paletteResult={paletteResult} />
            </div>
          )}
        </section>

        {/* ─── 12. CREATE ANOTHER RAMP CALLOUT ─────────────────────── */}
        <section className="p-6 sm:p-8 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1 max-w-lg">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#707070] dark:text-[#909090]">
              COLOR EXPERIMENTATION COMPLETE
            </span>
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
              GENERATE A NEW SPECTRAL SYSTEM.
            </h4>
            <p className="text-xs text-[#707070] dark:text-[#888888] leading-relaxed">
              Synthesize a fresh brand anchor or jump directly into mesh gradients, generative patterns, or live atmospheric color spaces.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <KromaButton
              variant="outline"
              size="md"
              onClick={handleRandomize}
              iconLeft={<Sparkles size={13} />}
            >
              RANDOMIZE RAMP
            </KromaButton>
            <KromaButton
              variant="filled"
              size="md"
              onClick={() => onNavigate({ path: 'mesh' })}
              iconRight={<ArrowRight size={13} />}
            >
              EXPLORE MESH GRADIENTS
            </KromaButton>
          </div>
        </section>
      </div>
    </div>
  );
};
