// =====================================================================
// heartbeat.ts
// Calls public.heartbeat_ping every 35s (PRD §5.2: 30–45s range).
// If 90s pass without a successful round-trip -> onTimeout.
// If the server rejects with 'session_invalid' -> onSessionRevoked.
// =====================================================================

import { createBrowserClient } from '@supabase/ssr';

export interface HeartbeatHandlers {
  onTimeout?: () => void;
  onSessionRevoked?: () => void;
}

export interface HeartbeatOptions extends HeartbeatHandlers {
  fingerprint: string;
  sessionId: string;
  intervalMs?: number;     // default 35000
  timeoutMs?: number;      // default 90000
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');
  return createBrowserClient(url, key);
}

export function startHeartbeat(opts: HeartbeatOptions): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const {
    fingerprint,
    sessionId,
    intervalMs = 35_000,
    timeoutMs = 90_000,
    onTimeout,
    onSessionRevoked,
  } = opts;

  const supabase = getSupabase();
  let lastSuccess = Date.now();
  let stopped = false;

  const ping = async () => {
    if (stopped) return;
    try {
      const { error } = await supabase.rpc('heartbeat_ping', {
        p_fingerprint: fingerprint,
        p_session_id: sessionId,
      });
      if (error) {
        const msg = String(error.message ?? '').toLowerCase();
        if (msg.includes('session_invalid') || msg.includes('session_timeout') || msg.includes('not authenticated')) {
          stopped = true;
          onSessionRevoked?.();
          return;
        }
      } else {
        lastSuccess = Date.now();
      }
    } catch (err) {
      const msg = String((err as Error)?.message ?? '').toLowerCase();
      if (msg.includes('session_invalid') || msg.includes('session_timeout')) {
        stopped = true;
        onSessionRevoked?.();
      }
    }
  };

  const intervalId = window.setInterval(ping, intervalMs);
  const watchdogId = window.setInterval(() => {
    if (stopped) return;
    if (Date.now() - lastSuccess > timeoutMs) {
      stopped = true;
      onTimeout?.();
    }
  }, 5_000);

  // Fire once immediately so the watchdog baseline is fresh.
  void ping();

  return () => {
    stopped = true;
    window.clearInterval(intervalId);
    window.clearInterval(watchdogId);
  };
}
