import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  Share2,
  Download,
  Check,
  Undo2,
  Redo2,
  PanelRight,
  ChevronDown,
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
  onRandomize?: () => void;
  onReset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onShareUrl?: () => void;
  hasCopiedShare?: boolean;
  exportOptions?: StudioExportOption[];
  centerControls?: React.ReactNode;
  toggleInspector?: () => void;
  isInspectorOpen?: boolean;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  studioName,
  documentTitle,
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
    <div className="studio-topbar">
      {/* Left: Studio Identity + Undo/Redo */}
      <div className="studio-topbar-left">
        <h1 className="studio-topbar-title">{studioName}</h1>

        {documentTitle && (
          <>
            <span className="studio-topbar-sep">/</span>
            <span className="studio-topbar-doc">{documentTitle}</span>
          </>
        )}

        {(onUndo || onRedo) && (
          <div className="studio-topbar-history">
            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="studio-topbar-icon-btn w-7 h-7 min-h-[28px] p-0"
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
              className="studio-topbar-icon-btn w-7 h-7 min-h-[28px] p-0"
              title="Redo (⌘⇧Z)"
              aria-label="Redo"
            >
              <Redo2 size={14} />
            </KromaButton>
          </div>
        )}
      </div>

      {/* Center: Contextual Tools */}
      <div className="studio-topbar-center">
        {centerControls}
      </div>

      {/* Right: Actions */}
      <div className="studio-topbar-right">
        {onReset && (
          <KromaButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="studio-topbar-icon-btn w-7 h-7 min-h-[28px] p-0 hidden min-[1200px]:flex"
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
            onClick={onShareUrl}
            className="studio-topbar-icon-btn w-7 h-7 min-h-[28px] p-0 hidden min-[1200px]:flex"
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
            className="studio-topbar-accent-btn hidden min-[768px]:inline-flex min-h-[30px] px-2.5 py-1 text-xs"
            title="Randomize (R)"
            iconLeft={<Sparkles size={13} className="flex-shrink-0" />}
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
              className="studio-topbar-export-btn min-h-[30px] px-2.5 py-1 text-xs"
              aria-expanded={exportOpen}
              aria-haspopup="true"
              iconLeft={<Download size={13} className="flex-shrink-0" />}
              iconRight={<ChevronDown size={10} className={`hidden sm:inline-block transition-transform duration-150 flex-shrink-0 ${exportOpen ? 'rotate-180' : ''}`} />}
            >
              <span className="studio-btn-text">Export</span>
            </KromaButton>

            {exportOpen && (
              <div className="studio-export-menu">
                <div className="studio-export-menu-header">Export Format</div>
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
                    className="studio-export-menu-item w-full flex items-center justify-between text-left min-h-[36px] px-3 py-2 rounded-xs normal-case font-normal"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.icon && <span className="studio-export-menu-icon flex-shrink-0">{opt.icon}</span>}
                      <span className="font-semibold truncate">{opt.label}</span>
                    </div>
                    {opt.sublabel && (
                      <span className="studio-export-menu-sublabel flex-shrink-0">{opt.sublabel}</span>
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
            className={`studio-topbar-icon-btn studio-topbar-inspector-toggle w-7 h-7 min-h-[28px] p-0 ${isInspectorOpen ? 'active' : ''}`}
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
