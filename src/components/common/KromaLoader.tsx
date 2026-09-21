import React from 'react';

interface KromaLoaderProps {
  minHeight?: string;
  label?: string;
  className?: string;
}

export const KromaLoader: React.FC<KromaLoaderProps> = ({
  minHeight = '50vh',
  label = 'CALIBRATING SPECIMENS',
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`flex items-center justify-center w-full select-none py-12 ${className}`}
      style={{ minHeight }}
    >
      <div className="kroma-loader-inner">
        <div className="kroma-loader-brand" style={{ marginBottom: '20px' }}>
          <span className="kroma-loader-glyph" aria-hidden="true" />
          <span className="kroma-loader-wordmark">KROMA</span>
        </div>
        <div className="kroma-loader-track-wrap" style={{ marginBottom: '14px' }} aria-hidden="true">
          <div className="kroma-loader-track">
            <div
              className="kroma-loader-fill"
              style={{
                animation: 'kromaLoaderShimmer 1.5s ease-in-out infinite alternate',
              }}
            />
          </div>
        </div>
        <div className="kroma-loader-label" aria-hidden="true">
          {label}
        </div>
      </div>
    </div>
  );
};
