import React, { useState } from 'react';
import { GeneratedPaletteResult } from '../../utils/rampsEngine';
import { RampsLiveUiPreview } from './RampsLiveUiPreview';
import { RampsCodeExport } from './RampsCodeExport';
import { RampsApiDocs } from './RampsApiDocs';
import { RampsSemanticTokensTable } from './RampsSemanticTokensTable';
import { ChevronUp, Eye, Code, FileText, Table } from 'lucide-react';

interface RampsBottomDockProps {
  paletteResult: GeneratedPaletteResult;
  wcagLevel: 'AA' | 'AAA';
  onToggleExcludeToken: (tokenName: string) => void;
  excludedTokens: string[];
}

export const RampsBottomDock: React.FC<RampsBottomDockProps> = ({
  paletteResult,
  wcagLevel,
  onToggleExcludeToken,
  excludedTokens,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokens' | 'preview' | 'code' | 'api'>('tokens');

  return (
    <div className="w-full flex flex-col bg-[var(--bg-surface-1)]">
      {/* Dock Toggle Header */}
      <div className="h-10 px-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (!isOpen) setIsOpen(true);
              setActiveTab('tokens');
            }}
            className={`px-2.5 py-1 rounded-xs font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isOpen && activeTab === 'tokens'
                ? 'bg-[var(--bg-surface-2)] text-[var(--color-primary)] border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Table size={13} />
            <span>Semantic Tokens ({paletteResult.tokens.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isOpen) setIsOpen(true);
              setActiveTab('preview');
            }}
            className={`px-2.5 py-1 rounded-xs font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isOpen && activeTab === 'preview'
                ? 'bg-[var(--bg-surface-2)] text-[var(--color-primary)] border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Eye size={13} />
            <span>Live UI Simulation</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isOpen) setIsOpen(true);
              setActiveTab('code');
            }}
            className={`px-2.5 py-1 rounded-xs font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isOpen && activeTab === 'code'
                ? 'bg-[var(--bg-surface-2)] text-[var(--color-primary)] border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Code size={13} />
            <span>Token Exports</span>
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
            <span>API Docs</span>
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

      {/* Dock Content Body */}
      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-[var(--border-subtle)] max-h-[480px] overflow-y-auto animate-in fade-in duration-100 bg-[var(--bg-surface-1)]">
          {activeTab === 'tokens' && (
            <RampsSemanticTokensTable
              tokens={paletteResult.tokens}
              wcagLevel={wcagLevel}
              onToggleExcludeToken={onToggleExcludeToken}
              excludedTokens={excludedTokens}
            />
          )}

          {activeTab === 'preview' && (
            <RampsLiveUiPreview paletteResult={paletteResult} />
          )}

          {activeTab === 'code' && (
            <RampsCodeExport paletteResult={paletteResult} />
          )}

          {activeTab === 'api' && (
            <RampsApiDocs paletteResult={paletteResult} />
          )}
        </div>
      )}
    </div>
  );
};
