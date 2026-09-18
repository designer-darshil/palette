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
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="studio-topbar-icon-btn"
              title="Undo (⌘Z)"
              aria-label="Undo"
            >
              <Undo2 size={14} />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="studio-topbar-icon-btn"
              title="Redo (⌘⇧Z)"
              aria-label="Redo"
            >
              <Redo2 size={14} />
            </button>
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
          <button
            type="button"
            onClick={onReset}
            className="studio-topbar-icon-btn"
            title="Reset to defaults"
          >
            <RotateCcw size={14} />
          </button>
        )}

        {onShareUrl && (
          <button
            type="button"
            onClick={onShareUrl}
            className="studio-topbar-icon-btn"
            title="Copy shareable link"
          >
            {hasCopiedShare ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          </button>
        )}

        {onRandomize && (
          <button
            type="button"
            onClick={onRandomize}
            className="studio-topbar-accent-btn"
            title="Randomize (R)"
          >
            <Sparkles size={13} className="flex-shrink-0" />
            <span className="studio-btn-text">Randomize</span>
          </button>
        )}

        {exportOptions.length > 0 && (
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setExportOpen(!exportOpen)}
              className="studio-topbar-export-btn"
              aria-expanded={exportOpen}
              aria-haspopup="true"
            >
              <Download size={13} className="flex-shrink-0" />
              <span className="studio-btn-text">Export</span>
              <ChevronDown size={10} className={`transition-transform duration-150 flex-shrink-0 ${exportOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportOpen && (
              <div className="studio-export-menu">
                <div className="studio-export-menu-header">Export Format</div>
                {exportOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      opt.onExport();
                      setExportOpen(false);
                    }}
                    className="studio-export-menu-item"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.icon && <span className="studio-export-menu-icon flex-shrink-0">{opt.icon}</span>}
                      <span className="font-semibold truncate">{opt.label}</span>
                    </div>
                    {opt.sublabel && (
                      <span className="studio-export-menu-sublabel flex-shrink-0">{opt.sublabel}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {toggleInspector && (
          <button
            type="button"
            onClick={toggleInspector}
            className={`studio-topbar-icon-btn studio-topbar-inspector-toggle ${isInspectorOpen ? 'active' : ''}`}
            title="Toggle inspector"
            aria-label="Toggle inspector panel"
          >
            <PanelRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
