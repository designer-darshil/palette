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
  Eye,
  Box,
} from 'lucide-react';

interface PhysicsControlsProps {
  config: AntigravityConfig;
  onChange: (patch: Partial<AntigravityConfig>) => void;
  onRandomize: () => void;
  onResetSettings: () => void;
  onShareUrl: () => void;
  hasCopiedShare: boolean;
}

export const PhysicsControls: React.FC<PhysicsControlsProps> = ({
  config,
  onChange,
  onRandomize,
  onResetSettings,
  onShareUrl,
  hasCopiedShare,
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
    <section id="physics-controls" className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col gap-6">
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
          <button
            type="button"
            onClick={onRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-all shadow-xs"
            title="Randomize within safe physical boundaries"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Randomize</span>
          </button>

          <button
            type="button"
            onClick={onResetSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-all shadow-xs"
            title="Reset all settings to default"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onShareUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--text-primary)] text-[var(--text-inverse)] text-xs font-mono font-medium hover:opacity-90 transition-all shadow-xs"
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
        </div>
      </div>

      {/* Target Simulated Object Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
          <span>Target Object Shape / UI Specimen</span>
          <span className="text-[10px] font-normal text-[var(--text-tertiary)] font-mono">{config.object}</span>
        </label>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 bg-[var(--bg-surface-2)] p-1 rounded-lg border border-[var(--border-subtle)]">
          {objects.map((obj) => (
            <button
              key={obj.id}
              type="button"
              onClick={() => onChange({ object: obj.id, preset: null })}
              className={`py-1.5 px-2 rounded text-xs font-mono font-medium transition-all text-center truncate ${
                config.object === obj.id
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)]'
              }`}
            >
              {obj.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Physics Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Gravity Y (Vertical Acceleration / Antigravity) */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--bg-surface-2)]/60 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[var(--text-primary)]">Vertical Gravity (gy)</span>
            <span className="font-bold text-blue-400">{config.gravityY > 0 ? `+${config.gravityY}` : config.gravityY} m/s²</span>
          </div>
          <input
            type="range"
            min={-20}
            max={20}
            step={0.2}
            value={config.gravityY}
            onChange={(e) => onChange({ gravityY: parseFloat(e.target.value), preset: null })}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>-20 (Lift)</span>
            <span>0 (Zero-G)</span>
            <span>+20 (Down)</span>
          </div>
        </div>

        {/* 2. Gravity X (Horizontal Wind / Drift) */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--bg-surface-2)]/60 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[var(--text-primary)]">Horizontal Gravity (gx)</span>
            <span className="font-bold text-blue-400">{config.gravityX > 0 ? `+${config.gravityX}` : config.gravityX} m/s²</span>
          </div>
          <input
            type="range"
            min={-20}
            max={20}
            step={0.2}
            value={config.gravityX}
            onChange={(e) => onChange({ gravityX: parseFloat(e.target.value), preset: null })}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>-20 (West)</span>
            <span>0 (None)</span>
            <span>+20 (East)</span>
          </div>
        </div>

        {/* 3. Bounce / Restitution */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--bg-surface-2)]/60 border border-[var(--border-subtle)]">
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
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>0% (Dead Impact)</span>
            <span>50%</span>
            <span>100% (Elastic)</span>
          </div>
        </div>

        {/* 4. Air Resistance / Damping */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--bg-surface-2)]/60 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[var(--text-primary)]">Air Damping (d)</span>
            <span className="font-bold text-amber-400">{(config.damping * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.2}
            step={0.002}
            value={config.damping}
            onChange={(e) => onChange({ damping: parseFloat(e.target.value), preset: null })}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>0% (Vacuum)</span>
            <span>5% (Atmosphere)</span>
            <span>20% (Fluid)</span>
          </div>
        </div>

        {/* 5. Surface Friction */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--bg-surface-2)]/60 border border-[var(--border-subtle)]">
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
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>0% (Ice)</span>
            <span>50%</span>
            <span>100% (High Grip)</span>
          </div>
        </div>

        {/* 6. Mass */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--bg-surface-2)]/60 border border-[var(--border-subtle)]">
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
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>0.1 (Feather)</span>
            <span>1.0 (Standard)</span>
            <span>10.0 (Dense)</span>
          </div>
        </div>
      </div>

      {/* Visual Affordance Toggles: Trajectory, Velocity Vector, Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--border-subtle)]">
        <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-medium)] transition-colors">
          <span className="text-xs font-mono text-[var(--text-primary)] flex items-center gap-1.5">
            <Activity size={14} className="text-blue-400" />
            <span>Predicted Trajectory</span>
          </span>
          <input
            type="checkbox"
            checked={config.showTrajectory}
            onChange={(e) => onChange({ showTrajectory: e.target.checked })}
            className="rounded accent-blue-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-medium)] transition-colors">
          <span className="text-xs font-mono text-[var(--text-primary)] flex items-center gap-1.5">
            <Compass size={14} className="text-emerald-400" />
            <span>Velocity Vector</span>
          </span>
          <input
            type="checkbox"
            checked={config.showVelocity}
            onChange={(e) => onChange({ showVelocity: e.target.checked })}
            className="rounded accent-emerald-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-medium)] transition-colors">
          <span className="text-xs font-mono text-[var(--text-primary)] flex items-center gap-1.5">
            <Layers size={14} className="text-amber-400" />
            <span>Coordinate Grid</span>
          </span>
          <input
            type="checkbox"
            checked={config.showGrid}
            onChange={(e) => onChange({ showGrid: e.target.checked })}
            className="rounded accent-amber-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Advanced Progressive Disclosure Area */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`}
          />
          <span className="font-bold uppercase tracking-wider">Advanced Physics Properties</span>
        </button>

        {advancedOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-2 border-t border-[var(--border-subtle)] animate-in fade-in duration-200">
            {/* Initial Launch Velocity X */}
            <div className="flex flex-col gap-1 text-xs font-mono">
              <label className="text-[var(--text-secondary)]">Launch Velocity X: {config.velocityX} px/s</label>
              <input
                type="range"
                min={-500}
                max={500}
                step={10}
                value={config.velocityX}
                onChange={(e) => onChange({ velocityX: parseFloat(e.target.value), preset: null })}
                className="accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Initial Launch Velocity Y */}
            <div className="flex flex-col gap-1 text-xs font-mono">
              <label className="text-[var(--text-secondary)]">Launch Velocity Y: {config.velocityY} px/s</label>
              <input
                type="range"
                min={-500}
                max={500}
                step={10}
                value={config.velocityY}
                onChange={(e) => onChange({ velocityY: parseFloat(e.target.value), preset: null })}
                className="accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Time Scale Multiplier */}
            <div className="flex flex-col gap-1 text-xs font-mono">
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
            <div className="flex flex-col gap-1 text-xs font-mono">
              <label className="text-[var(--text-secondary)]">Angular Spin: {config.angularVelocity} deg/s</label>
              <input
                type="range"
                min={-180}
                max={180}
                step={5}
                value={config.angularVelocity}
                onChange={(e) => onChange({ angularVelocity: parseFloat(e.target.value), rotation: true, preset: null })}
                className="accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Boundary Padding */}
            <div className="flex flex-col gap-1 text-xs font-mono">
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
