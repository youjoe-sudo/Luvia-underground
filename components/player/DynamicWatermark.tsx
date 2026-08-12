'use client';

import { useEffect, useState } from 'react';

interface Props {
  studentName: string;
  studentPhone?: string | null;
  nonce: string;
  position: { top: number; left: number };
  opacity: number;
}

export function DynamicWatermark({ studentName, studentPhone, nonce, position, opacity }: Props) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setShown(false);
    const t = window.setTimeout(() => setShown(true), 20);
    return () => window.clearTimeout(t);
  }, [nonce, position.top, position.left]);

  return (
    <div
      className="pointer-events-none absolute select-none whitespace-nowrap transition-all duration-300 ease-out"
      style={{
        top: `${position.top}%`,
        left: `${position.left}%`,
        opacity: shown ? opacity : 0,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="rounded bg-black/30 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/70 backdrop-blur-sm">
        {studentName} · {studentPhone ?? '—'} · #{nonce}
      </div>
    </div>
  );
}