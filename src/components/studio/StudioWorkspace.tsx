import React from 'react';

interface StudioWorkspaceProps {
  topBar: React.ReactNode;
  canvas: React.ReactNode;
  inspector?: React.ReactNode;
  leftRail?: React.ReactNode;
  bottomBar?: React.ReactNode;
  className?: string;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  topBar,
  canvas,
  inspector,
  leftRail,
  bottomBar,
  className = '',
}) => {
  return (
    <div className={`studio-workspace flex flex-col w-full min-h-[calc(100vh-60px)] bg-[var(--bg-canvas)] select-none overflow-hidden ${className}`}>
      {/* 1. Ultra-Compact Studio Top Bar */}
      {topBar}

      {/* 2. Main Work Area: [Left Rail] + [Dominant Canvas] + [Right Inspector] */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-0 relative overflow-hidden">
        {/* Optional Left Visual Presets Rail */}
        {leftRail && (
          <aside className="studio-left-rail w-full lg:w-64 lg:min-w-[240px] lg:max-w-[280px] bg-[var(--bg-surface-1)] border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] flex flex-col flex-shrink-0 z-10 overflow-y-auto">
            {leftRail}
          </aside>
        )}

        {/* Primary Viewport-Dominant Canvas Stage */}
        <main className="studio-canvas-area flex-1 flex flex-col items-center justify-center p-3 sm:p-5 lg:p-6 min-h-[420px] lg:min-h-0 relative overflow-hidden bg-[var(--bg-canvas)]">
          {canvas}
        </main>

        {/* Contextual Right Inspector Panel */}
        {inspector && (
          <aside className="studio-inspector-aside w-full lg:w-80 lg:min-w-[300px] lg:max-w-[340px] bg-[var(--bg-surface-1)] border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] flex flex-col flex-shrink-0 z-10 overflow-y-auto">
            {inspector}
          </aside>
        )}
      </div>

      {/* 3. Optional Bottom Code/Token Output Drawer */}
      {bottomBar && (
        <div className="studio-bottom-bar border-t border-[var(--border-subtle)] bg-[var(--bg-surface-1)] z-10">
          {bottomBar}
        </div>
      )}
    </div>
  );
};
