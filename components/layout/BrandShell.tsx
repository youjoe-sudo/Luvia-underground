'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export function GlobalToastBridge() {
  const { show } = useToast();
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string; tone?: 'info' | 'success' | 'warning' | 'danger' }>).detail;
      if (detail?.message) show(detail.message, detail.tone ?? 'info');
    };
    window.addEventListener('luvia:toast', handler);
    return () => window.removeEventListener('luvia:toast', handler);
  }, [show]);
  return null;
}

export function ToastCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-2 top-2 rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
      aria-label="Close"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
