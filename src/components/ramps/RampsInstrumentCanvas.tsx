import React, { useState } from 'react';
import {
  GeneratedPaletteResult,
  RampsNotation,
  ColorRamp,
  StepKey,
  STEP_KEYS,
} from '../../utils/rampsEngine';
import { Check, Copy, Activity } from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

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
    <div className="w-full h-full flex flex-col">
      {/* Ramp Tabs — top-left of canvas */}
      <div className="flex items-center gap-1 px-4 py-2 bg-[var(--bg-surface-1)] border-b border-[var(--border-subtle)] overflow-x-auto flex-shrink-0">
        {rampEntries.map(([rampKey, ramp]) => {
          const isSelected = rampKey === activeRampKey;
          return (
            <KromaButton
              key={rampKey}
              type="button"
              variant={isSelected ? 'filled' : 'ghost'}
              size="sm"
              onClick={() => onSelectRampKey(rampKey)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-semibold whitespace-nowrap min-h-[30px] ${
                isSelected
                  ? 'shadow-xs'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: ramp.steps['500']?.hex }}
              />
              <span>{ramp.label}</span>
            </KromaButton>
          );
        })}
      </div>

      {/* Canvas Content — scrollable */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
        {/* Primary Color Ramp Strip — Dominant Visual */}
        <div className="flex flex-col gap-1">
          <div className="h-28 sm:h-36 w-full rounded-sm overflow-hidden flex shadow-inner">
            {STEP_KEYS.map((stepKey) => {
              const c = activeRamp.steps[stepKey];
              if (!c) return null;
              const stepNum = parseInt(stepKey, 10);
              const isStopSelected = selectedStep === stepNum;
              const formattedVal = notation === 'oklch' ? c.oklch : notation === 'rgb' ? c.rgb : notation === 'hsl' ? c.hsl : c.hex;

              return (
                <div
                  key={stepKey}
                  className={`flex-1 h-full relative group transition-all flex flex-col justify-between p-2 sm:p-2.5 ${
                    isStopSelected ? 'ring-2 ring-[var(--color-primary)] z-10 scale-[1.02] shadow-lg' : 'hover:brightness-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  <button
                    type="button"
                    onClick={() => onSelectStep(isStopSelected ? null : stepNum)}
                    aria-pressed={isStopSelected}
                    aria-label={`Select step ${stepKey}: ${formattedVal}`}
                    className="font-mono text-xs font-bold px-1 py-0.5 rounded-xs w-fit border-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-white"
                    style={{
                      backgroundColor: c.contrastWithWhite < 4.5 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)',
                      color: c.contrastWithWhite < 4.5 ? '#FFFFFF' : '#000000',
                    }}
                  >
                    {stepKey}
                  </button>

                  <KromaButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleCopy(formattedVal, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-xs bg-black/60 text-white self-center text-xs font-mono flex items-center gap-1 w-6 h-6 min-h-[24px]"
                    title="Copy value"
                    aria-label="Copy value"
                  >
                    {copiedHex === formattedVal ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  </KromaButton>

                  <span
                    className="font-mono text-xs self-end opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: c.contrastWithWhite < 4.5 ? '#FFFFFF' : '#000000' }}
                  >
                    {c.contrastWithWhite.toFixed(1)}:1
                  </span>
                </div>
              );
            })}
          </div>

          {/* Scale Legend */}
          <div className="flex justify-between items-center px-1 text-xs font-mono text-[var(--text-tertiary)]">
            <span>50 · Tint</span>
            <span className="hidden sm:inline">500 · Anchor</span>
            <span>950 · Shade</span>
          </div>
        </div>

        {/* Selected Stop Popover */}
        {activeStop && (
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-sm bg-[var(--bg-surface-1)] border border-[var(--color-primary-border)] min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xs flex items-center justify-center font-mono text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor: activeStop.hex,
                  color: activeStop.contrastWithWhite < 4.5 ? '#FFFFFF' : '#000000',
                }}
              >
                {stepKeyStr}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-xs text-[var(--text-primary)] whitespace-nowrap">
                    {activeRamp.label}-{stepKeyStr}
                  </span>
                  <span className="font-mono text-xs text-[var(--text-tertiary)] truncate">{activeStop.oklch}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 font-mono text-xs text-[var(--text-secondary)] flex-wrap">
                  <span>W:{activeStop.contrastWithWhite.toFixed(1)}</span>
                  <span>B:{activeStop.contrastWithBlack.toFixed(1)}</span>
                  <span>L:{(activeStop.lightness * 100).toFixed(0)}%</span>
                  <span>C:{activeStop.chroma.toFixed(3)}</span>
                  <span>H:{activeStop.hue.toFixed(0)}°</span>
                </div>
              </div>
            </div>
            <KromaButton
              type="button"
              variant="filled"
              size="sm"
              onClick={(e) => handleCopy(activeStop.hex, e)}
              className="min-h-[28px] px-2 py-1 text-xs flex-shrink-0"
              iconLeft={copiedHex === activeStop.hex ? <Check size={11} /> : <Copy size={11} />}
            >
              <span>{copiedHex === activeStop.hex ? 'Copied' : activeStop.hex}</span>
            </KromaButton>
          </div>
        )}

        {/* OKLCH Perceptual Curve */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-[var(--color-primary)]" />
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                OKLCH Perceptual Curve
              </span>
            </div>
            <div className="flex items-center gap-1">
              {(['l', 'c', 'h'] as const).map((tab) => (
                <KromaButton
                  key={tab}
                  type="button"
                  variant={activeCurveTab === tab ? 'filled' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveCurveTab(tab)}
                  className={`px-2 py-0.5 rounded-xs font-mono text-xs font-semibold min-h-[24px] ${
                    activeCurveTab === tab
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {tab === 'l' ? 'Lightness' : tab === 'c' ? 'Chroma' : 'Hue'}
                </KromaButton>
              ))}
            </div>
          </div>

          <div className="h-16 w-full">
            <svg viewBox="0 0 500 64" className="w-full h-full overflow-visible" preserveAspectRatio="none">
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

              <line x1="0" y1="16" x2="500" y2="16" stroke="var(--border-subtle)" strokeDasharray="3,3" />
              <line x1="0" y1="32" x2="500" y2="32" stroke="var(--border-subtle)" strokeDasharray="3,3" />
              <line x1="0" y1="48" x2="500" y2="48" stroke="var(--border-subtle)" strokeDasharray="3,3" />

              {(() => {
                const points = STEP_KEYS.map((stepKey, i) => {
                  const c = activeRamp.steps[stepKey];
                  const x = (i / (STEP_KEYS.length - 1)) * 500;
                  let y = 32;
                  if (c) {
                    if (activeCurveTab === 'l') y = 8 + (1 - c.lightness) * 48;
                    else if (activeCurveTab === 'c') y = 56 - (c.chroma / 0.35) * 48;
                    else y = 56 - (c.hue / 360) * 48;
                  }
                  return { x, y, stepKey, hex: c?.hex || '#ffffff' };
                });

                const d = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x},${p.y}`, '');

                return (
                  <>
                    <path d={d} fill="none" stroke="url(#curveGradient)" strokeWidth="2.5" strokeLinecap="round" />
                    {points.map((p) => {
                      const isSelected = selectedStep === parseInt(p.stepKey, 10);
                      return (
                        <circle
                          key={p.stepKey}
                          cx={p.x}
                          cy={p.y}
                          r={isSelected ? 4.5 : 2.5}
                          fill={p.hex}
                          stroke="var(--bg-canvas)"
                          strokeWidth="1.5"
                          role="button"
                          tabIndex={0}
                          aria-pressed={isSelected}
                          aria-label={`Select step ${p.stepKey} on lightness curve: ${p.hex}`}
                          className="cursor-pointer focus-visible:outline-none"
                          onClick={() => onSelectStep(parseInt(p.stepKey, 10))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectStep(parseInt(p.stepKey, 10));
                            }
                          }}
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Sibling Ramps Grid — compact */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              All Ramps ({rampEntries.length})
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {rampEntries.map(([rampKey, ramp]) => {
              const isSelected = rampKey === activeRampKey;
              return (
                <button
                  type="button"
                  key={rampKey}
                  onClick={() => onSelectRampKey(rampKey)}
                  aria-pressed={isSelected}
                  aria-label={`Select ramp ${ramp.label}`}
                  className={`w-full flex items-center gap-2 cursor-pointer group transition-all rounded-xs p-1 border-0 bg-transparent text-left focus-visible:outline-2 focus-visible:outline-primary-500 ${
                    isSelected ? 'bg-[var(--bg-surface-1)]' : 'hover:bg-[var(--bg-surface-1)]/50'
                  }`}
                >
                  <span className={`font-mono text-xs w-16 truncate ${isSelected ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'}`}>
                    {ramp.label}
                  </span>
                  <div className="flex-1 h-5 rounded-xs overflow-hidden flex pointer-events-none">
                    {STEP_KEYS.map((stepKey) => {
                      const c = ramp.steps[stepKey];
                      return (
                        <div
                          key={stepKey}
                          className="flex-1 h-full"
                          style={{ backgroundColor: c?.hex }}
                          title={`${ramp.label}-${stepKey}: ${c?.hex}`}
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
