import React, { useState } from 'react';
import { MeshGradientConfig, MeshPoint, MESH_PRESETS } from '../../utils/meshEngine';
import { isValidHex } from '../../utils/rampsEngine';
import {
  StudioTabbedInspector,
  InspectorTab,
  StudioInspectorSection,
  StudioControlRow,
  StudioSliderInput,
  StudioSegmented,
} from '../studio/StudioInspector';
import { ColorSwatchPicker } from '../common/ColorSwatchPicker';
import { MeshCodeExport } from './MeshCodeExport';
import { MeshApiDocs } from './MeshApiDocs';
import {
  Sparkles,
  Trash2,
  Copy,
  RefreshCw,
  Sliders,
  Layers,
  Grid,
  Code,
  FileText,
} from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

interface MeshContextualInspectorProps {
  config: MeshGradientConfig;
  selectedPoint: MeshPoint | null;
  selectedPointIndex: number;
  onSelectPoint: (id: string) => void;
  onUpdatePoint: (id: string, patch: Partial<MeshPoint>) => void;
  onDuplicatePoint: (id: string) => void;
  onDeletePoint: (id: string) => void;
  onRandomizePointColor: (id: string) => void;
  onChangeConfig: (patch: Partial<MeshGradientConfig>) => void;
  onGenerateGrid: (rows: number, cols: number) => void;
  onAddPoint: (x: number, y: number) => void;
  onSelectPreset: (presetId: string) => void;
  sourceUrl: string;
}

export const MeshContextualInspector: React.FC<MeshContextualInspectorProps> = ({
  config,
  selectedPoint,
  selectedPointIndex,
  onSelectPoint,
  onUpdatePoint,
  onDuplicatePoint,
  onDeletePoint,
  onRandomizePointColor,
  onChangeConfig,
  onGenerateGrid,
  onAddPoint,
  onSelectPreset,
  sourceUrl,
}) => {
  const [activeTab, setActiveTab] = useState('nodes');

  const quickColors = [
    '#3D7DFF', '#E63946', '#2A9D8F', '#7B2CBF', '#F77F00',
    '#06D6A0', '#118AB2', '#E76F51', '#4361EE', '#F72585',
    '#E9C46A', '#9B5DE5', '#00BBF9', '#00F5D4', '#F15BB5',
  ];

  const tabs: InspectorTab[] = [
    { id: 'nodes', label: 'Nodes', icon: <Layers size={12} /> },
    { id: 'canvas', label: 'Canvas', icon: <Sliders size={12} /> },
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
      {activeTab === 'nodes' && (
        <div>
          {selectedPoint ? (
            <StudioInspectorSection title="Selected Node" badge={`Node ${selectedPointIndex + 1}`}>
              {/* Color */}
              <StudioControlRow label="Color" sublabel={selectedPoint.color}>
                <div className="flex items-center gap-2">
                  <ColorSwatchPicker
                    value={selectedPoint.color}
                    onChange={(color) => onUpdatePoint(selectedPoint.id, { color })}
                    showLabel={false}
                    size="md"
                  />
                  <input
                    type="text"
                    value={selectedPoint.color}
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      if (!val.startsWith('#') && (val.length === 3 || val.length === 6)) {
                        val = `#${val}`;
                      }
                      if (isValidHex(val)) {
                        onUpdatePoint(selectedPoint.id, { color: val.toUpperCase() });
                      }
                    }}
                    className="flex-1 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-2.5 py-1 font-mono text-xs text-[var(--text-primary)] uppercase font-semibold"
                  />
                  <KromaButton
                    size="icon"
                    variant="ghost"
                    onClick={() => onRandomizePointColor(selectedPoint.id)}
                    className="studio-topbar-icon-btn"
                    title="Randomize"
                    aria-label="Randomize"
                    iconLeft={<RefreshCw size={12} />}
                  />
                </div>
              </StudioControlRow>

              {/* Quick Swatches */}
              <StudioControlRow label="Swatches">
                <div className="grid grid-cols-5 gap-1.5">
                  {['#FF5252', '#FF4081', '#7C4DFF', '#536DFE', '#40C4FF', '#18FFFF', '#69F0AE', '#EEFF41', '#FFD740', '#FF6E40'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onUpdatePoint(selectedPoint.id, { color: hex })}
                      className="h-5 rounded-xs border border-white/20 transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </StudioControlRow>

              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <StudioControlRow label="X" sublabel={`${Math.round(selectedPoint.x)}%`}>
                  <StudioSliderInput
                    value={selectedPoint.x}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(x) => onUpdatePoint(selectedPoint.id, { x })}
                  />
                </StudioControlRow>
                <StudioControlRow label="Y" sublabel={`${Math.round(selectedPoint.y)}%`}>
                  <StudioSliderInput
                    value={selectedPoint.y}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(y) => onUpdatePoint(selectedPoint.id, { y })}
                  />
                </StudioControlRow>
              </div>

              {/* Influence */}
              <StudioControlRow label="Influence" sublabel={`${(selectedPoint.influence || 1).toFixed(2)}x`}>
                <StudioSliderInput
                  value={selectedPoint.influence || 1}
                  min={0.2}
                  max={2.5}
                  step={0.05}
                  onChange={(influence) => onUpdatePoint(selectedPoint.id, { influence })}
                />
              </StudioControlRow>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-subtle)]">
                <KromaButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onDuplicatePoint(selectedPoint.id)}
                  className="flex-1 py-1.5 px-2 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-semibold"
                  iconLeft={<Copy size={11} />}
                >
                  Duplicate
                </KromaButton>

                {config.points.length > 2 && (
                  <KromaButton
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeletePoint(selectedPoint.id)}
                    className="py-1.5 px-2.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-rose-950/40 text-rose-400 border border-[var(--border-subtle)] text-xs font-semibold"
                    iconLeft={<Trash2 size={11} />}
                  >
                    Delete
                  </KromaButton>
                )}
              </div>
            </StudioInspectorSection>
          ) : (
            <div className="p-4 text-center text-xs text-[var(--text-tertiary)]">
              Click a point on the canvas to inspect
            </div>
          )}

          {/* All Nodes List */}
          <StudioInspectorSection title="All Nodes" badge={`${config.points.length}`} defaultOpen={!selectedPoint}>
            <div className="flex flex-col gap-1">
              {config.points.map((pt, idx) => {
                const isActive = pt.id === selectedPoint?.id;
                return (
                  <KromaButton
                    key={pt.id}
                    variant={isActive ? 'filled' : 'ghost'}
                    size="sm"
                    onClick={() => onSelectPoint(pt.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-xs text-left transition-colors cursor-pointer w-full justify-start ${
                      isActive
                        ? 'bg-[var(--color-primary-subtle)] text-[var(--text-primary)]'
                        : 'hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)]'
                    }`}
                    iconLeft={
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 border border-white/30"
                        style={{ backgroundColor: pt.color }}
                      />
                    }
                  >
                    <span className="font-mono text-xs font-semibold">Node {idx + 1}</span>
                    <span className="font-mono text-xs text-[var(--text-tertiary)] ml-auto">{pt.color}</span>
                  </KromaButton>
                );
              })}
            </div>
          </StudioInspectorSection>
        </div>
      )}

      {activeTab === 'canvas' && (
        <div>
          <StudioInspectorSection title="Gradient Dynamics">
            <StudioControlRow label="Softness" sublabel={`${(config.softness || 1).toFixed(2)}x`}>
              <StudioSliderInput
                value={config.softness || 1}
                min={0.2}
                max={2.5}
                step={0.05}
                onChange={(softness) => onChangeConfig({ softness, preset: null })}
              />
            </StudioControlRow>

            <StudioControlRow label="Intensity" sublabel={`${(config.intensity || 1).toFixed(2)}x`}>
              <StudioSliderInput
                value={config.intensity || 1}
                min={0.2}
                max={2.0}
                step={0.05}
                onChange={(intensity) => onChangeConfig({ intensity, preset: null })}
              />
            </StudioControlRow>

            <StudioControlRow label="Blur" sublabel={`${config.blur}px`}>
              <StudioSliderInput
                value={config.blur}
                min={0}
                max={60}
                step={1}
                unit="px"
                onChange={(blur) => onChangeConfig({ blur, preset: null })}
              />
            </StudioControlRow>

            <StudioControlRow label="Grain" sublabel={`${config.grain}%`}>
              <StudioSliderInput
                value={config.grain}
                min={0}
                max={50}
                step={1}
                unit="%"
                onChange={(grain) => onChangeConfig({ grain, preset: null })}
              />
            </StudioControlRow>

            <StudioControlRow label="Rotation" sublabel={`${config.rotation || 0}°`}>
              <StudioSliderInput
                value={config.rotation || 0}
                min={0}
                max={360}
                step={5}
                unit="°"
                onChange={(rotation) => onChangeConfig({ rotation, preset: null })}
              />
            </StudioControlRow>

            <StudioControlRow label="Scale" sublabel={`${(config.scale || 1).toFixed(2)}x`}>
              <StudioSliderInput
                value={config.scale || 1}
                min={0.5}
                max={2.0}
                step={0.05}
                onChange={(scale) => onChangeConfig({ scale, preset: null })}
              />
            </StudioControlRow>
          </StudioInspectorSection>

          <StudioInspectorSection title="Background">
            <StudioControlRow label="Mode">
              <StudioSegmented<'canvas' | 'solid' | 'transparent'>
                value={config.background}
                onChange={(background) => onChangeConfig({ background, preset: null })}
                options={[
                  { id: 'canvas', label: 'Dark' },
                  { id: 'solid', label: 'Custom' },
                  { id: 'transparent', label: 'Clear' },
                ]}
              />
            </StudioControlRow>

            {config.background === 'solid' && (
              <StudioControlRow label="Color" sublabel={config.solidColor || '#090A0C'}>
                <div className="flex items-center gap-2">
                  <ColorSwatchPicker
                    value={config.solidColor || '#090A0C'}
                    onChange={(solidColor) => onChangeConfig({ solidColor })}
                    showLabel={false}
                    size="md"
                  />
                  <input
                    type="text"
                    value={config.solidColor || '#090A0C'}
                    onChange={(e) => onChangeConfig({ solidColor: e.target.value })}
                    className="flex-1 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-2 py-1 font-mono text-xs text-[var(--text-primary)] uppercase"
                  />
                </div>
              </StudioControlRow>
            )}

            <StudioControlRow label="Grid Layout">
              <div className="grid grid-cols-3 gap-1.5">
                <KromaButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onGenerateGrid(2, 2)}
                  className="py-1.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] font-mono text-xs font-semibold text-center"
                >
                  2×2
                </KromaButton>
                <KromaButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onGenerateGrid(3, 3)}
                  className="py-1.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] font-mono text-xs font-semibold text-center"
                >
                  3×3
                </KromaButton>
                <KromaButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onGenerateGrid(4, 4)}
                  className="py-1.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] font-mono text-xs font-semibold text-center"
                >
                  4×4
                </KromaButton>
              </div>
            </StudioControlRow>
          </StudioInspectorSection>
        </div>
      )}

      {activeTab === 'presets' && (
        <div className="p-3">
          <div className="studio-preset-grid">
            {MESH_PRESETS.map((p) => {
              const isSelected = config.preset === p.id;
              const colors = p.colors || ['#3D7DFF', '#BFA3F0', '#00F0FF'];
              return (
                <KromaButton
                  key={p.id}
                  variant="ghost"
                  onClick={() => onSelectPreset(p.id)}
                  className={`flex flex-col rounded-sm border transition-all overflow-hidden p-0 h-auto ${
                    isSelected
                      ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                  }`}
                  title={p.description}
                >
                  <div
                    className="w-full h-12"
                    style={{ background: `linear-gradient(135deg, ${colors.join(', ')})` }}
                  />
                  <div className="w-full px-2 py-1.5 bg-[var(--bg-surface-2)]">
                    <span className={`font-mono text-xs font-bold ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {p.name}
                    </span>
                  </div>
                </KromaButton>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="p-3">
          <MeshCodeExport config={config} sourceUrl={sourceUrl} />
        </div>
      )}

      {activeTab === 'api' && (
        <div className="p-3">
          <MeshApiDocs config={config} />
        </div>
      )}
    </StudioTabbedInspector>
  );
};
