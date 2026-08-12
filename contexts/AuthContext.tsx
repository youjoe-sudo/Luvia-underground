'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getFingerprint } from '@/lib/security/fingerprint';
import { startHeartbeat } from '@/lib/security/heartbeat';
import { checkSingleSession, clearRememberedSessionId, rememberSessionId } from '@/lib/security/single-session';
import type { Database } from '@/lib/types/database';

type Role = Database['public']['Enums']['user_role'];

export interface AuthProfile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_banned: boolean;
  must_change_password: boolean;
}

interface AuthContextValue {
  profile: AuthProfile | null;
  loading: boolean;
  fingerprint: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const heartbeatStopRef = useRef<(() => void) | null>(null);

  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_banned, must_change_password')
      .eq('id', user.id)
      .single();
    setProfile(data ?? null);
  }, [supabase]);

  const handleSessionRevoked = useCallback(async () => {
    heartbeatStopRef.current?.();
    heartbeatStopRef.current = null;
    clearRememberedSessionId();
    await supabase.auth.signOut();
    setProfile(null);
    router.replace('/login?revoked=1');
  }, [router, supabase]);

  const startSession = useCallback(async (fp: string) => {
    const { data, error } = await supabase.rpc('start_session', { p_fingerprint: fp });
    if (error || !data) throw error ?? new Error('start_session returned no id');
    const sessionId = String(data);
    rememberSessionId(sessionId);
    heartbeatStopRef.current?.();
    heartbeatStopRef.current = startHeartbeat({
      fingerprint: fp,
      sessionId,
      onSessionRevoked: handleSessionRevoked,
      onTimeout: handleSessionRevoked,
    });
  }, [supabase, handleSessionRevoked]);

  const signOut = useCallback(async () => {
    heartbeatStopRef.current?.();
    heartbeatStopRef.current = null;
    try {
      await supabase.rpc('end_session');
    } catch {
      // ignore — signOut below will still succeed
    }
    clearRememberedSessionId();
    await supabase.auth.signOut();
    setProfile(null);
    router.replace('/login');
  }, [router, supabase]);

  // Initial mount: load session, fingerprint, and start heartbeat.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fp = await getFingerprint();
      if (cancelled) return;
      setFingerprint(fp);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        await startSession(fp);
      } catch {
        await supabase.auth.signOut();
        setProfile(null);
        setLoading(false);
        return;
      }

      await refreshProfile();
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (!session) {
        heartbeatStopRef.current?.();
        heartbeatStopRef.current = null;
        clearRememberedSessionId();
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      heartbeatStopRef.current?.();
      heartbeatStopRef.current = null;
    };
  }, [supabase, refreshProfile, startSession]);

  // Periodic single-session re-check (covers the case where another tab
  // signs in and we're still on this page).
  useEffect(() => {
    if (!profile) return;
    const id = window.setInterval(async () => {
      const { revoked } = await checkSingleSession();
      if (revoked) {
        await handleSessionRevoked();
      }
    }, 15_000);
    return () => window.clearInterval(id);
  }, [profile, handleSessionRevoked]);

  const value = useMemo<AuthContextValue>(() => ({
    profile,
    loading,
    fingerprint,
    signOut,
    refreshProfile,
  }), [profile, loading, fingerprint, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
