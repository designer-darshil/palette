import React from 'react';
import { MeshGradientConfig, MeshPoint } from '../../utils/meshEngine';
import { isValidHex } from '../../utils/rampsEngine';
import {
  StudioInspectorSection,
  StudioControlRow,
  StudioSliderInput,
  StudioSegmented,
} from '../studio/StudioInspector';
import { ColorSwatchPicker } from '../common/ColorSwatchPicker';
import {
  Sparkles,
  Trash2,
  Copy,
  RefreshCw,
  Plus,
  Layers,
  Sliders,
  Grid,
} from 'lucide-react';

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
}) => {
  const quickColors = [
    '#3D7DFF', '#E63946', '#2A9D8F', '#7B2CBF', '#F77F00',
    '#06D6A0', '#118AB2', '#E76F51', '#4361EE', '#F72585',
    '#E9C46A', '#9B5DE5', '#00BBF9', '#00F5D4', '#F15BB5',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Inspector Header */}
      <div className="px-3.5 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
          Mesh Inspector
        </span>
        <span className="font-mono text-[9px] px-1.5 py-0.2 bg-[var(--bg-surface-2)] text-[var(--text-secondary)] rounded-xs">
          Radial Engine
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 1. Contextual Point Inspector (Active when a point is selected) */}
        {selectedPoint ? (
          <StudioInspectorSection title="Selected Node Properties" badge={`Node ${selectedPointIndex + 1}`}>
            {/* Color Swatch & Hex */}
            <StudioControlRow label="Node Color Specimen" sublabel={selectedPoint.color}>
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
                    const val = e.target.value;
                    if (isValidHex(val)) onUpdatePoint(selectedPoint.id, { color: val });
                  }}
                  className="flex-1 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-2.5 py-1 font-mono text-xs text-[var(--text-primary)] uppercase font-semibold"
                />

                <button
                  type="button"
                  onClick={() => onRandomizePointColor(selectedPoint.id)}
                  className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                  title="Randomize node color"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </StudioControlRow>

            {/* Quick Color Swatches */}
            <StudioControlRow label="Quick Palette Swatches">
              <div className="grid grid-cols-5 gap-1.5">
                {quickColors.map((hex) => {
                  const isSelected = selectedPoint.color.toLowerCase() === hex.toLowerCase();
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onUpdatePoint(selectedPoint.id, { color: hex })}
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

            {/* Position Coordinates */}
            <div className="grid grid-cols-2 gap-2">
              <StudioControlRow label="Position X (H)" sublabel={`${selectedPoint.x}%`}>
                <StudioSliderInput
                  value={selectedPoint.x}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  onChange={(x) => onUpdatePoint(selectedPoint.id, { x })}
                />
              </StudioControlRow>

              <StudioControlRow label="Position Y (V)" sublabel={`${selectedPoint.y}%`}>
                <StudioSliderInput
                  value={selectedPoint.y}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  onChange={(y) => onUpdatePoint(selectedPoint.id, { y })}
                />
              </StudioControlRow>
            </div>

            {/* Radius / Influence */}
            <StudioControlRow label="Influence Radius" sublabel={`${(selectedPoint.influence || 1).toFixed(2)}x`}>
              <StudioSliderInput
                value={selectedPoint.influence || 1}
                min={0.2}
                max={2.5}
                step={0.05}
                onChange={(influence) => onUpdatePoint(selectedPoint.id, { influence })}
              />
            </StudioControlRow>

            {/* Node Action Buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => onDuplicatePoint(selectedPoint.id)}
                className="flex-1 py-1 px-2 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy size={11} />
                <span>Duplicate</span>
              </button>

              {config.points.length > 2 && (
                <button
                  type="button"
                  onClick={() => onDeletePoint(selectedPoint.id)}
                  className="py-1 px-2.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-rose-950/40 text-rose-400 border border-[var(--border-subtle)] font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete Node"
                >
                  <Trash2 size={11} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </StudioInspectorSection>
        ) : (
          <div className="p-4 text-center font-mono text-xs text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">
            Click any point on canvas to inspect
          </div>
        )}

        {/* 2. Global Mesh Dynamics & Blending */}
        <StudioInspectorSection title="Global Mesh Dynamics">
          <StudioControlRow label="Gradient Softness" sublabel={`${config.softness}%`}>
            <StudioSliderInput
              value={config.softness}
              min={10}
              max={100}
              step={1}
              unit="%"
              onChange={(softness) => onChangeConfig({ softness, preset: null })}
            />
          </StudioControlRow>

          <StudioControlRow label="Color Intensity / Vibrancy" sublabel={`${config.intensity}%`}>
            <StudioSliderInput
              value={config.intensity}
              min={50}
              max={200}
              step={5}
              unit="%"
              onChange={(intensity) => onChangeConfig({ intensity, preset: null })}
            />
          </StudioControlRow>

          <StudioControlRow label="Diffusion Blur" sublabel={`${config.blur}px`}>
            <StudioSliderInput
              value={config.blur}
              min={0}
              max={60}
              step={2}
              unit="px"
              onChange={(blur) => onChangeConfig({ blur, preset: null })}
            />
          </StudioControlRow>

          <StudioControlRow label="Film Grain Texture" sublabel={`${config.grain}%`}>
            <StudioSliderInput
              value={config.grain}
              min={0}
              max={40}
              step={1}
              unit="%"
              onChange={(grain) => onChangeConfig({ grain, preset: null })}
            />
          </StudioControlRow>
        </StudioInspectorSection>

        {/* 3. Canvas Background & Topology */}
        <StudioInspectorSection title="Canvas Background & Topology">
          <StudioControlRow label="Background Mode">
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
            <StudioControlRow label="Solid Background Color" sublabel={config.solidColor || '#090A0C'}>
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

          {/* Grid Layout Generator */}
          <StudioControlRow label="Topology Grid Presets">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => onGenerateGrid(2, 2)}
                className="py-1 px-2 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] font-mono text-[10px] font-bold text-center transition-colors cursor-pointer"
              >
                2x2 (4 pts)
              </button>
              <button
                type="button"
                onClick={() => onGenerateGrid(3, 3)}
                className="py-1 px-2 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] font-mono text-[10px] font-bold text-center transition-colors cursor-pointer"
              >
                3x3 (9 pts)
              </button>
              <button
                type="button"
                onClick={() => onGenerateGrid(4, 4)}
                className="py-1 px-2 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] font-mono text-[10px] font-bold text-center transition-colors cursor-pointer"
              >
                4x4 (16 pts)
              </button>
            </div>
          </StudioControlRow>
        </StudioInspectorSection>
      </div>
    </div>
  );
};
