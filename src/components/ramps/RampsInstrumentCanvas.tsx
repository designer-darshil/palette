import React, { useState } from 'react';
import {
  GeneratedPaletteResult,
  RampsNotation,
  ColorRamp,
  StepKey,
  STEP_KEYS,
} from '../../utils/rampsEngine';
import { Check, Copy, Activity, ShieldCheck, Sparkles } from 'lucide-react';

interface RampsInstrumentCanvasProps {
  paletteResult: GeneratedPaletteResult;
  notation: RampsNotation;
  selectedRampKey: string;
  onSelectRampKey: (key: string) => void;
  selectedStep: number | null;
  onSelectStep: (step: number | null) => void;
  onBrandColorSelect: (hex: string) => void;
}

export const RampsInstrumentCanvas: React.FC<RampsInstrumentCanvasProps> = ({
  paletteResult,
  notation,
  selectedRampKey,
  onSelectRampKey,
  selectedStep,
  onSelectStep,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeCurveTab, setActiveCurveTab] = useState<'l' | 'c' | 'h'>('l');

  const handleCopy = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1600);
  };

  const rampEntries = Object.entries(paletteResult.ramps);
  const activeRampKey = paletteResult.ramps[selectedRampKey] ? selectedRampKey : rampEntries[0]?.[0] || 'brand';
  const activeRamp: ColorRamp = paletteResult.ramps[activeRampKey] || rampEntries[0]?.[1];

  const stepKeyStr = selectedStep !== null ? (selectedStep.toString() as StepKey) : null;
  const activeStop = stepKeyStr && activeRamp?.steps ? activeRamp.steps[stepKeyStr] : null;

  return (
    <div className="w-full max-w-5xl flex flex-col gap-5">
      {/* 1. Primary Ramp Spectral Stage */}
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xs p-4 sm:p-6 shadow-sm flex flex-col gap-4">
        {/* Stage Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Perceptual OKLCH Spectral Canvas
            </h2>
            <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
              ({STEP_KEYS.length} Steps · Perceptually Calibrated)
            </span>
          </div>

          {/* Ramp Selector Pills */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface-2)] p-0.5 rounded-xs border border-[var(--border-subtle)]">
            {rampEntries.map(([rampKey, ramp]) => {
              const isSelected = rampKey === activeRampKey;
              return (
                <button
                  key={rampKey}
                  type="button"
                  onClick={() => onSelectRampKey(rampKey)}
                  className={`px-2.5 py-1 rounded-xs font-mono text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full border border-white/20"
                    style={{ backgroundColor: ramp.steps['500']?.hex }}
                  />
                  <span>{ramp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Interactive Continuous Color Ramp Strip */}
        <div className="flex flex-col gap-2">
          <div className="h-20 sm:h-24 w-full rounded-xs overflow-hidden flex border border-[var(--border-subtle)] shadow-inner">
            {STEP_KEYS.map((stepKey) => {
              const c = activeRamp.steps[stepKey];
              if (!c) return null;
              const stepNum = parseInt(stepKey, 10);
              const isStopSelected = selectedStep === stepNum;
              const formattedVal = notation === 'oklch' ? c.oklch : notation === 'rgb' ? c.rgb : notation === 'hsl' ? c.hsl : c.hex;

              return (
                <div
                  key={stepKey}
                  onClick={() => onSelectStep(isStopSelected ? null : stepNum)}
                  className={`flex-1 h-full relative cursor-pointer group transition-all flex flex-col justify-between p-1.5 sm:p-2 ${
                    isStopSelected ? 'ring-2 ring-[var(--color-primary)] z-10 scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`${activeRamp.label} ${stepKey}: ${formattedVal} (Click to inspect)`}
                >
                  {/* Step Label */}
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-[9px] sm:text-[10px] font-bold px-1 py-0.2 rounded-xs shadow-xs"
                      style={{
                        backgroundColor: c.contrastWithWhite < 4.5 ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)',
                        color: c.contrastWithWhite < 4.5 ? '#FFFFFF' : '#000000',
                      }}
                    >
                      {stepKey}
                    </span>

                    {stepKey === '500' && !activeRamp.isDerived && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs" title="Brand Anchor Origin" />
                    )}
                  </div>

                  {/* Copy Button on Hover */}
                  <button
                    type="button"
                    onClick={(e) => handleCopy(formattedVal, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-xs bg-black/70 text-white self-center text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copiedHex === formattedVal ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  </button>

                  {/* Contrast ratio micro badge */}
                  <span
                    className="font-mono text-[8px] self-end opacity-70 group-hover:opacity-100"
                    style={{ color: c.contrastWithWhite < 4.5 ? '#FFFFFF' : '#000000' }}
                  >
                    {c.contrastWithWhite.toFixed(1)}:1
                  </span>
                </div>
              );
            })}
          </div>

          {/* Scale Legend */}
          <div className="flex justify-between items-center px-1 text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>50 (Highlight / Tint)</span>
            <span className="hidden sm:inline">500 (Midtone Anchor)</span>
            <span>950 (Deep Shade / Solid)</span>
          </div>
        </div>

        {/* 2. Precision Perceptual OKLCH Curve Graph */}
        <div className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-[var(--color-primary)]" />
              <span className="font-mono text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                OKLCH Perceptual Curve Interpolation
              </span>
            </div>

            <div className="flex items-center gap-1">
              {(['l', 'c', 'h'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveCurveTab(tab)}
                  className={`px-2 py-0.5 rounded-xs font-mono text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                    activeCurveTab === tab
                      ? 'bg-[var(--bg-surface-3)] text-[var(--color-primary)] border border-[var(--border-subtle)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {tab === 'l' ? 'Lightness (L)' : tab === 'c' ? 'Chroma (C)' : 'Hue (H)'}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Perceptual Graph */}
          <div className="h-20 w-full relative">
            <svg viewBox="0 0 500 80" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  {STEP_KEYS.map((stepKey, i) => (
                    <stop
                      key={stepKey}
                      offset={`${(i / (STEP_KEYS.length - 1)) * 100}%`}
                      stopColor={activeRamp.steps[stepKey]?.hex || '#ffffff'}
                    />
                  ))}
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border-subtle)" strokeDasharray="3,3" />
              <line x1="0" y1="40" x2="500" y2="40" stroke="var(--border-subtle)" strokeDasharray="3,3" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="var(--border-subtle)" strokeDasharray="3,3" />

              {/* Plotted Line */}
              {(() => {
                const points = STEP_KEYS.map((stepKey, i) => {
                  const c = activeRamp.steps[stepKey];
                  const x = (i / (STEP_KEYS.length - 1)) * 500;
                  let y = 40;
                  if (c) {
                    if (activeCurveTab === 'l') {
                      y = 10 + (1 - c.lightness) * 60;
                    } else if (activeCurveTab === 'c') {
                      y = 70 - (c.chroma / 0.35) * 60;
                    } else {
                      y = 70 - (c.hue / 360) * 60;
                    }
                  }
                  return { x, y, stepKey, hex: c?.hex || '#ffffff' };
                });

                const d = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x},${p.y}`, '');

                return (
                  <>
                    <path d={d} fill="none" stroke="url(#curveGradient)" strokeWidth="3" strokeLinecap="round" />
                    {points.map((p) => (
                      <circle
                        key={p.stepKey}
                        cx={p.x}
                        cy={p.y}
                        r={selectedStep === parseInt(p.stepKey, 10) ? 5 : 3}
                        fill={p.hex}
                        stroke="var(--bg-canvas)"
                        strokeWidth="1.5"
                        className="cursor-pointer transition-all"
                        onClick={() => onSelectStep(parseInt(p.stepKey, 10))}
                      />
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Selected Stop Inspection Stage (When a Stop is Selected) */}
      {activeStop && (
        <div className="bg-[var(--bg-surface-1)] border border-[var(--color-primary-border)] rounded-xs p-4 flex items-center justify-between flex-wrap gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xs border border-white/20 shadow-sm flex items-center justify-center font-mono text-xs font-bold"
              style={{
                backgroundColor: activeStop.hex,
                color: activeStop.contrastWithWhite < 4.5 ? '#FFFFFF' : '#000000',
              }}
            >
              {stepKeyStr}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                  {activeRamp.label}-{stepKeyStr}
                </span>
                {stepKeyStr === '500' && !activeRamp.isDerived && (
                  <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-mono bg-amber-400/20 text-amber-400 font-bold">
                    Anchor
                  </span>
                )}
              </div>
              <div className="font-mono text-xs text-[var(--text-secondary)] mt-0.5">
                {activeStop.oklch}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Contrast Indicators */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 font-mono text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-2)] px-2.5 py-1 rounded-xs border border-[var(--border-subtle)]">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>On White: {activeStop.contrastWithWhite.toFixed(1)}:1</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-2)] px-2.5 py-1 rounded-xs border border-[var(--border-subtle)]">
                <ShieldCheck size={12} className="text-blue-400" />
                <span>On Black: {activeStop.contrastWithBlack.toFixed(1)}:1</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => handleCopy(activeStop.hex, e)}
              className="px-3 py-1.5 rounded-xs bg-[var(--color-primary)] text-[#090A0C] font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              {copiedHex === activeStop.hex ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedHex === activeStop.hex ? 'Copied' : `Copy ${activeStop.hex}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Complete Sibling Ramps Grid Strip */}
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xs p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            All Generated Scale Systems ({rampEntries.length} Ramps)
          </span>
          <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
            Click any ramp to focus
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {rampEntries.map(([rampKey, ramp]) => {
            const isSelected = rampKey === activeRampKey;
            return (
              <div
                key={rampKey}
                onClick={() => onSelectRampKey(rampKey)}
                className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-xs border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--bg-surface-2)] border-[var(--color-primary-border)]'
                    : 'bg-transparent border-transparent hover:bg-[var(--bg-surface-2)]'
                }`}
              >
                <div className="w-24 flex items-center gap-2 flex-shrink-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: ramp.steps['500']?.hex }}
                  />
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)] truncate">
                    {ramp.label}
                  </span>
                </div>

                <div className="flex-1 h-7 rounded-xs overflow-hidden flex border border-[var(--border-subtle)]">
                  {STEP_KEYS.map((stepKey) => {
                    const c = ramp.steps[stepKey];
                    return (
                      <div
                        key={stepKey}
                        className="flex-1 h-full relative group"
                        style={{ backgroundColor: c?.hex }}
                        title={`${ramp.label}-${stepKey}: ${c?.hex}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
