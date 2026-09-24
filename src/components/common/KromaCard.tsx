import React from 'react';
import { clsx } from 'clsx';

export interface KromaCardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'article' | 'div' | 'section' | 'li' | 'button';
  type?: 'button' | 'submit' | 'reset';
  interactive?: boolean;
  variant?: 'default' | 'flat' | 'featured' | 'compact';
}

export const KromaCard = React.forwardRef<HTMLElement, KromaCardProps>(
  (
    {
      as: Component = 'article',
      type,
      interactive = true,
      variant = 'default',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const componentProps: any = { ...props };
    if (Component === 'button') {
      componentProps.type = type || 'button';
    }

    return (
      <Component
        ref={ref as any}
        {...componentProps}
        className={clsx(
          // Kroma Card Foundation
          'group relative bg-[var(--bg-surface-1)] text-[var(--text-primary)]',
          'border border-[var(--border-subtle)]',
          'rounded-[4px] overflow-hidden flex flex-col box-border select-none',
          // Interactive Hover Motions (150-250ms, cubic-bezier)
          interactive && [
            'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
            'hover:-translate-y-0.5',
            'hover:border-[var(--border-medium)]',
            'hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]',
            'cursor-pointer',
          ],
          variant === 'featured' && 'border-[var(--border-medium)] shadow-[0_4px_16px_rgba(0,0,0,0.04)]',
          variant === 'compact' && 'text-xs',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

KromaCard.displayName = 'KromaCard';

export interface KromaCardVisualProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: string;
  heightClass?: string;
}

export const KromaCardVisual: React.FC<KromaCardVisualProps> = ({
  aspectRatio,
  heightClass = 'h-40 sm:h-44',
  className,
  children,
  style,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'w-full relative overflow-hidden flex items-center justify-center',
        !aspectRatio && heightClass,
        className
      )}
      style={{
        aspectRatio,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export interface KromaCardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const KromaCardBody: React.FC<KromaCardBodyProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={clsx('p-3.5 sm:p-4 flex flex-col gap-1.5 flex-1', className)} {...props}>
      {children}
    </div>
  );
};

export interface KromaCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const KromaCardFooter: React.FC<KromaCardFooterProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'mt-auto pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
