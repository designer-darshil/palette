import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppLoader } from './components/AppLoader';
import { ToastProvider } from './context/ToastContext';
import { SavedProvider } from './context/SavedContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { LibraryDataProvider } from './context/LibraryDataContext';
import { initAnalytics } from './utils/analytics';
import './index.css';

initAnalytics();

// ─────────────────────────────────────────────────────────────
// Root Shell
// Renders the AppLoader as a true sibling — not a descendant —
// of the application tree so it can never be affected by any
// provider, page component, or layout container.
// ─────────────────────────────────────────────────────────────
const Root: React.FC = () => {
  const [appReady, setAppReady] = useState(false);

  // Signal ready after the first browser paint of the main tree.
  // useEffect fires after DOM paint, so by the time this runs
  // the App is mounted and interactive.
  useEffect(() => {
    // requestAnimationFrame ensures at least one paint has occurred.
    const raf = requestAnimationFrame(() => {
      setAppReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Loader: position fixed, inset 0, z-index 9999 — completely independent */}
      <AppLoader isReady={appReady} />

      {/* Full application tree */}
      <ThemeProvider>
        <AdminAuthProvider>
          <LibraryDataProvider>
            <SavedProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </SavedProvider>
          </LibraryDataProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

