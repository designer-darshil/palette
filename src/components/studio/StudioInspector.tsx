import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface StudioInspectorSectionProps {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const StudioInspectorSection: React.FC<StudioInspectorSectionProps> = ({
  title,
  badge,
  defaultOpen = true,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--border-subtle)] last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            {title}
          </span>
          {badge && (
            <span className="font-mono text-[9px] px-1.5 py-0.2 bg-[var(--bg-surface-3)] text-[var(--text-secondary)] rounded-xs">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={12}
          className={`text-[var(--text-tertiary)] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 flex flex-col gap-2.5 animate-in fade-in duration-100">
          {children}
        </div>
      )}
    </div>
  );
};

interface StudioControlRowProps {
  label: string;
  sublabel?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const StudioControlRow: React.FC<StudioControlRowProps> = ({
  label,
  sublabel,
  action,
  children,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="font-mono text-[11px] font-semibold text-[var(--text-secondary)]">
          {label}
        </label>
        {action || (sublabel && (
          <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
            {sublabel}
          </span>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
};

interface StudioSliderInputProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const StudioSliderInput: React.FC<StudioSliderInputProps> = ({
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="studio-slider flex-1 h-1 bg-[var(--bg-surface-3)] rounded-xs appearance-none cursor-pointer"
      />
      <div className="flex items-center bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs px-1.5 py-0.5 w-14 justify-end">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onChange(val);
          }}
          className="w-full bg-transparent font-mono text-[11px] text-[var(--text-primary)] text-right outline-none"
        />
        {unit && <span className="font-mono text-[10px] text-[var(--text-tertiary)] ml-0.5">{unit}</span>}
      </div>
    </div>
  );
};

interface StudioSegmentedProps<T extends string> {
  options: { id: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (val: T) => void;
}

export function StudioSegmented<T extends string>({ options, value, onChange }: StudioSegmentedProps<T>) {
  return (
    <div className="grid bg-[var(--bg-surface-2)] p-0.5 rounded-xs border border-[var(--border-subtle)]" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`py-1 px-1.5 rounded-xs font-mono text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              isSelected
                ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
