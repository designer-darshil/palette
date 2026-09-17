import React, { useState } from 'react';
import { MeshGradientConfig, MeshPoint, BackgroundMode } from '../../utils/meshEngine';
import {
  Palette,
  Sliders,
  Grid,
  Paintbrush,
  Sparkles,
  CopyPlus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Layers,
  Compass,
} from 'lucide-react';
import { ColorSwatchPicker } from '../common/ColorSwatchPicker';

interface MeshInspectorProps {
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

export const MeshInspector: React.FC<MeshInspectorProps> = ({
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
  const [activeTab, setActiveTab] = useState<'node' | 'appearance' | 'grid'>('node');
  const [hasCopiedHex, setHasCopiedHex] = useState(false);

  const handleCopyHex = () => {
    if (!selectedPoint) return;
    navigator.clipboard.writeText(selectedPoint.color);
    setHasCopiedHex(true);
    setTimeout(() => setHasCopiedHex(false), 2000);
  };

  return (
    <div
      className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md shadow-sm flex flex-col overflow-hidden"
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      {/* Inspector Segmented Tab Navigation */}
      <div className="flex items-center border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-1">
        <button
          type="button"
          onClick={() => setActiveTab('node')}
          className={`flex-1 py-1.5 px-2 rounded-xs text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
            activeTab === 'node'
              ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs border-[var(--border-subtle)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          style={{
            color: activeTab === 'node' ? 'var(--text-primary)' : undefined,
          }}
        >
          <Palette size={13} style={{ color: activeTab === 'node' ? 'var(--color-primary-text)' : undefined }} />
          <span>Point</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex-1 py-1.5 px-2 rounded-xs text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
            activeTab === 'appearance'
              ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs border-[var(--border-subtle)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          style={{
            color: activeTab === 'appearance' ? 'var(--text-primary)' : undefined,
          }}
        >
          <Sliders size={13} style={{ color: activeTab === 'appearance' ? 'var(--color-primary-text)' : undefined }} />
          <span>Dynamics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grid')}
          className={`flex-1 py-1.5 px-2 rounded-xs text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
            activeTab === 'grid'
              ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs border-[var(--border-subtle)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          style={{
            color: activeTab === 'grid' ? 'var(--text-primary)' : undefined,
          }}
        >
          <Grid size={13} style={{ color: activeTab === 'grid' ? 'var(--color-primary-text)' : undefined }} />
          <span>Grid &amp; Stage</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-5">
        {/* =================================================================== */}
        {/* TAB 1: SELECTED POINT / NODE CONTROLS */}
        {/* =================================================================== */}
        {activeTab === 'node' && (
          <div className="flex flex-col gap-4">
            {/* Quick Node Palette Switch Strip */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[var(--text-secondary)] font-bold uppercase">Mesh Nodes ({config.points.length})</span>
                <span className="text-[var(--text-tertiary)]">Click to select</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {config.points.map((pt, idx) => {
                  const isSelected = selectedPoint?.id === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => onSelectPoint(pt.id)}
                      className={`p-1.5 rounded-xs flex items-center gap-1.5 border transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                        isSelected
                          ? 'bg-[var(--bg-surface-2)] shadow-xs font-bold'
                          : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)]/60'
                      }`}
                      style={{
                        borderColor: isSelected ? 'var(--color-primary)' : undefined,
                        boxShadow: isSelected ? '0 0 0 1px var(--color-primary)' : undefined,
                      }}
                      title={`Point #${idx + 1} (${pt.color})`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs flex-shrink-0"
                        style={{ backgroundColor: pt.color }}
                      />
                      <span className="text-xs font-mono text-[var(--text-primary)]">
                        #{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedPoint ? (
              <div className="flex flex-col gap-4 pt-3 border-t border-[var(--border-subtle)]">
                {/* Header & Quick Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                      style={{ backgroundColor: selectedPoint.color }}
                    />
                    <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">
                      Point #{selectedPointIndex + 1} Settings
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onRandomizePointColor(selectedPoint.id)}
                      className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      title="Randomize this point color"
                    >
                      <Sparkles size={12} style={{ color: 'var(--color-primary-text)' }} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicatePoint(selectedPoint.id)}
                      className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      title="Duplicate this point"
                    >
                      <CopyPlus size={12} />
                    </button>

                    {config.points.length > 2 && (
                      <button
                        type="button"
                        onClick={() => onDeletePoint(selectedPoint.id)}
                        className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] hover:bg-rose-950/40 text-rose-400 border border-[var(--border-subtle)] transition-colors cursor-pointer"
                        title="Delete this point"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Color Picker & HEX input */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                    Color Value
                  </span>
                  <div className="flex items-center gap-2">
                    <ColorSwatchPicker
                      value={selectedPoint.color}
                      onChange={(color) => onUpdatePoint(selectedPoint.id, { color })}
                      showLabel={false}
                      size="md"
                    />
                    <div className="flex-1 flex items-center bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-2.5 py-1">
                      <input
                        type="text"
                        value={selectedPoint.color.toUpperCase()}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (!val.startsWith('#')) val = '#' + val;
                          onUpdatePoint(selectedPoint.id, { color: val });
                        }}
                        className="w-full font-mono text-xs text-[var(--text-primary)] bg-transparent outline-none uppercase"
                        maxLength={7}
                        aria-label="Hex color string"
                      />
                      <button
                        type="button"
                        onClick={handleCopyHex}
                        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer p-0.5"
                        title="Copy hex code"
                      >
                        {hasCopiedHex ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Position X (%) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[var(--text-secondary)]">Coordinate X</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedPoint.x}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedPoint.x}
                    onChange={(e) => onUpdatePoint(selectedPoint.id, { x: parseInt(e.target.value, 10) })}
                    className="w-full studio-slider"
                  />
                </div>

                {/* Position Y (%) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[var(--text-secondary)]">Coordinate Y</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedPoint.y}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedPoint.y}
                    onChange={(e) => onUpdatePoint(selectedPoint.id, { y: parseInt(e.target.value, 10) })}
                    className="w-full studio-slider"
                  />
                </div>

                {/* Point Radius / Influence */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[var(--text-secondary)]">Influence Radius</span>
                    <span className="font-bold" style={{ color: 'var(--color-primary-text)' }}>
                      {selectedPoint.influence.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.0}
                    step={0.05}
                    value={selectedPoint.influence}
                    onChange={(e) => onUpdatePoint(selectedPoint.id, { influence: parseFloat(e.target.value) })}
                    className="w-full studio-slider"
                  />
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[var(--text-tertiary)] font-mono">
                Click any point on canvas to inspect and edit.
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: APPEARANCE & DYNAMICS */}
        {/* =================================================================== */}
        {activeTab === 'appearance' && (
          <div className="flex flex-col gap-4">
            {/* Softness */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Blending Softness</span>
                <span className="font-bold" style={{ color: 'var(--color-primary-text)' }}>
                  {config.softness.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2.0}
                step={0.05}
                value={config.softness}
                onChange={(e) => onChangeConfig({ softness: parseFloat(e.target.value) })}
                className="w-full studio-slider"
              />
            </div>

            {/* Intensity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Color Intensity</span>
                <span className="font-bold" style={{ color: 'var(--color-primary-text)' }}>
                  {config.intensity.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2.0}
                step={0.05}
                value={config.intensity}
                onChange={(e) => onChangeConfig({ intensity: parseFloat(e.target.value) })}
                className="w-full studio-slider"
              />
            </div>

            {/* Blur */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Gaussian Blur</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {config.blur}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                step={2}
                value={config.blur}
                onChange={(e) => onChangeConfig({ blur: parseInt(e.target.value, 10) })}
                className="w-full studio-slider"
              />
            </div>

            {/* Grain */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Grain &amp; Noise</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {config.grain}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={config.grain}
                onChange={(e) => onChangeConfig({ grain: parseInt(e.target.value, 10) })}
                className="w-full studio-slider"
              />
            </div>

            {/* Rotation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Rotation Angle</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {config.rotation}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={config.rotation}
                onChange={(e) => onChangeConfig({ rotation: parseInt(e.target.value, 10) })}
                className="w-full studio-slider"
              />
            </div>

            {/* Scale */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Canvas Scale</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {config.scale.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={config.scale}
                onChange={(e) => onChangeConfig({ scale: parseFloat(e.target.value) })}
                className="w-full studio-slider"
              />
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: GRID MATRIX & STAGE BACKGROUND */}
        {/* =================================================================== */}
        {activeTab === 'grid' && (
          <div className="flex flex-col gap-5">
            {/* Grid Density Generators */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-secondary)] uppercase">
                <span>Structured Grid Density</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onGenerateGrid(2, 2)}
                  className="px-2.5 py-2 rounded-xs text-xs font-mono bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-center cursor-pointer"
                >
                  2 × 2 (4 pts)
                </button>

                <button
                  type="button"
                  onClick={() => onGenerateGrid(2, 3)}
                  className="px-2.5 py-2 rounded-xs text-xs font-mono bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-center cursor-pointer"
                >
                  2 × 3 (6 pts)
                </button>

                <button
                  type="button"
                  onClick={() => onGenerateGrid(3, 3)}
                  className="px-2.5 py-2 rounded-xs text-xs font-mono bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-center cursor-pointer"
                >
                  3 × 3 (9 pts)
                </button>

                <button
                  type="button"
                  onClick={() => onGenerateGrid(4, 4)}
                  className="px-2.5 py-2 rounded-xs text-xs font-mono bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-center cursor-pointer"
                >
                  4 × 4 (16 pts)
                </button>
              </div>

              <button
                type="button"
                onClick={() => onAddPoint(50, 50)}
                className="w-full py-2 px-3 rounded-xs text-xs font-mono font-bold bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)] border border-[var(--color-primary-border)] hover:bg-[var(--color-primary-subtle)]/80 transition-colors text-center cursor-pointer"
              >
                + Add Freeform Point
              </button>
            </div>

            {/* Background Mode */}
            <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase">
                Stage Background
              </span>

              <div className="flex flex-col gap-2">
                <div className="flex items-center bg-[var(--bg-surface-2)] p-1 rounded-xs border border-[var(--border-subtle)]">
                  {(['canvas', 'transparent', 'solid'] as BackgroundMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onChangeConfig({ background: mode })}
                      className={`flex-1 py-1.5 text-xs font-mono capitalize transition-all cursor-pointer select-none text-center ${
                        config.background === mode
                          ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {mode === 'canvas' ? 'Dark' : mode}
                    </button>
                  ))}
                </div>

                {config.background === 'solid' && (
                  <div className="flex items-center gap-2 bg-[var(--bg-surface-2)] px-2.5 py-1.5 rounded-xs border border-[var(--border-subtle)]">
                    <ColorSwatchPicker
                      value={config.solidColor}
                      onChange={(solidColor) => onChangeConfig({ solidColor })}
                      showLabel={false}
                      size="sm"
                    />
                    <span className="font-mono text-xs text-[var(--text-primary)] uppercase">
                      {config.solidColor}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
