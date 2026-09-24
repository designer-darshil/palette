import React, { useRef, useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { Link } from './Link';
import { RouteType } from '../../types';

export type KromaButtonVariant = 'filled' | 'outline' | 'ghost' | 'subtle';
export type KromaButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export interface KromaButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: KromaButtonVariant;
  size?: KromaButtonSize;
  magnetic?: boolean;
  magneticStrength?: number;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
  to?: RouteType | string;
  onNavigate?: (route: RouteType) => void;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
}

export const KromaButton = React.forwardRef<HTMLElement, KromaButtonProps>(
  (
    {
      children,
      className,
      variant = 'filled',
      size = 'md',
      magnetic = true,
      magneticStrength = 5,
      iconLeft,
      iconRight,
      isLoading = false,
      to,
      onNavigate,
      href,
      target,
      rel,
      onClick,
      disabled = false,
      type = 'button',
      ...rest
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLElement | null>(null);
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [canHover, setCanHover] = useState(true);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Combine forwarded ref and internal ref
    const setRef = useCallback(
      (node: HTMLElement | null) => {
        internalRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    // Detect touch-only and reduced-motion environments
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const hoverMedia = window.matchMedia('(hover: hover)');
        setCanHover(hoverMedia.matches);

        const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(motionMedia.matches);

        const handleHoverChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
        const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

        hoverMedia.addEventListener?.('change', handleHoverChange);
        motionMedia.addEventListener?.('change', handleMotionChange);

        return () => {
          hoverMedia.removeEventListener?.('change', handleHoverChange);
          motionMedia.removeEventListener?.('change', handleMotionChange);
        };
      }
    }, []);

    const isMagneticActive = magnetic && canHover && !prefersReducedMotion && !disabled && !isLoading;

    // Handle magnetic pointer movement
    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      if (!isMagneticActive || !internalRef.current) return;
      const rect = internalRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (e.clientY - rect.top) / rect.height - 0.5;

      const targetX = Math.round(relativeX * magneticStrength * 2);
      const targetY = Math.round(relativeY * magneticStrength * 2);

      setOffset({ x: targetX, y: targetY });
    };

    const handleMouseEnter = () => {
      if (!disabled && !isLoading) {
        setIsHovered(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setOffset({ x: 0, y: 0 });
    };

    // Handle ripple creation on click/pointer down
    const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
      if (disabled || isLoading || prefersReducedMotion || !internalRef.current) return;

      const rect = internalRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Diameter covers button bounding box from click origin
      const maxDist = Math.max(
        Math.hypot(clickX, clickY),
        Math.hypot(rect.width - clickX, clickY),
        Math.hypot(clickX, rect.height - clickY),
        Math.hypot(rect.width - clickX, rect.height - clickY)
      );
      const diameter = maxDist * 2;

      const newRipple: Ripple = {
        x: clickX,
        y: clickY,
        size: diameter,
        id: Date.now() + Math.random(),
      };

      setRipples((prev) => [...prev, newRipple]);
    };

    const removeRipple = (id: number) => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    };

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      if (disabled || isLoading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const isCustomFlexCol = className?.includes('flex-col');
    const isJustifyBetween = className?.includes('justify-between');
    const isItemsCenter = className?.includes('items-center');
    const hasCustomRounded = className?.includes('rounded-') || className?.includes('rounded ');
    const hasCustomMinHeight = className?.includes('min-h-') || className?.includes('h-auto') || className?.includes('h-');
    const hasCustomCase = className?.includes('lowercase') || className?.includes('normal-case') || className?.includes('capitalize');

    // ─── Visual Tokens Matching Canonical Kroma Design System ───
    const baseStyles = clsx(
      'relative inline-flex items-center justify-center font-sans font-semibold tracking-[0.02em]',
      !hasCustomCase && 'uppercase',
      !hasCustomRounded && 'rounded-full',
      'select-none cursor-pointer overflow-hidden box-border no-underline',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'
    );

    const sizeStyles = {
      xs: clsx('px-2.5 py-1 text-xs gap-1', !hasCustomMinHeight && 'min-h-[28px]'),
      sm: clsx('px-3.5 py-1.5 text-xs gap-1.5', !hasCustomMinHeight && 'min-h-[34px]'),
      md: clsx('px-6 py-3 text-[13.5px] gap-2', !hasCustomMinHeight && 'min-h-[44px]'), // Exact Home Page Proportions
      lg: clsx('px-8 py-3.5 text-[15px] gap-2.5', !hasCustomMinHeight && 'min-h-[50px]'),
      icon: clsx('w-10 h-10 p-0 text-xs justify-center', !hasCustomMinHeight && 'min-h-[40px]'),
      'icon-sm': clsx('w-7 h-7 p-0 text-xs justify-center', !hasCustomMinHeight && 'min-h-[28px]'),
    }[size as 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'] || clsx('px-6 py-3 text-[13.5px] gap-2', !hasCustomMinHeight && 'min-h-[44px]');

    const variantStyles = {
      filled: clsx(
        'bg-[var(--text-primary)] text-[var(--bg-canvas)]',
        'border-0 shadow-xs hover:opacity-90 active:opacity-95'
      ),
      outline: clsx(
        'bg-transparent text-[var(--text-primary)]',
        'border border-[var(--border-medium)]',
        'hover:bg-[var(--bg-surface-2)] hover:border-[var(--border-strong)]',
        'active:bg-[var(--bg-surface-3)]'
      ),
      ghost: clsx(
        'bg-transparent text-[var(--text-primary)] border-0',
        'hover:bg-[var(--bg-surface-2)] active:bg-[var(--bg-surface-3)]'
      ),
      subtle: clsx(
        'bg-[var(--bg-surface-2)] text-[var(--text-primary)] border-0',
        'hover:bg-[var(--bg-surface-3)] active:bg-[var(--bg-surface-elevated)]'
      ),
    }[variant];

    // Ripple color matching variant
    const rippleColor =
      variant === 'filled'
        ? 'bg-current opacity-20'
        : 'bg-current opacity-15';

    const transformStyle: React.CSSProperties = {
      transform: isMagneticActive
        ? `translate3d(${offset.x}px, ${offset.y}px, 0)`
        : undefined,
      transition: isHovered
        ? 'transform 140ms ease-out, background-color 200ms cubic-bezier(0.22,1,0.36,1), border-color 200ms cubic-bezier(0.22,1,0.36,1), opacity 200ms cubic-bezier(0.22,1,0.36,1)'
        : 'transform 360ms cubic-bezier(0.22,1,0.36,1), background-color 200ms cubic-bezier(0.22,1,0.36,1), border-color 200ms cubic-bezier(0.22,1,0.36,1), opacity 200ms cubic-bezier(0.22,1,0.36,1)',
    };

    const content = (
      <>
        {/* Ripple Layer */}
        <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-0" aria-hidden="true">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className={clsx('absolute rounded-full animate-kroma-ripple pointer-events-none', rippleColor)}
              style={{
                left: ripple.x - ripple.size / 2,
                top: ripple.y - ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
              }}
              onAnimationEnd={() => removeRipple(ripple.id)}
            />
          ))}
        </span>

        {/* Loading Spinner */}
        {isLoading && (
          <span className="relative z-10 shrink-0 inline-flex items-center justify-center animate-spin">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        )}

        {/* Icon Left */}
        {!isLoading && iconLeft && (
          <span className="relative z-10 shrink-0 inline-flex items-center justify-center transition-transform duration-200 group-hover:-translate-x-0.5">
            {iconLeft}
          </span>
        )}

        {/* Text / Children */}
        {children && (
          <span
            className={clsx(
              'relative z-10',
              isCustomFlexCol
                ? clsx('flex flex-col gap-1 leading-normal w-full', isItemsCenter ? 'items-center text-center' : 'items-start')
                : isJustifyBetween
                  ? 'flex items-center justify-between gap-1.5 leading-none w-full min-w-0'
                  : 'inline-flex items-center justify-center gap-1.5 leading-none'
            )}
          >
            {children}
          </span>
        )}

        {/* Icon Right */}
        {!isLoading && iconRight && (
          <span className="relative z-10 shrink-0 inline-flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
            {iconRight}
          </span>
        )}
      </>
    );

    const mergedClassName = clsx(
      'group',
      baseStyles,
      sizeStyles,
      variantStyles,
      className
    );

    const { style: customStyle, ...nativeRest } = rest;
    const combinedStyle = { ...transformStyle, ...customStyle };

    // If 'to' is specified, render router Link
    if (to) {
      return (
        <Link
          ref={setRef as React.Ref<HTMLAnchorElement>}
          to={to}
          onNavigate={onNavigate}
          className={mergedClassName}
          style={combinedStyle}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onPointerDown={handlePointerDown}
          onClick={handleClick}
          {...(nativeRest as any)}
        >
          {content}
        </Link>
      );
    }

    // If 'href' is specified, render standard anchor
    if (href) {
      return (
        <a
          ref={setRef as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
          className={mergedClassName}
          style={combinedStyle}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onPointerDown={handlePointerDown}
          onClick={handleClick}
          {...(nativeRest as any)}
        >
          {content}
        </a>
      );
    }

    // Default: render button
    return (
      <button
        ref={setRef as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled || isLoading}
        className={mergedClassName}
        style={combinedStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        {...nativeRest}
      >
        {content}
      </button>
    );
  }
);

KromaButton.displayName = 'KromaButton';
