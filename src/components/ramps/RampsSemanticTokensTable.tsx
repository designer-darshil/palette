import React, { useState } from 'react';
import { SemanticToken, RampsWcag } from '../../utils/rampsEngine';
import { Code, Copy, Check } from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

interface RampsSemanticTokensTableProps {
  tokens: SemanticToken[];
  wcagLevel: RampsWcag;
  onToggleExcludeToken?: (tokenName: string) => void;
  excludedTokens?: string[];
}

export const RampsSemanticTokensTable: React.FC<RampsSemanticTokensTableProps> = ({
  tokens,
  wcagLevel,
  onToggleExcludeToken,
  excludedTokens = [],
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const categories = ['all', 'Background', 'Text', 'Border', 'Focus'];

  const filteredTokens = activeCategory === 'all'
    ? tokens
    : tokens.filter((t) => t.category.toLowerCase() === activeCategory.toLowerCase());

  const handleCopy = (tokenName: string) => {
    navigator.clipboard.writeText(`var(--${tokenName})`);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  return (
    <section id="semantic-tokens" className="w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Code size={18} className="text-[var(--text-secondary)]" />
            <span>Role-Mapped Semantic Tokens</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Pre-computed design tokens for Light &amp; Dark themes with enforced WCAG {wcagLevel} contrast compliance.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface-2)] p-1 rounded-xs border border-[var(--border-subtle)] overflow-x-auto">
          {categories.map((cat) => (
            <KromaButton
              key={cat}
              variant={activeCategory === cat ? 'filled' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="capitalize font-mono"
            >
              {cat}
            </KromaButton>
          ))}
        </div>
      </div>

      {/* Semantic Tokens Table */}
      <div
        className="w-full overflow-x-auto bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md shadow-xs"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        <table className="w-full text-left border-collapse min-w-[680px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]/60 text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              <th className="py-2.5 px-4">Token Identifier</th>
              <th className="py-2.5 px-4">Light Theme</th>
              <th className="py-2.5 px-4">Dark Theme</th>
              <th className="py-2.5 px-4">WCAG Ratio</th>
              <th className="py-2.5 px-4">Semantic Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-mono">
            {filteredTokens.map((token) => {
              const isExcluded = excludedTokens.includes(token.name);
              const isCopied = copiedToken === token.name;

              return (
                <tr
                  key={token.name}
                  className={`hover:bg-[var(--bg-surface-2)]/40 transition-colors ${
                    isExcluded ? 'opacity-30' : ''
                  }`}
                >
                  {/* Token Name & Copy Action */}
                  <td className="py-2.5 px-4">
                    <KromaButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(token.name)}
                      className="group font-bold text-[var(--text-primary)] hover:text-[var(--color-primary-text)]"
                      title="Click to copy CSS variable syntax"
                      iconRight={isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={11} className="opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)]" />}
                    >
                      <span>--{token.name}</span>
                    </KromaButton>
                  </td>

                  {/* Light Theme Step */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-xs border border-black/15 shadow-2xs flex-shrink-0"
                        style={{ backgroundColor: token.lightHex }}
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[var(--text-primary)] font-bold">{token.lightStep}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] uppercase">{token.lightHex}</span>
                      </div>
                    </div>
                  </td>

                  {/* Dark Theme Step */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-xs border border-white/15 shadow-2xs flex-shrink-0"
                        style={{ backgroundColor: token.darkHex }}
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[var(--text-primary)] font-bold">{token.darkStep}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] uppercase">{token.darkHex}</span>
                      </div>
                    </div>
                  </td>

                  {/* WCAG Contrast Ratio */}
                  <td className="py-2.5 px-4">
                    {token.contrastRatio ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">
                          {token.contrastRatio.light}:1 L / {token.contrastRatio.dark}:1 D
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {wcagLevel}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[var(--text-tertiary)]">N/A (Structural)</span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="py-2.5 px-4 text-[11px] text-[var(--text-secondary)] font-sans">
                    {token.role}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
