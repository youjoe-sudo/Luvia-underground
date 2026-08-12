// =====================================================================
// single-session.ts
// The server stores users.active_session_id. On every auth event the
// client reads the latest record and compares it to the value it cached
// in sessionStorage. Mismatch -> another device logged in -> sign out.
// =====================================================================

import { createBrowserClient } from '@supabase/ssr';

const SESSION_STORAGE_KEY = 'luvia.session.id';

export function rememberSessionId(id: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
}

export function getRememberedSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(SESSION_STORAGE_KEY);
}

export function clearRememberedSessionId() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function checkSingleSession(): Promise<{
  current: string | null;
  remembered: string | null;
  revoked: boolean;
}> {
  const remembered = getRememberedSessionId();
  if (!remembered) return { current: null, remembered: null, revoked: false };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { current: null, remembered, revoked: false };

  const supabase = createBrowserClient(url, key);
  const { data } = await supabase
    .from('users')
    .select('active_session_id')
    .single();

  const current = (data?.active_session_id as string | null) ?? null;
  return { current, remembered, revoked: current !== null && current !== remembered };
}
