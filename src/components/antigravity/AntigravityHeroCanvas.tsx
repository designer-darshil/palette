import React, { useRef, useEffect, useState } from 'react';
import {
  AntigravityConfig,
  PhysicsSimulation,
  SimulationState,
  describeMotion,
} from '../../utils/antigravityEngine';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Activity,
  Compass,
} from 'lucide-react';

interface AntigravityHeroCanvasProps {
  config: AntigravityConfig;
  onConfigChange?: (patch: Partial<AntigravityConfig>) => void;
  onObjectClick?: () => void;
}

export const AntigravityHeroCanvas: React.FC<AntigravityHeroCanvasProps> = ({
  config,
  onConfigChange,
  onObjectClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<PhysicsSimulation | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simState, setSimState] = useState<SimulationState>('playing');
  const [objectTransform, setObjectTransform] = useState({ x: 300, y: 200, angle: 0 });
  const [trajectoryPoints, setTrajectoryPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [collisionRipple, setCollisionRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  // Live HUD metrics
  const [hudMetrics, setHudMetrics] = useState({
    x: 300,
    y: 200,
    vx: 0,
    vy: 0,
    speed: 0,
    energy: 0,
  });

  // Initialize and update simulation
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (!simRef.current) {
      simRef.current = new PhysicsSimulation(config, rect.width || 800, rect.height || 500);
    } else {
      simRef.current.updateDimensions(rect.width || 800, rect.height || 500);
      simRef.current.updateConfig(config);
    }

    setObjectTransform({
      x: simRef.current.x,
      y: simRef.current.y,
      angle: simRef.current.angle,
    });
  }, [config]);

  // ResizeObserver for canvas dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50 && simRef.current) {
          simRef.current.updateDimensions(width, height);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animation Loop with requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let throttleCounter = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (simRef.current && isPlaying && document.visibilityState === 'visible') {
        const result = simRef.current.step(dt);

        setObjectTransform({
          x: simRef.current.x,
          y: simRef.current.y,
          angle: simRef.current.angle,
        });

        if (result.collided) {
          setCollisionRipple({
            x: simRef.current.x,
            y: simRef.current.y,
            id: Date.now(),
          });
        }

        throttleCounter++;
        if (throttleCounter % 3 === 0) {
          const vx = simRef.current.vx;
          const vy = simRef.current.vy;
          const speed = Math.sqrt(vx * vx + vy * vy);
          const energy = Math.round(0.5 * config.mass * (speed ** 2) / 100);
          setSimState(simRef.current.state);

          setHudMetrics({
            x: Math.round(simRef.current.x),
            y: Math.round(simRef.current.y),
            vx: Math.round(vx),
            vy: Math.round(vy),
            speed: Math.round(speed),
            energy,
          });

          if (config.showTrajectory) {
            setTrajectoryPoints(simRef.current.getTrajectoryPoints(24, 0.05));
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, config.showTrajectory, config.mass]);

  // Pointer Handlers for Direct Drag & Throw
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current || !simRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    simRef.current.startDrag(e.clientX, e.clientY, rect);
    setSimState('dragging');
    if (onObjectClick) onObjectClick();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !simRef.current || !simRef.current.isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    simRef.current.dragTo(e.clientX, e.clientY, rect);

    setObjectTransform({
      x: simRef.current.x,
      y: simRef.current.y,
      angle: simRef.current.angle,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!simRef.current || !simRef.current.isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    simRef.current.releaseDrag();
    setSimState('playing');
  };

  const handleReset = () => {
    if (simRef.current) {
      simRef.current.reset();
      setObjectTransform({
        x: simRef.current.x,
        y: simRef.current.y,
        angle: simRef.current.angle,
      });
    }
  };

  const motionDesc = describeMotion(config);

  return (
    <div className="w-full h-full min-h-[480px] lg:min-h-[560px] flex flex-col relative rounded-xs overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface-1)]">
      {/* 1. Main Interactive Simulation Stage */}
      <div
        ref={containerRef}
        className="relative w-full flex-1 overflow-hidden cursor-crosshair select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Subtle Kinematic Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(var(--text-tertiary) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Gravity Force Direction Vector Indicator */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[var(--bg-surface-2)]/80 backdrop-blur-md border border-[var(--border-subtle)] px-2.5 py-1.5 rounded-xs font-mono text-[10px] text-[var(--text-secondary)] shadow-xs pointer-events-none">
          <Compass size={13} className="text-[var(--color-primary)]" />
          <span>
            G: ({config.gravityX > 0 ? `+${config.gravityX}` : config.gravityX}, {config.gravityY > 0 ? `+${config.gravityY}` : config.gravityY})
          </span>
        </div>

        {/* Top-Right Direct State Badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[var(--bg-surface-2)]/80 backdrop-blur-md border border-[var(--border-subtle)] px-2.5 py-1.5 rounded-xs font-mono text-[10px] shadow-xs pointer-events-none">
          <span
            className={`w-2 h-2 rounded-full ${
              simState === 'dragging'
                ? 'bg-amber-400 animate-pulse'
                : isPlaying
                ? 'bg-emerald-400'
                : 'bg-rose-400'
            }`}
          />
          <span className="uppercase font-bold text-[var(--text-primary)]">
            {simState === 'dragging' ? 'DIRECT USER DRAG' : isPlaying ? 'SIMULATING' : 'PAUSED'}
          </span>
        </div>

        {/* Trajectory Prediction Nodes */}
        {config.showTrajectory && trajectoryPoints.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {trajectoryPoints.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={Math.max(1, 3 - idx * 0.1)}
                fill="var(--color-primary)"
                opacity={Math.max(0.08, 0.7 - idx * 0.025)}
              />
            ))}
          </svg>
        )}

        {/* Collision Impact Pulse */}
        {collisionRipple && (
          <div
            key={collisionRipple.id}
            className="absolute rounded-full border border-[var(--color-primary)] pointer-events-none animate-ping"
            style={{
              left: collisionRipple.x - 30,
              top: collisionRipple.y - 30,
              width: 60,
              height: 60,
              opacity: 0.6,
            }}
          />
        )}

        {/* The Hero Physics Object (Direct Manipulation / Drag & Throw) */}
        <div
          onPointerDown={handlePointerDown}
          className="absolute z-20 cursor-grab active:cursor-grabbing transition-shadow"
          style={{
            transform: `translate(${objectTransform.x}px, ${objectTransform.y}px) rotate(${objectTransform.angle}deg)`,
            transformOrigin: 'center center',
            touchAction: 'none',
            left: 0,
            top: 0,
            marginTop: -40,
            marginLeft: -40,
          }}
        >
          {/* Object Styling Based on Type */}
          {config.object === 'card' && (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-md bg-[var(--bg-surface-elevated)] border-2 border-[var(--color-primary-border)] shadow-2xl flex flex-col justify-between p-2.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                <span className="font-mono text-[9px] text-[var(--text-tertiary)]">MASS {config.mass}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] font-bold text-[var(--text-primary)]">KROMA SPECIMEN</span>
                <span className="font-mono text-[8px] text-[var(--text-tertiary)]">#BFA3F0 ACCENT</span>
              </div>
              <div className="w-full h-1 bg-[var(--color-primary-subtle)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] w-3/4" />
              </div>
            </div>
          )}

          {config.object === 'circle' && (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[var(--bg-surface-3)] to-[var(--color-primary-subtle)] border-2 border-[var(--color-primary)] shadow-2xl flex items-center justify-center backdrop-blur-md">
              <Sparkles size={20} className="text-[var(--color-primary)]" />
            </div>
          )}

          {(config.object === 'rounded' || config.object === 'button') && (
            <div className="w-32 h-14 sm:w-36 sm:h-16 rounded-full bg-[var(--bg-surface-elevated)] border-2 border-[var(--color-primary)] shadow-2xl flex items-center justify-between px-3.5 backdrop-blur-md">
              <span className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
              <span className="font-mono text-xs font-bold text-[var(--text-primary)]">MOTION TOKEN</span>
              <span className="font-mono text-[9px] text-[var(--text-tertiary)]">{Math.round(hudMetrics.speed)}px/s</span>
            </div>
          )}

          {(config.object === 'square' || config.object === 'icon' || config.object === 'panel' || config.object === 'blob' || config.object === 'notification' || config.object === 'badge') && (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xs bg-[var(--bg-surface-elevated)] border-2 border-[var(--color-primary)] shadow-2xl flex items-center justify-center font-mono font-bold text-xs text-[var(--text-primary)]">
              CUBE-{config.mass}
            </div>
          )}
        </div>

        {/* Floating Stage Bottom HUD Bar (Micro Telemetry & Transport Controls) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[var(--bg-surface-1)]/90 backdrop-blur-xl border border-[var(--border-strong)] px-3 py-1.5 rounded-full shadow-2xl">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Simulation (Space)' : 'Play Simulation (Space)'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} className="text-emerald-400 fill-emerald-400" />}
          </button>

          {/* Reset Object */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-full bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Reset Object Position (R)"
          >
            <RotateCcw size={13} />
          </button>

          <div className="h-4 w-px bg-[var(--border-subtle)] mx-1" />

          {/* Live Telemetry Readout */}
          <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--text-secondary)] px-1">
            <span className="flex items-center gap-1">
              <span className="text-[var(--text-tertiary)]">V:</span>
              <strong className="text-[var(--text-primary)]">{hudMetrics.speed}</strong>
              <span className="text-[9px] text-[var(--text-tertiary)]">px/s</span>
            </span>

            <span className="flex items-center gap-1">
              <span className="text-[var(--text-tertiary)]">KE:</span>
              <strong className="text-[var(--color-primary-text)]">{hudMetrics.energy}</strong>
              <span className="text-[9px] text-[var(--text-tertiary)]">J</span>
            </span>

            <span className="hidden sm:flex items-center gap-1">
              <span className="text-[var(--text-tertiary)]">POS:</span>
              <span className="text-[var(--text-primary)]">({hudMetrics.x}, {hudMetrics.y})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Motion Description Bar */}
      <div className="px-4 py-2 bg-[var(--bg-surface-2)] border-t border-[var(--border-subtle)] flex items-center justify-between font-mono text-[11px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-2 truncate">
          <Activity size={13} className="text-[var(--color-primary)] flex-shrink-0" />
          <span className="truncate">{motionDesc}</span>
        </div>
        <span className="font-bold text-[var(--color-primary)] flex-shrink-0 uppercase text-[10px] hidden sm:inline">
          {config.preset ? config.preset.replace('-', ' ') : 'CUSTOM MOTION'}
        </span>
      </div>
    </div>
  );
};
