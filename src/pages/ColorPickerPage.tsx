import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Pipette,
  Copy,
  Check,
  Shuffle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Share2,
  Bookmark,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { RouteType } from '../types';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { PageHeader } from '../components/common/PageHeader';
import { KromaButton } from '../components/common/KromaButton';
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebApplicationSchema } from '../utils/schemaGenerator';
import {
  hexToHsv,
  hsvToHex,
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  hexToOklchNumbers,
  oklchToHex,
  calculateHarmonies,
  generateShadesAndTints,
  getColorAccessibility,
  getTextColorForBackground,
  getColorTemperature,
  assessPracticalUi,
  copyToClipboard,
} from '../utils/colorUtils';
import { findClosestColorName } from '../utils/paletteGenerator';

interface ColorPickerPageProps {
  initialHex?: string;
  onNavigate: (route: RouteType) => void;
}

export const ColorPickerPage: React.FC<ColorPickerPageProps> = ({
  initialHex,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved, removeItem } = useSaved();

  // Normalize initial color
  const normalizeHexColor = useCallback((raw?: string): string => {
    if (!raw) return '#3D7DFF';
    let clean = raw.trim();
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) return clean.toUpperCase();
    if (/^#[0-9A-Fa-f]{3}$/.test(clean)) {
      const r = clean[1], g = clean[2], b = clean[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return '#3D7DFF';
  }, []);

  const [startingHex, setStartingHex] = useState<string>(() => normalizeHexColor(initialHex));

  // Canonical HSV state
  const [hsv, setHsv] = useState<{ h: number; s: number; v: number }>(() => {
    return hexToHsv(normalizeHexColor(initialHex));
  });

  // Alpha transparency state (0-1)
  const [alpha, setAlpha] = useState<number>(1);

  // Text input local values
  const [hexInputText, setHexInputText] = useState<string>(() => normalizeHexColor(initialHex));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync when initialHex prop changes externally
  useEffect(() => {
    if (initialHex) {
      const clean = normalizeHexColor(initialHex);
      setStartingHex(clean);
      setHsv(hexToHsv(clean));
      setHexInputText(clean);
    }
  }, [initialHex, normalizeHexColor]);

  // Derived current color representations
  const currentHex = useMemo(() => {
    return hsvToHex(hsv.h, hsv.s, hsv.v);
  }, [hsv.h, hsv.s, hsv.v]);

  const currentRgb = useMemo(() => {
    return hexToRgb(currentHex) || { r: 61, g: 125, b: 255 };
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

  const temperature = useMemo(() => {
    return getColorTemperature(currentHex);
  }, [currentHex]);

  const harmonies = useMemo(() => {
    return calculateHarmonies(currentHex);
  }, [currentHex]);

  const shadesAndTints = useMemo(() => {
    return generateShadesAndTints(currentHex);
  }, [currentHex]);

  const accessibility = useMemo(() => {
    return getColorAccessibility(currentHex);
  }, [currentHex]);

  const practicalUi = useMemo(() => {
    return assessPracticalUi(currentHex);
  }, [currentHex]);

  // Pure hue color for 2D area background
  const pureHueHex = useMemo(() => {
    return hsvToHex(hsv.h, 100, 100);
  }, [hsv.h]);

  // Update color helper
  const updateColorFromHsv = useCallback((newHsv: { h: number; s: number; v: number }) => {
    setHsv(newHsv);
    const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHexInputText(newHex);
  }, []);

  const handleSelectHex = (hex: string) => {
    const clean = normalizeHexColor(hex);
    const newHsv = hexToHsv(clean);
    updateColorFromHsv(newHsv);
  };

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
    setHexInputText(hsvToHex(hsv.h, s, v));
  }, [hsv.h]);

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
    }
  };

  // Keyboard navigation on 2D area (accessibility)
  const handleKeyDownSatVal = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
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
    setHexInputText(hsvToHex(h, hsv.s, hsv.v));
  }, [hsv.s, hsv.v]);

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

  // Eyedropper API
  const isEyedropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

  const handleOpenEyedropper = async () => {
    if (!isEyedropperSupported) return;
    try {
      // @ts-expect-error - EyeDropper API
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        handleSelectHex(result.sRGBHex);
        showToast('Sampled screen color', result.sRGBHex.toUpperCase(), result.sRGBHex);
      }
    } catch {}
  };

  // Direct editing inputs
  const handleHexChange = (valStr: string) => {
    let val = valStr.toUpperCase();
    if (!val.startsWith('#') && val.length > 0) val = `#${val}`;
    setHexInputText(val);

    const clean = val.replace('#', '');
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      const newHsv = hexToHsv(val);
      setHsv(newHsv);
    }
  };

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
    updateColorFromHsv(hexToHsv(newHex));
  };

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
    updateColorFromHsv(hexToHsv(newHex));
  };

  const handleHsvChange = (channel: 'h' | 's' | 'v', valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val)) return;
    const max = channel === 'h' ? 360 : 100;
    const clamped = Math.max(0, Math.min(max, val));
    const nextHsv = {
      h: channel === 'h' ? clamped : hsv.h,
      s: channel === 's' ? clamped : hsv.s,
      v: channel === 'v' ? clamped : hsv.v,
    };
    updateColorFromHsv(nextHsv);
  };

  const handleOklchChange = (channel: 'l' | 'c' | 'h', valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val)) return;
    const targetL = channel === 'l' ? Math.max(0, Math.min(100, val)) / 100 : currentOklch.l;
    const targetC = channel === 'c' ? Math.max(0, Math.min(0.4, val)) : currentOklch.c;
    const targetH = channel === 'h' ? ((val % 360) + 360) % 360 : currentOklch.h;

    const newHex = oklchToHex(targetL, targetC, targetH);
    updateColorFromHsv(hexToHsv(newHex));
  };

  // Copy helper
  const handleCopyText = async (key: string, text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      showToast(`Copied ${label}`, text, currentHex);
      setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  // Random color generator
  const handleRandomColor = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
      .toUpperCase()}`;
    handleSelectHex(randomHex);
  };

  // Reset to initial
  const handleReset = () => {
    handleSelectHex(startingHex);
  };

  // Save color bookmark
  const isColorSaved = isSaved(currentHex);
  const handleToggleSave = () => {
    if (isColorSaved) {
      removeItem(currentHex);
      showToast('Removed from collection', currentHex, currentHex);
    } else {
      saveItem({
        id: currentHex,
        type: 'color',
        slug: currentHex.replace('#', '').toLowerCase(),
        title: `${colorName} (${currentHex})`,
        preview: currentHex,
      });
      showToast('Saved to collection', currentHex, currentHex);
    }
  };

  // Share URL
  const handleShareUrl = () => {
    const url = `${window.location.origin}/color-picker?hex=${currentHex.replace('#', '')}`;
    copyToClipboard(url).then(() => {
      showToast('Share link copied to clipboard', url, currentHex);
    });
  };

  const schema = generateWebApplicationSchema({
    name: 'KROMA Color Picker — Precision Colorimetry & Palette Studio',
    description:
      'Interactive color picker and colorimetry studio with bidirectional HEX, RGB, HSL, HSV & OKLCH translation, live harmonic schemes, and WCAG contrast validation.',
    url: '/color-picker',
    applicationCategory: 'DesignApplication',
  });

  return (
    <>
      <SEOHead
        title={`${colorName} (${currentHex}) — KROMA Color Picker Studio`}
        description={`Interactive colorimetry studio with live HEX, RGB, HSL, HSV, and OKLCH conversion for ${colorName} (${currentHex}). Harmonious schemes, tints, shades, and WCAG contrast analysis.`}
        canonicalPath="/color-picker"
        jsonLd={schema}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8 md:gap-12 animate-fade-in text-text-primary">
        {/* Page Header with Action Bar */}
        <PageHeader
          variant="standard"
          sectionLabel="PRECISION COLORIMETRY STUDIO"
          title="COLOR PICKER"
          description="Interactive color selection, bidirectional multi-space translation (HEX, RGB, HSL, HSV, OKLCH), harmonic schemes, and WCAG 2.2 contrast compliance."
          breadcrumbs={[
            { label: 'Home', to: { path: 'home' } },
            { label: 'Studios', to: { path: 'ramps' } },
            { label: 'Color Picker' },
          ]}
          onNavigate={onNavigate}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <KromaButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRandomColor}
                iconLeft={<Shuffle size={14} />}
              >
                Random
              </KromaButton>
              <KromaButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                iconLeft={<RotateCcw size={14} />}
                title="Reset to initial specimen"
              >
                Reset
              </KromaButton>
              <KromaButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleToggleSave}
                iconLeft={<Bookmark size={14} className={isColorSaved ? 'fill-[var(--color-primary)] text-[var(--color-primary)]' : ''} />}
              >
                {isColorSaved ? 'Saved' : 'Save'}
              </KromaButton>
              <KromaButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShareUrl}
                iconLeft={<Share2 size={14} />}
              >
                Share
              </KromaButton>
            </div>
          }
        />

        {/* ═════════════════════════════════════════════════════════
            PRIMARY WORKSPACE: 2D COLOR FIELD + FORMATS MATRIX
            ═════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Precision Interactive Color Canvas */}
          <div className="lg:col-span-7 flex flex-col gap-6 bg-surface-1 border border-border-subtle rounded-md p-5 sm:p-6 shadow-sm">
            {/* 1. Large 2D Saturation/Value Area */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold tracking-wider text-text-secondary uppercase">
                  Color Matrix (Saturation &amp; Value)
                </span>
                <span className="text-text-tertiary">
                  H: {Math.round(hsv.h)}° • S: {hsv.s}% • V: {hsv.v}%
                </span>
              </div>

              <div
                ref={satValAreaRef}
                tabIndex={0}
                onPointerDown={handlePointerDownSatVal}
                onPointerMove={handlePointerMoveSatVal}
                onPointerUp={handlePointerUpSatVal}
                onPointerCancel={handlePointerUpSatVal}
                onKeyDown={handleKeyDownSatVal}
                className="relative w-full h-72 sm:h-80 rounded-sm cursor-crosshair touch-none border border-border-subtle overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                style={{
                  backgroundColor: pureHueHex,
                  backgroundImage: `
                    linear-gradient(to top, #000000, transparent),
                    linear-gradient(to right, #FFFFFF, transparent)
                  `,
                }}
                role="slider"
                aria-label="Saturation and brightness 2D color picker"
                aria-valuetext={`Saturation ${hsv.s} percent, Brightness ${hsv.v} percent`}
              >
                {/* Pointer Crosshair Handle */}
                <div
                  className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white pointer-events-none transition-transform active:scale-125"
                  style={{
                    left: `${hsv.s}%`,
                    top: `${100 - hsv.v}%`,
                    backgroundColor: currentHex,
                    boxShadow: '0 0 0 1.5px rgba(0,0,0,0.5), 0 3px 8px rgba(0,0,0,0.4)',
                  }}
                />
              </div>
            </div>

            {/* 2. Sliders: Hue and Alpha */}
            <div className="flex flex-col gap-4">
              {/* Hue Rainbow Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span className="font-semibold uppercase">Hue Spectrum</span>
                  <span>{Math.round(hsv.h)}°</span>
                </div>
                <div
                  ref={hueSliderRef}
                  tabIndex={0}
                  onPointerDown={handlePointerDownHue}
                  onPointerMove={handlePointerMoveHue}
                  onPointerUp={handlePointerUpHue}
                  onPointerCancel={handlePointerUpHue}
                  className="relative w-full h-6 rounded-full cursor-pointer touch-none border border-border-subtle focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
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
                  role="slider"
                  aria-label="Hue spectrum slider"
                  aria-valuenow={Math.round(hsv.h)}
                  aria-valuemin={0}
                  aria-valuemax={360}
                >
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-black/30 shadow-md pointer-events-none"
                    style={{
                      left: `${(hsv.h / 360) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Alpha Transparency Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span className="font-semibold uppercase">Alpha / Opacity</span>
                  <span>{Math.round(alpha * 100)}%</span>
                </div>
                <div
                  ref={alphaSliderRef}
                  tabIndex={0}
                  onPointerDown={handlePointerDownAlpha}
                  onPointerMove={handlePointerMoveAlpha}
                  onPointerUp={handlePointerUpAlpha}
                  onPointerCancel={handlePointerUpAlpha}
                  className="relative w-full h-6 rounded-full cursor-pointer touch-none border border-border-subtle overflow-hidden focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                  }}
                  role="slider"
                  aria-label="Alpha opacity slider"
                  aria-valuenow={Math.round(alpha * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to right, transparent, ${currentHex})`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-black/30 shadow-md pointer-events-none"
                    style={{
                      left: `${alpha * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Dual Swatch Comparison + Eyedropper Bar */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border-subtle">
              {/* Dual Swatch (Current vs Previous) */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border-subtle rounded-sm overflow-hidden shadow-xs h-14 w-32 shrink-0">
                  {/* Current Active */}
                  <div
                    className="flex-1 h-full flex flex-col justify-end p-1 text-[10px] font-mono font-bold"
                    style={{
                      backgroundColor: currentHex,
                      color: getTextColorForBackground(currentHex),
                    }}
                    title={`Current: ${currentHex}`}
                  >
                    <span>NEW</span>
                  </div>
                  {/* Original / Starting */}
                  <button
                    className="flex-1 h-full flex flex-col justify-end p-1 text-[10px] font-mono font-bold border-l border-black/10"
                    style={{
                      backgroundColor: startingHex,
                      color: getTextColorForBackground(startingHex),
                    }}
                    title={`Original: ${startingHex} (Click to revert)`}
                    onClick={() => handleSelectHex(startingHex)}
                  >
                    <span>ORIG</span>
                  </button>
                </div>

                <div className="flex flex-col">
                  <span className="font-sans text-base font-bold text-text-primary leading-tight">
                    {colorName}
                  </span>
                  <span className="font-mono text-xs text-text-secondary">
                    {currentHex} • {temperature.classification} ({temperature.kelvin}K)
                  </span>
                </div>
              </div>

              {/* Eyedropper tool */}
              {isEyedropperSupported && (
                <KromaButton
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleOpenEyedropper}
                  iconLeft={<Pipette size={16} />}
                >
                  Sample Screen
                </KromaButton>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Multi-Format Values & Direct Editing */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Format Translation Matrix Card */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <h3 className="font-sans text-base font-bold uppercase tracking-tight text-text-primary m-0">
                  Color Value Translations
                </h3>
                <span className="font-mono text-xs text-text-tertiary">Live Bi-directional Sync</span>
              </div>

              {/* HEX Representation */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span className="font-bold">HEX</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText('hex', currentHex, 'HEX')}
                    className="hover:text-text-primary inline-flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'hex' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'hex' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-3 py-2 focus-within:border-[var(--color-primary)]">
                  <span className="font-mono text-xs text-text-tertiary mr-1">#</span>
                  <input
                    type="text"
                    maxLength={6}
                    value={hexInputText.replace('#', '')}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-full bg-transparent font-mono text-sm font-bold text-text-primary outline-none uppercase"
                    placeholder="3D7DFF"
                    aria-label="Hex color value"
                  />
                </div>
              </div>

              {/* RGB Representation */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span className="font-bold">RGB</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText('rgb', `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`, 'RGB')
                    }
                    className="hover:text-text-primary inline-flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'rgb' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'rgb' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['r', 'g', 'b'] as const).map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-2.5 py-1.5 focus-within:border-[var(--color-primary)]"
                    >
                      <span className="font-mono text-xs text-text-tertiary uppercase mr-1.5">
                        {channel}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={255}
                        value={currentRgb[channel]}
                        onChange={(e) => handleRgbChange(channel, e.target.value)}
                        className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label={`RGB ${channel.toUpperCase()} channel`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* HSL Representation */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span className="font-bold">HSL</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText('hsl', `hsl(${currentHsl.h}, ${currentHsl.s}%, ${currentHsl.l}%)`, 'HSL')
                    }
                    className="hover:text-text-primary inline-flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'hsl' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'hsl' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['h', 's', 'l'] as const).map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-2.5 py-1.5 focus-within:border-[var(--color-primary)]"
                    >
                      <span className="font-mono text-xs text-text-tertiary uppercase mr-1.5">
                        {channel}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={channel === 'h' ? 360 : 100}
                        value={currentHsl[channel]}
                        onChange={(e) => handleHslChange(channel, e.target.value)}
                        className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label={`HSL ${channel.toUpperCase()} channel`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* HSV / HSB Representation */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span className="font-bold">HSV / HSB</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText('hsv', `hsv(${Math.round(hsv.h)}, ${hsv.s}%, ${hsv.v}%)`, 'HSV')
                    }
                    className="hover:text-text-primary inline-flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'hsv' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'hsv' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['h', 's', 'v'] as const).map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-2.5 py-1.5 focus-within:border-[var(--color-primary)]"
                    >
                      <span className="font-mono text-xs text-text-tertiary uppercase mr-1.5">
                        {channel}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={channel === 'h' ? 360 : 100}
                        value={channel === 'h' ? Math.round(hsv.h) : hsv[channel]}
                        onChange={(e) => handleHsvChange(channel, e.target.value)}
                        className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label={`HSV ${channel.toUpperCase()} channel`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* OKLCH Representation */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span className="font-bold">OKLCH</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'oklch',
                        `oklch(${Math.round(currentOklch.l * 100)}% ${currentOklch.c} ${Math.round(currentOklch.h)})`,
                        'OKLCH'
                      )
                    }
                    className="hover:text-text-primary inline-flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'oklch' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'oklch' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-2 py-1.5 focus-within:border-[var(--color-primary)]">
                    <span className="font-mono text-xs text-text-tertiary uppercase mr-1">L%</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={Math.round(currentOklch.l * 100)}
                      onChange={(e) => handleOklchChange('l', e.target.value)}
                      className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="OKLCH Lightness percentage"
                    />
                  </div>
                  <div className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-2 py-1.5 focus-within:border-[var(--color-primary)]">
                    <span className="font-mono text-xs text-text-tertiary uppercase mr-1">C</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={0.4}
                      value={currentOklch.c}
                      onChange={(e) => handleOklchChange('c', e.target.value)}
                      className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="OKLCH Chroma"
                    />
                  </div>
                  <div className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-2 py-1.5 focus-within:border-[var(--color-primary)]">
                    <span className="font-mono text-xs text-text-tertiary uppercase mr-1">H°</span>
                    <input
                      type="number"
                      min={0}
                      max={360}
                      value={Math.round(currentOklch.h)}
                      onChange={(e) => handleOklchChange('h', e.target.value)}
                      className="w-full bg-transparent font-mono text-xs font-semibold text-text-primary outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="OKLCH Hue angle"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Export Snippets Card */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-5 shadow-sm flex flex-col gap-3 text-xs font-mono">
              <span className="font-bold text-text-secondary uppercase tracking-wider">
                Code Snippets
              </span>
              <div className="flex flex-col gap-2">
                <div
                  className="flex items-center justify-between p-2.5 rounded-xs bg-surface-2 border border-border-subtle cursor-pointer hover:border-border-medium transition-colors"
                  onClick={() => handleCopyText('css-var', `--color-specimen: ${currentHex};`, 'CSS Variable')}
                >
                  <span className="truncate">--color-specimen: {currentHex};</span>
                  <Copy size={13} className="text-text-tertiary shrink-0 ml-2" />
                </div>
                <div
                  className="flex items-center justify-between p-2.5 rounded-xs bg-surface-2 border border-border-subtle cursor-pointer hover:border-border-medium transition-colors"
                  onClick={() =>
                    handleCopyText(
                      'oklch-css',
                      `color: oklch(${Math.round(currentOklch.l * 100)}% ${currentOklch.c} ${Math.round(currentOklch.h)});`,
                      'OKLCH CSS'
                    )
                  }
                >
                  <span className="truncate">
                    color: oklch({Math.round(currentOklch.l * 100)}% {currentOklch.c} {Math.round(currentOklch.h)});
                  </span>
                  <Copy size={13} className="text-text-tertiary shrink-0 ml-2" />
                </div>
                <div
                  className="flex items-center justify-between p-2.5 rounded-xs bg-surface-2 border border-border-subtle cursor-pointer hover:border-border-medium transition-colors"
                  onClick={() =>
                    handleCopyText(
                      'tailwind-spec',
                      `'${colorName.toLowerCase().replace(/\s+/g, '-')}': '${currentHex}',`,
                      'Tailwind token'
                    )
                  }
                >
                  <span className="truncate">
                    '{colorName.toLowerCase().replace(/\s+/g, '-')}': '{currentHex}',
                  </span>
                  <Copy size={13} className="text-text-tertiary shrink-0 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            SECTION 02 — COLOR SCHEMES & HARMONIES (HTML Color Codes Inspired)
            ═════════════════════════════════════════════════════════ */}
        <section className="flex flex-col gap-6" aria-label="Color Harmonies">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border-subtle pb-4">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                <Sparkles size={13} className="text-[var(--color-primary)]" />
                Algorithmic Colorimetry
              </span>
              <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-text-primary m-0 mt-1">
                Harmonies &amp; Color Schemes
              </h2>
            </div>
            <span className="text-xs text-text-secondary font-mono">
              Click any swatch to load into the picker
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Complementary */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-text-secondary uppercase">Complementary</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      'comp',
                      `${currentHex}, ${harmonies.complementary}`,
                      'Complementary Palette'
                    )
                  }
                  className="text-text-tertiary hover:text-text-primary text-[11px]"
                >
                  Copy Pair
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 h-20">
                {[currentHex, harmonies.complementary].map((h, idx) => (
                  <button
                    key={`comp-${h}-${idx}`}
                    type="button"
                    onClick={() => handleSelectHex(h)}
                    className="h-full rounded-xs border border-white/20 p-2 flex flex-col justify-end text-left transition-transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: h,
                      color: getTextColorForBackground(h),
                    }}
                  >
                    <span className="font-mono text-[10px] font-bold">{idx === 0 ? 'Base' : 'Opposite'}</span>
                    <span className="font-mono text-xs font-bold">{h}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Analogous */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-text-secondary uppercase">Analogous</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      'analogous',
                      `${harmonies.analogous[0]}, ${currentHex}, ${harmonies.analogous[1]}`,
                      'Analogous Palette'
                    )
                  }
                  className="text-text-tertiary hover:text-text-primary text-[11px]"
                >
                  Copy Triad
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 h-20">
                {[harmonies.analogous[0], currentHex, harmonies.analogous[1]].map((h, idx) => (
                  <button
                    key={`ana-${h}-${idx}`}
                    type="button"
                    onClick={() => handleSelectHex(h)}
                    className="h-full rounded-xs border border-white/20 p-2 flex flex-col justify-end text-left transition-transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: h,
                      color: getTextColorForBackground(h),
                    }}
                  >
                    <span className="font-mono text-[10px] font-bold">
                      {idx === 1 ? 'Base' : idx === 0 ? '-30°' : '+30°'}
                    </span>
                    <span className="font-mono text-xs font-bold">{h}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Triadic */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-text-secondary uppercase">Triadic</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      'triadic',
                      `${currentHex}, ${harmonies.triadic[0]}, ${harmonies.triadic[1]}`,
                      'Triadic Palette'
                    )
                  }
                  className="text-text-tertiary hover:text-text-primary text-[11px]"
                >
                  Copy Triad
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 h-20">
                {[currentHex, harmonies.triadic[0], harmonies.triadic[1]].map((h, idx) => (
                  <button
                    key={`tri-${h}-${idx}`}
                    type="button"
                    onClick={() => handleSelectHex(h)}
                    className="h-full rounded-xs border border-white/20 p-2 flex flex-col justify-end text-left transition-transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: h,
                      color: getTextColorForBackground(h),
                    }}
                  >
                    <span className="font-mono text-[10px] font-bold">
                      {idx === 0 ? 'Base' : idx === 1 ? '+120°' : '+240°'}
                    </span>
                    <span className="font-mono text-xs font-bold">{h}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Tetradic */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-text-secondary uppercase">Tetradic (Square)</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      'tetradic',
                      `${currentHex}, ${harmonies.tetradic.join(', ')}`,
                      'Tetradic Palette'
                    )
                  }
                  className="text-text-tertiary hover:text-text-primary text-[11px]"
                >
                  Copy 4 Colors
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-20">
                {[currentHex, ...harmonies.tetradic].map((h, idx) => (
                  <button
                    key={`tet-${h}-${idx}`}
                    type="button"
                    onClick={() => handleSelectHex(h)}
                    className="h-full rounded-xs border border-white/20 p-1.5 flex flex-col justify-end text-left transition-transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: h,
                      color: getTextColorForBackground(h),
                    }}
                  >
                    <span className="font-mono text-[9px] font-bold">
                      {idx === 0 ? 'Base' : `+${idx * 90}°`}
                    </span>
                    <span className="font-mono text-[11px] font-bold">{h}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Split-Complementary */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-text-secondary uppercase">Split Complementary</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      'split',
                      `${currentHex}, ${harmonies.splitComplementary.join(', ')}`,
                      'Split Complementary'
                    )
                  }
                  className="text-text-tertiary hover:text-text-primary text-[11px]"
                >
                  Copy Triad
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 h-20">
                {[currentHex, ...harmonies.splitComplementary].map((h, idx) => (
                  <button
                    key={`split-${h}-${idx}`}
                    type="button"
                    onClick={() => handleSelectHex(h)}
                    className="h-full rounded-xs border border-white/20 p-2 flex flex-col justify-end text-left transition-transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: h,
                      color: getTextColorForBackground(h),
                    }}
                  >
                    <span className="font-mono text-[10px] font-bold">
                      {idx === 0 ? 'Base' : idx === 1 ? '+150°' : '+210°'}
                    </span>
                    <span className="font-mono text-xs font-bold">{h}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Monochromatic */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-text-secondary uppercase">Monochromatic</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      'mono',
                      `${harmonies.monochromatic.join(', ')}, ${currentHex}`,
                      'Monochromatic Palette'
                    )
                  }
                  className="text-text-tertiary hover:text-text-primary text-[11px]"
                >
                  Copy Scale
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5 h-20">
                {[...harmonies.monochromatic.slice(0, 2), currentHex, ...harmonies.monochromatic.slice(2, 4)].map(
                  (h, idx) => (
                    <button
                      key={`mono-${h}-${idx}`}
                      type="button"
                      onClick={() => handleSelectHex(h)}
                      className="h-full rounded-xs border border-white/20 p-1 flex flex-col justify-end text-left transition-transform hover:scale-[1.02]"
                      style={{
                        backgroundColor: h,
                        color: getTextColorForBackground(h),
                      }}
                    >
                      <span className="font-mono text-[9px] font-bold">{idx === 2 ? 'Base' : `L${idx + 1}`}</span>
                      <span className="font-mono text-[10px] font-bold">{h}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════
            SECTION 03 — TINTS, SHADES & TONES SCALES
            ═════════════════════════════════════════════════════════ */}
        <section className="flex flex-col gap-6" aria-label="Tints and Shades">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border-subtle pb-4">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Luminance &amp; Chroma Variations
              </span>
              <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-text-primary m-0 mt-1">
                Tints, Shades &amp; Tones
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tints (lighter variations) */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-4 flex flex-col gap-2">
              <span className="text-xs font-mono font-bold text-text-secondary uppercase">
                Tints (Lightness+)
              </span>
              <div className="grid grid-cols-6 gap-1 h-14">
                {shadesAndTints.tints.map((h, i) => (
                  <button
                    key={`tint-full-${h}-${i}`}
                    type="button"
                    onClick={() => handleSelectHex(h)}
                    className="h-full rounded-xs border border-white/10 hover:scale-105 transition-transform flex flex-col justify-end p-1 text-[9px] font-mono font-semibold"
                    style={{ backgroundColor: h, color: getTextColorForBackground(h) }}
                    title={`Tint ${i + 1}: ${h}`}
                  >
                    <span>{h.substring(1, 4)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shades (darker variations) */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-4 flex flex-col gap-2">
              <span className="text-xs font-mono font-bold text-text-secondary uppercase">
                Shades (Darkness+)
              </span>
              <div className="grid grid-cols-6 gap-1 h-14">
                {shadesAndTints.shades.map((h, i) => (
                  <button
                    key={`shade-full-${h}-${i}`}
                    type="button"
                    onClick={() => handleSelectHex(h)}
                    className="h-full rounded-xs border border-white/10 hover:scale-105 transition-transform flex flex-col justify-end p-1 text-[9px] font-mono font-semibold"
                    style={{ backgroundColor: h, color: getTextColorForBackground(h) }}
                    title={`Shade ${i + 1}: ${h}`}
                  >
                    <span>{h.substring(1, 4)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tones (desaturated variations) */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-4 flex flex-col gap-2">
              <span className="text-xs font-mono font-bold text-text-secondary uppercase">
                Tones (Saturation-)
              </span>
              <div className="grid grid-cols-6 gap-1 h-14">
                {shadesAndTints.tones.map((h, i) => (
                  <button
                    key={`tone-full-${h}-${i}`}
                    type="button"
                    onClick={() => handleSelectHex(h)}
                    className="h-full rounded-xs border border-white/10 hover:scale-105 transition-transform flex flex-col justify-end p-1 text-[9px] font-mono font-semibold"
                    style={{ backgroundColor: h, color: getTextColorForBackground(h) }}
                    title={`Tone ${i + 1}: ${h}`}
                  >
                    <span>{h.substring(1, 4)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════
            SECTION 04 — WCAG 2.2 ACCESSIBILITY & CONTRAST
            ═════════════════════════════════════════════════════════ */}
        <section className="flex flex-col gap-6" aria-label="Accessibility & Contrast">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border-subtle pb-4">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" />
                Compliance Matrix
              </span>
              <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-text-primary m-0 mt-1">
                WCAG 2.2 Accessibility &amp; Contrast
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* White Contrast Card */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-black/20 bg-white" />
                  <span className="font-mono text-xs font-bold text-text-secondary uppercase">
                    Contrast against Pure White (#FFFFFF)
                  </span>
                </div>
                <span className="font-mono text-base font-bold text-text-primary">
                  {accessibility.contrastWithWhite}:1
                </span>
              </div>

              {/* Live Specimen Demonstration */}
              <div
                className="p-4 rounded-xs border border-border-subtle flex items-center justify-between"
                style={{ backgroundColor: currentHex, color: '#FFFFFF' }}
              >
                <span className="font-sans text-sm font-bold">White Specimen Text</span>
                <span className="font-mono text-xs font-semibold">
                  {accessibility.contrastWithWhite >= 4.5 ? 'PASS (Normal Text)' : 'FAIL (< 4.5:1)'}
                </span>
              </div>

              {/* Ratings Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div
                  className={`p-2 rounded-xs border ${
                    accessibility.contrastWithWhite >= 4.5
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-border-subtle bg-surface-2 text-text-tertiary'
                  }`}
                >
                  <span className="font-bold block">AA</span>
                  <span className="text-[10px]">Normal (4.5:1)</span>
                </div>
                <div
                  className={`p-2 rounded-xs border ${
                    accessibility.contrastWithWhite >= 3.0
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-border-subtle bg-surface-2 text-text-tertiary'
                  }`}
                >
                  <span className="font-bold block">AA Large</span>
                  <span className="text-[10px]">Large (3.0:1)</span>
                </div>
                <div
                  className={`p-2 rounded-xs border ${
                    accessibility.contrastWithWhite >= 7.0
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-border-subtle bg-surface-2 text-text-tertiary'
                  }`}
                >
                  <span className="font-bold block">AAA</span>
                  <span className="text-[10px]">Enhanced (7.0:1)</span>
                </div>
              </div>
            </div>

            {/* Black Contrast Card */}
            <div className="bg-surface-1 border border-border-subtle rounded-md p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-black" />
                  <span className="font-mono text-xs font-bold text-text-secondary uppercase">
                    Contrast against Pure Black (#000000)
                  </span>
                </div>
                <span className="font-mono text-base font-bold text-text-primary">
                  {accessibility.contrastWithBlack}:1
                </span>
              </div>

              {/* Live Specimen Demonstration */}
              <div
                className="p-4 rounded-xs border border-border-subtle flex items-center justify-between"
                style={{ backgroundColor: currentHex, color: '#000000' }}
              >
                <span className="font-sans text-sm font-bold">Black Specimen Text</span>
                <span className="font-mono text-xs font-semibold">
                  {accessibility.contrastWithBlack >= 4.5 ? 'PASS (Normal Text)' : 'FAIL (< 4.5:1)'}
                </span>
              </div>

              {/* Ratings Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div
                  className={`p-2 rounded-xs border ${
                    accessibility.contrastWithBlack >= 4.5
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-border-subtle bg-surface-2 text-text-tertiary'
                  }`}
                >
                  <span className="font-bold block">AA</span>
                  <span className="text-[10px]">Normal (4.5:1)</span>
                </div>
                <div
                  className={`p-2 rounded-xs border ${
                    accessibility.contrastWithBlack >= 3.0
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-border-subtle bg-surface-2 text-text-tertiary'
                  }`}
                >
                  <span className="font-bold block">AA Large</span>
                  <span className="text-[10px]">Large (3.0:1)</span>
                </div>
                <div
                  className={`p-2 rounded-xs border ${
                    accessibility.contrastWithBlack >= 7.0
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-border-subtle bg-surface-2 text-text-tertiary'
                  }`}
                >
                  <span className="font-bold block">AAA</span>
                  <span className="text-[10px]">Enhanced (7.0:1)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Roles Bar */}
          <div className="bg-surface-1 border border-border-subtle rounded-md p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <span className="text-text-secondary">
              Recommended Best Foreground:{' '}
              <strong className="text-text-primary">
                {getTextColorForBackground(currentHex)} (Ratio {accessibility.bestContrast}:1)
              </strong>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <KromaButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onNavigate({
                    path: 'contrast-checker',
                    fg: getTextColorForBackground(currentHex),
                    bg: currentHex,
                  })
                }
                iconRight={<ExternalLink size={12} />}
              >
                Open in Contrast Checker
              </KromaButton>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════
            SECTION 05 — RELATED KROMA CREATIVE TOOLS
            ═════════════════════════════════════════════════════════ */}
        <section className="bg-surface-1 border border-border-subtle rounded-md p-6 flex flex-col gap-4">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Integrated Design Workflows
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-xs bg-surface-2 border border-border-subtle flex flex-col justify-between gap-3 cursor-pointer hover:border-border-medium transition-all"
              onClick={() => onNavigate({ path: 'ramps', b: currentHex.replace('#', '') })}
            >
              <div>
                <span className="font-sans text-sm font-bold text-text-primary block">Ramps Studio</span>
                <span className="text-xs text-text-secondary">
                  Generate an 11-step perceptual OKLCH design scale from {currentHex}.
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--color-primary)] inline-flex items-center gap-1 font-semibold">
                Generate Ramps <ArrowRight size={12} />
              </span>
            </div>

            <div
              className="p-4 rounded-xs bg-surface-2 border border-border-subtle flex flex-col justify-between gap-3 cursor-pointer hover:border-border-medium transition-all"
              onClick={() => onNavigate({ path: 'color-name-finder', hex: currentHex.replace('#', '') })}
            >
              <div>
                <span className="font-sans text-sm font-bold text-text-primary block">Color Name Finder</span>
                <span className="text-xs text-text-secondary">
                  Find CIEDE2000 nearest named pigment and history for {currentHex}.
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--color-primary)] inline-flex items-center gap-1 font-semibold">
                Find Names <ArrowRight size={12} />
              </span>
            </div>

            <div
              className="p-4 rounded-xs bg-surface-2 border border-border-subtle flex flex-col justify-between gap-3 cursor-pointer hover:border-border-medium transition-all"
              onClick={() => onNavigate({ path: 'brand-kit', paletteSlug: currentHex.replace('#', '') })}
            >
              <div>
                <span className="font-sans text-sm font-bold text-text-primary block">Brand Kit Studio</span>
                <span className="text-xs text-text-secondary">
                  Build a complete brand manual and token book with {colorName}.
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--color-primary)] inline-flex items-center gap-1 font-semibold">
                Build Brand Kit <ArrowRight size={12} />
              </span>
            </div>

            <div
              className="p-4 rounded-xs bg-surface-2 border border-border-subtle flex flex-col justify-between gap-3 cursor-pointer hover:border-border-medium transition-all"
              onClick={() => onNavigate({ path: 'mesh', p: currentHex.replace('#', '') })}
            >
              <div>
                <span className="font-sans text-sm font-bold text-text-primary block">Mesh Gradient Studio</span>
                <span className="text-xs text-text-secondary">
                  Create multi-point radial mesh canvases centered around {currentHex}.
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--color-primary)] inline-flex items-center gap-1 font-semibold">
                Create Mesh <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
