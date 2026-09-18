import React, { useState } from 'react';
import { Copy, Check, Download, FileCode } from 'lucide-react';

export interface StudioExportTab<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface StudioCodeBlockProps<T extends string = string> {
  title?: string;
  description?: string;
  tabs: StudioExportTab<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  code: string;
  filename?: string;
  mimeType?: string;
  language?: string;
}

export const StudioCodeBlock = <T extends string>({
  title = 'Developer Code & Token Export',
  description = 'Deterministic output compiled for modern frontend stacks, design systems, and coding agents.',
  tabs,
  activeTab,
  onTabChange,
  code,
  filename = 'export.txt',
  mimeType = 'text/plain',
  language = 'css',
}: StudioCodeBlockProps<T>) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-2.5 min-w-0">
      {/* Section Header */}
      <div className="flex flex-col gap-2 min-w-0">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 tracking-tight">
            <FileCode size={15} className="text-[var(--text-secondary)] flex-shrink-0" />
            <span>{title}</span>
          </h3>
          {description && (
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 leading-snug break-words">
              {description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownload}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.75rem', flex: 1, minWidth: '90px', justifyContent: 'center' }}
            title="Download file to your local workspace"
          >
            <Download size={12} />
            <span className="whitespace-nowrap">Download</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="btn-studio-primary"
            style={{ padding: '5px 12px', fontSize: '0.75rem', flex: 1, minWidth: '100px', justifyContent: 'center' }}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check size={12} />
                <span className="whitespace-nowrap">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="whitespace-nowrap">Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Container with Tabs Header */}
      <div
        className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-1)] overflow-hidden shadow-xs min-w-0"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        {/* Tab Navigation Header */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]/70 overflow-x-auto min-w-0">
          <div className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold border border-[var(--border-medium)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)]'
                }`}
                style={
                  activeTab === tab.id
                    ? {
                        borderColor: 'var(--color-primary-border)',
                        color: 'var(--text-primary)',
                      }
                    : {}
                }
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-tertiary)] pl-2 flex-shrink-0">
            <span>{code.split('\n').length}L</span>
            <span>•</span>
            <span className="uppercase">{language}</span>
          </div>
        </div>

        {/* Code Content Viewport (Strictly isolated horizontal scroll) */}
        <div className="relative p-3 overflow-x-auto max-h-[380px] bg-[var(--bg-surface-1)] min-w-0">
          <pre
            className="font-mono text-[11px] leading-relaxed text-[var(--text-primary)] whitespace-pre selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-contrast)] m-0"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
