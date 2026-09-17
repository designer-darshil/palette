import React, { useState } from 'react';
import { SemanticToken, RampsWcag } from '../../utils/rampsEngine';
import { Code, Check, Copy, ShieldCheck, Tag, Filter, CheckCircle2 } from 'lucide-react';

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
    <section id="semantic-tokens" className="w-full flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Code size={18} className="text-[var(--text-secondary)]" />
            <span>Usage-First Semantic Design Tokens</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Role-mapped semantic tokens for light and dark themes with enforced WCAG {wcagLevel} contrast ratios.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface-2)] p-1 rounded-lg border border-[var(--border-subtle)] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium capitalize transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Semantic Tokens Table */}
      <div className="w-full overflow-x-auto bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xl shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]/60 text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              <th className="py-3 px-4">Token Identifier</th>
              <th className="py-3 px-4">Light Theme Step</th>
              <th className="py-3 px-4">Dark Theme Step</th>
              <th className="py-3 px-4">WCAG Contrast</th>
              <th className="py-3 px-4">Semantic UI Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-mono">
            {filteredTokens.map((token) => {
              const isExcluded = excludedTokens.includes(token.name);
              const isCopied = copiedToken === token.name;

              return (
                <tr
                  key={token.name}
                  className={`hover:bg-[var(--bg-surface-2)]/50 transition-colors ${
                    isExcluded ? 'opacity-30' : ''
                  }`}
                >
                  {/* Token Name & Copy Action */}
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleCopy(token.name)}
                      className="group flex items-center gap-1.5 text-left font-bold text-[var(--text-primary)] hover:text-blue-400 transition-colors"
                      title="Click to copy CSS variable syntax"
                    >
                      <span>--{token.name}</span>
                      {isCopied ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={11} className="opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)]" />
                      )}
                    </button>
                  </td>

                  {/* Light Theme Step */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-black/15 shadow-2xs flex-shrink-0"
                        style={{ backgroundColor: token.lightHex }}
                      />
                      <div className="flex flex-col">
                        <span className="text-[var(--text-primary)]">{token.lightStep}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">{token.lightHex}</span>
                      </div>
                    </div>
                  </td>

                  {/* Dark Theme Step */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-white/15 shadow-2xs flex-shrink-0"
                        style={{ backgroundColor: token.darkHex }}
                      />
                      <div className="flex flex-col">
                        <span className="text-[var(--text-primary)]">{token.darkStep}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">{token.darkHex}</span>
                      </div>
                    </div>
                  </td>

                  {/* WCAG Contrast Ratio */}
                  <td className="py-3 px-4">
                    {token.contrastRatio ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">
                          {token.contrastRatio.light}:1 L / {token.contrastRatio.dark}:1 D
                        </span>
                        {token.contrastRatio.light >= 7.0 && token.contrastRatio.dark >= 7.0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                            AAA
                          </span>
                        ) : token.contrastRatio.light >= 4.5 && token.contrastRatio.dark >= 4.5 ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
                            AA
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                            AA+
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[var(--text-tertiary)]">—</span>
                    )}
                  </td>

                  {/* Role Description */}
                  <td className="py-3 px-4 font-sans text-xs text-[var(--text-secondary)]">
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
