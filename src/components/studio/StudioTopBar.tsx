import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  Share2,
  Download,
  Check,
  Undo2,
  Redo2,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

export interface StudioExportOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  onExport: () => void;
}

interface StudioTopBarProps {
  studioName: string;
  documentTitle?: string;
  badge?: string;
  onRandomize?: () => void;
  onReset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onShareUrl?: () => void;
  hasCopiedShare?: boolean;
  exportOptions?: StudioExportOption[];
  activeToolMode?: string;
  onToolModeChange?: (mode: string) => void;
  toolModes?: { id: string; label: string; icon?: React.ReactNode }[];
  centerControls?: React.ReactNode;
  toggleInspector?: () => void;
  isInspectorOpen?: boolean;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  studioName,
  documentTitle,
  badge,
  onRandomize,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onShareUrl,
  hasCopiedShare = false,
  exportOptions = [],
  centerControls,
  toggleInspector,
  isInspectorOpen = true,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="studio-topbar w-full h-12 bg-[var(--bg-surface-1)] border-b border-[var(--border-subtle)] px-3 sm:px-4 flex items-center justify-between gap-3 z-30 flex-shrink-0">
      {/* Left: Studio Identity & Document Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-1.5 py-0.5 rounded-xs">
            {badge || 'Studio'}
          </span>
          <h1 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate tracking-tight">
            {studioName}
          </h1>
        </div>

        {documentTitle && (
          <>
            <span className="text-[var(--text-tertiary)] text-xs hidden sm:inline">/</span>
            <span className="font-mono text-xs text-[var(--text-secondary)] hidden sm:inline truncate max-w-[140px]">
              {documentTitle}
            </span>
          </>
        )}

        {/* Undo / Redo controls */}
        {(onUndo || onRedo) && (
          <div className="hidden sm:flex items-center gap-0.5 ml-2 pl-2 border-l border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo (⌘Z)"
              aria-label="Undo"
            >
              <Undo2 size={13} />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo (⌘⇧Z)"
              aria-label="Redo"
            >
              <Redo2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Center: Contextual Tools / Mode Switchers */}
      <div className="flex items-center gap-2 min-w-0">
        {centerControls}
      </div>

      {/* Right: Quick Actions & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Reset */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset parameters to default"
          >
            <RotateCcw size={12} />
            <span className="hidden md:inline">Reset</span>
          </button>
        )}

        {/* Share URL */}
        {onShareUrl && (
          <button
            type="button"
            onClick={onShareUrl}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xs bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy shareable permalink"
          >
            {hasCopiedShare ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
            <span className="hidden sm:inline">{hasCopiedShare ? 'Copied' : 'Share'}</span>
          </button>
        )}

        {/* Randomize Action (#BFA3F0 Primary Accent) */}
        {onRandomize && (
          <button
            type="button"
            onClick={onRandomize}
            className="btn-studio-primary px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Generate random harmonious configuration (R)"
          >
            <Sparkles size={13} />
            <span>Randomize</span>
          </button>
        )}

        {/* Export Popover Dropdown */}
        {exportOptions.length > 0 && (
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setExportOpen(!exportOpen)}
              className="px-2.5 py-1 rounded-xs bg-[var(--bg-surface-3)] hover:bg-[var(--border-active)] text-[var(--text-primary)] border border-[var(--border-medium)] text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              aria-expanded={exportOpen}
              aria-haspopup="true"
            >
              <Download size={13} />
              <span>Export</span>
              <ChevronDown size={11} className={`transition-transform duration-150 ${exportOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-xs shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 font-mono text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Select Export Format
                </div>
                {exportOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      opt.onExport();
                      setExportOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xs text-left hover:bg-[var(--bg-surface-2)] text-[var(--text-primary)] transition-colors text-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon && <span className="text-[var(--text-secondary)] group-hover:text-[var(--color-primary)]">{opt.icon}</span>}
                      <span className="font-semibold">{opt.label}</span>
                    </div>
                    {opt.sublabel && (
                      <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{opt.sublabel}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Toggle Inspector on Mobile */}
        {toggleInspector && (
          <button
            type="button"
            onClick={toggleInspector}
            className={`p-1.5 rounded-xs border text-xs lg:hidden transition-colors ${
              isInspectorOpen
                ? 'bg-[var(--color-primary-subtle)] border-[var(--color-primary-border)] text-[var(--color-primary)]'
                : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
            }`}
            title="Toggle inspector panel"
            aria-label="Toggle inspector panel"
          >
            <SlidersHorizontal size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
