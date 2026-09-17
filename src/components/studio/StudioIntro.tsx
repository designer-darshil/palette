import React from 'react';
import { Sparkles, RotateCcw, Share2, Check, Terminal } from 'lucide-react';

interface StudioIntroProps {
  category: string;
  badge: string;
  title: string;
  description: string;
  onRandomize?: () => void;
  onReset?: () => void;
  onCopyPrompt?: () => void;
  hasCopiedPrompt?: boolean;
  onShareUrl?: () => void;
  hasCopiedShare?: boolean;
}

export const StudioIntro: React.FC<StudioIntroProps> = ({
  category,
  badge,
  title,
  description,
  onRandomize,
  onReset,
  onCopyPrompt,
  hasCopiedPrompt = false,
  onShareUrl,
  hasCopiedShare = false,
}) => {
  return (
    <div className="page-header" style={{ marginBottom: '28px', paddingBottom: '20px' }}>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="page-category-label" style={{ marginBottom: 0 }}>
              {category}
            </span>
            <span className="text-[var(--text-tertiary)]">•</span>
            <span
              className="text-[11px] font-mono uppercase font-semibold"
              style={{ color: 'var(--color-primary-text)' }}
            >
              {badge}
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: '2.2rem', marginBottom: '6px' }}>
            {title}
          </h1>
          <p className="page-description" style={{ fontSize: '0.95rem', maxWidth: '720px' }}>
            {description}
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {onRandomize && (
            <button
              type="button"
              onClick={onRandomize}
              className="btn-studio-primary"
              style={{ padding: '8px 16px', fontSize: '0.78rem' }}
              title="Generate random configuration"
            >
              <Sparkles size={13} />
              <span>Randomize</span>
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.78rem' }}
              title="Reset parameters to default"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          {onCopyPrompt && (
            <button
              type="button"
              onClick={onCopyPrompt}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.78rem' }}
              title="Copy LLM / coding agent prompt"
            >
              {hasCopiedPrompt ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Prompt Copied!</span>
                </>
              ) : (
                <>
                  <Terminal size={13} style={{ color: 'var(--color-primary-text)' }} />
                  <span>Agent Prompt</span>
                </>
              )}
            </button>
          )}

          {onShareUrl && (
            <button
              type="button"
              onClick={onShareUrl}
              className="btn-studio-primary"
              style={{ padding: '8px 16px', fontSize: '0.78rem' }}
              title="Copy shareable permalink"
            >
              {hasCopiedShare ? (
                <>
                  <Check size={13} />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>Share URL</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
