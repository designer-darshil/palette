import React, { useState } from 'react';
import { MeshPoint, MeshGradientConfig } from '../../utils/meshEngine';
import {
  Pipette,
  Copy,
  Check,
  Sparkles,
  CopyPlus,
  Trash2,
  Sliders,
  Move,
  Palette,
} from 'lucide-react';

interface MeshPointInspectorProps {
  config: MeshGradientConfig;
  selectedPoint: MeshPoint | null;
  selectedPointIndex: number;
  onSelectPoint: (id: string) => void;
  onUpdatePoint: (id: string, patch: Partial<MeshPoint>) => void;
  onDuplicatePoint: (id: string) => void;
  onDeletePoint: (id: string) => void;
  onRandomizePointColor: (id: string) => void;
}

export const MeshPointInspector: React.FC<MeshPointInspectorProps> = ({
  config,
  selectedPoint,
  selectedPointIndex,
  onSelectPoint,
  onUpdatePoint,
  onDuplicatePoint,
  onDeletePoint,
  onRandomizePointColor,
}) => {
  const [hasCopiedHex, setHasCopiedHex] = useState(false);

  const handleCopyHex = () => {
    if (!selectedPoint) return;
    navigator.clipboard.writeText(selectedPoint.color);
    setHasCopiedHex(true);
    setTimeout(() => setHasCopiedHex(false), 2000);
  };

  return (
    <div
      className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 shadow-xs flex flex-col gap-5"
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      {/* Mesh Palette Quick Switch Rail */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Palette size={14} style={{ color: 'var(--color-primary-text)' }} />
            <span>Active Point Palette</span>
          </label>
          <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
            {config.points.length} nodes
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {config.points.map((pt, idx) => {
            const isSelected = selectedPoint?.id === pt.id;
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => onSelectPoint(pt.id)}
                className={`p-1.5 rounded-xs flex items-center gap-2 border transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                  isSelected
                    ? 'bg-[var(--bg-surface-2)] shadow-xs font-bold'
                    : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)]/60'
                }`}
                style={{
                  borderColor: isSelected ? 'var(--color-primary)' : undefined,
                  boxShadow: isSelected ? '0 0 0 1px var(--color-primary)' : undefined,
                }}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/20 shadow-xs flex-shrink-0"
                  style={{ backgroundColor: pt.color }}
                />
                <span className="text-xs font-mono text-[var(--text-primary)]">
                  #{idx + 1}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] hidden sm:inline">
                  {pt.color}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Point Detailed Controls */}
      {selectedPoint ? (
        <div className="flex flex-col gap-4 pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border border-white/40"
                style={{ backgroundColor: selectedPoint.color }}
              />
              <h3 className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">
                Point #{selectedPointIndex + 1} Properties
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onRandomizePointColor(selectedPoint.id)}
                className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Randomize this point color"
                aria-label="Randomize color"
              >
                <Sparkles size={13} style={{ color: 'var(--color-primary-text)' }} />
              </button>

              <button
                type="button"
                onClick={() => onDuplicatePoint(selectedPoint.id)}
                className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Duplicate this point"
                aria-label="Duplicate point"
              >
                <CopyPlus size={13} />
              </button>

              {config.points.length > 2 && (
                <button
                  type="button"
                  onClick={() => onDeletePoint(selectedPoint.id)}
                  className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-rose-950/40 text-rose-400 border border-[var(--border-subtle)] transition-colors cursor-pointer"
                  title="Delete this point"
                  aria-label="Delete point"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Color Picker & HEX Input */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono font-medium text-[var(--text-secondary)]">
                Color Value
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedPoint.color}
                  onChange={(e) => onUpdatePoint(selectedPoint.id, { color: e.target.value })}
                  className="w-8 h-8 rounded-xs cursor-pointer border border-[var(--border-subtle)] bg-transparent p-0"
                  aria-label="Pick Color"
                />
                <div className="flex-1 flex items-center bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-2 py-1">
                  <input
                    type="text"
                    value={selectedPoint.color.toUpperCase()}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith('#')) val = '#' + val;
                      onUpdatePoint(selectedPoint.id, { color: val });
                    }}
                    className="w-full font-mono text-xs text-[var(--text-primary)] bg-transparent outline-none uppercase"
                    maxLength={7}
                    aria-label="Hex color string"
                  />
                  <button
                    type="button"
                    onClick={handleCopyHex}
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer p-0.5"
                    title="Copy hex code"
                  >
                    {hasCopiedHex ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Position X (%) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[var(--text-secondary)]">Position X</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedPoint.x}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={selectedPoint.x}
                onChange={(e) => onUpdatePoint(selectedPoint.id, { x: parseInt(e.target.value, 10) })}
                className="w-full studio-slider"
                aria-label="Position X percentage"
              />
            </div>

            {/* Position Y (%) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[var(--text-secondary)]">Position Y</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedPoint.y}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={selectedPoint.y}
                onChange={(e) => onUpdatePoint(selectedPoint.id, { y: parseInt(e.target.value, 10) })}
                className="w-full studio-slider"
                aria-label="Position Y percentage"
              />
            </div>

            {/* Point Radius / Influence Factor */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[var(--text-secondary)]">Influence</span>
                <span className="font-bold" style={{ color: 'var(--color-primary-text)' }}>
                  {selectedPoint.influence.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2.0}
                step={0.05}
                value={selectedPoint.influence}
                onChange={(e) => onUpdatePoint(selectedPoint.id, { influence: parseFloat(e.target.value) })}
                className="w-full studio-slider"
                aria-label="Point influence multiplier"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2 text-center text-xs text-[var(--text-tertiary)] font-mono">
          Select any point in the canvas or palette to tune its individual color and coordinates.
        </div>
      )}
    </div>
  );
};
