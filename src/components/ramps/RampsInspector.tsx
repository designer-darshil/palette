import React from 'react';
import {
  RampsConfig,
  RampsScheme,
  RampsScope,
  RampsWcag,
  RampsNotation,
  RampsVividness,
  GeneratedPaletteResult,
  StepKey,
  STEP_KEYS,
  isValidHex,
} from '../../utils/rampsEngine';
import {
  StudioInspectorSection,
  StudioControlRow,
  StudioSegmented,
} from '../studio/StudioInspector';

interface RampsInspectorProps {
  config: RampsConfig;
  onChange: (patch: Partial<RampsConfig>) => void;
  paletteResult: GeneratedPaletteResult;
  selectedRampKey: string;
  selectedStep: number | null;
}

export const RampsInspector: React.FC<RampsInspectorProps> = ({
  config,
  onChange,
  paletteResult,
  selectedRampKey,
  selectedStep,
}) => {
  const rampKeys = Object.keys(paletteResult.ramps);
  const activeRampKey = rampKeys.includes(selectedRampKey) ? selectedRampKey : rampKeys[0] || 'brand';
  const activeRamp = paletteResult.ramps[activeRampKey] || Object.values(paletteResult.ramps)[0];

  const stepKeyStr = selectedStep !== null ? (selectedStep.toString() as StepKey) : null;
  const activeStop = stepKeyStr && activeRamp?.steps ? activeRamp.steps[stepKeyStr] : null;

  const quickSwatches = [
    '#3D7DFF', '#E63946', '#2A9D8F', '#7B2CBF', '#F77F00',
    '#06D6A0', '#118AB2', '#E76F51', '#4361EE', '#F72585',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Inspector Title */}
      <div className="px-3.5 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
          Ramps Inspector
        </span>
        <span className="font-mono text-[9px] px-1.5 py-0.2 bg-[var(--bg-surface-2)] text-[var(--text-secondary)] rounded-xs">
          OKLCH Engine
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 1. Contextual Stop Inspector (When a stop is selected) */}
        {activeStop && (
          <StudioInspectorSection title="Selected Stop Parameters" badge={`${activeRamp.label}-${stepKeyStr}`}>
            <StudioControlRow label="Hex Specimen" sublabel={activeStop.hex}>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xs border border-white/20 flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: activeStop.hex }}
                />
                <input
                  type="text"
                  readOnly
                  value={activeStop.hex}
                  className="flex-1 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-2.5 py-1 font-mono text-xs text-[var(--text-primary)]"
                />
              </div>
            </StudioControlRow>

            <StudioControlRow label="OKLCH Notation">
              <div className="font-mono text-[11px] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs p-2 text-[var(--text-primary)] break-all select-all">
                {activeStop.oklch}
              </div>
            </StudioControlRow>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <div className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs p-1.5 flex flex-col items-center">
                <span className="font-mono text-[9px] text-[var(--text-tertiary)]">LIGHTNESS</span>
                <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{(activeStop.lightness * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs p-1.5 flex flex-col items-center">
                <span className="font-mono text-[9px] text-[var(--text-tertiary)]">CHROMA</span>
                <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{activeStop.chroma.toFixed(3)}</span>
              </div>
              <div className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs p-1.5 flex flex-col items-center">
                <span className="font-mono text-[9px] text-[var(--text-tertiary)]">HUE</span>
                <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{activeStop.hue.toFixed(0)}°</span>
              </div>
            </div>
          </StudioInspectorSection>
        )}

        {/* 2. Brand Anchor Specimen */}
        <StudioInspectorSection title="Brand Anchor Color">
          <StudioControlRow label="Base Anchor Hex">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xs border border-white/20 flex-shrink-0 relative overflow-hidden cursor-pointer"
                style={{ backgroundColor: `#${config.brand}` }}
              >
                <input
                  type="color"
                  value={`#${config.brand}`}
                  onChange={(e) => onChange({ brand: e.target.value.replace('#', '') })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              <div className="flex-1 flex items-center bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-2 py-1">
                <span className="font-mono text-xs text-[var(--text-tertiary)] mr-1">#</span>
                <input
                  type="text"
                  maxLength={6}
                  value={config.brand}
                  onChange={(e) => {
                    const clean = e.target.value.replace('#', '');
                    if (isValidHex(clean) || clean.length <= 6) {
                      onChange({ brand: clean });
                    }
                  }}
                  className="w-full bg-transparent font-mono text-xs text-[var(--text-primary)] outline-none uppercase font-semibold"
                />
              </div>
            </div>
          </StudioControlRow>

          {/* Quick Swatches Bar */}
          <StudioControlRow label="Preset Palettes">
            <div className="grid grid-cols-5 gap-1.5">
              {quickSwatches.map((hex) => {
                const isSelected = config.brand.toLowerCase() === hex.replace('#', '').toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => onChange({ brand: hex.replace('#', '') })}
                    className={`h-5 rounded-xs border transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-[var(--color-primary)] scale-110 z-10' : 'border-white/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                );
              })}
            </div>
          </StudioControlRow>
        </StudioInspectorSection>

        {/* 3. Harmony Scheme & Color Math */}
        <StudioInspectorSection title="Harmonic Scheme & Dynamics">
          <StudioControlRow label="Scheme Generator">
            <StudioSegmented<RampsScheme>
              value={config.scheme}
              onChange={(scheme) => onChange({ scheme })}
              options={[
                { id: 'complementary', label: 'Comp' },
                { id: 'analogous', label: 'Analog' },
                { id: 'triadic', label: 'Triad' },
                { id: 'split', label: 'Split' },
                { id: 'monochromatic', label: 'Mono' },
              ]}
            />
          </StudioControlRow>

          <StudioControlRow label="Ramp Scale Scope">
            <StudioSegmented<RampsScope>
              value={config.scope}
              onChange={(scope) => onChange({ scope })}
              options={[
                { id: 'full', label: 'Full (50–950)' },
                { id: 'basic', label: 'Basic (100–900)' },
              ]}
            />
          </StudioControlRow>

          <StudioControlRow label="Vividness Curve">
            <StudioSegmented<RampsVividness>
              value={config.vividness}
              onChange={(vividness) => onChange({ vividness })}
              options={[
                { id: 'natural', label: 'Natural' },
                { id: 'bold', label: 'Bold High-Chroma' },
              ]}
            />
          </StudioControlRow>
        </StudioInspectorSection>

        {/* 4. Contrast & Output Contract */}
        <StudioInspectorSection title="Accessibility & Output">
          <StudioControlRow label="Enforced Contrast Target">
            <StudioSegmented<RampsWcag>
              value={config.wcag}
              onChange={(wcag) => onChange({ wcag })}
              options={[
                { id: 'AA', label: 'WCAG AA (4.5:1)' },
                { id: 'AAA', label: 'WCAG AAA (7.0:1)' },
              ]}
            />
          </StudioControlRow>

          <StudioControlRow label="Color Output Notation">
            <StudioSegmented<RampsNotation>
              value={config.notation}
              onChange={(notation) => onChange({ notation })}
              options={[
                { id: 'oklch', label: 'OKLCH' },
                { id: 'hex', label: 'HEX' },
                { id: 'rgb', label: 'RGB' },
                { id: 'hsl', label: 'HSL' },
              ]}
            />
          </StudioControlRow>
        </StudioInspectorSection>
      </div>
    </div>
  );
};
