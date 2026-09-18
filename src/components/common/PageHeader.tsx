import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div className={`mb-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          {eyebrow && (
            <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--kroma-muted)] mb-1 font-medium">
              {eyebrow}
            </div>
          )}
          <h1 className="font-sans text-[28px] sm:text-[34px] md:text-[40px] leading-[1.0] tracking-[-0.035em] text-[var(--kroma-ink)] font-normal mb-1.5">
            {title}
          </h1>
          {description && (
            <p className="font-sans text-xs text-[var(--kroma-muted)] max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
