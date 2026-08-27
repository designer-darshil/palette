import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ToastProvider } from './context/ToastContext';
import { SavedProvider } from './context/SavedContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { LibraryDataProvider } from './context/LibraryDataContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
  </React.StrictMode>
);
