import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  subtext?: string;
  colorPreview?: string;
}

interface ToastContextType {
  showToast: (message: string, subtext?: string, colorPreview?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, subtext?: string, colorPreview?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, subtext, colorPreview }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-pill">
            {toast.colorPreview ? (
              <span
                className="toast-color-dot"
                style={{
                  background: toast.colorPreview.includes('gradient')
                    ? toast.colorPreview
                    : toast.colorPreview,
                }}
              />
            ) : (
              <span className="toast-icon-wrap">
                <Check size={14} strokeWidth={2.5} />
              </span>
            )}
            <div className="toast-content">
              <span className="toast-message">{toast.message}</span>
              {toast.subtext && <span className="toast-subtext">{toast.subtext}</span>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
