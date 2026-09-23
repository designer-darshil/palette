import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Pipette,
  Copy,
  Check,
  ClipboardPaste,
  ChevronDown,
  X,
} from 'lucide-react';
import { KromaButton } from './KromaButton';
import {
  hexToHsv,
  hsvToHex,
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  copyToClipboard,
} from '../../utils/colorUtils';
import { findClosestColorName } from '../../utils/paletteGenerator';

export interface CustomColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  showAlpha?: boolean;
  showRecent?: boolean;
  showFormatSwitcher?: boolean;
  onClose?: () => void;
  className?: string;
}

const RECENT_COLORS_STORAGE_KEY = 'kroma_picker_recent_colors';
const DEFAULT_RECENTS = [
  '#BFA3F0',
  '#3D7DFF',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#090A0C',
  '#FFFFFF',
];

export type ColorFormatMode = 'HEX' | 'RGB' | 'HSL';

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  color,
  onChange,
  showAlpha = false,
  showRecent = true,
  showFormatSwitcher = true,
  onClose,
  className = '',
}) => {
  // Normalize initial color to valid 6-char hex
  const normalizeHexColor = useCallback((raw: string): string => {
    if (!raw) return '#BFA3F0';
    let clean = raw.trim();
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) return clean.toUpperCase();
    if (/^#[0-9A-Fa-f]{3}$/.test(clean)) {
      const r = clean[1], g = clean[2], b = clean[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return '#BFA3F0';
  }, []);

  // HSV representation state
  const [hsv, setHsv] = useState<{ h: number; s: number; v: number }>(() => {
    return hexToHsv(normalizeHexColor(color));
  });

  // Alpha state (0 to 1)
  const [alpha, setAlpha] = useState<number>(1);

  // Format mode: HEX | RGB | HSL
  const [formatMode, setFormatMode] = useState<ColorFormatMode>('HEX');

  // Direct string input states for precision typing
  const [hexInputValue, setHexInputValue] = useState<string>(() => normalizeHexColor(color));
  const [copied, setCopied] = useState<boolean>(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Recent colors history stored in localStorage
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_COLORS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_RECENTS;
  });

  // Sync HSV state when external color prop changes (if not already matching)
  useEffect(() => {
    const clean = normalizeHexColor(color);
    const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
    if (clean.toLowerCase() !== currentHex.toLowerCase()) {
      const newHsv = hexToHsv(clean);
      setHsv(newHsv);
      setHexInputValue(clean);
    }
  }, [color, normalizeHexColor]);

  // Derived current color calculations
  const currentHex = useMemo(() => {
    return hsvToHex(hsv.h, hsv.s, hsv.v);
  }, [hsv.h, hsv.s, hsv.v]);

  const currentRgb = useMemo(() => {
    return hexToRgb(currentHex) || { r: 191, g: 163, b: 240 };
  }, [currentHex]);

  const currentHsl = useMemo(() => {
    return hexToHsl(currentHex) || { h: Math.round(hsv.h), s: Math.round(hsv.s), l: Math.round(hsv.v / 2) };
  }, [currentHex, hsv.h, hsv.s, hsv.v]);

  const colorName = useMemo(() => {
    return findClosestColorName(currentHex);
  }, [currentHex]);

  // Pure hue color for 2D area background
  const pureHueHex = useMemo(() => {
    return hsvToHex(hsv.h, 100, 100);
  }, [hsv.h]);

  // Save color to recents list
  const addColorToRecents = useCallback((hex: string) => {
    try {
      const clean = hex.toUpperCase();
      setRecentColors((prev) => {
        const filtered = prev.filter((c) => c.toUpperCase() !== clean);
        const updated = [clean, ...filtered].slice(0, 8);
        localStorage.setItem(RECENT_COLORS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {}
  }, []);

  // Update color handler helper
  const updateColorFromHsv = useCallback((newHsv: { h: number; s: number; v: number }) => {
    setHsv(newHsv);
    const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHexInputValue(newHex);
    onChange(newHex);
  }, [onChange]);

  // 2D Saturation / Value Area Dragging Logic
  const satValAreaRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSatVal = useRef<boolean>(false);

  const updateSatValFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!satValAreaRef.current) return;
    const rect = satValAreaRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const clampedY = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const s = Math.round((clampedX / rect.width) * 100);
    const v = Math.round((1 - clampedY / rect.height) * 100);

    const newHsv = { h: hsv.h, s, v };
    setHsv(newHsv);
    const newHex = hsvToHex(hsv.h, s, v);
    setHexInputValue(newHex);
    onChange(newHex);
  }, [hsv.h, onChange]);

  const handlePointerDownSatVal = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingSatVal.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateSatValFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMoveSatVal = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSatVal.current) {
      updateSatValFromPointer(e.clientX, e.clientY);
    }
  };

  const handlePointerUpSatVal = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSatVal.current) {
      isDraggingSatVal.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      addColorToRecents(currentHex);
    }
  };

  // Keyboard navigation on 2D area (accessibility)
  const handleKeyDownSatVal = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 5 : 1;
    let newS = hsv.s;
    let newV = hsv.v;

    if (e.key === 'ArrowRight') {
      newS = Math.min(100, hsv.s + step);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      newS = Math.max(0, hsv.s - step);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      newV = Math.min(100, hsv.v + step);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      newV = Math.max(0, hsv.v - step);
      e.preventDefault();
    } else {
      return;
    }

    updateColorFromHsv({ h: hsv.h, s: newS, v: newV });
  };

  // Hue Slider Dragging Logic
  const hueSliderRef = useRef<HTMLDivElement | null>(null);
  const isDraggingHue = useRef<boolean>(false);

  const updateHueFromPointer = useCallback((clientX: number) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const h = Math.round((clampedX / rect.width) * 360) % 360;

    const newHsv = { h, s: hsv.s, v: hsv.v };
    setHsv(newHsv);
    const newHex = hsvToHex(h, hsv.s, hsv.v);
    setHexInputValue(newHex);
    onChange(newHex);
  }, [hsv.s, hsv.v, onChange]);

  const handlePointerDownHue = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingHue.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateHueFromPointer(e.clientX);
  };

  const handlePointerMoveHue = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingHue.current) {
      updateHueFromPointer(e.clientX);
    }
  };

  const handlePointerUpHue = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingHue.current) {
      isDraggingHue.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      addColorToRecents(currentHex);
    }
  };

  // Alpha Slider Dragging Logic
  const alphaSliderRef = useRef<HTMLDivElement | null>(null);
  const isDraggingAlpha = useRef<boolean>(false);

  const updateAlphaFromPointer = useCallback((clientX: number) => {
    if (!alphaSliderRef.current) return;
    const rect = alphaSliderRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const newAlpha = Math.round((clampedX / rect.width) * 100) / 100;
    setAlpha(newAlpha);
  }, []);

  const handlePointerDownAlpha = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingAlpha.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateAlphaFromPointer(e.clientX);
  };

  const handlePointerMoveAlpha = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingAlpha.current) {
      updateAlphaFromPointer(e.clientX);
    }
  };

  const handlePointerUpAlpha = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingAlpha.current) {
      isDraggingAlpha.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Eyedropper integration
  const isEyedropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

  const handleOpenEyedropper = async () => {
    if (!isEyedropperSupported) return;
    try {
      // @ts-expect-error - EyeDropper API
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        const hex = normalizeHexColor(result.sRGBHex);
        const newHsv = hexToHsv(hex);
        updateColorFromHsv(newHsv);
        addColorToRecents(hex);
      }
    } catch {}
  };

  // Mode Handlers: Direct typing in HEX input
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let val = raw.toUpperCase();
    if (!val.startsWith('#') && val.length > 0) val = `#${val}`;
    setHexInputValue(val);

    const clean = val.replace('#', '');
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      const newHsv = hexToHsv(val);
      setHsv(newHsv);
      onChange(val);
      addColorToRecents(val);
    }
  };

  // Mode Handlers: Direct typing in RGB inputs
  const handleRgbChange = (channel: 'r' | 'g' | 'b', valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val)) return;
    const clamped = Math.max(0, Math.min(255, val));
    const nextRgb = {
      r: channel === 'r' ? clamped : currentRgb.r,
      g: channel === 'g' ? clamped : currentRgb.g,
      b: channel === 'b' ? clamped : currentRgb.b,
    };
    const newHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    const newHsv = hexToHsv(newHex);
    updateColorFromHsv(newHsv);
  };

  // Mode Handlers: Direct typing in HSL inputs
  const handleHslChange = (channel: 'h' | 's' | 'l', valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val)) return;
    const max = channel === 'h' ? 360 : 100;
    const clamped = Math.max(0, Math.min(max, val));
    const nextHsl = {
      h: channel === 'h' ? clamped : currentHsl.h,
      s: channel === 's' ? clamped : currentHsl.s,
      l: channel === 'l' ? clamped : currentHsl.l,
    };
    const newHex = hslToHex(nextHsl.h, nextHsl.s, nextHsl.l);
    const newHsv = hexToHsv(newHex);
    updateColorFromHsv(newHsv);
  };

  // Copy Color Action
  const handleCopyColor = async () => {
    let textToCopy = currentHex;
    if (formatMode === 'RGB') {
      textToCopy = showAlpha && alpha < 1
        ? `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, ${alpha})`
        : `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`;
    } else if (formatMode === 'HSL') {
      textToCopy = showAlpha && alpha < 1
        ? `hsla(${currentHsl.h}, ${currentHsl.s}%, ${currentHsl.l}%, ${alpha})`
        : `hsl(${currentHsl.h}, ${currentHsl.s}%, ${currentHsl.l}%)`;
    }

    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Paste Color Action
  const handlePasteColor = async () => {
    setPasteError(null);
    try {
      let text = '';
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      } else {
        const prompted = prompt('Paste color (HEX, RGB, or HSL):');
        if (prompted) text = prompted;
      }

      text = text.trim();
      if (!text) return;

      // Check for HEX
      if (/^#?[0-9A-Fa-f]{6}$/.test(text) || /^#?[0-9A-Fa-f]{3}$/.test(text)) {
        const hex = normalizeHexColor(text);
        const newHsv = hexToHsv(hex);
        updateColorFromHsv(newHsv);
        addColorToRecents(hex);
        return;
      }

      // Check for rgb(r, g, b)
      const rgbMatch = text.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        const hex = rgbToHex(r, g, b);
        const newHsv = hexToHsv(hex);
        updateColorFromHsv(newHsv);
        addColorToRecents(hex);
        return;
      }

      // Check for hsl(h, s%, l%)
      const hslMatch = text.match(/hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?/i);
      if (hslMatch) {
        const h = parseInt(hslMatch[1], 10);
        const s = parseInt(hslMatch[2], 10);
        const l = parseInt(hslMatch[3], 10);
        const hex = hslToHex(h, s, l);
        const newHsv = hexToHsv(hex);
        updateColorFromHsv(newHsv);
        addColorToRecents(hex);
        return;
      }

      setPasteError('Invalid format');
      setTimeout(() => setPasteError(null), 2000);
    } catch {
      setPasteError('Paste failed');
      setTimeout(() => setPasteError(null), 2000);
    }
  };

  // Cycle format mode (HEX -> RGB -> HSL -> HEX)
  const handleCycleFormatMode = () => {
    if (formatMode === 'HEX') setFormatMode('RGB');
    else if (formatMode === 'RGB') setFormatMode('HSL');
    else setFormatMode('HEX');
  };

  return (
    <div
      className={`flex flex-col gap-3 p-3 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md shadow-xl select-none text-[var(--text-primary)] ${className}`}
      style={{
        width: '248px',
        maxWidth: '100%',
        borderRadius: 'var(--radius-md)',
      }}
      role="region"
      aria-label="PaletteParadise Precision Color Picker"
    >
      {/* Header bar if onClose is provided */}
      {onClose && (
        <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)] text-xs font-mono">
          <span className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Color Inspector
          </span>
          <KromaButton
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="p-1 h-6 w-6 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            aria-label="Close picker"
            iconLeft={<X size={12} />}
          />
        </div>
      )}

      {/* 1. 2D Saturation / Value Color Area */}
      <div
        ref={satValAreaRef}
        tabIndex={0}
        onPointerDown={handlePointerDownSatVal}
        onPointerMove={handlePointerMoveSatVal}
        onPointerUp={handlePointerUpSatVal}
        onPointerCancel={handlePointerUpSatVal}
        onKeyDown={handleKeyDownSatVal}
        className="relative w-full h-36 rounded-xs cursor-crosshair touch-none border border-[var(--border-subtle)] overflow-hidden focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        style={{
          backgroundColor: pureHueHex,
          backgroundImage: `
            linear-gradient(to top, #000000, transparent),
            linear-gradient(to right, #FFFFFF, transparent)
          `,
        }}
        aria-label="Saturation and brightness picker. Use arrow keys to adjust."
      >
        {/* Pointer Thumb Handle */}
        <div
          className="absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none transition-transform active:scale-125"
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            backgroundColor: currentHex,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* 2. Controls Row: Hue Slider, Alpha Slider, Eyedropper & Color Preview */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          {/* Active Preview Swatch with Eyedropper Button */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-xs border border-[var(--border-subtle)] shadow-xs relative overflow-hidden flex-shrink-0"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              }}
              title={`Active: ${currentHex} (${colorName})`}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: currentHex,
                  opacity: showAlpha ? alpha : 1,
                }}
              />
            </div>

            {isEyedropperSupported && (
              <KromaButton
                size="icon"
                variant="ghost"
                onClick={handleOpenEyedropper}
                className="w-7 h-7 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                title="Sample screen color with eyedropper"
                aria-label="Pick color from screen"
                iconLeft={<Pipette size={13} />}
              />
            )}
          </div>

          {/* Sliders Container */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            {/* Hue Rainbow Spectrum Slider */}
            <div
              ref={hueSliderRef}
              onPointerDown={handlePointerDownHue}
              onPointerMove={handlePointerMoveHue}
              onPointerUp={handlePointerUpHue}
              onPointerCancel={handlePointerUpHue}
              className="relative w-full h-3 rounded-full cursor-pointer touch-none border border-[var(--border-subtle)]"
              style={{
                background: `linear-gradient(to right, 
                  #FF0000 0%, 
                  #FFFF00 17%, 
                  #00FF00 33%, 
                  #00FFFF 50%, 
                  #0000FF 67%, 
                  #FF00FF 83%, 
                  #FF0000 100%
                )`,
              }}
              aria-label="Hue spectrum slider"
            >
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border border-black/30 shadow-xs pointer-events-none"
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                }}
              />
            </div>

            {/* Optional Alpha Transparency Slider */}
            {showAlpha && (
              <div
                ref={alphaSliderRef}
                onPointerDown={handlePointerDownAlpha}
                onPointerMove={handlePointerMoveAlpha}
                onPointerUp={handlePointerUpAlpha}
                onPointerCancel={handlePointerUpAlpha}
                className="relative w-full h-3 rounded-full cursor-pointer touch-none border border-[var(--border-subtle)] overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '6px 6px',
                  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
                }}
                aria-label="Alpha transparency slider"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, transparent, ${currentHex})`,
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border border-black/30 shadow-xs pointer-events-none"
                  style={{
                    left: `${alpha * 100}%`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Direct Inputs & Mode Section (HEX / RGB / HSL) */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-1.5">
          {/* Format Mode Switcher Pill */}
          {showFormatSwitcher && (
            <KromaButton
              size="sm"
              variant="ghost"
              onClick={handleCycleFormatMode}
              className="flex items-center gap-1 px-1.5 py-1 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] rounded-xs text-xs font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-auto"
              title="Click to cycle color format (HEX / RGB / HSL)"
              iconRight={<ChevronDown size={10} className="text-[var(--text-tertiary)]" />}
            >
              <span>{formatMode}</span>
            </KromaButton>
          )}

          {/* Inputs based on active mode */}
          <div className="flex-1 flex items-center gap-1 min-w-0">
            {formatMode === 'HEX' && (
              <div className="flex-1 flex items-center bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-2 py-1 min-w-0 focus-within:border-[var(--color-primary)]">
                <span className="font-mono text-xs text-[var(--text-tertiary)] mr-0.5">#</span>
                <input
                  type="text"
                  maxLength={6}
                  value={hexInputValue.replace('#', '')}
                  onChange={handleHexInputChange}
                  className="w-full bg-transparent font-mono text-xs font-semibold text-[var(--text-primary)] outline-none uppercase min-w-0"
                  placeholder="BFA3F0"
                  aria-label="Hex color string"
                />
              </div>
            )}

            {formatMode === 'RGB' && (
              <div className="grid grid-cols-3 gap-1 flex-1 min-w-0">
                {(['r', 'g', 'b'] as const).map((channel) => (
                  <div
                    key={channel}
                    className="flex items-center bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-1.5 py-1 focus-within:border-[var(--color-primary)]"
                  >
                    <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase mr-1">
                      {channel}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={currentRgb[channel]}
                      onChange={(e) => handleRgbChange(channel, e.target.value)}
                      className="w-full bg-transparent font-mono text-xs font-semibold text-[var(--text-primary)] outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                    />
                  </div>
                ))}
              </div>
            )}

            {formatMode === 'HSL' && (
              <div className="grid grid-cols-3 gap-1 flex-1 min-w-0">
                {(['h', 's', 'l'] as const).map((channel) => (
                  <div
                    key={channel}
                    className="flex items-center bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-1.5 py-1 focus-within:border-[var(--color-primary)]"
                  >
                    <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase mr-1">
                      {channel}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={channel === 'h' ? 360 : 100}
                      value={currentHsl[channel]}
                      onChange={(e) => handleHslChange(channel, e.target.value)}
                      className="w-full bg-transparent font-mono text-xs font-semibold text-[var(--text-primary)] outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Copy Action */}
          <KromaButton
            size="icon"
            variant="ghost"
            onClick={handleCopyColor}
            className="p-1.5 h-7 w-7 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0"
            title="Copy color code"
            aria-label="Copy color"
            iconLeft={copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          />

          {/* Quick Paste Action */}
          <KromaButton
            size="icon"
            variant="ghost"
            onClick={handlePasteColor}
            className="p-1.5 h-7 w-7 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0"
            title={pasteError || 'Paste color code'}
            aria-label="Paste color"
            iconLeft={<ClipboardPaste size={12} className={pasteError ? 'text-rose-400' : ''} />}
          />
        </div>

        {/* Color Name Tag */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)] px-0.5">
          <span className="truncate max-w-[150px]">{colorName}</span>
          <span>{currentHex}</span>
        </div>
      </div>

      {/* 4. Recent Swatches Row */}
      {showRecent && recentColors.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1.5 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)] uppercase font-semibold">
            <span>Recent</span>
            <span>{recentColors.length} saved</span>
          </div>

          <div className="grid grid-cols-8 gap-1.5">
            {recentColors.slice(0, 8).map((hex, idx) => {
              const isSelected = currentHex.toUpperCase() === hex.toUpperCase();
              return (
                <button
                  key={`${hex}-${idx}`}
                  type="button"
                  onClick={() => {
                    const newHsv = hexToHsv(hex);
                    updateColorFromHsv(newHsv);
                    addColorToRecents(hex);
                  }}
                  className={`h-5 w-full rounded-xs border transition-transform cursor-pointer relative ${
                    isSelected
                      ? 'ring-2 ring-[var(--color-primary)] scale-110 z-10 border-white'
                      : 'border-white/15 hover:scale-110'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={`Select ${hex}`}
                  aria-label={`Select recent color ${hex}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
