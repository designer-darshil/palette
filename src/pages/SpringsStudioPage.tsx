import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RouteType } from '../types';
import {
  SpringsConfig,
  DEFAULT_SPRINGS_CONFIG,
  SPRING_PRESETS,
  SpringMode,
  SpringObjectShape,
  SpringSimulation,
  SpringPreset,
  calculateSpringMetrics,
  serializeSpringsConfig,
  deserializeSpringsConfig,
  generateCssSpringExport,
  generateJsSpringExport,
  generateFramerMotionSpringExport,
  generateDtcgSpringTokens,
} from '../utils/springsEngine';
import { SEOHead } from '../components/seo/SEOHead';
import { KromaButton } from '../components/common/KromaButton';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Undo2,
  Redo2,
  Share2,
  Sliders,
  SlidersHorizontal,
  Code2,
  Activity,
  Layers,
  ArrowRight,
  Zap,
  Maximize2,
  FileCode,
} from 'lucide-react';

interface SpringsStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialParams?: Record<string, string | undefined>;
}

const KROMA_PALETTE = ['#FF3B30', '#FF9500', '#FFD60A', '#34C759', '#00AEEF', '#7B2CBF'];

export const SpringsStudioPage: React.FC<SpringsStudioPageProps> = ({
  onNavigate,
  initialParams,
}) => {
  // ─── 1. Configuration & History State ─────────────────────────────
  const [config, setConfig] = useState<SpringsConfig>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return deserializeSpringsConfig(searchParams);
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [copiedCodeType, setCopiedCodeType] = useState<string | null>(null);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'css' | 'js' | 'framer' | 'dtcg'>('css');

  // History for Undo/Redo
  const [history, setHistory] = useState<SpringsConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // ─── 2. Physics Simulation State & Refs ────────────────────────────
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<SpringSimulation | null>(null);
  const [, setFrameTick] = useState(0);

  // Sync URL query parameters
  useEffect(() => {
    const qs = serializeSpringsConfig(config);
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [config]);

  // Handle configuration changes with undo history
  const handleConfigChange = useCallback((patch: Partial<SpringsConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch, preset: patch.preset !== undefined ? patch.preset : null };
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

  const handleApplyPreset = useCallback((preset: SpringPreset) => {
    handleConfigChange({
      ...preset.config,
      preset: preset.id,
    });
  }, [handleConfigChange]);

  const handleRandomize = useCallback(() => {
    const randomK = Math.round(80 + Math.random() * 500);
    const randomC = Math.round(5 + Math.random() * 35);
    const randomM = parseFloat((0.4 + Math.random() * 2.5).toFixed(1));
    const randomColor = KROMA_PALETTE[Math.floor(Math.random() * KROMA_PALETTE.length)];
    const modes: SpringMode[] = ['single', 'chain', 'field', 'weave'];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];

    handleConfigChange({
      stiffness: randomK,
      damping: randomC,
      mass: randomM,
      activeColor: randomColor,
      mode: randomMode,
    });
  }, [handleConfigChange]);

  const handleReset = useCallback(() => {
    handleConfigChange({ ...DEFAULT_SPRINGS_CONFIG });
    if (simulationRef.current) {
      simulationRef.current.reset();
    }
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

  // ─── 3. Physics Simulation Lifecycle ──────────────────────────────
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 480;

    if (!simulationRef.current) {
      simulationRef.current = new SpringSimulation(config, w, h);
    } else {
      simulationRef.current.updateDimensions(w, h);
      simulationRef.current.updateConfig(config);
    }
  }, [config]);

  // ResizeObserver for canvas dimensions
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50 && simulationRef.current) {
          simulationRef.current.updateDimensions(width, height);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animation Frame Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      if (simulationRef.current && isPlaying && document.visibilityState === 'visible') {
        simulationRef.current.step(dt);
        setFrameTick((t) => (t + 1) % 10000);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent, nodeId: string) => {
    if (!canvasContainerRef.current || !simulationRef.current) return;
    e.stopPropagation();
    const rect = canvasContainerRef.current.getBoundingClientRect();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    simulationRef.current.startDrag(nodeId, e.clientX, e.clientY, rect);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasContainerRef.current || !simulationRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    simulationRef.current.dragTo(e.clientX, e.clientY, rect);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!simulationRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    simulationRef.current.releaseDrag();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasContainerRef.current || !simulationRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    simulationRef.current.applyImpulse(clickX, clickY, 350);
  };

  // ─── 4. Metrics & Code Exports ───────────────────────────────────
  const metrics = useMemo(() => {
    return calculateSpringMetrics(config.stiffness, config.damping, config.mass);
  }, [config.stiffness, config.damping, config.mass]);

  const cssExport = useMemo(() => generateCssSpringExport(config), [config]);
  const jsExport = useMemo(() => generateJsSpringExport(config), [config]);
  const framerExport = useMemo(() => generateFramerMotionSpringExport(config), [config]);
  const dtcgExport = useMemo(() => JSON.stringify(generateDtcgSpringTokens(config), null, 2), [config]);

  const currentCodeOutput = useMemo(() => {
    switch (activeCodeTab) {
      case 'css':
        return cssExport;
      case 'js':
        return jsExport;
      case 'framer':
        return framerExport;
      case 'dtcg':
        return dtcgExport;
    }
  }, [activeCodeTab, cssExport, jsExport, framerExport, dtcgExport]);

  const simNodes = simulationRef.current ? simulationRef.current.nodes : [];
  const trailPoints = simulationRef.current ? simulationRef.current.trailPoints : [];

  return (
    <div className="w-full bg-[#F8F8F8] dark:bg-[#121212] text-[#171717] dark:text-[#EAEAEA] font-sans antialiased min-h-screen">
      <SEOHead
        title="Springs Studio — Physics & Motion Interaction Laboratory"
        description="A playful, tactile physics laboratory for exploring spring motion, elasticity, weight, tension, and kinetic UI interactions. Export to CSS, JavaScript, Framer Motion, and DTCG design tokens."
        canonicalPath="/springs"
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
              className="hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer p-0 h-auto font-mono text-xs text-[#707070] uppercase tracking-wider"
            >
              HOME
            </KromaButton>
            <span className="opacity-40">/</span>
            <KromaButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate({ path: 'create' })}
              className="hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer p-0 h-auto font-mono text-xs text-[#707070] uppercase tracking-wider"
            >
              STUDIO
            </KromaButton>
            <span className="opacity-40">/</span>
            <span className="text-[#171717] dark:text-white font-semibold">SPRINGS</span>
          </nav>

          {/* Compact Headline */}
          <div className="flex flex-col justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-4">
            <div>
              <span className="font-mono text-xs font-semibold text-text-tertiary uppercase tracking-wider block mb-1">
                SPRINGS · PHYSICS & INTERACTION LAB
              </span>
              <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight text-text-primary uppercase m-0">
                LET COLOR BOUNCE.
              </h1>
            </div>

            <p className="max-w-2xl text-sm sm:text-base text-text-secondary leading-relaxed">
              A playful physics laboratory for exploring spring motion, elasticity, weight, tension,
              and tactile interaction through real-time harmonic simulation.
            </p>
          </div>
        </section>

        {/* ─── 2. PRIMARY SPRING CANVAS (THE HERO) ─────────────────── */}
        <section className="flex flex-col gap-3">
          {/* Top Canvas Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-[#171717] dark:text-white font-bold">
                PHYSICS ARTBOARD
              </span>
              <span className="font-mono text-xs text-[#707070] uppercase">
                ({config.mode.toUpperCase()} MODE · k={config.stiffness} N/m)
              </span>
            </div>

            {/* Quick Canvas Controls */}
            <div className="flex items-center gap-2">
              <KromaButton
                variant="outline"
                size="sm"
                iconLeft={isPlaying ? <Pause size={12} /> : <Play size={12} />}
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2.5 py-1 text-xs font-mono rounded-xs bg-white dark:bg-[#202020] text-[#171717] dark:text-white h-auto"
              >
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </KromaButton>
              <KromaButton
                variant={config.showSpringLine ? 'filled' : 'outline'}
                size="sm"
                onClick={() => handleConfigChange({ showSpringLine: !config.showSpringLine })}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs h-auto ${
                  config.showSpringLine
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                    : 'text-[#707070]'
                }`}
              >
                SPRING LINES
              </KromaButton>
              <KromaButton
                variant={config.showTrails ? 'filled' : 'outline'}
                size="sm"
                onClick={() => handleConfigChange({ showTrails: !config.showTrails })}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs h-auto ${
                  config.showTrails
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                    : 'text-[#707070]'
                }`}
              >
                TRAILS
              </KromaButton>
            </div>
          </div>

          {/* Hero Simulation Artboard Container */}
          <div
            ref={canvasContainerRef}
            onClick={handleCanvasClick}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-full h-80 sm:h-96 md:h-[480px] rounded-sm overflow-hidden border border-black/[0.1] dark:border-white/[0.1] bg-[#F3F3F3] dark:bg-[#161616] cursor-crosshair select-none shadow-sm transition-all"
          >
            {/* Coordinate Dot Grid */}
            {config.showGrid && (
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage: `radial-gradient(#707070 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }}
              />
            )}

            {/* SVG Spring Connectors & Trails */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
              {/* Motion Trails */}
              {config.showTrails &&
                trailPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={Math.max(2, 6 - i * 0.25)}
                    fill={pt.color}
                    opacity={pt.opacity * 0.4}
                  />
                ))}

              {/* Elastic Spring Lines / Coils */}
              {config.showSpringLine &&
                simNodes.map((node) => {
                  return (
                    <g key={`spring-line-${node.id}`}>
                      {/* Equilibrium Anchor Mark */}
                      <circle
                        cx={node.anchorX}
                        cy={node.anchorY}
                        r={4}
                        fill="none"
                        stroke="#707070"
                        strokeWidth={1.5}
                        strokeDasharray="2,2"
                        opacity={0.6}
                      />
                      {/* Dynamic Spring Line */}
                      <line
                        x1={node.anchorX}
                        y1={node.anchorY}
                        x2={node.x}
                        y2={node.y}
                        stroke={node.color}
                        strokeWidth={Math.max(1.5, 4 - Math.hypot(node.x - node.anchorX, node.y - node.anchorY) * 0.01)}
                        strokeLinecap="round"
                        opacity={0.7}
                      />
                    </g>
                  );
                })}

              {/* Inter-node connection lines for Chain & Weave modes */}
              {config.showSpringLine && config.mode === 'chain' && (
                simNodes.map((node, i) => {
                  if (i === 0) return null;
                  const prev = simNodes[i - 1];
                  return (
                    <line
                      key={`chain-link-${i}`}
                      x1={prev.x}
                      y1={prev.y}
                      x2={node.x}
                      y2={node.y}
                      stroke="#171717"
                      strokeWidth={2}
                      strokeDasharray="4,4"
                      className="dark:stroke-white"
                      opacity={0.5}
                    />
                  );
                })
              )}

              {config.showSpringLine && config.mode === 'weave' && (
                simNodes.map((node, i) => {
                  const next = simNodes[(i + 1) % simNodes.length];
                  return (
                    <line
                      key={`weave-link-${i}`}
                      x1={node.x}
                      y1={node.y}
                      x2={next.x}
                      y2={next.y}
                      stroke={node.color}
                      strokeWidth={1.5}
                      opacity={0.5}
                    />
                  );
                })
              )}
            </svg>

            {/* Interactive Physics Nodes / Objects */}
            {simNodes.map((node) => {
              const speed = Math.hypot(node.vx, node.vy);
              const stretchScale = node.isDragging ? 1.08 : Math.min(1.2, 1 + speed * 0.0003);

              return (
                <div
                  key={node.id}
                  onPointerDown={(e) => handlePointerDown(e, node.id)}
                  className={`absolute z-20 flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
                    node.isDragging ? 'shadow-2xl z-30' : 'shadow-md'
                  }`}
                  style={{
                    transform: `translate(${node.x - node.radius}px, ${node.y - node.radius}px) scale(${stretchScale})`,
                    width: node.radius * 2,
                    height: node.radius * 2,
                    backgroundColor: node.color,
                    borderRadius:
                      config.object === 'circle'
                        ? '9999px'
                        : config.object === 'square'
                        ? '2px'
                        : config.object === 'diamond'
                        ? '4px'
                        : '8px',
                    transformOrigin: 'center center',
                    touchAction: 'none',
                  }}
                >
                  <span className="font-mono text-xs font-bold text-white drop-shadow-xs select-none pointer-events-none">
                    {node.label ? node.label.split(' ')[0] : ''}
                  </span>
                </div>
              );
            })}

            {/* Corner Badges */}
            <div className="absolute top-3 left-3 bg-white/80 dark:bg-black/80 backdrop-blur-xs border border-black/10 dark:border-white/10 px-2.5 py-1 rounded-xs font-mono text-xs text-[#707070] dark:text-[#909090] flex items-center gap-1.5 pointer-events-none">
              <Activity size={12} className="text-emerald-500" />
              <span>{metrics.regime.toUpperCase()} · ζ={metrics.zeta}</span>
            </div>

            <div className="absolute bottom-3 right-3 bg-white/80 dark:bg-black/80 backdrop-blur-xs border border-black/10 dark:border-white/10 px-2.5 py-1 rounded-xs font-mono text-xs text-[#707070] dark:text-[#909090] pointer-events-none">
              <span>DRAG TO PULL · CLICK TO IMPULSE</span>
            </div>
          </div>
        </section>

        {/* ─── 3. SPRING INSTRUMENT (LABORATORY CONTROLS) ──────────── */}
        <section className="p-5 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] flex flex-col gap-5">
          {/* Header Row */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#171717] dark:text-white" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#171717] dark:text-white">
                SPRING INSTRUMENT CONTROLS
              </span>
            </div>

            {/* Action Buttons using KromaButton with ONE ACTION = ONE VISUAL ICON */}
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

          {/* Mode Selector */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
              SPRING ARCHITECTURE MODE
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {(
                [
                  { id: 'single', name: 'SINGLE SPRING', desc: 'Anchor → Spring → Mass' },
                  { id: 'chain', name: 'SPRING CHAIN', desc: 'Sequential multi-body wave' },
                  { id: 'field', name: 'SPRING FIELD', desc: 'Spatial anchor lattice' },
                  { id: 'weave', name: 'COLOR WEAVE', desc: 'Woven chromatic mesh' },
                ] as const
              ).map((m) => (
                <KromaButton
                  key={m.id}
                  variant={config.mode === m.id ? 'filled' : 'outline'}
                  size="sm"
                  onClick={() => handleConfigChange({ mode: m.id })}
                  className={`p-3 rounded-xs text-left flex flex-col items-start gap-1 transition-all h-auto w-full min-h-[72px] ${
                    config.mode === m.id
                      ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-canvas)] shadow-xs'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)] bg-transparent text-[var(--text-primary)]'
                  }`}
                >
                  <span className="font-bold text-xs uppercase tracking-wider block">
                    {m.name}
                  </span>
                  <span className={`text-xs leading-tight font-normal block ${
                    config.mode === m.id ? 'opacity-85' : 'text-[var(--text-secondary)]'
                  }`}>
                    {m.desc}
                  </span>
                </KromaButton>
              ))}
            </div>
          </div>

          {/* Primary Parameter Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
            {/* Stiffness (k) */}
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
                  STIFFNESS (k)
                </span>
                <span className="font-bold text-[#171717] dark:text-white">
                  {config.stiffness} N/m
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={800}
                step={10}
                value={config.stiffness}
                onChange={(e) => handleConfigChange({ stiffness: parseFloat(e.target.value) })}
                className="w-full accent-[#171717] dark:accent-white cursor-pointer"
              />
              <span className="text-xs text-[#707070] dark:text-[#888888]">
                Restoring force magnitude per unit displacement
              </span>
            </div>

            {/* Damping (c) */}
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
                  DAMPING (c)
                </span>
                <span className="font-bold text-[#171717] dark:text-white">
                  {config.damping} N·s/m
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={60}
                step={1}
                value={config.damping}
                onChange={(e) => handleConfigChange({ damping: parseFloat(e.target.value) })}
                className="w-full accent-[#171717] dark:accent-white cursor-pointer"
              />
              <span className="text-xs text-[#707070] dark:text-[#888888]">
                Viscous drag opposing oscillation velocity
              </span>
            </div>

            {/* Mass (m) */}
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
                  MASS (m)
                </span>
                <span className="font-bold text-[#171717] dark:text-white">
                  {config.mass.toFixed(1)} kg
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={5.0}
                step={0.1}
                value={config.mass}
                onChange={(e) => handleConfigChange({ mass: parseFloat(e.target.value) })}
                className="w-full accent-[#171717] dark:accent-white cursor-pointer"
              />
              <span className="text-xs text-[#707070] dark:text-[#888888]">
                Inertial resistance to acceleration
              </span>
            </div>

            {/* Friction & Time Scale */}
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
                  SURFACE FRICTION
                </span>
                <span className="font-bold text-[#171717] dark:text-white">
                  {config.friction.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={0.3}
                step={0.01}
                value={config.friction}
                onChange={(e) => handleConfigChange({ friction: parseFloat(e.target.value) })}
                className="w-full accent-[#171717] dark:accent-white cursor-pointer"
              />
              <span className="text-xs text-[#707070] dark:text-[#888888]">
                Surface boundary resistance
              </span>
            </div>
          </div>

          {/* Color & Shape Selectors */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] font-mono text-xs">
            {/* Color swatches */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
                MATERIAL COLOR:
              </span>
              <div className="flex items-center gap-1.5">
                {KROMA_PALETTE.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => handleConfigChange({ activeColor: hex })}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                      config.activeColor.toLowerCase() === hex.toLowerCase()
                        ? 'ring-2 ring-black dark:ring-white scale-110'
                        : 'border-black/10 dark:border-white/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>

            {/* Object shape */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090]">
                GEOMETRY:
              </span>
              <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-xs">
                {(['circle', 'square', 'rounded', 'diamond'] as const).map((shp) => (
                  <KromaButton
                    key={shp}
                    variant={config.object === shp ? 'filled' : 'ghost'}
                    size="sm"
                    onClick={() => handleConfigChange({ object: shp })}
                    className={`px-2 py-0.5 rounded-xs uppercase font-semibold text-xs h-auto min-h-0 border-0 ${
                      config.object === shp
                        ? 'bg-white dark:bg-[#252525] text-[#171717] dark:text-white font-bold shadow-xs'
                        : 'text-[#707070] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    {shp}
                  </KromaButton>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. SPRING PRESETS (WITH MINI MOTION PREVIEWS) ────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090] uppercase tracking-wider">
              CURATED PHYSICAL PRESETS
            </span>
            <span className="font-mono text-xs text-[#707070] dark:text-[#888888]">
              ONE-CLICK TUNED HARMONICS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SPRING_PRESETS.map((preset) => {
              const isSelected = config.preset === preset.id;
              const pMet = calculateSpringMetrics(
                preset.config.stiffness || 220,
                preset.config.damping || 14,
                preset.config.mass || 1.0
              );

              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${preset.name} spring preset`}
                  className={`p-3 rounded-sm border transition-all cursor-pointer flex flex-col justify-between gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                    isSelected
                      ? 'border-[#171717] dark:border-white bg-white dark:bg-[#1A1A1A] shadow-sm ring-1 ring-black/5'
                      : 'border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs font-bold text-[#171717] dark:text-white uppercase">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="text-xs px-1.5 py-0.2 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Motion specimen bar */}
                  <div className="h-10 w-full rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] relative overflow-hidden flex items-center justify-center pointer-events-none">
                    <div
                      className="w-5 h-5 rounded-full transition-transform"
                      style={{
                        backgroundColor: preset.config.activeColor || '#3D7DFF',
                        animation: `kroma-spring-preview-${preset.id} ${Math.max(1, pMet.periodMs * 0.002)}s ease-in-out infinite alternate`,
                      }}
                    />
                  </div>

                  <p className="text-xs text-[#707070] dark:text-[#888888] leading-snug line-clamp-2">
                    {preset.description}
                  </p>

                  <div className="flex items-center justify-between font-mono text-xs text-[#707070] dark:text-[#909090] pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <span>k: {preset.config.stiffness}</span>
                    <span>c: {preset.config.damping}</span>
                    <span>m: {preset.config.mass}kg</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── 5. SPRING EXPERIMENTS GALLERY ───────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090] uppercase tracking-wider">
              SPRING EXPERIMENTS · KINETIC PHENOMENA
            </span>
            <span className="font-mono text-xs text-[#707070] dark:text-[#888888]">
              MODAL RIG EXPERIMENTS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                title: 'CRITICAL DAMPING',
                tag: 'EXP 01',
                desc: 'Fastest return to equilibrium without overshooting or oscillation.',
                k: 400,
                c: 40,
                m: 1.0,
                color: '#FF3B30',
              },
              {
                title: 'UNDERDAMPED BOUNCE',
                tag: 'EXP 02',
                desc: 'Rhythmic oscillatory decay with high elastic coefficient.',
                k: 240,
                c: 6,
                m: 0.8,
                color: '#FF9500',
              },
              {
                title: 'HEAVY IMPACT INERTIA',
                tag: 'EXP 03',
                desc: 'Substantial mass with authoritative, sluggish momentum.',
                k: 360,
                c: 44,
                m: 4.2,
                color: '#7B2CBF',
              },
              {
                title: 'MICRO-VIBRATION WHIP',
                tag: 'EXP 04',
                desc: 'Ultra-light high-stiffness spring generating rapid reverberation.',
                k: 720,
                c: 12,
                m: 0.3,
                color: '#00AEEF',
              },
            ].map((exp) => (
              <button
                type="button"
                key={exp.tag}
                onClick={() =>
                  handleConfigChange({
                    stiffness: exp.k,
                    damping: exp.c,
                    mass: exp.m,
                    activeColor: exp.color,
                  })
                }
                aria-label={`Apply ${exp.title} (${exp.tag}) configuration`}
                className="p-3.5 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between gap-2.5 group shadow-2xs text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="text-xs text-[#707070] dark:text-[#888888] uppercase">
                    {exp.tag}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: exp.color }}
                  />
                </div>

                <div>
                  <h4 className="font-mono text-xs font-bold text-[#171717] dark:text-white uppercase group-hover:text-emerald-500 transition-colors">
                    {exp.title}
                  </h4>
                  <p className="text-xs text-[#707070] dark:text-[#888888] leading-snug mt-1">
                    {exp.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between font-mono text-xs text-[#707070] dark:text-[#909090] pt-1.5 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <span>k={exp.k} · c={exp.c}</span>
                  <span className="text-[#171717] dark:text-white font-semibold">APPLY →</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ─── 6. PHYSICS SPECIFICATION SHEET ──────────────────────── */}
        <section className="p-5 sm:p-6 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] flex flex-col gap-4 font-mono">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <div>
              <span className="text-xs uppercase font-bold text-[#707070] dark:text-[#909090] block">
                MATHEMATICAL MODEL & SCIENTIFIC DATA
              </span>
              <h3 className="text-base font-bold text-[#171717] dark:text-white uppercase">
                SPRING OSCILLATOR SPECIFICATION
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
              {metrics.regime}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-2.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <span className="text-xs text-[#707070] dark:text-[#888888] uppercase block">NATURAL FREQ (ω₀)</span>
              <span className="font-bold text-[#171717] dark:text-white text-sm">
                {metrics.omega0} rad/s
              </span>
            </div>

            <div className="p-2.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <span className="text-xs text-[#707070] dark:text-[#888888] uppercase block">DAMPING RATIO (ζ)</span>
              <span className="font-bold text-[#171717] dark:text-white text-sm">
                {metrics.zeta}
              </span>
            </div>

            <div className="p-2.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <span className="text-xs text-[#707070] dark:text-[#888888] uppercase block">DAMPED FREQ (ω_d)</span>
              <span className="font-bold text-[#171717] dark:text-white text-sm">
                {metrics.omegaD} rad/s
              </span>
            </div>

            <div className="p-2.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <span className="text-xs text-[#707070] dark:text-[#888888] uppercase block">PERIOD (T)</span>
              <span className="font-bold text-[#171717] dark:text-white text-sm">
                {metrics.periodMs} ms
              </span>
            </div>

            <div className="p-2.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <span className="text-xs text-[#707070] dark:text-[#888888] uppercase block">SETTLING TIME</span>
              <span className="font-bold text-[#171717] dark:text-white text-sm">
                ~{metrics.settlingTimeSec} s
              </span>
            </div>

            <div className="p-2.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <span className="text-xs text-[#707070] dark:text-[#888888] uppercase block">MASS RATIO</span>
              <span className="font-bold text-[#171717] dark:text-white text-sm">
                {config.mass} kg
              </span>
            </div>
          </div>
        </section>

        {/* ─── 7. TECHNICAL CODE & TOKEN EXPORTS ───────────────────── */}
        <section className="p-5 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] flex flex-col gap-4 min-w-0 max-w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-3 min-w-0">
            <div className="flex items-center gap-2">
              <FileCode size={14} className="text-[#171717] dark:text-white" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#171717] dark:text-white">
                TECHNICAL CODE SPECIMEN & EXPORTS
              </span>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-xs font-mono text-xs">
              {(
                [
                  { id: 'css', label: 'CSS @KEYFRAMES' },
                  { id: 'js', label: 'VANILLA JS LOOP' },
                  { id: 'framer', label: 'FRAMER MOTION' },
                  { id: 'dtcg', label: 'DTCG TOKENS' },
                ] as const
              ).map((tab) => (
                <KromaButton
                  key={tab.id}
                  variant={activeCodeTab === tab.id ? 'filled' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveCodeTab(tab.id)}
                  className={`px-2.5 py-1 rounded-xs transition-colors text-xs uppercase font-semibold h-auto min-h-0 border-0 ${
                    activeCodeTab === tab.id
                      ? 'bg-white dark:bg-[#202020] text-[#171717] dark:text-white font-bold shadow-xs'
                      : 'text-[#707070] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </KromaButton>
              ))}
            </div>

            {/* Copy Action using KromaButton with ONE ACTION = ONE VISUAL ICON */}
            <KromaButton
              variant="filled"
              size="sm"
              onClick={() => handleCopyCode(currentCodeOutput, activeCodeTab)}
              iconLeft={copiedCodeType === activeCodeTab ? <Check size={11} /> : <Copy size={11} />}
            >
              {copiedCodeType === activeCodeTab ? 'COPIED CODE' : 'COPY SPECIMEN'}
            </KromaButton>
          </div>

          {/* Strictly Contained Code Block (min-w-0, max-w-full, overflow-x-auto) */}
          <div className="w-full min-w-0 max-w-full overflow-x-auto bg-[#181818] p-4 rounded-xs border border-white/10 font-mono text-xs text-neutral-300 leading-relaxed">
            <pre className="min-w-0 max-w-full overflow-x-auto whitespace-pre">
              <code>{currentCodeOutput}</code>
            </pre>
          </div>
        </section>

        {/* ─── 8. CREATE ANOTHER EXPERIMENT CALLOUT ─────────────────── */}
        <section className="p-6 sm:p-8 rounded-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1 max-w-lg">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#707070] dark:text-[#909090]">
              MOTION EXPERIMENTATION COMPLETE
            </span>
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
              EXPLORE COLOR IN MOTION.
            </h4>
            <p className="text-xs text-[#707070] dark:text-[#888888] leading-relaxed">
              Transition from kinetic spring mechanics to continuous OKLCH color ramps, radial mesh gradients, or generative vector artboards.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <KromaButton
              variant="outline"
              size="md"
              onClick={() => onNavigate({ path: 'ramps' })}
              iconRight={<ArrowRight size={13} />}
            >
              COLOR RAMPS LAB
            </KromaButton>
            <KromaButton
              variant="filled"
              size="md"
              onClick={() => onNavigate({ path: 'mesh' })}
              iconRight={<ArrowRight size={13} />}
            >
              MESH GRADIENT STUDIO
            </KromaButton>
          </div>
        </section>
      </div>
    </div>
  );
};
