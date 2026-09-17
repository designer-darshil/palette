import React from 'react';
import { MeshGradientConfig, BackgroundMode } from '../../utils/meshEngine';
import { Sliders, Grid, Sparkles, Layers, Paintbrush, Compass } from 'lucide-react';

interface MeshControlsProps {
  config: MeshGradientConfig;
  onChange: (patch: Partial<MeshGradientConfig>) => void;
  onGenerateGrid: (rows: number, cols: number) => void;
  onAddFreeformPoint: () => void;
}

export const MeshControls: React.FC<MeshControlsProps> = ({
  config,
  onChange,
  onGenerateGrid,
  onAddFreeformPoint,
}) => {
  return (
    <section
      id="mesh-controls"
      className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-6 shadow-sm flex flex-col gap-6"
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      {/* 1. Grid Structure & Layout Generators */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Grid size={14} style={{ color: 'var(--color-primary-text)' }} />
            <span>Mesh Density &amp; Grid Generator</span>
          </h3>
          <span className="text-[11px] text-[var(--text-tertiary)] hidden sm:inline">
            Reorganize points in structured coordinates
          </span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => onGenerateGrid(2, 2)}
            className="px-3 py-2 rounded-xs text-xs font-mono bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            2 × 2 (4 pts)
          </button>

          <button
            type="button"
            onClick={() => onGenerateGrid(2, 3)}
            className="px-3 py-2 rounded-xs text-xs font-mono bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            2 × 3 (6 pts)
          </button>

          <button
            type="button"
            onClick={() => onGenerateGrid(3, 3)}
            className="px-3 py-2 rounded-xs text-xs font-mono bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            3 × 3 (9 pts)
          </button>

          <button
            type="button"
            onClick={() => onGenerateGrid(4, 4)}
            className="px-3 py-2 rounded-xs text-xs font-mono bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            4 × 4 (16 pts)
          </button>

          <button
            type="button"
            onClick={onAddFreeformPoint}
            className="col-span-2 xs:col-span-4 sm:col-span-1 px-3 py-2 rounded-xs text-xs font-mono font-bold bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)] border border-[var(--color-primary-border)] hover:bg-[var(--color-primary-subtle)]/80 transition-colors text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            + Add Point
          </button>
        </div>
      </div>

      {/* 2. Global Appearance & Blending Sliders */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Sliders size={14} style={{ color: 'var(--color-primary-text)' }} />
            <span>Appearance &amp; Blending Dynamics</span>
          </h3>
          <span className="text-[11px] text-[var(--text-tertiary)] hidden sm:inline">
            Global post-processing &amp; falloff
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
          {/* Softness */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Blending Softness</span>
              <span className="font-bold" style={{ color: 'var(--color-primary-text)' }}>
                {config.softness.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={2.0}
              step={0.05}
              value={config.softness}
              onChange={(e) => onChange({ softness: parseFloat(e.target.value) })}
              className="w-full studio-slider"
              aria-label="Blending Softness"
            />
          </div>

          {/* Intensity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Color Intensity</span>
              <span className="font-bold" style={{ color: 'var(--color-primary-text)' }}>
                {config.intensity.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={2.0}
              step={0.05}
              value={config.intensity}
              onChange={(e) => onChange({ intensity: parseFloat(e.target.value) })}
              className="w-full studio-slider"
              aria-label="Color Intensity"
            />
          </div>

          {/* Blur */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Gaussian Blur</span>
              <span className="font-bold text-[var(--text-primary)]">
                {config.blur}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={2}
              value={config.blur}
              onChange={(e) => onChange({ blur: parseInt(e.target.value, 10) })}
              className="w-full studio-slider"
              aria-label="Gaussian Blur"
            />
          </div>

          {/* Grain */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Grain &amp; Noise</span>
              <span className="font-bold text-[var(--text-primary)]">
                {config.grain}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={config.grain}
              onChange={(e) => onChange({ grain: parseInt(e.target.value, 10) })}
              className="w-full studio-slider"
              aria-label="Grain & Noise"
            />
          </div>

          {/* Rotation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Composition Rotation</span>
              <span className="font-bold text-[var(--text-primary)]">
                {config.rotation}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={config.rotation}
              onChange={(e) => onChange({ rotation: parseInt(e.target.value, 10) })}
              className="w-full studio-slider"
              aria-label="Composition Rotation"
            />
          </div>

          {/* Scale */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Mesh Scale</span>
              <span className="font-bold text-[var(--text-primary)]">
                {config.scale.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={config.scale}
              onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
              className="w-full studio-slider"
              aria-label="Mesh Scale"
            />
          </div>
        </div>
      </div>

      {/* 3. Canvas Background & Transparency Settings */}
      <div className="flex flex-col gap-3 pt-2 border-t border-[var(--border-subtle)]">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
          <Paintbrush size={14} style={{ color: 'var(--color-primary-text)' }} />
          <span>Canvas Background</span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[var(--bg-surface-2)] p-1 rounded-xs border border-[var(--border-subtle)]">
            {(['canvas', 'transparent', 'solid'] as BackgroundMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ background: mode })}
                className={`px-3 py-1.5 rounded-xs text-xs font-mono capitalize transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                  config.background === mode
                    ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                style={{
                  color: config.background === mode ? 'var(--text-primary)' : undefined,
                }}
              >
                {mode === 'canvas' ? 'Dark Canvas' : mode}
              </button>
            ))}
          </div>

          {config.background === 'solid' && (
            <div className="flex items-center gap-2 bg-[var(--bg-surface-2)] px-2.5 py-1 rounded-xs border border-[var(--border-subtle)]">
              <input
                type="color"
                value={config.solidColor}
                onChange={(e) => onChange({ solidColor: e.target.value })}
                className="w-6 h-6 rounded-xs cursor-pointer border border-[var(--border-subtle)] bg-transparent p-0"
                aria-label="Solid background color"
              />
              <span className="font-mono text-xs text-[var(--text-primary)] uppercase">
                {config.solidColor}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
