import React, { useState } from 'react';
import {
  AntigravityConfig,
  ObjectShape,
  ANTIGRAVITY_PRESETS,
} from '../../utils/antigravityEngine';
import {
  Sliders,
  Sparkles,
  RotateCcw,
  Share2,
  Check,
  ChevronDown,
  Layers,
  Activity,
  Compass,
} from 'lucide-react';

interface PhysicsControlsProps {
  config: AntigravityConfig;
  onChange: (patch: Partial<AntigravityConfig>) => void;
  onRandomize?: () => void;
  onResetSettings?: () => void;
  onShareUrl?: () => void;
  hasCopiedShare?: boolean;
}

export const PhysicsControls: React.FC<PhysicsControlsProps> = ({
  config,
  onChange,
  onRandomize,
  onResetSettings,
  onShareUrl,
  hasCopiedShare = false,
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const objects: { id: ObjectShape; label: string; group: 'Geometric' | 'UI Component' }[] = [
    { id: 'circle', label: 'Circle', group: 'Geometric' },
    { id: 'square', label: 'Square', group: 'Geometric' },
    { id: 'rounded', label: 'Rounded Box', group: 'Geometric' },
    { id: 'blob', label: 'Organic Blob', group: 'Geometric' },
    { id: 'button', label: 'CTA Button', group: 'UI Component' },
    { id: 'card', label: 'Surface Card', group: 'UI Component' },
    { id: 'notification', label: 'Toast Alert', group: 'UI Component' },
    { id: 'badge', label: 'Status Badge', group: 'UI Component' },
    { id: 'icon', label: 'Action Icon', group: 'UI Component' },
    { id: 'panel', label: 'Telemetry Panel', group: 'UI Component' },
  ];

  return (
    <section
      id="physics-controls"
      className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-6 shadow-sm flex flex-col gap-5"
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Sliders size={18} className="text-[var(--text-secondary)]" />
            <span>Physics Parameters &amp; Kinematics</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Tune acceleration, restitution, damping, and inertial mass. Changes update the simulation and URL deterministically.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onRandomize && (
            <button
              type="button"
              onClick={onRandomize}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              title="Randomize within safe physical boundaries"
            >
              <Sparkles size={13} className="text-[var(--accent-gold)]" />
              <span>Randomize</span>
            </button>
          )}

          {onResetSettings && (
            <button
              type="button"
              onClick={onResetSettings}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              title="Reset all settings to default"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          {onShareUrl && (
            <button
              type="button"
              onClick={onShareUrl}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              title="Copy shareable permalink"
            >
              {hasCopiedShare ? (
                <>
                  <Check size={13} />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>Share URL</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Target Simulated Object Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
          <span>Target Object Specimen</span>
          <span className="text-[10px] font-normal text-[var(--text-tertiary)] font-mono">{config.object}</span>
        </label>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 bg-[var(--bg-surface-2)] p-1 rounded-xs border border-[var(--border-subtle)]">
          {objects.map((obj) => (
            <button
              key={obj.id}
              type="button"
              onClick={() => onChange({ object: obj.id, preset: null })}
              className={`py-1.5 px-2 rounded-xs text-xs font-mono font-medium transition-all text-center truncate cursor-pointer ${
                config.object === obj.id
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)]'
              }`}
            >
              {obj.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Physics Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Gravity Y (Vertical Acceleration / Antigravity) */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[var(--text-primary)]">Vertical Gravity (gy)</span>
            <span className="font-bold text-[var(--accent-blue)]">{config.gravityY > 0 ? `+${config.gravityY}` : config.gravityY} m/s²</span>
          </div>
          <input
            type="range"
            min={-20}
            max={20}
            step={0.2}
            value={config.gravityY}
            onChange={(e) => onChange({ gravityY: parseFloat(e.target.value), preset: null })}
            className="w-full cursor-pointer accent-[var(--accent-blue)]"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>-20 (Buoyant Lift)</span>
            <span>0 (Zero-G)</span>
            <span>+20 (Down)</span>
          </div>
        </div>

        {/* 2. Gravity X (Horizontal Wind / Drift) */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[var(--text-primary)]">Horizontal Gravity (gx)</span>
            <span className="font-bold text-[var(--accent-blue)]">{config.gravityX > 0 ? `+${config.gravityX}` : config.gravityX} m/s²</span>
          </div>
          <input
            type="range"
            min={-20}
            max={20}
            step={0.2}
            value={config.gravityX}
            onChange={(e) => onChange({ gravityX: parseFloat(e.target.value), preset: null })}
            className="w-full cursor-pointer accent-[var(--accent-blue)]"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>-20 (West)</span>
            <span>0 (None)</span>
            <span>+20 (East)</span>
          </div>
        </div>

        {/* 3. Bounce / Restitution */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[var(--text-primary)]">Bounce Elasticity (r)</span>
            <span className="font-bold text-emerald-400">{(config.restitution * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={config.restitution}
            onChange={(e) => onChange({ restitution: parseFloat(e.target.value), preset: null })}
            className="w-full cursor-pointer accent-emerald-500"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>0% (Dead Impact)</span>
            <span>50%</span>
            <span>100% (Elastic)</span>
          </div>
        </div>

        {/* 4. Air Resistance / Damping */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[var(--text-primary)]">Air Damping (d)</span>
            <span className="font-bold text-[var(--accent-gold)]">{(config.damping * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.2}
            step={0.002}
            value={config.damping}
            onChange={(e) => onChange({ damping: parseFloat(e.target.value), preset: null })}
            className="w-full cursor-pointer accent-[var(--accent-gold)]"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>0% (Vacuum)</span>
            <span>5% (Atmosphere)</span>
            <span>20% (Viscous)</span>
          </div>
        </div>

        {/* 5. Surface Friction */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[var(--text-primary)]">Surface Friction (f)</span>
            <span className="font-bold text-purple-400">{(config.friction * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={config.friction}
            onChange={(e) => onChange({ friction: parseFloat(e.target.value), preset: null })}
            className="w-full cursor-pointer accent-purple-500"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>0% (Ice)</span>
            <span>50%</span>
            <span>100% (High Grip)</span>
          </div>
        </div>

        {/* 6. Mass */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[var(--text-primary)]">Inertial Mass (m)</span>
            <span className="font-bold text-rose-400">{config.mass.toFixed(1)} kg</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={10}
            step={0.1}
            value={config.mass}
            onChange={(e) => onChange({ mass: parseFloat(e.target.value), preset: null })}
            className="w-full cursor-pointer accent-rose-500"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>0.1 (Lightweight)</span>
            <span>1.0 (Standard)</span>
            <span>10.0 (Heavy)</span>
          </div>
        </div>
      </div>

      {/* Visual Affordance Toggles: Trajectory, Velocity Vector, Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--border-subtle)]">
        <label className="flex items-center justify-between p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-medium)] transition-colors">
          <span className="text-xs font-mono text-[var(--text-primary)] flex items-center gap-1.5">
            <Activity size={14} className="text-[var(--accent-blue)]" />
            <span>Predicted Trajectory</span>
          </span>
          <input
            type="checkbox"
            checked={config.showTrajectory}
            onChange={(e) => onChange({ showTrajectory: e.target.checked })}
            className="rounded-xs accent-[var(--accent-blue)] cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-medium)] transition-colors">
          <span className="text-xs font-mono text-[var(--text-primary)] flex items-center gap-1.5">
            <Compass size={14} className="text-emerald-400" />
            <span>Velocity Vector</span>
          </span>
          <input
            type="checkbox"
            checked={config.showVelocity}
            onChange={(e) => onChange({ showVelocity: e.target.checked })}
            className="rounded-xs accent-emerald-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-medium)] transition-colors">
          <span className="text-xs font-mono text-[var(--text-primary)] flex items-center gap-1.5">
            <Layers size={14} className="text-[var(--accent-gold)]" />
            <span>Coordinate Grid</span>
          </span>
          <input
            type="checkbox"
            checked={config.showGrid}
            onChange={(e) => onChange({ showGrid: e.target.checked })}
            className="rounded-xs accent-[var(--accent-gold)] cursor-pointer"
          />
        </label>
      </div>

      {/* Advanced Progressive Disclosure Area */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`}
          />
          <span className="font-bold uppercase tracking-wider">Advanced Physics Properties</span>
        </button>

        {advancedOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-2 border-t border-[var(--border-subtle)]">
            {/* Initial Launch Velocity X */}
            <div className="flex flex-col gap-1 text-xs font-mono p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
              <label className="text-[var(--text-secondary)]">Launch Velocity X: {config.velocityX} px/s</label>
              <input
                type="range"
                min={-500}
                max={500}
                step={10}
                value={config.velocityX}
                onChange={(e) => onChange({ velocityX: parseFloat(e.target.value), preset: null })}
                className="accent-[var(--accent-blue)] cursor-pointer"
              />
            </div>

            {/* Initial Launch Velocity Y */}
            <div className="flex flex-col gap-1 text-xs font-mono p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
              <label className="text-[var(--text-secondary)]">Launch Velocity Y: {config.velocityY} px/s</label>
              <input
                type="range"
                min={-500}
                max={500}
                step={10}
                value={config.velocityY}
                onChange={(e) => onChange({ velocityY: parseFloat(e.target.value), preset: null })}
                className="accent-[var(--accent-blue)] cursor-pointer"
              />
            </div>

            {/* Time Scale Multiplier */}
            <div className="flex flex-col gap-1 text-xs font-mono p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
              <label className="text-[var(--text-secondary)]">Time Scale: {config.timeScale}x</label>
              <input
                type="range"
                min={0.2}
                max={2.5}
                step={0.1}
                value={config.timeScale}
                onChange={(e) => onChange({ timeScale: parseFloat(e.target.value) })}
                className="accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Angular Velocity / Rotation Spin */}
            <div className="flex flex-col gap-1 text-xs font-mono p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
              <label className="text-[var(--text-secondary)]">Angular Spin: {config.angularVelocity} deg/s</label>
              <input
                type="range"
                min={-180}
                max={180}
                step={5}
                value={config.angularVelocity}
                onChange={(e) => onChange({ angularVelocity: parseFloat(e.target.value), rotation: true, preset: null })}
                className="accent-[var(--accent-gold)] cursor-pointer"
              />
            </div>

            {/* Boundary Padding */}
            <div className="flex flex-col gap-1 text-xs font-mono p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
              <label className="text-[var(--text-secondary)]">Boundary Margin: {config.boundaryPadding} px</label>
              <input
                type="range"
                min={0}
                max={48}
                step={4}
                value={config.boundaryPadding}
                onChange={(e) => onChange({ boundaryPadding: parseInt(e.target.value, 10) })}
                className="accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
