import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { hexToHsv, hsvToHex, hexToRgb, hexToHsl } from '../utils/colorUtils';
import { findClosestColorName } from '../utils/paletteGenerator';

interface ColorPickerModalProps {
  isOpen: boolean;
  initialColor?: string;
  paletteColors?: string[];
  title?: string;
  onApply: (hex: string) => void;
  onClose: () => void;
}

const RECENT_STORAGE_KEY = 'kroma_picker_recent_colors';
const DEFAULT_RECENT = ['#E9C46A', '#10288C', '#5739E6', '#0F1117', '#1A1D27', '#F8FAFC', '#10B981', '#EF4444'];

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  initialColor = '#AEBAC7',
  paletteColors = [],
  title = 'SELECT COLOR',
  onApply,
  onClose,
}) => {
  const [hsv, setHsv] = useState<{ h: number; s: number; v: number }>(() => {
    return hexToHsv(initialColor);
  });
  const [hexInput, setHexInput] = useState<string>(() => {
    const clean = initialColor.startsWith('#') ? initialColor : `#${initialColor}`;
    return clean.toUpperCase();
  });
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_RECENT;
  });

  const satValAreaRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSatVal = useRef<boolean>(false);

  // Sync state when initialColor changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const clean = initialColor.startsWith('#') ? initialColor : `#${initialColor}`;
      const valid = /^#[0-9A-F]{6}$/i.test(clean) ? clean.toUpperCase() : '#AEBAC7';
      setHsv(hexToHsv(valid));
      setHexInput(valid);
    }
  }, [isOpen, initialColor]);

  // Derived current HEX from HSV
  const currentHex = useMemoHex(hsv.h, hsv.s, hsv.v);

  // Keep hexInput in sync with HSV adjustments
  useEffect(() => {
    setHexInput(currentHex);
  }, [currentHex]);

  // Handle Saturation/Value Dragging
  const updateSatValFromCoords = useCallback((clientX: number, clientY: number) => {
    if (!satValAreaRef.current) return;
    const rect = satValAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - y / rect.height) * 100);

    setHsv((prev) => ({ ...prev, s, v }));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingSatVal.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSatValFromCoords(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSatVal.current) {
      updateSatValFromCoords(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSatVal.current) {
      isDraggingSatVal.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Handle Hue slider change
  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = parseInt(e.target.value, 10);
    setHsv((prev) => ({ ...prev, h }));
  };

  // Handle direct text HEX input
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('#')) val = `#${val}`;
    setHexInput(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      setHsv(hexToHsv(val));
    }
  };

  // Swatch click
  const handleSelectSwatch = (hex: string) => {
    const clean = hex.startsWith('#') ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
    if (/^#[0-9A-F]{6}$/i.test(clean)) {
      setHsv(hexToHsv(clean));
      setHexInput(clean);
    }
  };

  // Apply action
  const handleApply = () => {
    onApply(currentHex);
    // Update recents
    try {
      const updated = [currentHex, ...recentColors.filter((c) => c.toUpperCase() !== currentHex.toUpperCase())].slice(0, 10);
      setRecentColors(updated);
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    onClose();
  };

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Pure hue background for 2D area
  const pureHueHex = hsvToHex(hsv.h, 100, 100);
  const colorName = findClosestColorName(currentHex);

  // Combined swatch list from palette and recent colors
  const activeSwatches = Array.from(
    new Set([...paletteColors.filter((c) => /^#[0-9A-F]{6}$/i.test(c)), ...recentColors])
  ).slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-md shadow-2xl overflow-hidden flex flex-col gap-4 p-4 sm:p-5 animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
          <span className="font-mono text-xs font-bold text-[var(--accent-gold)] tracking-wider uppercase">
            {title}
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] rounded-xs transition-colors"
            aria-label="Close color selector"
          >
            <X size={14} />
          </button>
        </div>

        {/* 2D Saturation / Value Color Area */}
        <div
          ref={satValAreaRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full h-44 sm:h-48 rounded-xs cursor-crosshair select-none touch-none border border-[var(--border-medium)] overflow-hidden shadow-inner"
          style={{
            backgroundColor: pureHueHex,
            backgroundImage: `
              linear-gradient(to top, #000000, transparent),
              linear-gradient(to right, #FFFFFF, transparent)
            `,
          }}
        >
          {/* Draggable Indicator Pointer (●) */}
          <div
            className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
              backgroundColor: currentHex,
            }}
          />
        </div>

        {/* Hue Slider & Swatch Row */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[var(--text-tertiary)] uppercase font-semibold">
                HUE SPECTRUM
              </span>
              <span className="font-mono text-[9px] text-[var(--text-secondary)]">
                {hsv.h}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={hsv.h}
              onChange={handleHueChange}
              className="w-full h-3 rounded-full appearance-none cursor-pointer border border-[var(--border-subtle)] focus:outline-none"
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
            />
          </div>

          {/* Color Preview Swatch */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className="w-10 h-10 rounded-xs border border-[var(--border-strong)] shadow-inner"
              style={{ backgroundColor: currentHex }}
              title={`Active Color: ${currentHex}`}
            />
          </div>
        </div>

        {/* HEX Input & Name */}
        <div className="flex flex-col gap-1.5 p-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] text-[var(--text-secondary)] font-bold uppercase">
              HEX
            </label>
            <span className="font-mono text-[10px] text-[var(--text-tertiary)] truncate max-w-[150px]">
              {colorName}
            </span>
          </div>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            maxLength={7}
            className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xs px-2.5 py-1.5 font-mono text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
            placeholder="#AEBAC7"
          />
        </div>

        {/* Recent / Palette Swatches */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] text-[var(--text-tertiary)] uppercase font-semibold">
            RECENT / PALETTE
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeSwatches.map((hex, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSwatch(hex)}
                className={`w-6 h-6 rounded-xs border transition-transform hover:scale-110 ${
                  currentHex.toUpperCase() === hex.toUpperCase()
                    ? 'border-[var(--accent-gold)] ring-1 ring-[var(--accent-gold)]'
                    : 'border-[var(--border-medium)]'
                }`}
                style={{ backgroundColor: hex }}
                title={`Select ${hex}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 bg-[var(--accent-gold)] hover:opacity-90 text-black rounded-xs text-xs font-bold uppercase tracking-wider transition-opacity shadow-sm flex items-center gap-1"
          >
            <Check size={13} />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper hook for memoized hex from HSV
function useMemoHex(h: number, s: number, v: number): string {
  return React.useMemo(() => hsvToHex(h, s, v), [h, s, v]);
}
