import React, { useState } from 'react';
import { AntigravityConfig } from '../../utils/antigravityEngine';
import { AntigravityCodeExport } from './AntigravityCodeExport';
import { AntigravityApiDocs } from './AntigravityApiDocs';
import { ChevronUp, Code, FileText, Sparkles } from 'lucide-react';

interface AntigravityBottomDockProps {
  config: AntigravityConfig;
  sourceUrl?: string;
}

export const AntigravityBottomDock: React.FC<AntigravityBottomDockProps> = ({ config, sourceUrl = 'https://kroma.design/antigravity' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'api'>('export');

  return (
    <div className="w-full flex flex-col bg-[var(--bg-surface-1)]">
      {/* Dock Toggle Bar */}
      <div className="h-10 px-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (!isOpen) setIsOpen(true);
              setActiveTab('export');
            }}
            className={`px-2.5 py-1 rounded-xs font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isOpen && activeTab === 'export'
                ? 'bg-[var(--bg-surface-2)] text-[var(--color-primary)] border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Code size={13} />
            <span>Deterministic Code &amp; Keyframes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isOpen) setIsOpen(true);
              setActiveTab('api');
            }}
            className={`px-2.5 py-1 rounded-xs font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isOpen && activeTab === 'api'
                ? 'bg-[var(--bg-surface-2)] text-[var(--color-primary)] border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <FileText size={13} />
            <span>Kinematics API Spec</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-xs hover:bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-1 font-mono text-[10px]"
          aria-expanded={isOpen}
        >
          <span>{isOpen ? 'Collapse Drawer' : 'Expand Drawer'}</span>
          <ChevronUp size={13} className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dock Body */}
      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-[var(--border-subtle)] max-h-[480px] overflow-y-auto animate-in fade-in duration-100 bg-[var(--bg-surface-1)]">
          {activeTab === 'export' && (
            <AntigravityCodeExport config={config} sourceUrl={sourceUrl} />
          )}

          {activeTab === 'api' && (
            <AntigravityApiDocs config={config} />
          )}
        </div>
      )}
    </div>
  );
};
