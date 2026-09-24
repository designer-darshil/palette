import React from 'react';
import { KromaButton } from './KromaButton';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`py-16 px-6 text-center bg-[var(--bg-surface-1)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex flex-col items-center justify-center max-w-xl mx-auto my-8 shadow-sm ${className}`}
    >
      {icon && <div className="mb-3 text-[var(--text-tertiary)]">{icon}</div>}
      <h3 className="font-sans text-base font-semibold text-[var(--text-primary)] mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="font-sans text-xs text-[var(--text-secondary)] max-w-md leading-relaxed mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <KromaButton variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </KromaButton>
      )}
    </div>
  );
};
