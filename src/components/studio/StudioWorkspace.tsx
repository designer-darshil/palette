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
    <div className={`studio-workspace ${className}`}>
      {/* Unified Studio Toolbar */}
      {topBar}

      {/* Main Work Area: [Dominant Canvas] + [Inspector Panel] */}
      <div className="studio-body">
        {/* Canvas Stage — edge-to-edge, no padding, no card */}
        <main className="studio-canvas">
          {canvas}
        </main>

        {/* Contextual Right Inspector (collapsible) */}
        {inspector && (
          <aside className="studio-inspector">
            {inspector}
          </aside>
        )}
      </div>

      {/* Optional compact status bar */}
      {statusBar && (
        <div className="studio-status-bar">
          {statusBar}
        </div>
      )}
    </div>
  );
};
