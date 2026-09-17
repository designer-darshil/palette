import React, { useState } from 'react';
import { ColorRamp, STEP_KEYS, StepKey, RampsNotation } from '../../utils/rampsEngine';
import { Copy, Check, EyeOff, Layers, Info } from 'lucide-react';

interface RampsPaletteGridProps {
  ramps: Record<string, ColorRamp>;
  notation: RampsNotation;
  onToggleExcludeRamp?: (rampName: string) => void;
  excludedRamps?: string[];
}

export const RampsPaletteGrid: React.FC<RampsPaletteGridProps> = ({
  ramps,
  notation,
  onToggleExcludeRamp,
  excludedRamps = [],
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const rampEntries = Object.entries(ramps);

  return (
    <section id="color-ramps" className="w-full flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Layers size={18} className="text-[var(--text-secondary)]" />
            <span>Perceptual OKLCH Scales (50—950)</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            11 lightness steps per scale with continuous chroma compensation. Click any swatch to copy value.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-tertiary)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>Notation: <strong className="text-[var(--text-primary)] uppercase">{notation}</strong></span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {rampEntries.map(([rampKey, ramp]) => {
          const isExcluded = excludedRamps.includes(rampKey);

          return (
            <div
              key={rampKey}
              className={`bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 transition-all ${
                isExcluded ? 'opacity-35 grayscale' : 'hover:border-[var(--border-medium)]'
              }`}
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              {/* Ramp Header */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-xs border border-black/15 shadow-2xs"
                    style={{ backgroundColor: ramp.steps['500'].hex }}
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] font-mono flex items-center gap-2">
                      <span className="uppercase">{rampKey}</span>
                      <span className="text-[11px] font-sans font-normal text-[var(--text-tertiary)]">
                        — {ramp.label}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-tertiary)]">
                  <span className="hidden sm:inline text-[11px]">
                    H: {ramp.baseHue.toFixed(0)}° · C: {ramp.baseChroma.toFixed(2)}
                  </span>
                  {onToggleExcludeRamp && (
                    <button
                      type="button"
                      onClick={() => onToggleExcludeRamp(rampKey)}
                      className="text-[11px] p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      title={isExcluded ? 'Include ramp in export' : 'Exclude ramp from export'}
                    >
                      <EyeOff size={13} className={isExcluded ? 'text-[var(--accent-gold)]' : ''} />
                    </button>
                  )}
                </div>
              </div>

              {/* Continuous Gradient Preview */}
              <div className="w-full h-3 rounded-xs overflow-hidden flex shadow-inner mb-3 border border-black/10">
                {STEP_KEYS.map((step) => (
                  <div
                    key={step}
                    className="flex-1 h-full"
                    style={{ backgroundColor: ramp.steps[step].hex }}
                    title={`${rampKey}-${step}: ${ramp.steps[step].hex}`}
                  />
                ))}
              </div>

              {/* 11 Steps Grid */}
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 lg:grid-cols-11 gap-1.5 sm:gap-2">
                {STEP_KEYS.map((step) => {
                  const stepData = ramp.steps[step];
                  const copyKey = `${rampKey}-${step}`;
                  const isCopied = copiedKey === copyKey;

                  let displayValue = stepData.hex;
                  if (notation === 'oklch') displayValue = stepData.oklch;
                  else if (notation === 'rgb') displayValue = stepData.rgb;
                  else if (notation === 'hsl') displayValue = stepData.hsl;

                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleCopy(copyKey, displayValue)}
                      className="group relative flex flex-col rounded-xs overflow-hidden border border-[var(--border-subtle)] text-left hover:border-[var(--border-strong)] transition-all cursor-pointer"
                      style={{ borderRadius: 'var(--radius-xs)' }}
                      title={`Click to copy: ${displayValue}`}
                    >
                      {/* Swatch Area */}
                      <div
                        className="h-12 sm:h-14 w-full p-1.5 flex flex-col justify-between transition-colors relative"
                        style={{ backgroundColor: stepData.hex }}
                      >
                        {/* Step Label */}
                        <span
                          className="font-mono text-[9px] font-bold tracking-tight"
                          style={{ color: stepData.textContrast }}
                        >
                          {step}
                        </span>

                        {/* Hover / Copied Indicator */}
                        <div
                          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity backdrop-blur-[1px] ${
                            isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          style={{ color: '#FFFFFF' }}
                        >
                          {isCopied ? (
                            <Check size={13} className="text-emerald-400 font-bold" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </div>
                      </div>

                      {/* Info Footer */}
                      <div className="px-1.5 py-1 bg-[var(--bg-surface-2)] flex flex-col gap-0.5 border-t border-[var(--border-subtle)]">
                        <span className="font-mono text-[9px] font-bold text-[var(--text-primary)] truncate uppercase">
                          {stepData.hex}
                        </span>
                        <span className="font-mono text-[8px] text-[var(--text-tertiary)] truncate">
                          L {(stepData.lightness * 100).toFixed(0)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
