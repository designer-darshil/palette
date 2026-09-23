import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CustomColorPicker } from './CustomColorPicker';

export interface ColorSwatchPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showLabel?: boolean;
  showAlpha?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  swatchClassName?: string;
  placement?: 'auto' | 'bottom' | 'top';
}

export const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({
  value,
  onChange,
  label,
  showLabel = true,
  showAlpha = false,
  size = 'md',
  disabled = false,
  className = '',
  swatchClassName = '',
  placement = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Normalize color value with hash prefix
  const cleanHex = React.useMemo(() => {
    if (!value) return '#BFA3F0';
    let c = value.trim();
    if (!c.startsWith('#')) c = `#${c}`;
    return c.toUpperCase();
  }, [value]);

  // Compute popover position avoiding viewport boundaries
  const updatePopoverPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const pickerWidth = 248;
    const pickerHeight = 350; // estimated maximum height
    const margin = 10;

    let left = rect.left;
    // Prevent right edge clipping
    if (left + pickerWidth > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - pickerWidth - margin);
    }
    // Prevent left edge clipping
    if (left < margin) {
      left = margin;
    }

    let top = rect.bottom + 6;
    // Determine if popover should flip to top
    if (placement === 'top' || (placement === 'auto' && rect.bottom + pickerHeight > window.innerHeight - margin && rect.top > pickerHeight)) {
      top = rect.top - pickerHeight - 6;
    }

    setPopoverCoords({ top, left });
  }, [placement]);

  // Open and compute position
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (!isOpen) {
      updatePopoverPosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && triggerRef.current.contains(target) ||
        popoverRef.current && popoverRef.current.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        updatePopoverPosition();
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePopoverPosition]);

  // Dimension sizes for trigger swatch
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  }[size];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`inline-flex items-center gap-2 p-1 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-xs transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
          isOpen ? 'ring-1 ring-[var(--color-primary)] border-[var(--color-primary)]' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        title={label || `Color: ${cleanHex}`}
        aria-label={label || `Pick color (current: ${cleanHex})`}
        aria-expanded={isOpen}
      >
        {/* Swatch Specimen Dot / Box */}
        <span
          className={`${sizeClasses} rounded-xs border border-white/20 shadow-xs flex-shrink-0 relative overflow-hidden transition-transform group-hover:scale-105 ${swatchClassName}`}
          style={{ backgroundColor: cleanHex }}
        />

        {/* Optional Hex Label Text */}
        {showLabel && (
          <span className="font-mono text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider pr-1">
            {cleanHex}
          </span>
        )}
      </button>

      {/* Popover rendered via Portal to escape clipping ancestors */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[99999] animate-fade-in"
            style={{
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
            }}
          >
            <CustomColorPicker
              color={cleanHex}
              onChange={onChange}
              showAlpha={showAlpha}
              onClose={() => setIsOpen(false)}
            />
          </div>,
          document.body
        )}
    </>
  );
};
