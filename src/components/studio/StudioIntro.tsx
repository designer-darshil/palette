import React from 'react';
import { Sparkles, RotateCcw, Share2, Check, Terminal } from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

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
    <div className="mb-7 pb-5 border-b border-[var(--border-subtle)]">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--text-tertiary)] tracking-tight">
              {category}
            </span>
            <span className="text-[var(--text-tertiary)]">•</span>
            <span
              className="text-xs font-mono uppercase font-semibold text-[var(--color-primary-text)]"
            >
              {badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-bold tracking-[-0.03em] text-[var(--text-primary)] mb-1.5 leading-tight">
            {title}
          </h1>
          <p className="text-sm md:text-[0.95rem] text-[var(--text-secondary)] leading-relaxed max-w-[720px]">
            {description}
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {onRandomize && (
            <KromaButton
              type="button"
              variant="filled"
              size="sm"
              onClick={onRandomize}
              iconLeft={<Sparkles size={13} />}
              title="Generate random configuration"
            >
              Randomize
            </KromaButton>
          )}

          {onReset && (
            <KromaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              iconLeft={<RotateCcw size={13} />}
              title="Reset parameters to default"
            >
              Reset
            </KromaButton>
          )}

          {onCopyPrompt && (
            <KromaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onCopyPrompt}
              iconLeft={hasCopiedPrompt ? <Check size={13} className="text-emerald-400" /> : <Terminal size={13} />}
              title="Copy LLM / coding agent prompt"
            >
              {hasCopiedPrompt ? 'Prompt Copied!' : 'Agent Prompt'}
            </KromaButton>
          )}

          {onShareUrl && (
            <KromaButton
              type="button"
              variant="filled"
              size="sm"
              onClick={onShareUrl}
              iconLeft={hasCopiedShare ? <Check size={13} /> : <Share2 size={13} />}
              title="Copy shareable permalink"
            >
              {hasCopiedShare ? 'Link Copied!' : 'Share'}
            </KromaButton>
          )}
        </div>
      </div>
    </div>
  );
};
