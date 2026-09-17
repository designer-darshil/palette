import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  AntigravityConfig,
  PhysicsSimulation,
  ObjectShape,
  SimulationState,
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

  // Initialize and update simulation when dimensions or config change
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (!simRef.current) {
      simRef.current = new PhysicsSimulation(config, rect.width || 600, rect.height || 420);
    } else {
      simRef.current.updateDimensions(rect.width || 600, rect.height || 420);
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
          setSimState(simRef.current.state);

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
  }, [isPlaying, onStateUpdate, config.showTrajectory]);

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

  // Render Object based on chosen Shape / UI Element
  const renderObjectContent = () => {
    switch (config.object) {
      case 'circle':
        return (
          <div className="w-14 h-14 rounded-full bg-[var(--accent-blue)] border-2 border-blue-300/60 shadow-lg flex items-center justify-center relative cursor-grab active:cursor-grabbing">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
            <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-white/60" />
          </div>
        );

      case 'square':
        return (
          <div className="w-14 h-14 rounded-xs bg-purple-600 border-2 border-purple-400/60 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
            <Box size={20} className="text-white" />
          </div>
        );

      case 'rounded':
        return (
          <div className="w-16 h-12 rounded-sm bg-emerald-600 border-2 border-emerald-400/60 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
            <div className="w-4 h-1 rounded-full bg-white/70" />
          </div>
        );

      case 'blob':
        return (
          <div
            className="w-16 h-16 bg-[var(--accent-gold)] border-2 border-amber-300/70 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform"
            style={{ borderRadius: '60% 40% 50% 70% / 60% 50% 70% 40%' }}
          >
            <Sparkles size={18} className="text-[var(--text-inverse)]" />
          </div>
        );

      case 'button':
        return (
          <button
            type="button"
            className="btn-primary whitespace-nowrap select-none cursor-grab active:cursor-grabbing shadow-lg"
            style={{ padding: '8px 14px', fontSize: '0.78rem' }}
          >
            <span>SUBMIT ACTION</span>
          </button>
        );

      case 'card':
        return (
          <div className="w-36 p-2.5 rounded-xs bg-[var(--bg-surface-1)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-xl flex flex-col gap-1 select-none cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[var(--accent-blue)]">#SURFACE-01</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xs font-bold leading-tight">Motion Specimen</div>
            <div className="text-[9px] text-[var(--text-tertiary)] font-mono">PaletteParadise</div>
          </div>
        );

      case 'notification':
        return (
          <div className="px-3 py-2 rounded-xs bg-[var(--bg-surface-1)] border border-emerald-500/40 text-[var(--text-primary)] shadow-xl flex items-center gap-2 select-none cursor-grab active:cursor-grabbing whitespace-nowrap">
            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-medium">Kinematics Active</span>
          </div>
        );

      case 'badge':
        return (
          <div className="px-3 py-1 rounded-xs bg-[var(--bg-surface-3)] border border-[var(--border-medium)] text-[var(--text-primary)] font-mono text-xs font-bold shadow-md select-none cursor-grab active:cursor-grabbing">
            PHYSICS 60FPS
          </div>
        );

      case 'icon':
        return (
          <div className="w-12 h-12 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-strong)] shadow-lg flex items-center justify-center text-[var(--text-primary)] cursor-grab active:cursor-grabbing">
            <Sparkles size={20} className="text-[var(--accent-gold)]" />
          </div>
        );

      case 'panel':
        return (
          <div className="w-40 p-3 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-strong)] shadow-xl text-[var(--text-primary)] flex flex-col gap-1 select-none cursor-grab active:cursor-grabbing">
            <div className="text-[10px] font-mono text-[var(--text-secondary)]">TELEMETRY STREAM</div>
            <div className="text-xs font-mono font-bold text-[var(--accent-blue)]">V = {Math.round(Math.abs(config.velocityY))} px/s</div>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Simulation Stage Viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[360px] sm:h-[440px] rounded-md bg-[var(--bg-canvas)] border border-[var(--border-medium)] overflow-hidden shadow-inner select-none touch-none"
        style={{ borderRadius: 'var(--radius-md)' }}
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
              stroke="var(--accent-gold, #3B82F6)"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeOpacity="0.4"
            />
            {trajectoryPoints[trajectoryPoints.length - 1] && (
              <circle
                cx={trajectoryPoints[trajectoryPoints.length - 1].x}
                cy={trajectoryPoints[trajectoryPoints.length - 1].y}
                r="3"
                fill="var(--accent-gold, #3B82F6)"
                fillOpacity="0.5"
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
                backgroundColor: 'var(--accent-blue)',
                transformOrigin: 'left center',
                transform: `rotate(${Math.atan2(simRef.current.vy, simRef.current.vx)}rad)`,
              }}
            >
              <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-[var(--accent-blue)] rotate-45" />
            </div>
          )}
        </div>

        {/* Collision Impact Ripple Animation */}
        {collisionRipple && (
          <div
            key={collisionRipple.id}
            className="absolute pointer-events-none w-10 h-10 -ml-5 -mt-5 rounded-full border-2 border-[var(--accent-blue)]/80 animate-ping"
            style={{
              left: `${collisionRipple.x}px`,
              top: `${collisionRipple.y}px`,
            }}
          />
        )}

        {/* Stage Floating HUD Information */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <div className="px-2 py-1 rounded-xs bg-[var(--bg-surface-1)]/85 border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)] backdrop-blur-md flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-[var(--text-primary)] uppercase">{simState}</span>
          </div>

          <div className="px-2 py-1 rounded-xs bg-[var(--bg-surface-1)]/85 border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-tertiary)] backdrop-blur-md hidden sm:flex items-center gap-1 shadow-xs">
            <span>Gravity:</span>
            <strong className="text-[var(--text-primary)]">{config.gravityY} m/s²</strong>
          </div>
        </div>

        {/* Drag Hint on Bottom Right */}
        <div className="absolute bottom-3 right-3 pointer-events-none text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-surface-1)]/80 px-2 py-0.5 rounded-xs border border-[var(--border-subtle)]">
          Click / Touch &amp; Drag to Throw
        </div>
      </div>

      {/* Primary Simulator Control Bar */}
      <div
        className="w-full flex items-center justify-between gap-2 p-2 rounded-md bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] shadow-xs"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        {/* Play / Pause & Reset Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-primary"
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
        </div>

        {/* Kinetic Nudge / Impulse Buttons */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] hidden sm:inline mr-1">
            Impulse:
          </span>
          <button
            type="button"
            onClick={() => handleImpulse(0, -200)}
            className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer"
            title="Nudge Up"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleImpulse(0, 200)}
            className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer"
            title="Nudge Down"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleImpulse(-200, 0)}
            className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer"
            title="Nudge Left"
          >
            <ArrowLeft size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleImpulse(200, 0)}
            className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer"
            title="Nudge Right"
          >
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
