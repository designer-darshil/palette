import React from 'react';
import { AntigravityConfig, SimulationState, describeMotion } from '../../utils/antigravityEngine';
import { Activity, Info } from 'lucide-react';

interface SimulationInspectorProps {
  config: AntigravityConfig;
  telemetry: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    state: SimulationState;
  };
}

export const SimulationInspector: React.FC<SimulationInspectorProps> = ({ config, telemetry }) => {
  const kineticEnergy = Math.round(0.5 * config.mass * (telemetry.speed ** 2) / 100);

  return (
    <div
      className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 flex flex-col gap-3.5 shadow-xs"
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)] flex items-center gap-2">
          <Activity size={16} className="text-[var(--accent-blue)]" />
          <span>Motion Telemetry &amp; Kinematics</span>
        </h3>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-xs bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-bold uppercase">
          Live 60 FPS
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Position (X, Y)</span>
          <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
            {telemetry.x}px, {telemetry.y}px
          </span>
        </div>

        <div className="p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Velocity Vector</span>
          <span className="text-xs font-mono font-bold text-[var(--accent-blue)]">
            {telemetry.vx} / {telemetry.vy} px/s
          </span>
        </div>

        <div className="p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Kinetic Energy</span>
          <span className="text-xs font-mono font-bold text-[var(--accent-gold)]">
            {kineticEnergy} J
          </span>
        </div>

        <div className="p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">State</span>
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
            {telemetry.state}
          </span>
        </div>
      </div>

      {/* Semantic Rule-Based Motion Description */}
      <div className="p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
        <Info size={15} className="text-[var(--accent-blue)] flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 font-sans">
          <span className="font-bold text-[var(--text-primary)]">Semantic Behavior: </span>
          <span>{describeMotion(config)}</span>
        </div>
      </div>
    </div>
  );
};
