import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  RotateCcw,
  Sparkles,
  Share2,
  Download,
  PanelRight,
  ChevronDown,
  Check,
} from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

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
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onReset?: () => void;
  onRandomize?: () => void;
  onShareUrl?: () => void;
  exportOptions?: StudioExportOption[];
  centerControls?: React.ReactNode;
  isInspectorOpen?: boolean;
  toggleInspector?: () => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  studioName,
  documentTitle,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onReset,
  onRandomize,
  onShareUrl,
  exportOptions = [],
  centerControls,
  isInspectorOpen = true,
  toggleInspector,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportOpen]);

  return (
    <div className="w-full max-w-full min-w-0 h-10 bg-surface-1 border-b border-border-subtle px-2.5 flex items-center justify-between gap-1.5 z-30 shrink-0">
      {/* Left: Studio Identity + Undo/Redo */}
      <div className="flex items-center gap-1.5 min-w-0 shrink overflow-hidden">
        <h1 className="text-xs sm:text-[13px] font-bold text-text-primary tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] sm:max-w-none">
          {studioName}
        </h1>

        {documentTitle && (
          <>
            <span className="hidden sm:inline text-text-tertiary text-xs shrink-0">/</span>
            <span className="hidden sm:inline font-mono text-xs text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
              {documentTitle}
            </span>
          </>
        )}

        {(onUndo || onRedo) && (
          <div className="hidden sm:flex items-center gap-0.5 ml-0.5 pl-1.5 border-l border-border-subtle shrink-0">
            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="w-7 h-7 min-h-[28px] p-0"
              title="Undo (⌘Z)"
              aria-label="Undo"
            >
              <Undo2 size={14} />
            </KromaButton>
            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="w-7 h-7 min-h-[28px] p-0"
              title="Redo (⌘⇧Z)"
              aria-label="Redo"
            >
              <Redo2 size={14} />
            </KromaButton>
          </div>
        )}
      </div>

      {/* Center: Contextual Tools */}
      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
        {centerControls}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        {onReset && (
          <KromaButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="w-7 h-7 min-h-[28px] p-0 hidden min-[1200px]:flex"
            title="Reset to defaults"
            aria-label="Reset to defaults"
          >
            <RotateCcw size={14} />
          </KromaButton>
        )}

        {onShareUrl && (
          <KromaButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              onShareUrl();
              setHasCopiedShare(true);
              setTimeout(() => setHasCopiedShare(false), 2000);
            }}
            className="w-7 h-7 min-h-[28px] p-0 hidden min-[1200px]:flex"
            title="Copy shareable link"
            aria-label="Copy shareable link"
          >
            {hasCopiedShare ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          </KromaButton>
        )}

        {onRandomize && (
          <KromaButton
            type="button"
            variant="subtle"
            size="sm"
            onClick={onRandomize}
            className="hidden min-[768px]:inline-flex min-h-[30px] px-2.5 py-1 text-xs"
            title="Randomize (R)"
            iconLeft={<Sparkles size={13} className="shrink-0" />}
          >
            <span className="hidden min-[1024px]:inline">Randomize</span>
          </KromaButton>
        )}

        {exportOptions.length > 0 && (
          <div className="relative" ref={exportMenuRef}>
            <KromaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExportOpen(!exportOpen)}
              className="min-h-[30px] px-2.5 py-1 text-xs"
              aria-expanded={exportOpen}
              aria-haspopup="true"
              iconLeft={<Download size={13} className="shrink-0" />}
              iconRight={<ChevronDown size={10} className={`hidden sm:inline-block transition-transform duration-150 shrink-0 ${exportOpen ? 'rotate-180' : ''}`} />}
            >
              <span>Export</span>
            </KromaButton>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-[min(300px,calc(100vw-24px))] max-w-[calc(100vw-24px)] bg-surface-1 border border-border-strong rounded-sm shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)] p-1 z-[100] flex flex-col gap-0.5">
                <div className="py-1.5 px-2.5 pb-1 font-mono text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                  Export Format
                </div>
                {exportOptions.map((opt) => (
                  <KromaButton
                    key={opt.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      opt.onExport();
                      setExportOpen(false);
                    }}
                    className="w-full flex items-center justify-between text-left min-h-[36px] px-3 py-2 rounded-xs normal-case font-normal hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.icon && <span className="text-text-secondary shrink-0">{opt.icon}</span>}
                      <span className="font-semibold truncate text-[13.5px] text-text-primary">{opt.label}</span>
                    </div>
                    {opt.sublabel && (
                      <span className="font-mono text-xs text-text-tertiary shrink-0">{opt.sublabel}</span>
                    )}
                  </KromaButton>
                ))}
              </div>
            )}
          </div>
        )}

        {toggleInspector && (
          <KromaButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleInspector}
            className={`w-7 h-7 min-h-[28px] p-0 ${isInspectorOpen ? 'text-text-primary' : 'text-text-secondary'}`}
            title="Toggle inspector"
            aria-label="Toggle inspector panel"
          >
            <PanelRight size={14} />
          </KromaButton>
        )}
      </div>
    </div>
  );
};
