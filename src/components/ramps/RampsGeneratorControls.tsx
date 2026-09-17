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
import { ColorPickerModal } from '../ColorPickerModal';
import { ColorSwatchPicker } from '../common/ColorSwatchPicker';

interface RampsGeneratorControlsProps {
  config: RampsConfig;
  onChange: (newConfig: Partial<RampsConfig>) => void;
  onRandomize?: () => void;
  onReset?: () => void;
  onShareUrl?: () => void;
  hasCopiedShare?: boolean;
}

export const RampsGeneratorControls: React.FC<RampsGeneratorControlsProps> = ({
  config,
  onChange,
  onRandomize,
  onReset,
  onShareUrl,
  hasCopiedShare = false,
}) => {
  const [brandInput, setBrandInput] = useState(config.brand);
  const [accentInput, setAccentInput] = useState(config.accent || '');
  const [accent2Input, setAccent2Input] = useState(config.accent2 || '');

  // Picker modal state
  const [pickerTarget, setPickerTarget] = useState<'brand' | 'accent' | 'accent2' | null>(null);

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

  const getActivePickerColor = () => {
    if (pickerTarget === 'brand') return `#${config.brand}`;
    if (pickerTarget === 'accent') return config.accent ? `#${config.accent}` : '#F4D59B';
    if (pickerTarget === 'accent2') return config.accent2 ? `#${config.accent2}` : '#0099C5';
    return '#3D7DFF';
  };

  const handleApplyColor = (hex: string) => {
    const clean = normalizeHex(hex);
    if (pickerTarget === 'brand') {
      handleBrandChange(clean);
    } else if (pickerTarget === 'accent') {
      handleAccentChange(clean);
    } else if (pickerTarget === 'accent2') {
      handleAccent2Change(clean);
    }
    setPickerTarget(null);
  };

  return (
    <section
      id="ramps-generator"
      className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-6 shadow-sm"
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Sliders size={18} className="text-[var(--text-secondary)]" />
            <span>Interactive Color &amp; Token Parameters</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Configure brand anchors and generation modes. Scales, tokens, and shareable permalinks update instantly.
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {onRandomize && (
            <button
              type="button"
              onClick={onRandomize}
              className="btn-studio-primary"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              title="Generate random harmonious brand color"
            >
              <Sparkles size={13} />
              <span>Randomize</span>
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              title="Reset to default brand parameters (#3d7dff)"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          {onShareUrl && (
            <button
              type="button"
              onClick={onShareUrl}
              className="btn-studio-primary"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
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
          )}
        </div>
      </div>

      {/* Primary Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-5">
        {/* Brand Color Input */}
        <div className="flex flex-col gap-2 p-3 sm:p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
            <span>1. Brand Color Anchor</span>
            <span className="text-[10px] font-normal text-[var(--text-tertiary)] font-mono">#{config.brand.toUpperCase()}</span>
          </label>
          <div className="flex items-center gap-2.5">
            {/* Color Swatch Picker */}
            <ColorSwatchPicker
              value={`#${config.brand}`}
              onChange={(hex) => handleBrandChange(hex)}
              showLabel={false}
              size="lg"
            />

            {/* Hex Input */}
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-tertiary)] font-bold">
                #
              </span>
              <input
                type="text"
                maxLength={7}
                value={brandInput.toUpperCase()}
                onChange={(e) => handleBrandChange(e.target.value)}
                placeholder="3D7DFF"
                className="w-full pl-7 pr-3 py-2 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xs font-mono text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
          <div className="text-[10px] font-mono text-[var(--text-tertiary)] flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
            <span>OKLCH scale root anchor</span>
            <span style={{ color: 'var(--color-primary-text)' }} className="font-semibold">Required</span>
          </div>
        </div>

        {/* Secondary Accent Control (Auto / Pinned) */}
        <div className="flex flex-col gap-2 p-3 sm:p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
            <span>2. Secondary Accent</span>
            {config.accent ? (
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded-xs flex items-center gap-1 font-semibold"
                style={{
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-primary-border)',
                }}
              >
                <Pin size={10} /> Pinned
              </span>
            ) : (
              <span className="font-mono text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-surface-3)] px-1.5 py-0.5 rounded-xs">
                Auto-Harmonized
              </span>
            )}
          </label>
          <div className="flex items-center gap-2.5">
            <ColorSwatchPicker
              value={config.accent ? `#${config.accent}` : '#F4D59B'}
              onChange={(hex) => handleAccentChange(hex)}
              showLabel={false}
              size="lg"
            />

            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-tertiary)] font-bold">
                #
              </span>
              <input
                type="text"
                maxLength={7}
                value={accentInput.toUpperCase()}
                onChange={(e) => handleAccentChange(e.target.value)}
                placeholder="Auto (Harmonized)"
                className="w-full pl-7 pr-8 py-2 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xs font-mono text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
              {config.accent && (
                <button
                  type="button"
                  onClick={() => handleAccentChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                  title="Unpin and return to auto-derivation"
                >
                  <PinOff size={13} />
                </button>
              )}
            </div>
          </div>
          <div className="text-[10px] font-mono text-[var(--text-tertiary)] flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
            <span>Derived from {config.scheme}</span>
            <button
              type="button"
              onClick={() => handleAccentChange(config.accent ? '' : 'B28200')}
              className="underline hover:text-[var(--text-primary)] cursor-pointer"
            >
              {config.accent ? 'Reset to Auto' : 'Pin Custom'}
            </button>
          </div>
        </div>

        {/* Tertiary Accent Control (Auto / Pinned) */}
        <div className="flex flex-col gap-2 p-3 sm:p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
            <span>3. Tertiary Accent</span>
            {config.accent2 ? (
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded-xs flex items-center gap-1 font-semibold"
                style={{
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-primary-border)',
                }}
              >
                <Pin size={10} /> Pinned
              </span>
            ) : (
              <span className="font-mono text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-surface-3)] px-1.5 py-0.5 rounded-xs">
                Auto-Harmonized
              </span>
            )}
          </label>
          <div className="flex items-center gap-2.5">
            <ColorSwatchPicker
              value={config.accent2 ? `#${config.accent2}` : '#0099C5'}
              onChange={(hex) => handleAccent2Change(hex)}
              showLabel={false}
              size="lg"
            />

            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-tertiary)] font-bold">
                #
              </span>
              <input
                type="text"
                maxLength={7}
                value={accent2Input.toUpperCase()}
                onChange={(e) => handleAccent2Change(e.target.value)}
                placeholder="Auto (Harmonized)"
                className="w-full pl-7 pr-8 py-2 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xs font-mono text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
              {config.accent2 && (
                <button
                  type="button"
                  onClick={() => handleAccent2Change('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                  title="Unpin and return to auto-derivation"
                >
                  <PinOff size={13} />
                </button>
              )}
            </div>
          </div>
          <div className="text-[10px] font-mono text-[var(--text-tertiary)] flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
            <span>Secondary harmony anchor</span>
            <button
              type="button"
              onClick={() => handleAccent2Change(config.accent2 ? '' : '0099C5')}
              className="underline hover:text-[var(--text-primary)] cursor-pointer"
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
            <span>Harmonic Scheme</span>
          </label>
          <select
            value={config.scheme}
            onChange={(e) => onChange({ scheme: e.target.value as RampsScheme })}
            className="w-full px-2.5 py-1.5 bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
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
            <span>Palette Scope</span>
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[var(--bg-surface-2)] p-0.5 rounded-xs border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => onChange({ scope: 'full' })}
              className={`py-1 rounded-xs text-xs font-mono font-medium transition-all cursor-pointer ${
                config.scope === 'full'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Full (8)
            </button>
            <button
              type="button"
              onClick={() => onChange({ scope: 'basic' })}
              className={`py-1 rounded-xs text-xs font-mono font-medium transition-all cursor-pointer ${
                config.scope === 'basic'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold shadow-2xs'
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
            <span>WCAG Target</span>
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[var(--bg-surface-2)] p-0.5 rounded-xs border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => onChange({ wcag: 'AA' })}
              className={`py-1 rounded-xs text-xs font-mono font-medium transition-all cursor-pointer ${
                config.wcag === 'AA'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              AA (4.5:1)
            </button>
            <button
              type="button"
              onClick={() => onChange({ wcag: 'AAA' })}
              className={`py-1 rounded-xs text-xs font-mono font-medium transition-all cursor-pointer ${
                config.wcag === 'AAA'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
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
            <span>Output Notation</span>
          </label>
          <select
            value={config.notation}
            onChange={(e) => onChange({ notation: e.target.value as RampsNotation })}
            className="w-full px-2.5 py-1.5 bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
          >
            <option value="oklch">OKLCH (Perceptual)</option>
            <option value="hex">HEX (Hexadecimal)</option>
            <option value="rgb">RGB (sRGB triplet)</option>
            <option value="hsl">HSL (Hue, Sat, Light)</option>
          </select>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            Format used across tables and exports
          </span>
        </div>

        {/* Vividness Mode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)] font-semibold flex items-center gap-1">
            <Eye size={13} className="text-[var(--text-tertiary)]" />
            <span>Chroma Vividness</span>
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[var(--bg-surface-2)] p-0.5 rounded-xs border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => onChange({ vividness: 'natural' })}
              className={`py-1 rounded-xs text-xs font-mono font-medium transition-all cursor-pointer ${
                config.vividness === 'natural'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Natural
            </button>
            <button
              type="button"
              onClick={() => onChange({ vividness: 'bold' })}
              className={`py-1 rounded-xs text-xs font-mono font-medium transition-all cursor-pointer ${
                config.vividness === 'bold'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold shadow-2xs'
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

      {/* Color Picker Modal */}
      <ColorPickerModal
        isOpen={pickerTarget !== null}
        initialColor={getActivePickerColor()}
        title={`SELECT ${pickerTarget?.toUpperCase()} COLOR`}
        onApply={handleApplyColor}
        onClose={() => setPickerTarget(null)}
      />
    </section>
  );
};
