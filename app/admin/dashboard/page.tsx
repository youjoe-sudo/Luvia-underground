import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [pending, courses, sessions, devices, tickets] = await Promise.all([
    supabase.from('account_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('virtual_sessions').select('id', { count: 'exact', head: true }),
    supabase.from('device_locks').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).neq('status', 'closed'),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin overview</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Stat label="Pending requests" value={pending.count ?? 0} />
        <Stat label="Active courses" value={courses.count ?? 0} />
        <Stat label="Sessions" value={sessions.count ?? 0} />
        <Stat label="New devices" value={devices.count ?? 0} tone="warning" />
        <Stat label="Open tickets" value={tickets.count ?? 0} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm">
          <li>→ <a className="text-brand-cyan hover:underline" href="/admin/requests">Review access requests</a></li>
          <li>→ <a className="text-brand-cyan hover:underline" href="/admin/devices">Approve / ban devices</a></li>
          <li>→ <a className="text-brand-cyan hover:underline" href="/admin/enrollments">Activate courses</a></li>
        </ul>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'warning' }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${tone === 'warning' && value > 0 ? 'text-amber-300' : 'text-white'}`}>
        {value}
      </div>
    </Card>
  );
}