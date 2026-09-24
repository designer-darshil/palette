import React from 'react';
import { Breadcrumbs, BreadcrumbCrumb } from './Breadcrumbs';
import { RouteType } from '../../types';

export interface PageHeaderProps {
  /** 'display' = large hero title for public landing pages; 'standard' = compact title for detail/tool pages */
  variant?: 'display' | 'standard';
  sectionLabel?: string;
  /** Optional icon rendered before the eyebrow label */
  sectionIcon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbCrumb[];
  onNavigate?: (route: RouteType) => void;
  className?: string;
}

/*
 * KROMA Global Page Title System
 *
 * Display variant (public hero/landing pages):
 *   H1:          font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem]  font-bold  leading-[1.05]  tracking-tight  uppercase
 *   Eyebrow:     font-mono text-xs  font-semibold  tracking-wider  uppercase  text-text-tertiary
 *   Description: text-sm sm:text-base  text-text-secondary  leading-relaxed  max-w-2xl
 *
 * Standard variant (detail, tool, game pages):
 *   H1:          font-sans text-2xl sm:text-3xl md:text-4xl  font-bold  leading-[1.1]  tracking-tight
 *   Eyebrow:     text-xs  font-semibold  tracking-wider  uppercase  text-text-tertiary
 *   Description: text-sm md:text-base  text-text-secondary  leading-relaxed
 */

/** Shared H1 class tokens — importable for the rare page that cannot use PageHeader directly */
export const KROMA_TITLE_CLASSES = {
  display: 'font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight text-text-primary uppercase m-0',
  standard: 'font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] text-text-primary m-0',
} as const;

export const PageHeader: React.FC<PageHeaderProps> = ({
  variant = 'standard',
  sectionLabel,
  sectionIcon,
  title,
  description,
  actions,
  breadcrumbs,
  onNavigate,
  className = '',
}) => {
  const isDisplay = variant === 'display';

  return (
    <header className={`mb-8 pb-6 border-b border-border-subtle ${className}`}>
      {breadcrumbs && onNavigate && (
        <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
      )}

      {sectionLabel && (
        <span
          className={`mb-3 block ${
            isDisplay
              ? 'font-mono text-xs font-semibold tracking-wider uppercase text-text-tertiary inline-flex items-center gap-2'
              : 'text-xs font-semibold tracking-wider uppercase text-text-tertiary'
          }`}
        >
          {sectionIcon}
          {sectionLabel}
        </span>
      )}

      <div className={`flex flex-col ${isDisplay ? 'lg:flex-row lg:items-end' : 'md:flex-row md:items-end'} justify-between gap-4`}>
        <div className={isDisplay ? 'max-w-4xl' : 'max-w-3xl'}>
          <h1 className={KROMA_TITLE_CLASSES[variant]}>
            {title}
          </h1>
          {description && (
            <p
              className={
                isDisplay
                  ? 'text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl mt-3'
                  : 'text-sm md:text-base text-text-secondary leading-relaxed mt-2.5'
              }
            >
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
