import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { CustomColorPicker } from './common/CustomColorPicker';

export interface ColorPickerModalProps {
  isOpen: boolean;
  initialColor?: string;
  paletteColors?: string[];
  title?: string;
  onApply: (hex: string) => void;
  onClose: () => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  initialColor = '#BFA3F0',
  title = 'SELECT COLOR',
  onApply,
  onClose,
}) => {
  const [currentColor, setCurrentColor] = React.useState<string>(initialColor);

  useEffect(() => {
    if (isOpen) {
      setCurrentColor(initialColor);
    }
  }, [isOpen, initialColor]);

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

  const handleApply = () => {
    onApply(currentColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md shadow-2xl overflow-hidden flex flex-col gap-3 p-4 animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          width: '280px',
          maxWidth: '100%',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
          <span className="font-mono text-xs font-bold text-[var(--color-primary-text)] tracking-wider uppercase">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] rounded-xs transition-colors cursor-pointer"
            aria-label="Close color selector"
          >
            <X size={14} />
          </button>
        </div>

        {/* Custom Color Picker Core */}
        <CustomColorPicker
          color={currentColor}
          onChange={(newHex) => setCurrentColor(newHex)}
          showAlpha={false}
          showRecent={true}
          showFormatSwitcher={true}
          className="border-none shadow-none p-0 w-full"
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="btn-studio-primary"
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            <Check size={13} />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
