import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ToastProvider } from './context/ToastContext';
import { SavedProvider } from './context/SavedContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SavedProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </SavedProvider>
  </React.StrictMode>
);
