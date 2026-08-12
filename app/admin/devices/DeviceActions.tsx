'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function DeviceActions({ id, userId }: { id: string; userId: string }) {
  const router = useRouter();
  const { show } = useToast();
  const act = async (action: 'approve' | 'ban') => {
    const res = await fetch(`/api/admin/devices/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      show(j.error ?? 'Failed', 'danger');
      return;
    }
    show(`Device ${action}d`, 'success');
    router.refresh();
  };
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => act('approve')}>Allow</Button>
      <Button size="sm" variant="danger" onClick={() => act('ban')}>Ban</Button>
    </div>
  );
}