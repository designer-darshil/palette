import React from 'react';
import { KromaButton, KromaButtonProps, KromaButtonVariant, KromaButtonSize } from './KromaButton';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'filled' | 'outline';
export type ButtonSize = KromaButtonSize;

export interface ButtonProps extends Omit<KromaButtonProps, 'variant'> {
  variant?: ButtonVariant;
}

/**
 * Universal Button component for Kroma.
 * Standardized on the canonical Home Page button design system with subtle magnetic
 * pull and contained ripple interaction.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', ...props }, ref) => {
    // Map legacy variants to KromaButton variants
    const resolvedVariant: KromaButtonVariant =
      variant === 'primary' ? 'filled' : variant === 'secondary' ? 'outline' : variant;

    return (
      <KromaButton
        ref={ref as any}
        variant={resolvedVariant}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { KromaButton };
export type { KromaButtonProps, KromaButtonVariant, KromaButtonSize };
