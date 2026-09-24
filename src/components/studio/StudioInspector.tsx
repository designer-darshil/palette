import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

/* ─── Inspector Tab System ─── */

export interface InspectorTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface StudioTabbedInspectorProps {
  title?: string;
  tabs: InspectorTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

export const StudioTabbedInspector: React.FC<StudioTabbedInspectorProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      onTabChange(tabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onTabChange(tabs[prevIndex].id);
    }
  };

  return (
    <div className="flex flex-col h-full min-w-0 w-full">
      {/* Tab Bar */}
      <div className="flex items-center gap-0 px-1 border-b border-border-subtle bg-surface-1 overflow-x-auto shrink-0 min-w-0 w-full scrollbar-none" role="tablist" aria-label="Studio inspector tabs">
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <KromaButton
              key={tab.id}
              type="button"
              role="tab"
              id={`studio-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`studio-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              variant={isActive ? 'filled' : 'ghost'}
              size="sm"
              className={`min-h-[30px] px-2.5 py-1 text-xs flex items-center gap-1 font-semibold whitespace-nowrap cursor-pointer border-b-2 -mb-px shrink-0 transition-colors ${
                isActive
                  ? 'text-primary border-primary'
                  : 'text-text-tertiary border-transparent hover:text-text-secondary'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </KromaButton>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full"
        role="tabpanel"
        id={`studio-panel-${activeTab}`}
        aria-labelledby={`studio-tab-${activeTab}`}
      >
        {children}
      </div>
    </div>
  );
};

/* ─── Section ─── */

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
  const sectionId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="border-b border-border-subtle last:border-b-0 min-w-0 w-full">
      <KromaButton
        type="button"
        variant="ghost"
        size="sm"
        id={`section-header-${sectionId}`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left min-h-[34px] px-3 py-2 rounded-none font-normal bg-transparent hover:bg-surface-2 transition-colors cursor-pointer min-w-0"
        aria-expanded={isOpen}
        aria-controls={`section-body-${sectionId}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[12.5px] font-semibold text-text-secondary tracking-normal whitespace-nowrap truncate">{title}</span>
          {badge && <span className="font-mono text-xs px-1.5 py-px bg-surface-2 text-text-tertiary rounded-xs shrink-0">{badge}</span>}
        </div>
        <ChevronDown
          size={12}
          className={`text-text-tertiary shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </KromaButton>

      {isOpen && (
        <div
          id={`section-body-${sectionId}`}
          role="region"
          aria-labelledby={`section-header-${sectionId}`}
          className="px-3 pt-1 pb-3 flex flex-col gap-2.5 min-w-0 w-full"
        >
          {children}
        </div>
      )}
    </div>
  );
};

/* ─── Control Row ─── */

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
        <label className="text-[12.5px] font-semibold text-text-secondary">{label}</label>
        {action || (sublabel && <span className="font-mono text-xs text-text-tertiary">{sublabel}</span>)}
      </div>
      <div>{children}</div>
    </div>
  );
};

/* ─── Slider Input ─── */

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
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="studio-range-input"
          style={{ '--slider-progress': `${percentage}%` } as React.CSSProperties}
        />
      </div>
      <div className="flex items-center bg-surface-2 border border-border-subtle rounded-xs px-1.5 py-0.5 w-14 justify-end">
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
          className="studio-slider-number-input w-full bg-transparent font-mono text-xs text-text-primary text-right outline-none border-none"
        />
        {unit && <span className="font-mono text-xs text-text-tertiary ml-0.5">{unit}</span>}
      </div>
    </div>
  );
};

/* ─── Segmented Control ─── */

interface StudioSegmentedProps<T extends string> {
  options: { id: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (val: T) => void;
}

export function StudioSegmented<T extends string>({ options, value, onChange }: StudioSegmentedProps<T>) {
  return (
    <div className="grid bg-surface-2 p-0.5 rounded-sm gap-0.5" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <KromaButton
            key={opt.id}
            type="button"
            variant={isSelected ? 'filled' : 'ghost'}
            size="sm"
            onClick={() => onChange(opt.id)}
            className={`min-h-[30px] px-2 py-1 text-xs ${isSelected ? 'active' : ''}`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </KromaButton>
        );
      })}
    </div>
  );
}
