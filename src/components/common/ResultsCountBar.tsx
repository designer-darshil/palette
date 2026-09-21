import React from 'react';

export interface ResultsCountBarProps {
  displayedCount: number;
  totalCount: number;
  itemName?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const ResultsCountBar: React.FC<ResultsCountBarProps> = ({
  displayedCount,
  totalCount,
  itemName = 'SPECIMENS',
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 mb-4 text-xs font-mono text-[var(--text-tertiary)] ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] inline-block" />
        <span>
          SHOWING {displayedCount.toLocaleString()} OF {totalCount.toLocaleString()} {itemName.toUpperCase()}
        </span>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
