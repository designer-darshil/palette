import React from 'react';
import { Breadcrumbs, BreadcrumbCrumb } from './Breadcrumbs';
import { RouteType } from '../../types';

export interface PageHeaderProps {
  sectionLabel?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbCrumb[];
  onNavigate?: (route: RouteType) => void;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  sectionLabel,
  title,
  description,
  actions,
  breadcrumbs,
  onNavigate,
  className = '',
}) => {
  return (
    <header className={`mb-8 pb-6 border-b border-[var(--border-subtle)] ${className}`}>
      {breadcrumbs && onNavigate && (
        <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
      )}

      {sectionLabel && (
        <span className="text-xs font-semibold text-[var(--text-tertiary)] mb-2 block tracking-tight">
          {sectionLabel}
        </span>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.03em] text-[var(--text-primary)] mb-2.5">
            {title}
          </h1>
          {description && (
            <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};
