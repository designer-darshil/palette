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
  Compass,
} from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

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

  const [hudMetrics, setHudMetrics] = useState({
    x: 300, y: 200, vx: 0, vy: 0, speed: 0, energy: 0,
  });

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

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Simulation Stage */}
      <div
        ref={containerRef}
        className="relative w-full flex-1 overflow-hidden cursor-crosshair select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Dot Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `radial-gradient(var(--text-tertiary) 0.5px, transparent 0.5px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Corner: Gravity Vector */}
        <div className="studio-corner-badge top-left">
          <Compass size={11} className="text-[var(--color-primary)]" />
          <span>G: ({config.gravityX}, {config.gravityY})</span>
        </div>

        {/* Corner: State */}
        <div className="studio-corner-badge top-right">
          <span className={`studio-state-dot ${simState === 'dragging' ? 'dragging' : isPlaying ? 'playing' : 'paused'}`} />
          <span className="font-bold text-[var(--text-primary)] uppercase text-xs">
            {simState === 'dragging' ? 'Drag' : isPlaying ? 'Live' : 'Paused'}
          </span>
        </div>

        {/* Trajectory */}
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

        {/* Collision Ripple */}
        {collisionRipple && (
          <div
            key={collisionRipple.id}
            className="absolute rounded-full border border-[var(--color-primary)] pointer-events-none animate-ping"
            style={{
              left: collisionRipple.x - 24,
              top: collisionRipple.y - 24,
              width: 48,
              height: 48,
              opacity: 0.5,
            }}
          />
        )}

        {/* Physics Object */}
        <div
          onPointerDown={handlePointerDown}
          className="absolute z-20 cursor-grab active:cursor-grabbing"
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
          {config.object === 'card' && (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-md bg-[var(--bg-surface-elevated)] border-2 border-[var(--color-primary-border)] shadow-2xl flex flex-col justify-between p-2.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                <span className="font-mono text-xs text-[var(--text-tertiary)]">M:{config.mass}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-[var(--text-primary)]">SPECIMEN</span>
                <span className="font-mono text-xs text-[var(--text-tertiary)]">#BFA3F0</span>
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
              <span className="font-mono text-xs font-bold text-[var(--text-primary)]">MOTION</span>
              <span className="font-mono text-xs text-[var(--text-tertiary)]">{Math.round(hudMetrics.speed)}px/s</span>
            </div>
          )}

          {(config.object === 'square' || config.object === 'icon' || config.object === 'panel' || config.object === 'blob' || config.object === 'notification' || config.object === 'badge') && (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xs bg-[var(--bg-surface-elevated)] border-2 border-[var(--color-primary)] shadow-2xl flex items-center justify-center font-mono font-bold text-xs text-[var(--text-primary)]">
              CUBE-{config.mass}
            </div>
          )}
        </div>

        {/* Compact Canvas HUD */}
        <div className="studio-canvas-hud">
          <KromaButton
            size="icon"
            variant="ghost"
            onClick={() => setIsPlaying(!isPlaying)}
            className="studio-canvas-hud-btn"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            iconLeft={isPlaying ? <Pause size={12} /> : <Play size={12} className="text-emerald-400" />}
          />

          <KromaButton
            size="icon"
            variant="ghost"
            onClick={handleReset}
            className="studio-canvas-hud-btn"
            title="Reset position"
            aria-label="Reset position"
            iconLeft={<RotateCcw size={12} />}
          />

          <div className="studio-canvas-hud-divider" />

          <div className="studio-canvas-hud-label">
            <span className="text-[var(--text-tertiary)]">V:</span>
            <strong>{hudMetrics.speed}</strong>
          </div>

          <div className="studio-canvas-hud-label hidden sm:flex">
            <span className="text-[var(--text-tertiary)]">KE:</span>
            <strong className="text-[var(--color-primary)]">{hudMetrics.energy}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
