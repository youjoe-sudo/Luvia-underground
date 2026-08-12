'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { getFingerprint } from '@/lib/security/fingerprint';
import { rememberSessionId } from '@/lib/security/single-session';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { show } = useToast();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const banned = params.get('banned') === '1';
  const revoked = params.get('revoked') === '1';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fingerprint = await getFingerprint();
      const res = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    password,
    fingerprint,
  }),
});
const contentType = res.headers.get('content-type');

if (!contentType?.includes('application/json')) {
  const text = await res.text();

  console.error('LOGIN API RETURNED NON-JSON:', {
    status: res.status,
    url: res.url,
    contentType,
    body: text.slice(0, 500),
  });

  throw new Error(
    `Login API returned ${contentType || 'unknown response'}`
  );
}

const json = await res.json();
      if (!res.ok) {
        show(json.error ?? 'Invalid credentials', 'danger');
        return;
      }
      if (json.sessionId) rememberSessionId(json.sessionId);
      await refreshProfile();
      if (json.mustChangePassword) router.replace('/change-password');
      else router.replace('/');
    } catch (err) {
      show((err as Error).message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <div className="bg-brand-gradient bg-clip-text text-3xl font-bold text-transparent">Luvia</div>
        <p className="mt-1 text-sm text-white/60">Welcome back. Sign in to continue.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use your Luvia email and password.</CardDescription>
        </CardHeader>
        {banned && (
          <p className="mb-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
            Your account has been banned. Contact support.
          </p>
        )}
        {revoked && (
          <p className="mb-3 rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-300">
            Signed in from another device. You have been logged out here.
          </p>
        )}
        <form onSubmit={onSubmit} className="space-y-3">
          <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" loading={loading} className="w-full">Sign in</Button>
        </form>
        <div className="mt-4 text-center text-xs text-white/60">
          No account?{' '}
          <Link href="/access" className="text-brand-cyan hover:underline">Request access</Link>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Suspense fallback={<div className="text-white/60">Loading…</div>}>
        <LoginInner />
      </Suspense>
    </main>
  );
}