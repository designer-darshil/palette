import React from 'react';

interface KromaContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const KromaContainer: React.FC<KromaContainerProps> = ({
  children,
  className = '',
  as: Component = 'div',
}) => {
  return (
    <Component className={`max-w-[1360px] mx-auto px-4 md:px-8 w-full ${className}`}>
      {children}
    </Component>
  );
};
