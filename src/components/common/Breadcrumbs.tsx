import React from 'react';
import { ChevronRight } from 'lucide-react';
import { RouteType } from '../../types';
import { Link } from './Link';

export interface BreadcrumbCrumb {
  label: string;
  to?: RouteType | string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbCrumb[];
  onNavigate: (route: RouteType) => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate, className = '' }) => {
  if (!items || items.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`breadcrumbs-nav ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.78rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-tertiary)',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          flexWrap: 'wrap',
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.isCurrent;

          return (
            <li
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {index > 0 && (
                <ChevronRight
                  size={11}
                  style={{ opacity: 0.5, flexShrink: 0, color: 'var(--text-tertiary)' }}
                  aria-hidden="true"
                />
              )}

              {isLast || !item.to ? (
                <span
                  aria-current="page"
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    maxWidth: '240px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  onNavigate={onNavigate}
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'color var(--transition-quick)',
                  }}
                  className="hover:text-[var(--text-primary)]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
