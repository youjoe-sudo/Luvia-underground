'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { CredentialActions } from './CredentialActions';

interface Props {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

export function RequestActions({ id, fullName, email, phone }: Props) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const approve = async () => {
    setLoading('approve');
    try {
      const res = await fetch(`/api/admin/requests/${id}/approve`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Approval failed');
      setPassword(json.tempPassword);
      show('Account created. Share the credentials below.', 'success');
    } catch (err) {
      show((err as Error).message, 'danger');
    } finally {
      setLoading(null);
    }
  };

  const reject = async () => {
    if (!confirm('Reject this request?')) return;
    setLoading('reject');
    try {
      const res = await fetch(`/api/admin/requests/${id}/reject`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Rejection failed');
      show('Request rejected.', 'success');
      router.refresh();
    } catch (err) {
      show((err as Error).message, 'danger');
    } finally {
      setLoading(null);
    }
  };

  if (password !== null) {
    return (
      <Card className="mt-2">
        <CardTitle className="text-base">Account created</CardTitle>
        <CardDescription>
          The student has been notified. Send them their credentials below.
        </CardDescription>
        <CredentialActions
          email={email}
          fullName={fullName}
          phone={phone}
          initialPassword={password}
        />
      </Card>
    );
  }

  return (
    <div className="mt-2 flex gap-2">
      <Button size="sm" onClick={approve} loading={loading === 'approve'}>
        Approve & create account
      </Button>
      <Button size="sm" variant="danger" onClick={reject} loading={loading === 'reject'}>
        Reject
      </Button>
    </div>
  );
}