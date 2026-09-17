import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MeshGradientConfig, MeshPoint } from '../../utils/meshEngine';
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Eye,
  Edit3,
  Grid,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

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

  // Render Canvas using high-performance 2D context engine
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background fill
    if (config.background === 'solid') {
      ctx.fillStyle = config.solidColor || '#090A0C';
      ctx.fillRect(0, 0, width, height);
    } else if (config.background === 'canvas') {
      ctx.fillStyle = '#090A0C';
      ctx.fillRect(0, 0, width, height);
    }

    // Render radial point layers
    config.points.forEach((pt) => {
      const px = (pt.x / 100) * width;
      const py = (pt.y / 100) * height;
      const maxDim = Math.max(width, height);
      const radius = (maxDim * (pt.influence || 1.0) * (config.softness / 50)) / 1.5;

      const radGrad = ctx.createRadialGradient(px, py, 0, px, py, Math.max(1, radius));
      radGrad.addColorStop(0, pt.color);
      radGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);
    });
  }, [config]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer drag interactions
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

    // If click was directly on background, add a point at clicked location
    onAddPoint(x, y);
  };

  const selectedPoint = config.points.find((p) => p.id === selectedPointId);

  return (
    <div className="w-full h-full min-h-[480px] lg:min-h-[560px] flex flex-col relative rounded-xs overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface-1)]">
      {/* Canvas Viewport Stage */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full flex-1 overflow-hidden flex items-center justify-center p-3 select-none cursor-crosshair"
      >
        {/* Rendered 2D Canvas Target */}
        <div
          className="relative w-full h-full max-w-[840px] max-h-[540px] rounded-xs overflow-hidden shadow-2xl border border-[var(--border-medium)]"
          style={{
            filter: `blur(${config.blur}px)`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={840}
            height={540}
            className="w-full h-full object-cover"
          />

          {/* Grain / Noise Filter Overlay */}
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

        {/* Interactive Point Nodes Overlay (Active in Edit Mode) */}
        {viewMode === 'edit' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-3">
            <div className="relative w-full h-full max-w-[840px] max-h-[540px]">
              {/* Optional Grid Guidelines */}
              {showGridLines && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
                  <line x1="33.3%" y1="0" x2="33.3%" y2="100%" stroke="var(--text-tertiary)" strokeDasharray="3,3" />
                  <line x1="66.6%" y1="0" x2="66.6%" y2="100%" stroke="var(--text-tertiary)" strokeDasharray="3,3" />
                  <line x1="0" y1="33.3%" x2="100%" y2="33.3%" stroke="var(--text-tertiary)" strokeDasharray="3,3" />
                  <line x1="0" y1="66.6%" x2="100%" y2="66.6%" stroke="var(--text-tertiary)" strokeDasharray="3,3" />
                </svg>
              )}

              {/* Direct Point Control Nodes */}
              {config.points.map((pt, idx) => {
                const isSelected = pt.id === selectedPointId;
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
                    {/* Influence Radius Circle Guide */}
                    {isSelected && (
                      <div
                        className="absolute rounded-full border border-[var(--color-primary)] opacity-40 pointer-events-none -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                        style={{
                          width: `${Math.max(40, (pt.influence || 1) * 90)}px`,
                          height: `${Math.max(40, (pt.influence || 1) * 90)}px`,
                        }}
                      />
                    )}

                    {/* Point Swatch Handle */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 shadow-xl flex items-center justify-center transition-transform ${
                        isSelected
                          ? 'border-white ring-2 ring-[var(--color-primary)] scale-125 z-30'
                          : 'border-white/80 hover:scale-115'
                      }`}
                      style={{ backgroundColor: pt.color }}
                    >
                      <span className="font-mono text-[9px] font-bold text-white drop-shadow-md">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-xs bg-black/85 text-white font-mono text-[9px] whitespace-nowrap pointer-events-none shadow-md z-40">
                      {pt.color} ({pt.x}%, {pt.y}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Viewport Tool HUD */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[var(--bg-surface-1)]/90 backdrop-blur-xl border border-[var(--border-strong)] px-3 py-1.5 rounded-full shadow-2xl">
          {/* View / Edit Mode Switcher */}
          <button
            type="button"
            onClick={onToggleViewMode}
            className={`p-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 px-2.5 font-mono text-xs font-bold ${
              viewMode === 'edit'
                ? 'bg-[var(--color-primary)] text-[#090A0C]'
                : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Toggle Edit / Clean Preview Mode"
          >
            {viewMode === 'edit' ? <Edit3 size={13} /> : <Eye size={13} />}
            <span>{viewMode === 'edit' ? 'Edit Nodes' : 'Preview'}</span>
          </button>

          {/* Grid Toggle */}
          <button
            type="button"
            onClick={onToggleGridLines}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              showGridLines
                ? 'bg-[var(--bg-surface-3)] text-[var(--color-primary)]'
                : 'bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
            title="Toggle Grid Guidelines"
          >
            <Grid size={13} />
          </button>

          <div className="h-4 w-px bg-[var(--border-subtle)] mx-1" />

          {/* Point Count Badge */}
          <span className="font-mono text-[11px] text-[var(--text-secondary)] px-1">
            {config.points.length} Nodes
          </span>

          {/* Quick Context Action on Selected Point */}
          {selectedPoint && onRandomizePointColor && (
            <button
              type="button"
              onClick={() => onRandomizePointColor(selectedPoint.id)}
              className="p-1.5 rounded-full bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Randomize selected node color"
            >
              <RefreshCw size={12} />
            </button>
          )}

          {selectedPoint && config.points.length > 2 && (
            <button
              type="button"
              onClick={() => onDeletePoint(selectedPoint.id)}
              className="p-1.5 rounded-full bg-[var(--bg-surface-2)] hover:bg-rose-950/40 text-rose-400 transition-colors cursor-pointer"
              title="Delete selected node"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
