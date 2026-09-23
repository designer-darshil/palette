import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MeshGradientConfig, MeshPoint, isValidHex } from '../../utils/meshEngine';
import {
  Trash2,
  Eye,
  Edit3,
  Grid,
  RefreshCw,
} from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

interface MeshHeroCanvasProps {
  config: MeshGradientConfig;
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  onUpdatePoint: (id: string, patch: Partial<MeshPoint>) => void;
  onAddPoint: (x: number, y: number) => void;
  onDeletePoint: (id: string) => void;
  onRandomizePointColor?: (id: string) => void;
  viewMode: 'edit' | 'preview';
  onToggleViewMode: () => void;
  showGridLines: boolean;
  onToggleGridLines: () => void;
}

/**
 * Normalizes any hex color format (e.g. 'fff', '#fff', '#ffffff') to a strict 6-digit uppercase #RRGGBB.
 */
function normalizeHexColor(hex: string | undefined | null, fallback = '#BFA3F0'): string {
  if (!hex || typeof hex !== 'string') return fallback;
  let clean = hex.trim();
  if (!clean.startsWith('#')) clean = `#${clean}`;
  if (clean.length === 4) {
    clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
    return clean.toUpperCase();
  }
  return fallback;
}

/**
 * Converts a hex string and alpha (0 to 1) into an rgba(r, g, b, a) CSS color string.
 */
function hexToRgba(hex: string, alpha: number): string {
  const norm = normalizeHexColor(hex);
  const r = parseInt(norm.slice(1, 3), 16);
  const g = parseInt(norm.slice(3, 5), 16);
  const b = parseInt(norm.slice(5, 7), 16);
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

export const MeshHeroCanvas: React.FC<MeshHeroCanvasProps> = ({
  config,
  selectedPointId,
  onSelectPoint,
  onUpdatePoint,
  onAddPoint,
  onDeletePoint,
  onRandomizePointColor,
  viewMode,
  onToggleViewMode,
  showGridLines,
  onToggleGridLines,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 840, height: 540 });

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvasSize.width;
    const height = canvasSize.height;
    if (width <= 0 || height <= 0) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const physWidth = Math.round(width * dpr);
    const physHeight = Math.round(height * dpr);

    if (canvas.width !== physWidth || canvas.height !== physHeight) {
      canvas.width = physWidth;
      canvas.height = physHeight;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear entire viewport
    ctx.clearRect(0, 0, width, height);

    // Render Base Background Layer
    if (config.background === 'solid') {
      ctx.fillStyle = normalizeHexColor(config.solidColor, '#090A0C');
      ctx.fillRect(0, 0, width, height);
    } else if (config.background === 'canvas') {
      ctx.fillStyle = '#090A0C';
      ctx.fillRect(0, 0, width, height);
    }

    // Apply rotation and scale around the center if configured
    const hasTransform = (config.rotation && config.rotation !== 0) || (config.scale && config.scale !== 1);
    if (hasTransform) {
      ctx.translate(width / 2, height / 2);
      if (config.rotation) ctx.rotate((config.rotation * Math.PI) / 180);
      if (config.scale) ctx.scale(config.scale, config.scale);
      ctx.translate(-width / 2, -height / 2);
    }

    const maxDim = Math.max(width, height);
    const softness = typeof config.softness === 'number' ? Math.max(0.2, config.softness) : 1.2;
    const intensity = typeof config.intensity === 'number' ? Math.max(0.2, config.intensity) : 1.1;

    // Render each mesh point's radial gradient field directly using config.points[].color
    config.points.forEach((pt) => {
      const px = (pt.x / 100) * width;
      const py = (pt.y / 100) * height;
      const influence = typeof pt.influence === 'number' ? Math.max(0.2, pt.influence) : 1.0;
      const radius = Math.max(40, maxDim * 0.65 * influence * softness);
      const normColor = normalizeHexColor(pt.color);

      const radGrad = ctx.createRadialGradient(px, py, 0, px, py, radius);
      radGrad.addColorStop(0, hexToRgba(normColor, Math.min(1.0, 0.98 * intensity)));
      radGrad.addColorStop(0.25, hexToRgba(normColor, Math.min(1.0, 0.85 * intensity)));
      radGrad.addColorStop(0.55, hexToRgba(normColor, Math.min(1.0, 0.45 * intensity)));
      radGrad.addColorStop(0.85, hexToRgba(normColor, Math.min(1.0, 0.12 * intensity)));
      radGrad.addColorStop(1, hexToRgba(normColor, 0));

      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);
    });

    ctx.restore();
  }, [config, canvasSize]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Resize canvas observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50) {
          setCanvasSize({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePointerDownPoint = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingPointId(id);
    onSelectPoint(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingPointId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.round(Math.max(0, Math.min(100, rawX)));
    const clampedY = Math.round(Math.max(0, Math.min(100, rawY)));

    onUpdatePoint(draggingPointId, { x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingPointId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDraggingPointId(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!containerRef.current || viewMode === 'preview') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onAddPoint(x, y);
  };

  const selectedPoint = config.points.find((p) => p.id === selectedPointId);

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full flex-1 overflow-hidden select-none cursor-crosshair bg-[#090A0C]"
      >
        {/* Full-bleed Canvas with Blur & Grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            filter: config.blur > 0 ? `blur(${config.blur}px)` : undefined,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
            }}
            className="w-full h-full block"
          />

          {/* Grain overlay */}
          {config.grain > 0 && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay"
              style={{
                opacity: config.grain / 100,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
          )}
        </div>

        {/* Point Handles & Editing Overlay */}
        {viewMode === 'edit' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Grid Guidelines */}
            {showGridLines && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line x1="33.3%" y1="0" x2="33.3%" y2="100%" stroke="var(--text-tertiary)" strokeDasharray="3,3" />
                <line x1="66.6%" y1="0" x2="66.6%" y2="100%" stroke="var(--text-tertiary)" strokeDasharray="3,3" />
                <line x1="0" y1="33.3%" x2="100%" y2="33.3%" stroke="var(--text-tertiary)" strokeDasharray="3,3" />
                <line x1="0" y1="66.6%" x2="100%" y2="66.6%" stroke="var(--text-tertiary)" strokeDasharray="3,3" />
              </svg>
            )}

            {/* Draggable Point Handles */}
            {config.points.map((pt, idx) => {
              const isSelected = pt.id === selectedPointId;
              const normColor = normalizeHexColor(pt.color);
              return (
                <div
                  key={pt.id}
                  onPointerDown={(e) => handlePointerDownPoint(e, pt.id)}
                  className="absolute pointer-events-auto cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                  style={{
                    left: `${pt.x}%`,
                    top: `${pt.y}%`,
                  }}
                >
                  {isSelected && (
                    <div
                      className="absolute rounded-full border border-[var(--color-primary)] opacity-40 pointer-events-none -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 animate-pulse"
                      style={{
                        width: `${Math.max(48, (pt.influence || 1) * 80)}px`,
                        height: `${Math.max(48, (pt.influence || 1) * 80)}px`,
                      }}
                    />
                  )}

                  <div
                    className={`w-6 h-6 rounded-full border-2 shadow-lg flex items-center justify-center transition-transform ${
                      isSelected
                        ? 'border-white ring-2 ring-[var(--color-primary)] scale-125 z-30'
                        : 'border-white/80 hover:scale-110'
                    }`}
                    style={{ backgroundColor: normColor }}
                  >
                    <span className="font-mono text-[9px] font-bold text-white drop-shadow-md">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-xs bg-black/85 text-white font-mono text-[9px] whitespace-nowrap pointer-events-none z-40 border border-white/10 shadow-lg">
                    {normColor} ({pt.x}%, {pt.y}%)
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Canvas HUD */}
        <div className="studio-canvas-hud">
          <KromaButton
            size="sm"
            variant={viewMode === 'edit' ? 'filled' : 'ghost'}
            onClick={onToggleViewMode}
            className={`studio-canvas-hud-btn ${viewMode === 'edit' ? 'active' : ''}`}
            title="Toggle Edit / Preview"
            style={{ width: 'auto', borderRadius: 'var(--radius-sm)', padding: '4px 10px', gap: '4px', display: 'flex' }}
            iconLeft={viewMode === 'edit' ? <Edit3 size={12} /> : <Eye size={12} />}
          >
            <span className="font-mono text-[10px] font-bold">{viewMode === 'edit' ? 'Edit' : 'View'}</span>
          </KromaButton>

          <KromaButton
            size="icon"
            variant="ghost"
            onClick={onToggleGridLines}
            className="studio-canvas-hud-btn"
            title="Toggle grid"
            aria-label="Toggle grid"
            style={showGridLines ? { color: 'var(--color-primary)' } : {}}
            iconLeft={<Grid size={12} />}
          />

          <div className="studio-canvas-hud-divider" />

          <span className="studio-canvas-hud-label">
            <strong>{config.points.length}</strong> nodes
          </span>

          {selectedPoint && onRandomizePointColor && (
            <KromaButton
              size="icon"
              variant="ghost"
              onClick={() => onRandomizePointColor(selectedPoint.id)}
              className="studio-canvas-hud-btn"
              title="Randomize node color"
              aria-label="Randomize node color"
              iconLeft={<RefreshCw size={11} />}
            />
          )}

          {selectedPoint && config.points.length > 2 && (
            <KromaButton
              size="icon"
              variant="ghost"
              onClick={() => onDeletePoint(selectedPoint.id)}
              className="studio-canvas-hud-btn"
              title="Delete node"
              aria-label="Delete node"
              style={{ color: '#F87171' }}
              iconLeft={<Trash2 size={11} />}
            />
          )}
        </div>
      </div>
    </div>
  );
};
