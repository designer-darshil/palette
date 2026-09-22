import React from 'react';
import { clsx } from 'clsx';
import { KromaCard, KromaCardProps } from './KromaCard';

export interface SpecimenCardBaseProps extends KromaCardProps {}

export const SpecimenCardBase = React.forwardRef<HTMLElement, SpecimenCardBaseProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <KromaCard
        ref={ref}
        className={clsx('specimen-card', className)}
        {...props}
      >
        {children}
      </KromaCard>
    );
  }
);

SpecimenCardBase.displayName = 'SpecimenCardBase';
