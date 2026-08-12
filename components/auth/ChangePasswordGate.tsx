'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ChangePasswordGate({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (profile?.must_change_password) {
      router.replace('/change-password');
    }
  }, [profile, loading, router]);

  if (loading || profile?.must_change_password) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-bg text-white/60">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
