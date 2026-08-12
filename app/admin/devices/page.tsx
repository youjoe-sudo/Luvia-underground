import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { DeviceActions } from './DeviceActions';

export default async function DevicesPage() {
  const supabase = await createClient();
  const { data: devices } = await supabase
    .from('device_locks')
    .select('id, user_id, device_fingerprint, ip_address, is_approved, flagged_at, users(email, full_name)')
    .order('flagged_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Device Lock review</h1>
      <Card>
        {!devices || devices.length === 0 ? (
          <p className="text-sm text-white/60">No flagged devices.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {devices.map((d: any) => (
              <li key={d.id} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium">{d.users?.full_name ?? '—'} · {d.users?.email ?? '—'}</div>
                    <div className="truncate text-xs text-white/50">
                      fp {d.device_fingerprint.slice(0, 12)}… · ip {d.ip_address ?? '—'}
                    </div>
                    <div className="text-xs text-white/40">{new Date(d.flagged_at).toLocaleString()}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={d.is_approved ? 'success' : 'warning'}>{d.is_approved ? 'Approved' : 'Pending'}</Badge>
                    {!d.is_approved && <DeviceActions id={d.id} userId={d.user_id} />}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}