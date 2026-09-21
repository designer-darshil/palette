import React from 'react';
import { clsx } from 'clsx';

export interface SpecimenCardBaseProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'article' | 'div';
  interactive?: boolean;
}

export const SpecimenCardBase = React.forwardRef<HTMLElement, SpecimenCardBaseProps>(
  ({ as: Component = 'article', interactive = true, className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={clsx(
          'group relative bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-3 flex flex-col overflow-hidden transition-all duration-200 shadow-[var(--shadow-sm)]',
          interactive &&
            'hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

SpecimenCardBase.displayName = 'SpecimenCardBase';
