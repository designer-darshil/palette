import React, { useState } from 'react';
import {
  AntigravityConfig,
  ObjectShape,
  ANTIGRAVITY_PRESETS,
} from '../../utils/antigravityEngine';
import {
  StudioTabbedInspector,
  InspectorTab,
  StudioInspectorSection,
  StudioControlRow,
  StudioSliderInput,
  StudioSegmented,
} from '../studio/StudioInspector';
import { AntigravityCodeExport } from './AntigravityCodeExport';
import { AntigravityApiDocs } from './AntigravityApiDocs';
import { Sliders, Grid, Code, FileText, Compass, Feather, ArrowDown, Sparkles } from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

interface AntigravityInspectorProps {
  config: AntigravityConfig;
  onChange: (patch: Partial<AntigravityConfig>) => void;
  onSelectPreset: (presetId: string) => void;
  sourceUrl?: string;
}

export const AntigravityInspector: React.FC<AntigravityInspectorProps> = ({
  config,
  onChange,
  onSelectPreset,
  sourceUrl = 'https://kroma.design/antigravity',
}) => {
  const [activeTab, setActiveTab] = useState('physics');

  const tabs: InspectorTab[] = [
    { id: 'physics', label: 'Physics', icon: <Sliders size={12} /> },
    { id: 'presets', label: 'Presets', icon: <Grid size={12} /> },
    { id: 'code', label: 'Code', icon: <Code size={12} /> },
    { id: 'api', label: 'API', icon: <FileText size={12} /> },
  ];

  return (
    <StudioTabbedInspector
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'physics' && (
        <div>
          {/* Object Shape */}
          <StudioInspectorSection title="Object Shape">
            <StudioControlRow label="Type">
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

            <StudioControlRow label="Mass" sublabel={`${config.mass} kg`}>
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

          {/* Gravity */}
          <StudioInspectorSection title="Gravity & Force">
            <StudioControlRow label="Gravity Y" sublabel={`${config.gravityY} G`}>
              <StudioSliderInput
                value={config.gravityY}
                min={-20}
                max={30}
                step={1}
                unit="G"
                onChange={(gravityY) => onChange({ gravityY, preset: null })}
              />
            </StudioControlRow>

            <StudioControlRow label="Wind X" sublabel={`${config.gravityX} W`}>
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

          {/* Collisions */}
          <StudioInspectorSection title="Dynamics">
            <StudioControlRow label="Bounce" sublabel={`${Math.round(config.restitution * 100)}%`}>
              <StudioSliderInput
                value={config.restitution}
                min={0}
                max={1}
                step={0.05}
                onChange={(restitution) => onChange({ restitution, preset: null })}
              />
            </StudioControlRow>

            <StudioControlRow label="Damping" sublabel={`${Math.round(config.damping * 1000) / 10}%`}>
              <StudioSliderInput
                value={config.damping}
                min={0}
                max={0.1}
                step={0.005}
                onChange={(damping) => onChange({ damping, preset: null })}
              />
            </StudioControlRow>
          </StudioInspectorSection>

          {/* Overlays */}
          <StudioInspectorSection title="Overlays">
            <div className="flex items-center justify-between py-1">
              <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                Trajectory
              </label>
              <input
                type="checkbox"
                checked={config.showTrajectory}
                onChange={(e) => onChange({ showTrajectory: e.target.checked })}
                className="accent-[var(--color-primary)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                Velocity Vector
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
      )}

      {activeTab === 'presets' && (
        <div className="p-3">
          <div className="studio-preset-grid">
            {ANTIGRAVITY_PRESETS.map((p) => {
              const isSelected = config.preset === p.id;
              let icon = <Compass size={16} className="text-[var(--color-primary)]" />;
              if (p.id.includes('float') || p.id.includes('weightless')) icon = <Feather size={16} className="text-cyan-400" />;
              if (p.id.includes('drop') || p.id.includes('heavy')) icon = <ArrowDown size={16} className="text-amber-400" />;
              if (p.id.includes('bounce') || p.id.includes('hyper')) icon = <Sparkles size={16} className="text-pink-400" />;

              return (
                <KromaButton
                  key={p.id}
                  variant={isSelected ? 'filled' : 'ghost'}
                  onClick={() => onSelectPreset(p.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-sm border transition-all h-auto ${
                    isSelected
                      ? 'bg-[var(--color-primary-subtle)] border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                      : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                  }`}
                  title={p.description}
                  iconLeft={icon}
                >
                  <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'}`}>
                    {p.name}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--text-tertiary)]">
                    G:{p.config.gravityY ?? 0} · M:{p.config.mass ?? 1}
                  </span>
                </KromaButton>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="p-3">
          <AntigravityCodeExport config={config} sourceUrl={sourceUrl} />
        </div>
      )}

      {activeTab === 'api' && (
        <div className="p-3">
          <AntigravityApiDocs config={config} />
        </div>
      )}
    </StudioTabbedInspector>
  );
};
