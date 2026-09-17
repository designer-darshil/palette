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
  CheckCircle2,
  Box,
} from 'lucide-react';

interface PhysicsStageProps {
  config: AntigravityConfig;
  onStateUpdate?: (data: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    state: SimulationState;
  }) => void;
}

export const PhysicsStage: React.FC<PhysicsStageProps> = ({ config, onStateUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<PhysicsSimulation | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simState, setSimState] = useState<SimulationState>('playing');
  const [objectTransform, setObjectTransform] = useState({ x: 300, y: 200, angle: 0 });
  const [trajectoryPoints, setTrajectoryPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [collisionRipple, setCollisionRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  // Live telemetry metrics for integrated HUD strip
  const [hudMetrics, setHudMetrics] = useState({
    x: 300,
    y: 200,
    vx: 0,
    vy: 0,
    speed: 0,
    energy: 0,
  });

  // Initialize and update simulation when dimensions or config change
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (!simRef.current) {
      simRef.current = new PhysicsSimulation(config, rect.width || 800, rect.height || 480);
    } else {
      simRef.current.updateDimensions(rect.width || 800, rect.height || 480);
      simRef.current.updateConfig(config);
    }

    setObjectTransform({
      x: simRef.current.x,
      y: simRef.current.y,
      angle: simRef.current.angle,
    });
  }, [config]);

  // ResizeObserver to keep simulation stage boundaries calibrated
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

  // Animation Loop with requestAnimationFrame and visibility pause
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

        // Throttle telemetry update to React parent (every 3 frames) for 60fps smoothness
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

          if (onStateUpdate) {
            onStateUpdate({
              x: Math.round(simRef.current.x),
              y: Math.round(simRef.current.y),
              vx: Math.round(vx),
              vy: Math.round(vy),
              speed: Math.round(speed),
              state: simRef.current.state,
            });
          }

          if (config.showTrajectory) {
            setTrajectoryPoints(simRef.current.getTrajectoryPoints(24, 0.05));
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, onStateUpdate, config.showTrajectory, config.mass]);

  // Pointer Interaction Handlers (Click / Touch Drag & Throw)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current || !simRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    simRef.current.startDrag(e.clientX, e.clientY, rect);
    setSimState('dragging');
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

  const handleImpulse = (ix: number, iy: number) => {
    if (simRef.current) {
      simRef.current.applyImpulse(ix, iy);
    }
  };

  // Render Object based on chosen Shape / UI Element using #BFA3F0 accents
  const renderObjectContent = () => {
    switch (config.object) {
      case 'circle':
        return (
          <div
            className="w-14 h-14 rounded-full border-2 shadow-lg flex items-center justify-center relative cursor-grab active:cursor-grabbing"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-primary-hover)',
              color: 'var(--color-primary-contrast)',
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
            <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-white/70" />
          </div>
        );

      case 'square':
        return (
          <div
            className="w-14 h-14 rounded-xs border-2 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-primary-hover)',
              color: 'var(--color-primary-contrast)',
            }}
          >
            <Box size={20} />
          </div>
        );

      case 'rounded':
        return (
          <div
            className="w-16 h-12 rounded-sm border-2 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-primary-hover)',
              color: 'var(--color-primary-contrast)',
            }}
          >
            <div className="w-4 h-1 rounded-full bg-black/40" />
          </div>
        );

      case 'blob':
        return (
          <div
            className="w-16 h-16 border-2 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-primary-hover)',
              color: 'var(--color-primary-contrast)',
              borderRadius: '60% 40% 50% 70% / 60% 50% 70% 40%',
            }}
          >
            <Sparkles size={18} />
          </div>
        );

      case 'button':
        return (
          <button
            type="button"
            className="btn-studio-primary whitespace-nowrap select-none cursor-grab active:cursor-grabbing shadow-lg"
            style={{ padding: '8px 14px', fontSize: '0.78rem' }}
          >
            <span>SUBMIT ACTION</span>
          </button>
        );

      case 'card':
        return (
          <div className="w-36 p-2.5 rounded-xs bg-[var(--bg-surface-1)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-xl flex flex-col gap-1 select-none cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                #SURFACE-01
              </span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
            </div>
            <div className="text-xs font-bold leading-tight">Motion Specimen</div>
            <div className="text-[9px] text-[var(--text-tertiary)] font-mono">PaletteParadise</div>
          </div>
        );

      case 'notification':
        return (
          <div
            className="px-3 py-2 rounded-xs bg-[var(--bg-surface-1)] text-[var(--text-primary)] shadow-xl flex items-center gap-2 select-none cursor-grab active:cursor-grabbing whitespace-nowrap border"
            style={{ borderColor: 'var(--color-primary-border)' }}
          >
            <CheckCircle2 size={14} style={{ color: 'var(--color-primary-text)' }} className="flex-shrink-0" />
            <span className="text-xs font-medium">Kinematics Active</span>
          </div>
        );

      case 'badge':
        return (
          <div
            className="px-3 py-1 rounded-xs border font-mono text-xs font-bold shadow-md select-none cursor-grab active:cursor-grabbing"
            style={{
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary-text)',
              borderColor: 'var(--color-primary-border)',
            }}
          >
            PHYSICS 60FPS
          </div>
        );

      case 'icon':
        return (
          <div className="w-12 h-12 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-strong)] shadow-lg flex items-center justify-center text-[var(--text-primary)] cursor-grab active:cursor-grabbing">
            <Sparkles size={20} style={{ color: 'var(--color-primary-text)' }} />
          </div>
        );

      case 'panel':
        return (
          <div
            className="w-40 p-3 rounded-xs bg-[var(--bg-surface-2)] border shadow-xl text-[var(--text-primary)] flex flex-col gap-1 select-none cursor-grab active:cursor-grabbing"
            style={{ borderColor: 'var(--color-primary-border)' }}
          >
            <div className="text-[10px] font-mono text-[var(--text-secondary)]">TELEMETRY STREAM</div>
            <div className="text-xs font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
              V = {Math.round(Math.abs(config.velocityY))} px/s
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md overflow-hidden shadow-sm" style={{ borderRadius: 'var(--radius-md)' }}>
      {/* Simulation Stage Viewport (Hero Canvas) */}
      <div
        ref={containerRef}
        className="relative w-full h-[380px] sm:h-[480px] md:h-[520px] bg-[var(--bg-canvas)] overflow-hidden select-none touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Subtle Coordinate Grid Overlay */}
        {config.showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--border-medium) 1px, transparent 1px), linear-gradient(to bottom, var(--border-medium) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        )}

        {/* Boundary Perimeter Padding Lines */}
        <div
          className="absolute pointer-events-none border border-dashed border-[var(--border-subtle)] rounded-xs"
          style={{
            inset: `${config.boundaryPadding}px`,
          }}
        />

        {/* Trajectory Prediction Path (Dotted Vector Line) */}
        {config.showTrajectory && trajectoryPoints.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <polyline
              points={trajectoryPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeOpacity="0.6"
            />
            {trajectoryPoints[trajectoryPoints.length - 1] && (
              <circle
                cx={trajectoryPoints[trajectoryPoints.length - 1].x}
                cy={trajectoryPoints[trajectoryPoints.length - 1].y}
                r="3"
                fill="var(--color-primary)"
                fillOpacity="0.8"
              />
            )}
          </svg>
        )}

        {/* Interactive Physics Object */}
        <div
          className="absolute will-change-transform pointer-events-auto"
          style={{
            transform: `translate3d(${objectTransform.x}px, ${objectTransform.y}px, 0) translate(-50%, -50%) rotate(${objectTransform.angle}deg)`,
          }}
        >
          {renderObjectContent()}

          {/* Velocity Vector Arrow Indicator */}
          {config.showVelocity && simRef.current && (
            <div
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                width: `${Math.min(80, Math.sqrt(simRef.current.vx ** 2 + simRef.current.vy ** 2) * 0.2)}px`,
                height: '2px',
                backgroundColor: 'var(--color-primary)',
                transformOrigin: 'left center',
                transform: `rotate(${Math.atan2(simRef.current.vy, simRef.current.vx)}rad)`,
              }}
            >
              <div
                className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 rotate-45"
                style={{ borderColor: 'var(--color-primary)' }}
              />
            </div>
          )}
        </div>

        {/* Collision Impact Ripple Animation */}
        {collisionRipple && (
          <div
            key={collisionRipple.id}
            className="absolute pointer-events-none w-10 h-10 -ml-5 -mt-5 rounded-full border-2 animate-ping"
            style={{
              left: `${collisionRipple.x}px`,
              top: `${collisionRipple.y}px`,
              borderColor: 'var(--color-primary)',
            }}
          />
        )}

        {/* Stage Floating Minimal Status Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-[var(--bg-surface-1)]/90 border border-[var(--border-subtle)] text-[11px] font-mono backdrop-blur-md flex items-center gap-2 shadow-xs">
            <span
              className="w-2 h-2 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <span className="font-semibold text-[var(--text-primary)] uppercase tracking-wider text-[10px]">
              {simState}
            </span>
            <span className="text-[var(--text-tertiary)]">|</span>
            <span className="text-[var(--text-secondary)] text-[10px]">
              gy: <strong className="text-[var(--text-primary)]">{config.gravityY > 0 ? `+${config.gravityY}` : config.gravityY}</strong> m/s²
            </span>
          </div>
        </div>

        {/* Drag Hint on Bottom Right */}
        <div className="absolute top-3 right-3 pointer-events-none text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-surface-1)]/80 px-2.5 py-1 rounded-full border border-[var(--border-subtle)] backdrop-blur-md">
          Drag &amp; throw object
        </div>
      </div>

      {/* Integrated Playback & Telemetry Bottom Bar */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)]">
        {/* Play / Pause, Reset, and Impulses */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-studio-primary"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Reset object to launch configuration"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          {/* Impulse Nudge Buttons */}
          <div className="flex items-center gap-1 pl-2 border-l border-[var(--border-subtle)]">
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] hidden sm:inline mr-1">
              Impulse:
            </span>
            <button
              type="button"
              onClick={() => handleImpulse(0, -200)}
              className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              title="Nudge Up"
              aria-label="Impulse Up"
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              onClick={() => handleImpulse(0, 200)}
              className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              title="Nudge Down"
              aria-label="Impulse Down"
            >
              <ArrowDown size={12} />
            </button>
            <button
              type="button"
              onClick={() => handleImpulse(-200, 0)}
              className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              title="Nudge Left"
              aria-label="Impulse Left"
            >
              <ArrowLeft size={12} />
            </button>
            <button
              type="button"
              onClick={() => handleImpulse(200, 0)}
              className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              title="Nudge Right"
              aria-label="Impulse Right"
            >
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Compact Live Telemetry Strip */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto whitespace-nowrap py-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-tertiary)]">POS</span>
            <span className="text-[var(--text-primary)] font-medium">{hudMetrics.x}, {hudMetrics.y}px</span>
          </div>

          <span className="text-[var(--border-medium)]">·</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-tertiary)]">VEL</span>
            <span className="font-medium" style={{ color: 'var(--color-primary-text)' }}>
              {hudMetrics.vx}/{hudMetrics.vy} px/s
            </span>
          </div>

          <span className="text-[var(--border-medium)]">·</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-tertiary)]">ENERGY</span>
            <span className="text-[var(--text-primary)] font-medium">{hudMetrics.energy} J</span>
          </div>

          <span className="text-[var(--border-medium)]">·</span>

          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
            style={{
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary-text)',
            }}
          >
            60 FPS
          </span>
        </div>
      </div>

      {/* Subtle Motion Profile Description Bar */}
      <div className="px-3.5 py-2 bg-[var(--bg-surface-2)] border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-[var(--text-secondary)] font-mono text-[11px]">PROFILE:</span>
          <span className="truncate">{describeMotion(config)}</span>
        </div>
      </div>
    </div>
  );
};
