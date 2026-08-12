'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface ToastItem {
  id: number;
  message: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
}

interface ToastContextValue {
  show: (message: string, tone?: ToastItem['tone'], durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TONE_CLASS: Record<ToastItem['tone'], string> = {
  info: 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan',
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  danger: 'border-red-500/40 bg-red-500/10 text-red-300',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, tone: ToastItem['tone'] = 'info', durationMs = 4000) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }, durationMs);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((it) => (
          <div
            key={it.id}
            className={`pointer-events-auto rounded-lg border px-4 py-2 text-sm shadow-lg ${TONE_CLASS[it.tone]}`}
          >
            {it.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
