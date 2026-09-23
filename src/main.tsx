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
// Dynamic Module Preload Error Recovery
// When a new production version is deployed, clients with an open
// session might request stale/superseded chunk hashes. This recovers
// gracefully by refreshing once to load the latest HTML and chunk map.
// ─────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    const lastReload = sessionStorage.getItem('kroma_chunk_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('kroma_chunk_reload', now.toString());
      window.location.reload();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const errorMsg = event.reason?.message || '';
    if (
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('Expected a JavaScript-or-Wasm module script') ||
      errorMsg.includes('error loading dynamically imported module')
    ) {
      event.preventDefault();
      const lastReload = sessionStorage.getItem('kroma_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('kroma_chunk_reload', now.toString());
        window.location.reload();
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────
// Root Shell
// The boot loader is parsed and painted on Frame 0 via index.html
// with inline critical CSS at z-index 99999.
// When Root mounts and performs its initial paint, we signal
// the boot loader to seamlessly complete to 100% and fade away.
// ─────────────────────────────────────────────────────────────
const Root: React.FC = () => {
  useEffect(() => {
    // Notify RainbowPaintRollerPreloader that React tree has mounted
    if (typeof window !== 'undefined' && window.__RAINBOW_LOADER_COMPLETE__) {
      window.__RAINBOW_LOADER_COMPLETE__();
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

declare global {
  interface Window {
    __KROMA_REACT_ROOT__?: ReactDOM.Root;
    __RAINBOW_LOADER_COMPLETE__?: () => void;
  }
}

const container = document.getElementById('root')!;
let root = window.__KROMA_REACT_ROOT__;
if (!root) {
  root = ReactDOM.createRoot(container);
  window.__KROMA_REACT_ROOT__ = root;
}

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

