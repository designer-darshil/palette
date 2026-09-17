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
    <section id="color-ramps" className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Layers size={18} className="text-[var(--text-secondary)]" />
            <span>OKLCH Color Ramps (50—950)</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            11 perceptually uniform lightness steps per scale with continuous chroma compensation. Click any swatch to copy value.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-tertiary)]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span>Active Notation: <strong className="text-[var(--text-primary)] uppercase">{notation}</strong></span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {rampEntries.map(([rampKey, ramp]) => {
          const isExcluded = excludedRamps.includes(rampKey);

          return (
            <div
              key={rampKey}
              className={`bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 transition-all ${
                isExcluded ? 'opacity-40 grayscale' : 'hover:border-[var(--border-medium)]'
              }`}
            >
              {/* Ramp Header */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full border border-black/10"
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
                    Hue: {ramp.baseHue.toFixed(0)}° · C: {ramp.baseChroma.toFixed(2)}
                  </span>
                  {onToggleExcludeRamp && (
                    <button
                      type="button"
                      onClick={() => onToggleExcludeRamp(rampKey)}
                      className="text-[11px] p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                      title={isExcluded ? 'Include ramp in export' : 'Exclude ramp from export'}
                    >
                      <EyeOff size={13} className={isExcluded ? 'text-amber-400' : ''} />
                    </button>
                  )}
                </div>
              </div>

              {/* Seamless Ramp Bar Preview */}
              <div className="w-full h-3.5 rounded-md overflow-hidden flex shadow-inner mb-3 border border-black/10">
                {STEP_KEYS.map((step) => (
                  <div
                    key={step}
                    className="flex-1 h-full transition-transform hover:scale-y-125 origin-bottom"
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
                      className="group relative flex flex-col rounded-lg overflow-hidden border border-[var(--border-subtle)] text-left hover:border-[var(--border-strong)] hover:shadow-md transition-all active:scale-[0.98]"
                      title={`Click to copy: ${displayValue}`}
                    >
                      {/* Swatch Area */}
                      <div
                        className="h-14 sm:h-16 w-full p-2 flex flex-col justify-between transition-colors relative"
                        style={{ backgroundColor: stepData.hex }}
                      >
                        {/* Step Label */}
                        <span
                          className="font-mono text-[10px] font-bold tracking-tight"
                          style={{ color: stepData.textContrast }}
                        >
                          {step}
                        </span>

                        {/* Hover Copy Indicator */}
                        <div
                          className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]"
                          style={{ color: '#FFFFFF' }}
                        >
                          {isCopied ? (
                            <div className="flex items-center gap-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400">
                              <Check size={11} />
                              <span>Copied</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                              <Copy size={11} />
                              <span>Copy</span>
                            </div>
                          )}
                        </div>

                        {/* Contrast Indicator */}
                        <span
                          className="text-[9px] font-mono opacity-80"
                          style={{ color: stepData.textContrast }}
                        >
                          {stepData.textContrast === '#FFFFFF' ? 'Dark' : 'Light'}
                        </span>
                      </div>

                      {/* Step Code Metadata */}
                      <div className="p-1.5 bg-[var(--bg-surface-2)] flex flex-col gap-0.5">
                        <span className="font-mono text-[10px] font-bold text-[var(--text-primary)] truncate">
                          {stepData.hex}
                        </span>
                        <span className="font-mono text-[9px] text-[var(--text-tertiary)] truncate">
                          L: {stepData.lightness.toFixed(2)}
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
