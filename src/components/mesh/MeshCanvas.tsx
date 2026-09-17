import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MeshGradientConfig, MeshPoint, hexToRgb } from '../../utils/meshEngine';
import { Eye, Edit3, Grid, Plus, Trash2, Maximize2 } from 'lucide-react';

interface MeshCanvasProps {
  config: MeshGradientConfig;
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  onUpdatePoint: (id: string, patch: Partial<MeshPoint>) => void;
  onAddPoint: (x: number, y: number) => void;
  onDeletePoint: (id: string) => void;
  viewMode: 'edit' | 'preview';
  showGridLines: boolean;
  onToggleGridLines: () => void;
  onToggleViewMode: () => void;
}

export const MeshCanvas: React.FC<MeshCanvasProps> = ({
  config,
  selectedPointId,
  onSelectPoint,
  onUpdatePoint,
  onAddPoint,
  onDeletePoint,
  viewMode,
  showGridLines,
  onToggleGridLines,
  onToggleViewMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  // Render High-Performance Mesh Gradient to Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background
    if (config.background === 'solid') {
      ctx.fillStyle = config.solidColor;
      ctx.fillRect(0, 0, width, height);
    } else if (config.background === 'canvas') {
      ctx.fillStyle = '#090A0C';
      ctx.fillRect(0, 0, width, height);
    } // If transparent, canvas remains clear

    // 2. Multi-Pass Radial Mesh Blending
    ctx.save();

    // Apply global transformations if specified
    if (config.rotation !== 0 || config.scale !== 1.0) {
      ctx.translate(width / 2, height / 2);
      ctx.rotate((config.rotation * Math.PI) / 180);
      ctx.scale(config.scale, config.scale);
      ctx.translate(-width / 2, -height / 2);
    }

    config.points.forEach((point) => {
      const px = (point.x / 100) * width;
      const py = (point.y / 100) * height;
      const maxDim = Math.max(width, height);
      const radius = maxDim * 0.55 * point.influence * config.softness;

      const gradient = ctx.createRadialGradient(px, py, 0, px, py, Math.max(10, radius));

      const rgb = hexToRgb(point.color);
      const baseAlpha = Math.min(1.0, 0.95 * config.intensity);

      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseAlpha})`);
      gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseAlpha * 0.6})`);
      gradient.addColorStop(0.8, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseAlpha * 0.15})`);
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    });

    ctx.restore();

    // 3. Procedural Noise / Grain Layer
    if (config.grain > 0) {
      const grainFactor = (config.grain / 100) * 0.15;
      const grainCanvas = document.createElement('canvas');
      grainCanvas.width = 128;
      grainCanvas.height = 128;
      const gCtx = grainCanvas.getContext('2d');
      if (gCtx) {
        const imgData = gCtx.createImageData(128, 128);
        for (let i = 0; i < imgData.data.length; i += 4) {
          const val = Math.random() * 255;
          imgData.data[i] = val;
          imgData.data[i + 1] = val;
          imgData.data[i + 2] = val;
          imgData.data[i + 3] = val * grainFactor;
        }
        gCtx.putImageData(imgData, 0, 0);

        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        const pattern = ctx.createPattern(grainCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();
      }
    }
  }, [config]);

  // Adjust canvas size to parent and re-render on resize
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
      renderCanvas();
    };

    updateSize();

    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [renderCanvas]);

  // Rerender when config changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer Interaction Handlers for Mesh Points (Mouse & Touch)
  const handlePointerDownPoint = (e: React.PointerEvent, pointId: string) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onSelectPoint(pointId);
    setDraggingId(pointId);
  };

  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, Math.round(rawX)));
    const clampedY = Math.max(0, Math.min(100, Math.round(rawY)));

    onUpdatePoint(draggingId, { x: clampedX, y: clampedY });
  };

  const handlePointerUpCanvas = (e: React.PointerEvent) => {
    if (draggingId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDraggingId(null);
    }
  };

  const handleDoubleClickCanvas = (e: React.MouseEvent) => {
    if (!containerRef.current || viewMode === 'preview') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    onAddPoint(x, y);
  };

  // Keyboard navigation for selected point
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPointId || viewMode === 'preview') return;
      const pt = config.points.find((p) => p.id === selectedPointId);
      if (!pt) return;

      const step = e.shiftKey ? 5 : 1;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdatePoint(selectedPointId, { y: Math.max(0, pt.y - step) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdatePoint(selectedPointId, { y: Math.min(100, pt.y + step) });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdatePoint(selectedPointId, { x: Math.max(0, pt.x - step) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdatePoint(selectedPointId, { x: Math.min(100, pt.x + step) });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (config.points.length > 2) {
          e.preventDefault();
          onDeletePoint(selectedPointId);
        }
      } else if (e.key === 'Escape') {
        onSelectPoint(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPointId, config.points, onUpdatePoint, onDeletePoint, onSelectPoint, viewMode]);

  return (
    <div
      className="w-full flex flex-col bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md overflow-hidden shadow-sm"
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      {/* Interactive Mesh Stage Viewport */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMoveCanvas}
        onPointerUp={handlePointerUpCanvas}
        onPointerCancel={handlePointerUpCanvas}
        onDoubleClick={handleDoubleClickCanvas}
        className={`relative w-full h-[380px] sm:h-[480px] md:h-[540px] select-none touch-none overflow-hidden ${
          config.background === 'transparent'
            ? 'bg-[repeating-conic-gradient(#1c1e24_0%_25%,#121316_0%_50%)] [background-size:24px_24px]'
            : 'bg-[var(--bg-canvas)]'
        }`}
        style={{
          filter: config.blur > 0 ? `blur(${config.blur * 0.4}px)` : undefined,
        }}
      >
        {/* Render Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Optional Connecting Mesh Grid Lines (Edit Mode) */}
        {viewMode === 'edit' && showGridLines && config.points.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {config.points.map((p1, idx) => {
              // Connect each point to nearest neighbors
              return config.points.slice(idx + 1).map((p2) => {
                const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                if (dist < 55) {
                  return (
                    <line
                      key={`${p1.id}-${p2.id}`}
                      x1={`${p1.x}%`}
                      y1={`${p1.y}%`}
                      x2={`${p2.x}%`}
                      y2={`${p2.y}%`}
                      stroke="var(--color-primary)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      strokeOpacity="0.35"
                    />
                  );
                }
                return null;
              });
            })}
          </svg>
        )}

        {/* Interactive Point Handles (Visible in Edit Mode) */}
        {viewMode === 'edit' &&
          config.points.map((pt, idx) => {
            const isSelected = selectedPointId === pt.id;
            const isHovered = hoveredPointId === pt.id;

            return (
              <div
                key={pt.id}
                onPointerDown={(e) => handlePointerDownPoint(e, pt.id)}
                onMouseEnter={() => setHoveredPointId(pt.id)}
                onMouseLeave={() => setHoveredPointId(null)}
                className="absolute will-change-transform pointer-events-auto cursor-grab active:cursor-grabbing transition-transform"
                style={{
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.2)' : isHovered ? 'scale(1.1)' : 'scale(1)'}`,
                  zIndex: isSelected ? 30 : 20,
                }}
              >
                {/* Outer Selection Highlight Ring */}
                {isSelected && (
                  <div
                    className="absolute -inset-2.5 rounded-full border-2 animate-pulse pointer-events-none"
                    style={{ borderColor: 'var(--color-primary)' }}
                  />
                )}

                {/* Point Color Sphere & Grab Target */}
                <div
                  className="w-7 h-7 rounded-full shadow-lg border-2 border-white flex items-center justify-center relative"
                  style={{
                    backgroundColor: pt.color,
                    boxShadow: isSelected
                      ? '0 0 0 3px var(--color-primary), 0 4px 12px rgba(0,0,0,0.5)'
                      : '0 2px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  <span className="text-[9px] font-mono font-bold text-white drop-shadow-md select-none">
                    {idx + 1}
                  </span>
                </div>

                {/* Coordinate Badge Tooltip (On Select or Hover) */}
                {(isSelected || isHovered) && (
                  <div
                    className="absolute top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-xs bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-primary)] shadow-md whitespace-nowrap pointer-events-none flex items-center gap-1.5"
                    style={{ borderColor: isSelected ? 'var(--color-primary)' : undefined }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: pt.color }}
                    />
                    <span>{pt.x}%, {pt.y}%</span>
                  </div>
                )}
              </div>
            );
          })}

        {/* Floating Canvas Action Pills */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-[var(--bg-surface-1)]/90 border border-[var(--border-subtle)] text-[11px] font-mono backdrop-blur-md flex items-center gap-2 shadow-xs">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <span className="font-semibold text-[var(--text-primary)] uppercase tracking-wider text-[10px]">
              {viewMode} Mode
            </span>
            <span className="text-[var(--text-tertiary)]">|</span>
            <span className="text-[var(--text-secondary)] text-[10px]">
              {config.points.length} Points
            </span>
          </div>
        </div>

        {/* Double-Click Hint */}
        {viewMode === 'edit' && (
          <div className="absolute top-3 right-3 pointer-events-none text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-surface-1)]/80 px-2.5 py-1 rounded-full border border-[var(--border-subtle)] backdrop-blur-md hidden sm:block">
            Double-click canvas to add point
          </div>
        )}
      </div>

      {/* Integrated Viewport Controls Bottom Bar */}
      <div className="w-full flex items-center justify-between gap-3 p-3 bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)]">
        {/* View Mode & Grid Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleViewMode}
            className={`px-3 py-1.5 rounded-xs text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer border select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
              viewMode === 'preview'
                ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] font-bold'
                : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            style={{
              borderColor: viewMode === 'preview' ? 'var(--color-primary)' : undefined,
            }}
            title={viewMode === 'edit' ? 'Switch to Preview mode' : 'Switch to Edit mode'}
          >
            {viewMode === 'preview' ? <Eye size={13} /> : <Edit3 size={13} />}
            <span>{viewMode === 'preview' ? 'Preview' : 'Edit Mesh'}</span>
          </button>

          {viewMode === 'edit' && (
            <button
              type="button"
              onClick={onToggleGridLines}
              className={`p-1.5 rounded-xs text-xs font-mono transition-colors cursor-pointer border select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                showGridLines
                  ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] border-[var(--color-primary)]'
                  : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Toggle connecting mesh guide lines"
              aria-label="Toggle mesh grid guides"
            >
              <Grid size={14} />
            </button>
          )}
        </div>

        {/* Selected Point Fast Actions (If Any Point Selected) */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {selectedPointId ? (
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-tertiary)] hidden xs:inline">
                Selected: Point {config.points.findIndex((p) => p.id === selectedPointId) + 1}
              </span>
              {config.points.length > 2 && (
                <button
                  type="button"
                  onClick={() => onDeletePoint(selectedPointId)}
                  className="px-2 py-1 rounded-xs bg-[var(--bg-surface-2)] text-rose-400 hover:bg-rose-950/40 border border-[var(--border-subtle)] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Delete selected point"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-[var(--text-tertiary)]">
              Click any point to inspect
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
