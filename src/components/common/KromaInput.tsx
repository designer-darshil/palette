import React, { useState, useId, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, X, AlertCircle } from 'lucide-react';

export type KromaInputSize = 'sm' | 'md' | 'lg';
export type KromaInputVariant = 'default' | 'surface' | 'filled';

export interface KromaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  labelId?: string;
  helperText?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
  showPasswordToggle?: boolean;
  onClear?: () => void;
  inputSize?: KromaInputSize;
  variant?: KromaInputVariant;
  wrapperClassName?: string;
}

export const KromaInput = forwardRef<HTMLInputElement, KromaInputProps>(
  (
    {
      id: providedId,
      name,
      type = 'text',
      label,
      labelId,
      helperText,
      error,
      iconLeft,
      iconRight,
      isLoading = false,
      showPasswordToggle,
      onClear,
      inputSize = 'md',
      variant = 'default',
      wrapperClassName,
      className,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      placeholder,
      disabled = false,
      readOnly = false,
      required = false,
      autoComplete,
      'aria-invalid': ariaInvalid,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Password visibility toggle state
    const isPasswordType = type === 'password';
    const enablePasswordToggle = showPasswordToggle !== undefined ? showPasswordToggle : isPasswordType;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const effectiveType = isPasswordType && isPasswordVisible ? 'text' : type;

    // Has value check for clear button
    const hasValue = value !== undefined ? Boolean(value) : Boolean(defaultValue);

    // Size variants (strictly adhering to 14px minimum typography)
    const sizeClasses: Record<KromaInputSize, string> = {
      sm: 'py-1.5 text-sm min-h-[34px]',
      md: 'py-2.5 text-sm min-h-[42px]',
      lg: 'py-3 text-base min-h-[48px]',
    };

    // Variant backgrounds & borders
    const variantClasses: Record<KromaInputVariant, string> = {
      default:
        'bg-white dark:bg-[#111216] border border-kroma-border text-kroma-foreground placeholder:text-kroma-muted',
      surface:
        'bg-black/[0.03] dark:bg-white/[0.04] border border-kroma-border text-kroma-foreground placeholder:text-kroma-muted',
      filled:
        'bg-black/[0.05] dark:bg-white/[0.06] border border-transparent text-kroma-foreground placeholder:text-kroma-muted',
    };

    // Horizontal padding adjustments for left/right elements
    const paddingLeftClass = iconLeft ? (inputSize === 'lg' ? 'pl-11' : 'pl-9') : 'pl-3.5';
    const paddingRightClass =
      enablePasswordToggle || onClear || iconRight || isLoading
        ? inputSize === 'lg'
          ? 'pr-11'
          : 'pr-10'
        : 'pr-3.5';

    // Status borders & focus styles
    const statusClasses = error
      ? 'border-[#D70015] dark:border-[#FF453A] focus:border-[#D70015] dark:focus:border-[#FF453A] focus:ring-1 focus:ring-[#D70015]/30'
      : 'focus:border-kroma-foreground dark:focus:border-kroma-foreground focus:ring-1 focus:ring-kroma-foreground/20';

    const disabledClasses = disabled
      ? 'opacity-60 cursor-not-allowed bg-black/[0.03] dark:bg-white/[0.03]'
      : '';

    // Determine aria-describedby references
    const describedByList: string[] = [];
    if (error) describedByList.push(errorId);
    else if (helperText) describedByList.push(helperId);
    if (ariaDescribedBy) describedByList.push(ariaDescribedBy);
    const effectiveAriaDescribedBy = describedByList.length > 0 ? describedByList.join(' ') : undefined;

    return (
      <div className={clsx('w-full flex flex-col', wrapperClassName)}>
        {/* Accessible Label */}
        {label && (
          <label
            htmlFor={inputId}
            id={labelId}
            className="block text-xs font-mono font-medium text-kroma-muted uppercase tracking-wider mb-1.5 select-none"
          >
            {label}
            {required && <span className="text-[#D70015] dark:text-[#FF453A] ml-1">*</span>}
          </label>
        )}

        {/* Input Control Container */}
        <div className="relative flex items-center w-full">
          {/* Left Icon */}
          {iconLeft && (
            <div
              className={clsx(
                'absolute left-3 flex items-center justify-center pointer-events-none text-kroma-muted',
                inputSize === 'lg' ? 'left-3.5' : 'left-3'
              )}
              aria-hidden="true"
            >
              {iconLeft}
            </div>
          )}

          {/* Core Input */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={effectiveType}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            aria-invalid={ariaInvalid !== undefined ? ariaInvalid : Boolean(error)}
            aria-describedby={effectiveAriaDescribedBy}
            className={clsx(
              'w-full font-sans rounded-xs transition-colors focus:outline-none',
              sizeClasses[inputSize],
              variantClasses[variant],
              paddingLeftClass,
              paddingRightClass,
              statusClasses,
              disabledClasses,
              className
            )}
            {...rest}
          />

          {/* Right Action Stack: Loading Spinner, Clear Button, Password Toggle, or Custom Right Icon */}
          <div className="absolute right-2.5 flex items-center gap-1">
            {isLoading && (
              <span className="shrink-0 p-1 text-kroma-muted animate-spin" aria-hidden="true">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            )}

            {!isLoading && onClear && hasValue && !disabled && !readOnly && (
              <button
                type="button"
                onClick={onClear}
                aria-label="Clear input value"
                className="p-1 rounded-xs text-kroma-muted hover:text-kroma-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X size={15} />
              </button>
            )}

            {!isLoading && enablePasswordToggle && (
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                disabled={disabled}
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                className="p-1 rounded-xs text-kroma-muted hover:text-kroma-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {isPasswordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            )}

            {!isLoading && !enablePasswordToggle && iconRight && (
              <div className="p-1 flex items-center justify-center text-kroma-muted" aria-hidden="true">
                {iconRight}
              </div>
            )}
          </div>
        </div>

        {/* Error / Validation Message */}
        {error && (
          <div
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 mt-1.5 text-xs font-mono text-[#D70015] dark:text-[#FF453A]"
          >
            <AlertCircle size={13} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Descriptive Helper Text */}
        {!error && helperText && (
          <div id={helperId} className="mt-1.5 text-xs font-mono text-kroma-muted">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

KromaInput.displayName = 'KromaInput';
