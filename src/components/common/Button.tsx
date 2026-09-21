import React from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'secondary',
      size = 'md',
      iconLeft,
      iconRight,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-semibold tracking-wide transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:translate-y-0';

    const sizeStyles = {
      sm: 'h-[30px] px-2.5 text-xs gap-1.5 rounded-[var(--radius-xs)]',
      md: 'h-[36px] px-4 text-xs gap-2 rounded-[var(--radius-sm)]',
      lg: 'h-[42px] px-5 text-sm gap-2.5 rounded-[var(--radius-sm)]',
    }[size];

    const variantStyles = {
      primary:
        'bg-[var(--color-primary)] text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 active:bg-[var(--color-primary-active)] shadow-[var(--shadow-sm)] border border-transparent',
      secondary:
        'bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-medium)] hover:bg-[var(--bg-surface-3)] hover:border-[var(--border-strong)] shadow-sm',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] border border-transparent',
      subtle:
        'bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary-hover)]/20 border border-[var(--color-primary-border)]',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={clsx(baseStyles, sizeStyles, variantStyles, className)}
        {...props}
      >
        {iconLeft && <span className="shrink-0 flex items-center">{iconLeft}</span>}
        {children && <span>{children}</span>}
        {iconRight && <span className="shrink-0 flex items-center">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
