import React from 'react';
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
      className={`kroma-breadcrumbs ${className}`}
      style={{
        background: 'transparent',
        padding: 0,
        margin: '0 0 14px 0',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .kroma-breadcrumbs__list {
          display: flex;
          align-items: center;
          list-style: none;
          padding: 0;
          margin: 0;
          font-family: var(--font-sans, 'General Sans', sans-serif);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 1.4;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .kroma-breadcrumbs__item {
          display: inline-flex;
          align-items: center;
          min-width: 0;
        }

        .kroma-breadcrumbs__link {
          color: #707070;
          text-decoration: none;
          opacity: 0.8;
          transition: color 200ms ease-out, opacity 200ms ease-out;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 220px;
        }

        [data-theme="dark"] .kroma-breadcrumbs__link,
        :root:not([data-theme="light"]) .kroma-breadcrumbs__link {
          color: #9E9E9E;
        }

        .kroma-breadcrumbs__link:hover {
          color: #171717;
          opacity: 1;
        }

        [data-theme="dark"] .kroma-breadcrumbs__link:hover,
        :root:not([data-theme="light"]) .kroma-breadcrumbs__link:hover {
          color: #FFFFFF;
        }

        .kroma-breadcrumbs__separator {
          margin: 0 8px;
          color: #A0A0A0;
          font-weight: 400;
          user-select: none;
          flex-shrink: 0;
        }

        [data-theme="dark"] .kroma-breadcrumbs__separator,
        :root:not([data-theme="light"]) .kroma-breadcrumbs__separator {
          color: #666666;
        }

        .kroma-breadcrumbs__current {
          color: #171717;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 280px;
          cursor: default;
        }

        [data-theme="dark"] .kroma-breadcrumbs__current,
        :root:not([data-theme="light"]) .kroma-breadcrumbs__current {
          color: #F8F8F8;
        }

        @media (max-width: 640px) {
          .kroma-breadcrumbs__link {
            max-width: 120px;
          }
          .kroma-breadcrumbs__current {
            max-width: 160px;
          }
        }
      `}</style>

      <ol className="kroma-breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.isCurrent;
          const displayLabel = item.label.toUpperCase();

          return (
            <li key={index} className="kroma-breadcrumbs__item">
              {index > 0 && (
                <span className="kroma-breadcrumbs__separator" aria-hidden="true">
                  /
                </span>
              )}

              {isLast || !item.to ? (
                <span
                  className="kroma-breadcrumbs__current"
                  aria-current="page"
                  title={item.label}
                >
                  {displayLabel}
                </span>
              ) : (
                <Link
                  to={item.to}
                  onNavigate={onNavigate}
                  className="kroma-breadcrumbs__link"
                  title={item.label}
                >
                  {displayLabel}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
