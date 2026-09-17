import React, { useState } from 'react';
import {
  RampsConfig,
  RampsScope,
  RampsScheme,
  RampsWcag,
  RampsNotation,
  RampsVividness,
  normalizeHex,
  isValidHex,
} from '../../utils/rampsEngine';
import {
  Sparkles,
  RotateCcw,
  Share2,
  Check,
  Pin,
  PinOff,
  Sliders,
  ShieldCheck,
  Code2,
  Palette,
  Eye,
  Layers,
} from 'lucide-react';

interface RampsGeneratorControlsProps {
  config: RampsConfig;
  onChange: (newConfig: Partial<RampsConfig>) => void;
  onRandomize: () => void;
  onReset: () => void;
  onShareUrl: () => void;
  hasCopiedShare: boolean;
}

export const RampsGeneratorControls: React.FC<RampsGeneratorControlsProps> = ({
  config,
  onChange,
  onRandomize,
  onReset,
  onShareUrl,
  hasCopiedShare,
}) => {
  const [brandInput, setBrandInput] = useState(config.brand);
  const [accentInput, setAccentInput] = useState(config.accent || '');
  const [accent2Input, setAccent2Input] = useState(config.accent2 || '');

  // Keep local input in sync if config changes externally (e.g. randomize/URL)
  React.useEffect(() => {
    setBrandInput(config.brand);
  }, [config.brand]);

  React.useEffect(() => {
    setAccentInput(config.accent || '');
  }, [config.accent]);

  React.useEffect(() => {
    setAccent2Input(config.accent2 || '');
  }, [config.accent2]);

  const handleBrandChange = (raw: string) => {
    const clean = normalizeHex(raw);
    setBrandInput(clean);
    if (isValidHex(clean)) {
      onChange({ brand: clean });
    }
  };

  const handleAccentChange = (raw: string) => {
    const clean = normalizeHex(raw);
    setAccentInput(clean);
    if (isValidHex(clean)) {
      onChange({ accent: clean });
    } else if (clean === '') {
      onChange({ accent: null });
    }
  };

  const handleAccent2Change = (raw: string) => {
    const clean = normalizeHex(raw);
    setAccent2Input(clean);
    if (isValidHex(clean)) {
      onChange({ accent2: clean });
    } else if (clean === '') {
      onChange({ accent2: null });
    }
  };

  const schemes: { id: RampsScheme; label: string; desc: string }[] = [
    { id: 'complementary', label: 'Complementary', desc: '+180° opposite hue angle' },
    { id: 'analogous', label: 'Analogous', desc: '±35° neighboring hues' },
    { id: 'triadic', label: 'Triadic', desc: '120° equidistant triangle' },
    { id: 'split', label: 'Split-Comp', desc: '150° / 210° split complementary' },
    { id: 'monochromatic', label: 'Monochromatic', desc: 'Single hue, modulated chroma' },
  ];

  return (
    <section id="ramps-generator" className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Sliders size={18} className="text-[var(--text-secondary)]" />
            <span>Interactive Color &amp; Token Generator</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Configure your brand inputs. Changes update the OKLCH mathematical scales, semantic tokens, and URL instantly.
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-all"
            title="Generate random harmonious brand color"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Randomize</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-all"
            title="Reset to default brand parameters (#3d7dff)"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onShareUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--text-primary)] text-[var(--text-inverse)] text-xs font-mono font-medium hover:opacity-90 transition-all shadow-xs"
            title="Copy shareable permalink with current configuration"
          >
            {hasCopiedShare ? (
              <>
                <Check size={13} />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>Share URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-5">
        {/* Brand Color Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
            <span>1. Brand Color (b)</span>
            <span className="text-[10px] font-normal text-[var(--text-tertiary)]">Required 6-hex</span>
          </label>
          <div className="flex items-center gap-2">
            {/* Color Swatch Picker */}
            <label className="relative cursor-pointer flex-shrink-0">
              <input
                type="color"
                value={`#${config.brand}`}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="sr-only"
              />
              <div
                className="w-10 h-10 rounded-md border border-[var(--border-strong)] shadow-inner transition-transform active:scale-95"
                style={{ backgroundColor: `#${config.brand}` }}
                title="Click to open system color picker"
              />
            </label>

            {/* Hex Input */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-tertiary)] font-bold">
                #
              </span>
              <input
                type="text"
                maxLength={7}
                value={brandInput}
                onChange={(e) => handleBrandChange(e.target.value)}
                placeholder="3d7dff"
                className="w-full pl-7 pr-3 py-2 bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-md font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--ring-focus)] focus:ring-1 focus:ring-[var(--ring-focus)]"
              />
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] flex items-center justify-between">
            <span>Anchor for primary OKLCH ramp</span>
            <span className="font-mono text-[10px] uppercase font-semibold">#{config.brand}</span>
          </div>
        </div>

        {/* Secondary Accent Control (Auto / Pinned) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
            <span>2. Secondary Accent (a)</span>
            {config.accent ? (
              <span className="font-mono text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Pin size={10} /> Pinned
              </span>
            ) : (
              <span className="font-mono text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-surface-2)] px-1.5 py-0.5 rounded">
                Auto-Derived
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <label className="relative cursor-pointer flex-shrink-0">
              <input
                type="color"
                value={config.accent ? `#${config.accent}` : '#f4d59b'}
                onChange={(e) => handleAccentChange(e.target.value)}
                className="sr-only"
              />
              <div
                className="w-10 h-10 rounded-md border border-[var(--border-strong)] shadow-inner transition-transform active:scale-95"
                style={{ backgroundColor: config.accent ? `#${config.accent}` : 'var(--accent, #f4d59b)' }}
                title="Pick pinned secondary accent"
              />
            </label>

            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-tertiary)] font-bold">
                #
              </span>
              <input
                type="text"
                maxLength={7}
                value={accentInput}
                onChange={(e) => handleAccentChange(e.target.value)}
                placeholder="Auto (e.g. b28200)"
                className="w-full pl-7 pr-8 py-2 bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-md font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--ring-focus)] focus:ring-1 focus:ring-[var(--ring-focus)]"
              />
              {config.accent && (
                <button
                  type="button"
                  onClick={() => handleAccentChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  title="Unpin and return to auto-derivation"
                >
                  <PinOff size={13} />
                </button>
              )}
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] flex items-center justify-between">
            <span>Derived via {config.scheme} scheme</span>
            <button
              type="button"
              onClick={() => handleAccentChange(config.accent ? '' : 'b28200')}
              className="text-[10px] font-mono underline hover:text-[var(--text-primary)]"
            >
              {config.accent ? 'Reset to Auto' : 'Pin Custom'}
            </button>
          </div>
        </div>

        {/* Tertiary Accent Control (Auto / Pinned) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
            <span>3. Tertiary Accent (a2)</span>
            {config.accent2 ? (
              <span className="font-mono text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Pin size={10} /> Pinned
              </span>
            ) : (
              <span className="font-mono text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-surface-2)] px-1.5 py-0.5 rounded">
                Auto-Derived
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <label className="relative cursor-pointer flex-shrink-0">
              <input
                type="color"
                value={config.accent2 ? `#${config.accent2}` : '#0099c5'}
                onChange={(e) => handleAccent2Change(e.target.value)}
                className="sr-only"
              />
              <div
                className="w-10 h-10 rounded-md border border-[var(--border-strong)] shadow-inner transition-transform active:scale-95"
                style={{ backgroundColor: config.accent2 ? `#${config.accent2}` : 'var(--accent-2, #0099c5)' }}
                title="Pick pinned tertiary accent"
              />
            </label>

            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-tertiary)] font-bold">
                #
              </span>
              <input
                type="text"
                maxLength={7}
                value={accent2Input}
                onChange={(e) => handleAccent2Change(e.target.value)}
                placeholder="Auto (e.g. 0099c5)"
                className="w-full pl-7 pr-8 py-2 bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-md font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--ring-focus)] focus:ring-1 focus:ring-[var(--ring-focus)]"
              />
              {config.accent2 && (
                <button
                  type="button"
                  onClick={() => handleAccent2Change('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  title="Unpin and return to auto-derivation"
                >
                  <PinOff size={13} />
                </button>
              )}
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] flex items-center justify-between">
            <span>Secondary harmony offset</span>
            <button
              type="button"
              onClick={() => handleAccent2Change(config.accent2 ? '' : '0099c5')}
              className="text-[10px] font-mono underline hover:text-[var(--text-primary)]"
            >
              {config.accent2 ? 'Reset to Auto' : 'Pin Custom'}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Controls: Scheme, Scope, WCAG Level, Notation, Vividness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-5 mt-5 border-t border-[var(--border-subtle)]">
        {/* Color Scheme Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)] font-semibold flex items-center gap-1">
            <Palette size={13} className="text-[var(--text-tertiary)]" />
            <span>Scheme (s)</span>
          </label>
          <select
            value={config.scheme}
            onChange={(e) => onChange({ scheme: e.target.value as RampsScheme })}
            className="w-full px-2.5 py-1.5 bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--ring-focus)] cursor-pointer"
          >
            {schemes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {schemes.find((s) => s.id === config.scheme)?.desc}
          </span>
        </div>

        {/* Scope Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)] font-semibold flex items-center gap-1">
            <Layers size={13} className="text-[var(--text-tertiary)]" />
            <span>Scope (m)</span>
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[var(--bg-surface-2)] p-0.5 rounded border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => onChange({ scope: 'full' })}
              className={`py-1 rounded text-xs font-mono font-medium transition-all ${
                config.scope === 'full'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Full (8)
            </button>
            <button
              type="button"
              onClick={() => onChange({ scope: 'basic' })}
              className={`py-1 rounded text-xs font-mono font-medium transition-all ${
                config.scope === 'basic'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Basic (2)
            </button>
          </div>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {config.scope === 'full' ? 'Brand + accents + neutral + status' : 'Brand + neutral tokens only'}
          </span>
        </div>

        {/* WCAG Target Contrast Level */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)] font-semibold flex items-center gap-1">
            <ShieldCheck size={13} className="text-[var(--text-tertiary)]" />
            <span>WCAG Target (c)</span>
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[var(--bg-surface-2)] p-0.5 rounded border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => onChange({ wcag: 'AA' })}
              className={`py-1 rounded text-xs font-mono font-medium transition-all ${
                config.wcag === 'AA'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              AA (4.5:1)
            </button>
            <button
              type="button"
              onClick={() => onChange({ wcag: 'AAA' })}
              className={`py-1 rounded text-xs font-mono font-medium transition-all ${
                config.wcag === 'AAA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              AAA (7.0:1)
            </button>
          </div>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {config.wcag === 'AAA' ? 'Strict high-contrast token steps' : 'Standard Web Accessibility'}
          </span>
        </div>

        {/* Notation Format */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)] font-semibold flex items-center gap-1">
            <Code2 size={13} className="text-[var(--text-tertiary)]" />
            <span>Notation (f)</span>
          </label>
          <select
            value={config.notation}
            onChange={(e) => onChange({ notation: e.target.value as RampsNotation })}
            className="w-full px-2.5 py-1.5 bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--ring-focus)] cursor-pointer"
          >
            <option value="oklch">OKLCH (Perceptual)</option>
            <option value="hex">HEX (Hexadecimal)</option>
            <option value="rgb">RGB (sRGB triplet)</option>
            <option value="hsl">HSL (Hue, Sat, Light)</option>
          </select>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            Color representation in tables &amp; JSON
          </span>
        </div>

        {/* Vividness Mode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)] font-semibold flex items-center gap-1">
            <Eye size={13} className="text-[var(--text-tertiary)]" />
            <span>Vividness (v)</span>
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[var(--bg-surface-2)] p-0.5 rounded border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => onChange({ vividness: 'natural' })}
              className={`py-1 rounded text-xs font-mono font-medium transition-all ${
                config.vividness === 'natural'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Natural
            </button>
            <button
              type="button"
              onClick={() => onChange({ vividness: 'bold' })}
              className={`py-1 rounded text-xs font-mono font-medium transition-all ${
                config.vividness === 'bold'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Bold +25%
            </button>
          </div>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {config.vividness === 'bold' ? 'Enhanced chroma saturation' : 'Perceptual natural chroma'}
          </span>
        </div>
      </div>
    </section>
  );
};
