import React from 'react';
import {
  AntigravityConfig,
  ObjectShape,
} from '../../utils/antigravityEngine';
import {
  StudioInspectorSection,
  StudioControlRow,
  StudioSliderInput,
  StudioSegmented,
} from '../studio/StudioInspector';

interface AntigravityInspectorProps {
  config: AntigravityConfig;
  onChange: (patch: Partial<AntigravityConfig>) => void;
}

export const AntigravityInspector: React.FC<AntigravityInspectorProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Inspector Header */}
      <div className="px-3.5 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
          Kinematics Inspector
        </span>
        <span className="font-mono text-[9px] px-1.5 py-0.2 bg-[var(--bg-surface-2)] text-[var(--text-secondary)] rounded-xs">
          Matter.js Engine
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 1. Object Topology & Shape */}
        <StudioInspectorSection title="Physics Body Topology">
          <StudioControlRow label="Object Archetype">
            <StudioSegmented<ObjectShape>
              value={config.object}
              onChange={(object) => onChange({ object, preset: null })}
              options={[
                { id: 'card', label: 'Card' },
                { id: 'circle', label: 'Orb' },
                { id: 'rounded', label: 'Pill' },
                { id: 'square', label: 'Cube' },
              ]}
            />
          </StudioControlRow>

          <StudioControlRow label="Inertial Mass" sublabel={`${config.mass} kg`}>
            <StudioSliderInput
              value={config.mass}
              min={0.5}
              max={10}
              step={0.5}
              unit="kg"
              onChange={(mass) => onChange({ mass, preset: null })}
            />
          </StudioControlRow>
        </StudioInspectorSection>

        {/* 2. Gravitational & Force Vectors */}
        <StudioInspectorSection title="Gravitational Vectors & Force">
          <StudioControlRow label="Vertical Gravity (G-Y)" sublabel={`${config.gravityY} m/s²`}>
            <StudioSliderInput
              value={config.gravityY}
              min={-20}
              max={30}
              step={1}
              unit="G"
              onChange={(gravityY) => onChange({ gravityY, preset: null })}
            />
          </StudioControlRow>

          <StudioControlRow label="Lateral Wind Drift (G-X)" sublabel={`${config.gravityX} m/s²`}>
            <StudioSliderInput
              value={config.gravityX}
              min={-20}
              max={20}
              step={1}
              unit="W"
              onChange={(gravityX) => onChange({ gravityX, preset: null })}
            />
          </StudioControlRow>
        </StudioInspectorSection>

        {/* 3. Surface Dynamics & Damping */}
        <StudioInspectorSection title="Collisions & Fluid Damping">
          <StudioControlRow label="Restitution (Bounciness)" sublabel={`${Math.round(config.restitution * 100)}%`}>
            <StudioSliderInput
              value={config.restitution}
              min={0}
              max={1}
              step={0.05}
              onChange={(restitution) => onChange({ restitution, preset: null })}
            />
          </StudioControlRow>

          <StudioControlRow label="Damping (Friction & Drag)" sublabel={`${Math.round(config.damping * 1000) / 10}%`}>
            <StudioSliderInput
              value={config.damping}
              min={0}
              max={0.1}
              step={0.005}
              onChange={(damping) => onChange({ damping, preset: null })}
            />
          </StudioControlRow>
        </StudioInspectorSection>

        {/* 4. Display & Visual Vector Overlay */}
        <StudioInspectorSection title="Visual Debug & Overlays">
          <div className="flex items-center justify-between py-1">
            <label className="font-mono text-[11px] font-semibold text-[var(--text-secondary)]">
              Motion Trajectory Arc
            </label>
            <input
              type="checkbox"
              checked={config.showTrajectory}
              onChange={(e) => onChange({ showTrajectory: e.target.checked })}
              className="accent-[var(--color-primary)] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="font-mono text-[11px] font-semibold text-[var(--text-secondary)]">
              Velocity Vector Arrow
            </label>
            <input
              type="checkbox"
              checked={config.showVelocity}
              onChange={(e) => onChange({ showVelocity: e.target.checked })}
              className="accent-[var(--color-primary)] cursor-pointer"
            />
          </div>
        </StudioInspectorSection>
      </div>
    </div>
  );
};
