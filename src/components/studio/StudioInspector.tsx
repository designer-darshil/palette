import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
    <div className="studio-tabbed-inspector">
      {/* Tab Bar */}
      <div className="studio-inspector-tabs" role="tablist" aria-label="Studio inspector tabs">
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`studio-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`studio-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`studio-inspector-tab ${isActive ? 'active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        className="studio-inspector-content"
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
    <div className="studio-section">
      <button
        type="button"
        id={`section-header-${sectionId}`}
        onClick={() => setIsOpen(!isOpen)}
        className="studio-section-header"
        aria-expanded={isOpen}
        aria-controls={`section-body-${sectionId}`}
      >
        <div className="flex items-center gap-2">
          <span className="studio-section-title">{title}</span>
          {badge && <span className="studio-section-badge">{badge}</span>}
        </div>
        <ChevronDown
          size={12}
          className={`studio-section-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id={`section-body-${sectionId}`}
          role="region"
          aria-labelledby={`section-header-${sectionId}`}
          className="studio-section-body"
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
    <div className="studio-control-row">
      <div className="studio-control-label-row">
        <label className="studio-control-label">{label}</label>
        {action || (sublabel && <span className="studio-control-sublabel">{sublabel}</span>)}
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
    <div className="studio-slider-row">
      <div className="studio-slider-track-wrapper">
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
      <div className="studio-slider-value">
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
          className="studio-slider-number-input"
        />
        {unit && <span className="studio-slider-unit">{unit}</span>}
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
    <div className="studio-segmented" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`studio-segmented-btn ${isSelected ? 'active' : ''}`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
