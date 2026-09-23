import React, { useState } from 'react';
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
  StudioTabbedInspector,
  InspectorTab,
  StudioInspectorSection,
  StudioControlRow,
  StudioSegmented,
} from '../studio/StudioInspector';
import { ColorSwatchPicker } from '../common/ColorSwatchPicker';
import { RampsSemanticTokensTable } from './RampsSemanticTokensTable';
import { RampsCodeExport } from './RampsCodeExport';
import { RampsLiveUiPreview } from './RampsLiveUiPreview';
import { RampsApiDocs } from './RampsApiDocs';
import { Sliders, Table, Code, Eye, FileText } from 'lucide-react';

interface RampsInspectorProps {
  config: RampsConfig;
  onChange: (patch: Partial<RampsConfig>) => void;
  paletteResult: GeneratedPaletteResult;
  selectedRampKey: string;
  selectedStep: number | null;
  wcagLevel: 'AA' | 'AAA';
  onToggleExcludeToken: (tokenName: string) => void;
  excludedTokens: string[];
}

export const RampsInspector: React.FC<RampsInspectorProps> = ({
  config,
  onChange,
  paletteResult,
  selectedRampKey,
  selectedStep,
  wcagLevel,
  onToggleExcludeToken,
  excludedTokens,
}) => {
  const [activeTab, setActiveTab] = useState('properties');

  const rampKeys = Object.keys(paletteResult.ramps);
  const activeRampKey = rampKeys.includes(selectedRampKey) ? selectedRampKey : rampKeys[0] || 'brand';
  const activeRamp = paletteResult.ramps[activeRampKey] || Object.values(paletteResult.ramps)[0];

  const stepKeyStr = selectedStep !== null ? (selectedStep.toString() as StepKey) : null;
  const activeStop = stepKeyStr && activeRamp?.steps ? activeRamp.steps[stepKeyStr] : null;

  const quickSwatches = [
    '#3D7DFF', '#E63946', '#2A9D8F', '#7B2CBF', '#F77F00',
    '#06D6A0', '#118AB2', '#E76F51', '#4361EE', '#F72585',
  ];

  const tabs: InspectorTab[] = [
    { id: 'properties', label: 'Properties', icon: <Sliders size={12} /> },
    { id: 'tokens', label: 'Tokens', icon: <Table size={12} /> },
    { id: 'preview', label: 'Preview', icon: <Eye size={12} /> },
    { id: 'code', label: 'Code', icon: <Code size={12} /> },
    { id: 'api', label: 'API', icon: <FileText size={12} /> },
  ];

  return (
    <StudioTabbedInspector
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'properties' && (
        <div>
          {/* Contextual Stop Inspector */}
          {activeStop && (
            <StudioInspectorSection title="Selected Stop" badge={`${activeRamp.label}-${stepKeyStr}`}>
              <StudioControlRow label="Hex" sublabel={activeStop.hex}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xs flex-shrink-0"
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

              <StudioControlRow label="OKLCH">
                <div className="font-mono text-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs p-2 text-[var(--text-primary)] break-all select-all">
                  {activeStop.oklch}
                </div>
              </StudioControlRow>

              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-[var(--bg-surface-2)] rounded-xs p-1.5 flex flex-col items-center">
                  <span className="text-xs text-[var(--text-tertiary)] font-semibold">L</span>
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{(activeStop.lightness * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-[var(--bg-surface-2)] rounded-xs p-1.5 flex flex-col items-center">
                  <span className="text-xs text-[var(--text-tertiary)] font-semibold">C</span>
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{activeStop.chroma.toFixed(3)}</span>
                </div>
                <div className="bg-[var(--bg-surface-2)] rounded-xs p-1.5 flex flex-col items-center">
                  <span className="text-xs text-[var(--text-tertiary)] font-semibold">H</span>
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{activeStop.hue.toFixed(0)}°</span>
                </div>
              </div>
            </StudioInspectorSection>
          )}

          {/* Brand Anchor */}
          <StudioInspectorSection title="Brand Anchor">
            <StudioControlRow label="Base Color">
              <div className="flex items-center gap-2">
                <ColorSwatchPicker
                  value={`#${config.brand}`}
                  onChange={(val) => onChange({ brand: val.replace('#', '') })}
                  showLabel={false}
                  size="md"
                />
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

            <StudioControlRow label="Quick Swatches">
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

          {/* Scheme & Dynamics */}
          <StudioInspectorSection title="Harmony & Scheme">
            <StudioControlRow label="Scheme">
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

            <StudioControlRow label="Scope">
              <StudioSegmented<RampsScope>
                value={config.scope}
                onChange={(scope) => onChange({ scope })}
                options={[
                  { id: 'full', label: 'Full (50–950)' },
                  { id: 'basic', label: 'Basic (100–900)' },
                ]}
              />
            </StudioControlRow>

            <StudioControlRow label="Vividness">
              <StudioSegmented<RampsVividness>
                value={config.vividness}
                onChange={(vividness) => onChange({ vividness })}
                options={[
                  { id: 'natural', label: 'Natural' },
                  { id: 'bold', label: 'Bold' },
                ]}
              />
            </StudioControlRow>
          </StudioInspectorSection>

          {/* Output */}
          <StudioInspectorSection title="Accessibility & Output">
            <StudioControlRow label="Contrast Target">
              <StudioSegmented<RampsWcag>
                value={config.wcag}
                onChange={(wcag) => onChange({ wcag })}
                options={[
                  { id: 'AA', label: 'WCAG AA (4.5:1)' },
                  { id: 'AAA', label: 'WCAG AAA (7:1)' },
                ]}
              />
            </StudioControlRow>

            <StudioControlRow label="Notation">
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
      )}

      {activeTab === 'tokens' && (
        <div className="p-3">
          <RampsSemanticTokensTable
            tokens={paletteResult.tokens}
            wcagLevel={wcagLevel}
            onToggleExcludeToken={onToggleExcludeToken}
            excludedTokens={excludedTokens}
          />
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="p-3">
          <RampsLiveUiPreview paletteResult={paletteResult} />
        </div>
      )}

      {activeTab === 'code' && (
        <div className="p-3">
          <RampsCodeExport paletteResult={paletteResult} />
        </div>
      )}

      {activeTab === 'api' && (
        <div className="p-3">
          <RampsApiDocs paletteResult={paletteResult} />
        </div>
      )}
    </StudioTabbedInspector>
  );
};
