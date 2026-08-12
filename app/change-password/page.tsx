'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { show } = useToast();
  const { refreshProfile } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      show('Passwords do not match', 'danger');
      return;
    }
    if (next.length < 8 || !/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/[0-9]/.test(next) || !/[^A-Za-z0-9]/.test(next)) {
      show('Password must be 8+ chars with upper, lower, digit, and symbol.', 'danger');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current, next }),
      });
      const json = await res.json();
      if (!res.ok) {
        show(json.error ?? 'Failed to change password', 'danger');
        return;
      }
      show('Password updated', 'success');
      await refreshProfile();
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="bg-brand-gradient bg-clip-text text-3xl font-bold text-transparent">Luvia</div>
          <p className="mt-1 text-sm text-white/60">Set a new password to continue.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>
              You're using a temporary password. Set a strong one to proceed.
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input label="Current (temporary) password" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
            <Input label="New password" type="password" required value={next} onChange={(e) => setNext(e.target.value)} />
            <Input label="Confirm new password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <Button type="submit" loading={loading} className="w-full">Update password</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}