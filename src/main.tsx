import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ToastProvider } from './context/ToastContext';
import { SavedProvider } from './context/SavedContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AdminAuthProvider>
        <SavedProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SavedProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
