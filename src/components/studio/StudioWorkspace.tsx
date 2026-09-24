import React from 'react';

interface StudioWorkspaceProps {
  topBar: React.ReactNode;
  canvas: React.ReactNode;
  inspector?: React.ReactNode;
  statusBar?: React.ReactNode;
  className?: string;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  topBar,
  canvas,
  inspector,
  statusBar,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col w-full max-w-full min-w-0 h-[calc(100dvh-60px)] max-h-[calc(100dvh-60px)] bg-canvas overflow-hidden select-none relative ${className}`}
    >
      {/* Unified Studio Toolbar */}
      {topBar}

      {/* Main Work Area: [Dominant Canvas] + [Inspector Panel] */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-full min-w-0 min-h-0 relative overflow-hidden">
        {/* Canvas Stage — edge-to-edge, no padding, no card */}
        <main className="flex-1 flex flex-col min-h-[240px] lg:min-h-0 min-w-0 w-full relative overflow-hidden bg-canvas">
          {canvas}
        </main>

        {/* Contextual Right Inspector (collapsible) */}
        {inspector && (
          <aside className="w-full max-w-full min-w-0 bg-surface-1 border-t lg:border-t-0 lg:border-l border-border-subtle flex flex-col shrink-0 z-20 overflow-y-auto overflow-x-hidden max-h-[min(80dvh,720px)] lg:max-h-none lg:h-full lg:w-[280px] lg:min-w-[260px] lg:max-w-[300px] xl:w-[300px] xl:min-w-[280px] xl:max-w-[320px] 2xl:w-[340px] 2xl:min-w-[300px] 2xl:max-w-[360px]">
            {inspector}
          </aside>
        )}
      </div>

      {/* Optional compact status bar */}
      {statusBar && (
        <div className="h-[26px] px-2.5 border-t border-border-subtle bg-surface-1 flex items-center justify-between font-mono text-xs text-text-tertiary shrink-0 z-10 min-w-0 overflow-hidden">
          {statusBar}
        </div>
      )}
    </div>
  );
};
