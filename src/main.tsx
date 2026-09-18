import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ToastProvider } from './context/ToastContext';
import { SavedProvider } from './context/SavedContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { LibraryDataProvider } from './context/LibraryDataContext';
import { CollectionProvider } from './context/CollectionContext';
import { CreatorProvider } from './context/CreatorContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import { initAnalytics } from './utils/analytics';
import './index.css';

initAnalytics();

// ─────────────────────────────────────────────────────────────
// Root Shell
// The boot loader is parsed and painted on Frame 0 via index.html
// with inline critical CSS at z-index 99999.
// When Root mounts and performs its initial paint, we signal
// the boot loader to seamlessly complete to 100% and fade away.
// ─────────────────────────────────────────────────────────────
const Root: React.FC = () => {
  useEffect(() => {
    // Notify boot loader that React tree has mounted
    if (typeof window !== 'undefined' && window.__KROMA_LOADER_COMPLETE__) {
      window.__KROMA_LOADER_COMPLETE__();
    }
  }, []);

  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <LibraryDataProvider>
          <MaintenanceProvider>
            <SavedProvider>
              <CollectionProvider>
                <CreatorProvider>
                  <ToastProvider>
                    <App />
                  </ToastProvider>
                </CreatorProvider>
              </CollectionProvider>
            </SavedProvider>
          </MaintenanceProvider>
        </LibraryDataProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
};

const container = document.getElementById('root')!;
let root = (container as any)._reactRoot;
if (!root) {
  root = ReactDOM.createRoot(container);
  (container as any)._reactRoot = root;
}

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
