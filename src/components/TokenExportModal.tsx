import React, { useState } from 'react';
import { X, Copy, Check, Code } from 'lucide-react';
import { PaletteItem } from '../types';
import {
  generateCssVariablesExport,
  generateScssExport,
  generateTailwindExport,
  generateDtcgTokensJson,
} from '../utils/tokenExportEngine';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { KromaButton } from './common/KromaButton';

interface TokenExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: PaletteItem;
}

export const TokenExportModal: React.FC<TokenExportModalProps> = ({
  isOpen,
  onClose,
  palette,
}) => {
  const { showToast } = useToast();
  const [format, setFormat] = useState<'css' | 'scss' | 'tailwind' | 'json'>('css');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getCode = () => {
    switch (format) {
      case 'css':
        return generateCssVariablesExport(palette);
      case 'scss':
        return generateScssExport(palette);
      case 'tailwind':
        return generateTailwindExport(palette);
      case 'json':
        return generateDtcgTokensJson(palette);
      default:
        return '';
    }
  };

  const code = getCode();

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      showToast(`Copied ${format.toUpperCase()} Tokens`, palette.title);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Code size={18} className="text-[var(--color-primary)]" />
            <span className="font-bold text-base text-[var(--text-primary)]">
              Developer Tokens: {palette.title}
            </span>
          </div>
          <KromaButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 min-h-[32px] p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            aria-label="Close dialog"
          >
            <X size={18} />
          </KromaButton>
        </div>

        {/* Format Selector Pills */}
        <div className="filter-pills flex flex-wrap gap-1.5">
          <KromaButton
            type="button"
            variant={format === 'css' ? 'filled' : 'subtle'}
            size="sm"
            className="text-xs px-3 py-1.5 min-h-[30px]"
            onClick={() => setFormat('css')}
          >
            CSS Variables
          </KromaButton>
          <KromaButton
            type="button"
            variant={format === 'scss' ? 'filled' : 'subtle'}
            size="sm"
            className="text-xs px-3 py-1.5 min-h-[30px]"
            onClick={() => setFormat('scss')}
          >
            SCSS Map
          </KromaButton>
          <KromaButton
            type="button"
            variant={format === 'tailwind' ? 'filled' : 'subtle'}
            size="sm"
            className="text-xs px-3 py-1.5 min-h-[30px]"
            onClick={() => setFormat('tailwind')}
          >
            Tailwind Config
          </KromaButton>
          <KromaButton
            type="button"
            variant={format === 'json' ? 'filled' : 'subtle'}
            size="sm"
            className="text-xs px-3 py-1.5 min-h-[30px]"
            onClick={() => setFormat('json')}
          >
            DTCG JSON Tokens
          </KromaButton>
        </div>

        {/* Code Output Block */}
        <div className="relative">
          <pre
            className="p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs font-mono text-xs text-[var(--text-primary)] overflow-x-auto max-h-72"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            <code>{code}</code>
          </pre>

          <div className="absolute top-2.5 right-2.5">
            <KromaButton
              variant="outline"
              size="sm"
              onClick={handleCopy}
              iconLeft={copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            >
              {copied ? 'Copied' : 'Copy Tokens'}
            </KromaButton>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] font-mono">
          <span>{palette.colors.length} tokens generated</span>
          <KromaButton type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </KromaButton>
        </div>
      </div>
    </div>
  );
};
