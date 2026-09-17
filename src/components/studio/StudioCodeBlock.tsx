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
    <div className="w-full flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <FileCode size={18} className="text-[var(--text-secondary)]" />
            <span>{title}</span>
          </h2>
          {description && (
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Download file to your local workspace"
          >
            <Download size={13} />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="btn-studio-primary"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check size={13} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Container with Tabs Header */}
      <div
        className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-1)] overflow-hidden shadow-xs"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        {/* Tab Navigation Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]/70 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-medium transition-all cursor-pointer ${
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

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-[var(--text-tertiary)] pl-3">
            <span>{code.split('\n').length} lines</span>
            <span>•</span>
            <span className="uppercase">{language}</span>
          </div>
        </div>

        {/* Code Content Viewport */}
        <div className="relative p-4 overflow-x-auto max-h-[460px] bg-[var(--bg-surface-1)]">
          <pre
            className="font-mono text-xs leading-relaxed text-[var(--text-primary)] whitespace-pre selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-contrast)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
