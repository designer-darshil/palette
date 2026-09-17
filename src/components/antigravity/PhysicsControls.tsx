import React, { useState } from 'react';
import {
  AntigravityConfig,
  ObjectShape,
} from '../../utils/antigravityEngine';
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  Compass,
  Sparkles,
} from 'lucide-react';

interface PhysicsControlsProps {
  config: AntigravityConfig;
  onChange: (patch: Partial<AntigravityConfig>) => void;
}

export const PhysicsControls: React.FC<PhysicsControlsProps> = ({
  config,
  onChange,
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const objects: { id: ObjectShape; label: string; icon: string }[] = [
    { id: 'circle', label: 'Circle', icon: '○' },
    { id: 'square', label: 'Square', icon: '□' },
    { id: 'rounded', label: 'Rounded', icon: '▢' },
    { id: 'blob', label: 'Blob', icon: '✨' },
    { id: 'button', label: 'Button', icon: '🔘' },
    { id: 'card', label: 'Card', icon: '🗂️' },
    { id: 'notification', label: 'Toast', icon: '🔔' },
    { id: 'badge', label: 'Badge', icon: '🏷️' },
    { id: 'icon', label: 'Icon', icon: '⚡' },
    { id: 'panel', label: 'Panel', icon: '📊' },
  ];

  return (
    <section
      id="physics-controls"
      className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-6 shadow-sm flex flex-col gap-6"
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      {/* 1. Target Object Specimen Selector */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Layers size={14} style={{ color: 'var(--color-primary-text)' }} />
            <span>Target Object Specimen</span>
          </label>
          <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
            Active: <strong className="text-[var(--text-primary)]">{config.object}</strong>
          </span>
        </div>

        <div className="w-full grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 bg-[var(--bg-surface-2)] p-1 rounded-xs border border-[var(--border-subtle)]">
          {objects.map((obj) => {
            const isSelected = config.object === obj.id;
            return (
              <button
                key={obj.id}
                type="button"
                onClick={() => onChange({ object: obj.id, preset: null })}
                className={`py-2 px-2.5 rounded-xs text-xs font-mono transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer border select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                  isSelected
                    ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)]'
                }`}
                style={{
                  borderColor: isSelected ? 'var(--color-primary)' : undefined,
                }}
              >
                <span>{obj.icon}</span>
                <span className="truncate">{obj.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Primary Physics Parameters (Forces & Key Properties) */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Sliders size={14} style={{ color: 'var(--color-primary-text)' }} />
            <span>Core Forces &amp; Kinematics</span>
          </h3>
          <span className="text-[11px] text-[var(--text-tertiary)] hidden sm:inline">
            Direct parameter manipulation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Gravity Y */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-primary)]">Vertical Gravity (gy)</span>
              <span className="font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                {config.gravityY > 0 ? `+${config.gravityY.toFixed(1)}` : config.gravityY.toFixed(1)} m/s²
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={20}
              step={0.2}
              value={config.gravityY}
              onChange={(e) => onChange({ gravityY: parseFloat(e.target.value), preset: null })}
              className="w-full studio-slider"
              aria-label="Vertical Gravity"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
              <span>-20 (Buoyant Lift)</span>
              <span>0 (Zero-G)</span>
              <span>+20 (Heavy Down)</span>
            </div>
          </div>

          {/* Gravity X */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-primary)]">Horizontal Gravity (gx)</span>
              <span className="font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                {config.gravityX > 0 ? `+${config.gravityX.toFixed(1)}` : config.gravityX.toFixed(1)} m/s²
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={20}
              step={0.2}
              value={config.gravityX}
              onChange={(e) => onChange({ gravityX: parseFloat(e.target.value), preset: null })}
              className="w-full studio-slider"
              aria-label="Horizontal Gravity"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
              <span>-20 (West Drift)</span>
              <span>0 (None)</span>
              <span>+20 (East Drift)</span>
            </div>
          </div>

          {/* Bounce / Restitution */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-primary)]">Bounce Elasticity (r)</span>
              <span className="font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                {(config.restitution * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={config.restitution}
              onChange={(e) => onChange({ restitution: parseFloat(e.target.value), preset: null })}
              className="w-full studio-slider"
              aria-label="Bounce Elasticity"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
              <span>0% (Dead Impact)</span>
              <span>50%</span>
              <span>100% (Elastic)</span>
            </div>
          </div>

          {/* Inertial Mass */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-primary)]">Inertial Mass (m)</span>
              <span className="font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                {config.mass.toFixed(1)} kg
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={10}
              step={0.1}
              value={config.mass}
              onChange={(e) => onChange({ mass: parseFloat(e.target.value), preset: null })}
              className="w-full studio-slider"
              aria-label="Inertial Mass"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
              <span>0.1 kg (Feather)</span>
              <span>1.0 kg</span>
              <span>10.0 kg (Dense)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Progressive Disclosure: Advanced Physics & Visualization */}
      <div className="flex flex-col border border-[var(--border-subtle)] rounded-xs overflow-hidden bg-[var(--bg-surface-2)]">
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-mono font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          aria-expanded={advancedOpen}
        >
          <div className="flex items-center gap-2">
            <Compass size={15} style={{ color: 'var(--color-primary-text)' }} />
            <span>Advanced Physics &amp; Stage Overlays</span>
          </div>
          {advancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {advancedOpen && (
          <div className="p-4 sm:p-5 flex flex-col gap-6 bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)]">
            {/* Advanced Parameter Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Air Damping */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-primary)]">Air Damping (d)</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                    {(config.damping * 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.2}
                  step={0.002}
                  value={config.damping}
                  onChange={(e) => onChange({ damping: parseFloat(e.target.value), preset: null })}
                  className="w-full studio-slider"
                  aria-label="Air Damping"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                  <span>0% (Vacuum)</span>
                  <span>5% (Atmosphere)</span>
                  <span>20% (Viscous)</span>
                </div>
              </div>

              {/* Surface Friction */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-primary)]">Surface Friction (f)</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                    {(config.friction * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={config.friction}
                  onChange={(e) => onChange({ friction: parseFloat(e.target.value), preset: null })}
                  className="w-full studio-slider"
                  aria-label="Surface Friction"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                  <span>0% (Ice)</span>
                  <span>10% (Teflon)</span>
                  <span>100% (Rubber)</span>
                </div>
              </div>

              {/* Initial Velocity X */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-primary)]">Launch Velocity X (vx)</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                    {config.velocityX} px/s
                  </span>
                </div>
                <input
                  type="range"
                  min={-500}
                  max={500}
                  step={10}
                  value={config.velocityX}
                  onChange={(e) => onChange({ velocityX: parseFloat(e.target.value), preset: null })}
                  className="w-full studio-slider"
                  aria-label="Launch Velocity X"
                />
              </div>

              {/* Initial Velocity Y */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-primary)]">Launch Velocity Y (vy)</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                    {config.velocityY} px/s
                  </span>
                </div>
                <input
                  type="range"
                  min={-500}
                  max={500}
                  step={10}
                  value={config.velocityY}
                  onChange={(e) => onChange({ velocityY: parseFloat(e.target.value), preset: null })}
                  className="w-full studio-slider"
                  aria-label="Launch Velocity Y"
                />
              </div>

              {/* Simulation Time Scale */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-primary)]">Time Scale (ts)</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                    {config.timeScale.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={config.timeScale}
                  onChange={(e) => onChange({ timeScale: parseFloat(e.target.value), preset: null })}
                  className="w-full studio-slider"
                  aria-label="Time Scale"
                />
              </div>

              {/* Boundary Padding */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-primary)]">Stage Boundary Padding</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-primary-text)' }}>
                    {config.boundaryPadding}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={64}
                  step={4}
                  value={config.boundaryPadding}
                  onChange={(e) => onChange({ boundaryPadding: parseInt(e.target.value, 10), preset: null })}
                  className="w-full studio-slider"
                  aria-label="Boundary Padding"
                />
              </div>
            </div>

            {/* Stage Visual Overlays & Toggles */}
            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none">
                <input
                  type="checkbox"
                  checked={config.showTrajectory}
                  onChange={(e) => onChange({ showTrajectory: e.target.checked })}
                  className="rounded-xs text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <span>Show Trajectory Trail</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none">
                <input
                  type="checkbox"
                  checked={config.showVelocity}
                  onChange={(e) => onChange({ showVelocity: e.target.checked })}
                  className="rounded-xs text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <span>Show Velocity Vector</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none">
                <input
                  type="checkbox"
                  checked={config.showGrid}
                  onChange={(e) => onChange({ showGrid: e.target.checked })}
                  className="rounded-xs text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <span>Coordinate Grid</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none">
                <input
                  type="checkbox"
                  checked={config.scaleResponse}
                  onChange={(e) => onChange({ scaleResponse: e.target.checked })}
                  className="rounded-xs text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <span>Squash &amp; Stretch</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none">
                <input
                  type="checkbox"
                  checked={config.rotation}
                  onChange={(e) => onChange({ rotation: e.target.checked })}
                  className="rounded-xs text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <span>Angular Rotation</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
