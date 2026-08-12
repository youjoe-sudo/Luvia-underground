'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function ApproveRejectButtons({ id }: { id: string }) {
  const router = useRouter();
  const { show } = useToast();

  const act = async (action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/requests/${id}/${action}`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) {
      show(json.error ?? 'Failed', 'danger');
      return;
    }
    if (action === 'approve' && json.tempPassword) {
      show(`Approved. Temp password: ${json.tempPassword}`, 'info', 8000);
    } else {
      show(`Request ${action}d`, 'success');
    }
    router.refresh();
  };

  return (
    <div className="mt-2 flex gap-2">
      <Button size="sm" onClick={() => act('approve')}>Approve</Button>
      <Button size="sm" variant="danger" onClick={() => act('reject')}>Reject</Button>
    </div>
  );
}