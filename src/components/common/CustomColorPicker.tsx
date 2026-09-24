import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Pipette,
  Copy,
  Check,
  ClipboardPaste,
  ChevronDown,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { KromaButton } from './KromaButton';
import {
  hexToHsv,
  hsvToHex,
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  hexToOklchNumbers,
  oklchToHex,
  parseOklch,
  calculateHarmonies,
  generateShadesAndTints,
  getColorAccessibility,
  getTextColorForBackground,
  copyToClipboard,
} from '../../utils/colorUtils';
import { findClosestColorName } from '../../utils/paletteGenerator';

export interface CustomColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  showAlpha?: boolean;
  showRecent?: boolean;
  showFormatSwitcher?: boolean;
  showHarmonies?: boolean;
  showShadesTints?: boolean;
  showAccessibility?: boolean;
  showEyedropper?: boolean;
  onClose?: () => void;
  className?: string;
  title?: string;
}

export type KromaColorPickerProps = CustomColorPickerProps;

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

export type ColorFormatMode = 'HEX' | 'RGB' | 'HSL' | 'OKLCH';

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  color,
  onChange,
  showAlpha = false,
  showRecent = true,
  showFormatSwitcher = true,
  showHarmonies = false,
  showShadesTints = false,
  showAccessibility = false,
  showEyedropper = true,
  onClose,
  className = '',
  title,
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

  // Format mode: HEX | RGB | HSL | OKLCH
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

  const currentOklch = useMemo(() => {
    return hexToOklchNumbers(currentHex);
  }, [currentHex]);

  const colorName = useMemo(() => {
    return findClosestColorName(currentHex);
  }, [currentHex]);

  const harmonies = useMemo(() => {
    if (!showHarmonies) return null;
    return calculateHarmonies(currentHex);
  }, [currentHex, showHarmonies]);

  const shadesAndTints = useMemo(() => {
    if (!showShadesTints) return null;
    return generateShadesAndTints(currentHex);
  }, [currentHex, showShadesTints]);

  const accessibility = useMemo(() => {
    if (!showAccessibility) return null;
    return getColorAccessibility(currentHex);
  }, [currentHex, showAccessibility]);

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

  // Mode Handlers: Direct typing in OKLCH inputs
  const handleOklchChange = (channel: 'l' | 'c' | 'h', valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val)) return;
    const targetL = channel === 'l' ? Math.max(0, Math.min(100, val)) / 100 : currentOklch.l;
    const targetC = channel === 'c' ? Math.max(0, Math.min(0.4, val)) : currentOklch.c;
    const targetH = channel === 'h' ? ((val % 360) + 360) % 360 : currentOklch.h;

    const newHex = oklchToHex(targetL, targetC, targetH);
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
    } else if (formatMode === 'OKLCH') {
      textToCopy = showAlpha && alpha < 1
        ? `oklch(${Math.round(currentOklch.l * 100)}% ${currentOklch.c} ${Math.round(currentOklch.h)} / ${alpha})`
        : `oklch(${Math.round(currentOklch.l * 100)}% ${currentOklch.c} ${Math.round(currentOklch.h)})`;
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
        const prompted = prompt('Paste color (HEX, RGB, HSL, or OKLCH):');
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

      // Check for OKLCH
      const oklchParsed = parseOklch(text);
      if (oklchParsed) {
        const hex = oklchToHex(oklchParsed.l, oklchParsed.c, oklchParsed.h);
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

  // Cycle format mode (HEX -> RGB -> HSL -> OKLCH -> HEX)
  const handleCycleFormatMode = () => {
    if (formatMode === 'HEX') setFormatMode('RGB');
    else if (formatMode === 'RGB') setFormatMode('HSL');
    else if (formatMode === 'HSL') setFormatMode('OKLCH');
    else setFormatMode('HEX');
  };

  const handleSelectColor = (hex: string) => {
    const newHsv = hexToHsv(hex);
    updateColorFromHsv(newHsv);
    addColorToRecents(hex);
  };

  return (
    <div
      className={`flex flex-col gap-3 p-3 bg-surface-1 border border-border-subtle rounded-md shadow-xl select-none text-text-primary ${className}`}
      style={{
        width: showHarmonies || showShadesTints ? '320px' : '260px',
        maxWidth: '100%',
        borderRadius: 'var(--radius-md)',
      }}
      role="region"
      aria-label="KROMA Precision Color Picker"
    >
      {/* Header bar if onClose or title is provided */}
      {(onClose || title) && (
        <div className="flex items-center justify-between pb-1 border-b border-border-subtle text-xs font-mono">
          <span className="font-bold uppercase tracking-wider text-text-secondary">
            {title || 'Color Inspector'}
          </span>
          {onClose && (
            <KromaButton
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="p-1 h-6 w-6 text-text-tertiary hover:text-text-primary"
              aria-label="Close picker"
              iconLeft={<X size={12} />}
            />
          )}
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
        className="relative w-full h-36 rounded-xs cursor-crosshair touch-none border border-border-subtle overflow-hidden focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
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
              className="w-7 h-7 rounded-xs border border-border-subtle shadow-xs relative overflow-hidden flex-shrink-0"
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

            {showEyedropper && isEyedropperSupported && (
              <KromaButton
                size="icon"
                variant="ghost"
                onClick={handleOpenEyedropper}
                className="w-7 h-7 bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary border border-border-subtle"
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
              className="relative w-full h-3 rounded-full cursor-pointer touch-none border border-border-subtle"
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
                className="relative w-full h-3 rounded-full cursor-pointer touch-none border border-border-subtle overflow-hidden"
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

      {/* 3. Direct Inputs & Mode Section (HEX / RGB / HSL / OKLCH) */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-border-subtle">
        <div className="flex items-center gap-1.5">
          {/* Format Mode Switcher Pill */}
          {showFormatSwitcher && (
            <KromaButton
              size="sm"
              variant="ghost"
              onClick={handleCycleFormatMode}
              className="flex items-center gap-1 px-1.5 py-1 bg-surface-2 hover:bg-surface-3 border border-border-subtle rounded-xs text-xs font-mono font-bold text-text-secondary hover:text-text-primary h-auto"
              title="Click to cycle color format (HEX / RGB / HSL / OKLCH)"
              iconRight={<ChevronDown size={10} className="text-text-tertiary" />}
            >
              <span>{formatMode}</span>
            </KromaButton>
          )}

          {/* Inputs based on active mode */}
          <div className="flex-1 flex items-center gap-1 min-w-0">
            {formatMode === 'HEX' && (
              <div className="flex-1 flex items-center bg-surface-2 border border-border-subtle rounded-xs px-2 py-1 min-w-0 focus-within:border-[var(--color-primary)]">
                <span className="font-mono text-xs text-text-tertiary mr-0.5">#</span>
                <input
                  type="text"
                  maxLength={6}
                  value={hexInputValue.replace('#', '')}
                  onChange={handleHexInputChange}
                  className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none uppercase min-w-0"
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
                    className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-1.5 py-1 focus-within:border-[var(--color-primary)]"
                  >
                    <span className="font-mono text-xs text-text-tertiary uppercase mr-1">
                      {channel}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={currentRgb[channel]}
                      onChange={(e) => handleRgbChange(channel, e.target.value)}
                      className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
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
                    className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-1.5 py-1 focus-within:border-[var(--color-primary)]"
                  >
                    <span className="font-mono text-xs text-text-tertiary uppercase mr-1">
                      {channel}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={channel === 'h' ? 360 : 100}
                      value={currentHsl[channel]}
                      onChange={(e) => handleHslChange(channel, e.target.value)}
                      className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                    />
                  </div>
                ))}
              </div>
            )}

            {formatMode === 'OKLCH' && (
              <div className="grid grid-cols-3 gap-1 flex-1 min-w-0">
                <div className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-1 py-1 focus-within:border-[var(--color-primary)]">
                  <span className="font-mono text-[10px] text-text-tertiary uppercase mr-0.5">L</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(currentOklch.l * 100)}
                    onChange={(e) => handleOklchChange('l', e.target.value)}
                    className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                    title="Lightness percentage (0-100%)"
                  />
                </div>
                <div className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-1 py-1 focus-within:border-[var(--color-primary)]">
                  <span className="font-mono text-[10px] text-text-tertiary uppercase mr-0.5">C</span>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={0.4}
                    value={currentOklch.c}
                    onChange={(e) => handleOklchChange('c', e.target.value)}
                    className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                    title="Chroma (0.00-0.40)"
                  />
                </div>
                <div className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-1 py-1 focus-within:border-[var(--color-primary)]">
                  <span className="font-mono text-[10px] text-text-tertiary uppercase mr-0.5">H</span>
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={Math.round(currentOklch.h)}
                    onChange={(e) => handleOklchChange('h', e.target.value)}
                    className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                    title="Hue angle (0-360 deg)"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Copy Action */}
          <KromaButton
            size="icon"
            variant="ghost"
            onClick={handleCopyColor}
            className="p-1.5 h-7 w-7 rounded-xs bg-surface-2 hover:bg-surface-3 border border-border-subtle text-text-secondary hover:text-text-primary flex-shrink-0"
            title="Copy color code"
            aria-label="Copy color"
            iconLeft={copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          />

          {/* Quick Paste Action */}
          <KromaButton
            size="icon"
            variant="ghost"
            onClick={handlePasteColor}
            className="p-1.5 h-7 w-7 rounded-xs bg-surface-2 hover:bg-surface-3 border border-border-subtle text-text-secondary hover:text-text-primary flex-shrink-0"
            title={pasteError || 'Paste color code'}
            aria-label="Paste color"
            iconLeft={<ClipboardPaste size={12} className={pasteError ? 'text-rose-400' : ''} />}
          />
        </div>

        {/* Color Name Tag */}
        <div className="flex items-center justify-between text-xs font-mono text-text-tertiary px-0.5">
          <span className="truncate max-w-[150px]">{colorName}</span>
          <span>{currentHex}</span>
        </div>
      </div>

      {/* 4. Optional Harmonies Section (HTML Color Codes UX pattern) */}
      {showHarmonies && harmonies && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs font-mono text-text-secondary uppercase font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-[var(--color-primary)]" />
              Harmonies
            </span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-mono">
            {/* Complementary */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-text-tertiary w-20">Complement</span>
              <div className="flex items-center gap-1">
                {[currentHex, harmonies.complementary].map((h, i) => (
                  <button
                    key={`${h}-${i}`}
                    type="button"
                    onClick={() => handleSelectColor(h)}
                    className="w-6 h-5 rounded-xs border border-white/20 hover:scale-105 transition-transform"
                    style={{ backgroundColor: h }}
                    title={`Select ${h}`}
                  />
                ))}
              </div>
            </div>

            {/* Triadic */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-text-tertiary w-20">Triadic</span>
              <div className="flex items-center gap-1">
                {[currentHex, ...harmonies.triadic].map((h, i) => (
                  <button
                    key={`${h}-${i}`}
                    type="button"
                    onClick={() => handleSelectColor(h)}
                    className="w-6 h-5 rounded-xs border border-white/20 hover:scale-105 transition-transform"
                    style={{ backgroundColor: h }}
                    title={`Select ${h}`}
                  />
                ))}
              </div>
            </div>

            {/* Analogous */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-text-tertiary w-20">Analogous</span>
              <div className="flex items-center gap-1">
                {[harmonies.analogous[0], currentHex, harmonies.analogous[1]].map((h, i) => (
                  <button
                    key={`${h}-${i}`}
                    type="button"
                    onClick={() => handleSelectColor(h)}
                    className="w-6 h-5 rounded-xs border border-white/20 hover:scale-105 transition-transform"
                    style={{ backgroundColor: h }}
                    title={`Select ${h}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Optional Shades & Tints Section */}
      {showShadesTints && shadesAndTints && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-border-subtle">
          <span className="text-[10px] font-mono uppercase text-text-tertiary font-semibold">Tints & Shades</span>
          {/* Tints strip */}
          <div className="grid grid-cols-6 gap-1">
            {shadesAndTints.tints.map((h, i) => (
              <button
                key={`tint-${h}-${i}`}
                type="button"
                onClick={() => handleSelectColor(h)}
                className="h-4 rounded-xs border border-white/10 hover:scale-110 transition-transform"
                style={{ backgroundColor: h }}
                title={`Tint: ${h}`}
              />
            ))}
          </div>
          {/* Shades strip */}
          <div className="grid grid-cols-6 gap-1">
            {shadesAndTints.shades.map((h, i) => (
              <button
                key={`shade-${h}-${i}`}
                type="button"
                onClick={() => handleSelectColor(h)}
                className="h-4 rounded-xs border border-white/10 hover:scale-110 transition-transform"
                style={{ backgroundColor: h }}
                title={`Shade: ${h}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. Optional WCAG Accessibility Section */}
      {showAccessibility && accessibility && (
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs font-mono">
          <div className="flex items-center gap-1 text-[11px] text-text-secondary">
            <ShieldCheck size={12} className={accessibility.passAANormal ? 'text-emerald-400' : 'text-amber-400'} />
            <span>WCAG: {accessibility.bestContrast}:1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="px-1.5 py-0.5 rounded-xs font-bold text-[10px] border border-border-subtle"
              style={{
                backgroundColor: currentHex,
                color: getTextColorForBackground(currentHex),
              }}
            >
              Text Preview
            </span>
          </div>
        </div>
      )}

      {/* 7. Recent Swatches Row */}
      {showRecent && recentColors.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1.5 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs font-mono text-text-tertiary uppercase font-semibold">
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
                  onClick={() => handleSelectColor(hex)}
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

export const KromaColorPicker = CustomColorPicker;
