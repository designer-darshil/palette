import React from 'react';
import { Undo2, Redo2, RotateCcw, Sparkles, Share2, Check, Copy } from 'lucide-react';

interface MeshToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  seed: number;
  onSeedChange: (seed: number) => void;
  onRandomize: () => void;
  onReset: () => void;
  onShareUrl: () => void;
  hasCopiedShare: boolean;
  onCopyPrompt: () => void;
  hasCopiedPrompt: boolean;
}

export const MeshToolbar: React.FC<MeshToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  seed,
  onSeedChange,
  onRandomize,
  onReset,
  onShareUrl,
  hasCopiedShare,
  onCopyPrompt,
  hasCopiedPrompt,
}) => {
  return (
    <div
      className="w-full flex items-center justify-between gap-3 p-2.5 rounded-md bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] shadow-xs flex-wrap"
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      {/* 1. Undo / Redo / Reset Group */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          title="Undo last change (Cmd/Ctrl + Z)"
          aria-label="Undo"
        >
          <Undo2 size={14} />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          title="Redo (Cmd/Ctrl + Shift + Z)"
          aria-label="Redo"
        >
          <Redo2 size={14} />
        </button>

        <div className="h-4 w-[1px] bg-[var(--border-subtle)] mx-1" />

        <button
          type="button"
          onClick={onReset}
          className="px-2.5 py-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          title="Reset to default mesh"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* 2. Seed & Randomize Group */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-[var(--bg-surface-2)] px-2 py-1 rounded-xs border border-[var(--border-subtle)]">
          <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">
            Seed:
          </span>
          <input
            type="number"
            value={seed}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) onSeedChange(val);
            }}
            className="w-16 font-mono text-xs text-[var(--text-primary)] bg-transparent outline-none text-right"
            aria-label="PRNG Seed Number"
          />
        </div>

        <button
          type="button"
          onClick={onRandomize}
          className="btn-studio-primary"
          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          title="Generate random harmonious mesh"
        >
          <Sparkles size={13} />
          <span>Randomize</span>
        </button>
      </div>

      {/* 3. Share URL & Copy Prompt Group */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopyPrompt}
          className="px-2.5 py-1.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          title="Copy LLM system prompt / design specification"
        >
          {hasCopiedPrompt ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{hasCopiedPrompt ? 'Prompt Copied' : 'Prompt'}</span>
        </button>

        <button
          type="button"
          onClick={onShareUrl}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title="Copy permanent shareable link"
        >
          {hasCopiedShare ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
          <span>{hasCopiedShare ? 'Link Copied' : 'Share'}</span>
        </button>
      </div>
    </div>
  );
};
