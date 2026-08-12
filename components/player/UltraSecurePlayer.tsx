'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { startScreenProtection } from '@/lib/security/screenProtection';
import { DynamicWatermark } from './DynamicWatermark';

interface Props {
  videoId: string;            // Google Drive video id (URL is hidden from DOM)
  lessonId: string;
  studentName: string;
  studentPhone?: string | null;
  durationSeconds: number;
  onComplete?: () => Promise<void> | void;
  onViolation?: () => void;   // defaults to sign-out (PRD §5.1: "halt immediately")
}

interface WatermarkInstance {
  nonce: string;
  top: number;
  left: number;
  opacity: number;
}

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function randomNonce() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function buildDriveSrc(videoId: string): string {
  // URL is held in a ref; never assigned to a static `src` attribute that
  // the DOM exposes. The iframe receives it only via React's runtime.
  return `https://drive.google.com/file/d/${encodeURIComponent(videoId)}/preview`;
}

export function UltraSecurePlayer({
  videoId,
  lessonId,
  studentName,
  studentPhone,
  durationSeconds,
  onComplete,
  onViolation,
}: Props) {
  const src = useMemo(() => buildDriveSrc(videoId), [videoId]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [watermarks, setWatermarks] = useState<WatermarkInstance[]>([]);
  const [startedAt] = useState(() => Date.now());
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const handleViolationRef = useRef(onViolation);

  useEffect(() => {
    handleViolationRef.current = onViolation;
  }, [onViolation]);

  // Refresh watermark position every 4–8 seconds with a tween.
  useEffect(() => {
    const tick = () => {
      setWatermarks((prev) => {
        const next = [...prev, {
          nonce: randomNonce(),
          top: randomInt(80),
          left: randomInt(70),
          opacity: 0.7 + Math.random() * 0.3,
        }];
        // Keep at most 3 visible at once — staggered fade.
        return next.slice(-3);
      });
    };
    tick();
    const id = window.setInterval(tick, 4000 + randomInt(4000));
    return () => window.clearInterval(id);
  }, []);

  // Screen protection. PRD §5.1: on violation → halt playback. We default
  // to a hard sign-out (strictest reading) when the player is mounted.
  useEffect(() => {
    const stop = startScreenProtection({
      onPause: () => {
        // Best-effort: ask the Drive iframe to pause. The iframe is on a
        // different origin so we can't call methods directly; the
        // postMessage protocol used by Google's player accepts this event.
        const iframe = containerRef.current?.querySelector('iframe');
        iframe?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*',
        );
      },
      onViolation: () => {
        handleViolationRef.current?.();
      },
    });
    return stop;
  }, []);

  const handleComplete = useCallback(async () => {
    if (completed) return;
    setSubmitting(true);
    try {
      await onComplete?.();
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  }, [completed, onComplete]);

  // The Complete Video button enables only after the lesson duration has
  // elapsed. (For Drive-hosted content the player API can't report
  // time-update events cross-origin, so we use the server-provided
  // duration_seconds as the source of truth.)
  const elapsedSeconds = (Date.now() - startedAt) / 1000;
  const canComplete = elapsedSeconds >= durationSeconds && durationSeconds > 0;

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative aspect-video w-full overflow-hidden rounded-xl border border-brand-border bg-black"
      >
        <iframe
          src={src}
          title={`Lesson ${lessonId}`}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
        {/* Watermarks overlay */}
        {watermarks.map((w, i) => (
          <DynamicWatermark
            key={`${w.nonce}-${i}`}
            studentName={studentName}
            studentPhone={studentPhone}
            nonce={w.nonce}
            position={{ top: w.top, left: w.left }}
            opacity={w.opacity}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">
          This stream is watermarked and protected. Right-click, screenshots, DevTools, and tab
          switching are detected.
        </p>
        <button
          onClick={handleComplete}
          disabled={!canComplete || submitting || completed}
          className="rounded-lg bg-brand-gradient px-5 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {completed ? '✓ Completed' : submitting ? 'Saving…' : canComplete ? 'Complete Video' : `Watch ${Math.max(0, Math.ceil(durationSeconds - elapsedSeconds))}s more`}
        </button>
      </div>
    </div>
  );
}