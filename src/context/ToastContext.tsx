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
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-[var(--bg-surface-1)] border border-[var(--border-strong)] shadow-[var(--shadow-elevated)] px-4 py-2.5 rounded-[var(--radius-sm)] flex items-center gap-2.5 animate-[toastIn_180ms_cubic-bezier(0.16,1,0.3,1)_forwards] pointer-events-auto"
          >
            {toast.colorPreview ? (
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                style={{
                  background: toast.colorPreview.includes('gradient')
                    ? toast.colorPreview
                    : toast.colorPreview,
                }}
              />
            ) : (
              <span className="text-[var(--text-primary)] flex items-center">
                <Check size={14} strokeWidth={2.5} />
              </span>
            )}
            <div className="flex flex-col">
              <span className="text-[0.85rem] font-semibold text-[var(--text-primary)]">{toast.message}</span>
              {toast.subtext && <span className="font-mono text-[0.72rem] text-[var(--text-secondary)]">{toast.subtext}</span>}
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
