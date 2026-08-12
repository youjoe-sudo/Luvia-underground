import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const supabase = await createClient();
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, courses(title), enrolled_at')
    .eq('user_id', user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <Card>
        <h2 className="text-sm font-semibold">Account</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <dt className="text-white/50">Name</dt><dd>{user.full_name}</dd>
          <dt className="text-white/50">Email</dt><dd>{user.email}</dd>
          <dt className="text-white/50">Role</dt><dd className="capitalize">{user.role.replace('_', ' ')}</dd>
        </dl>
      </Card>
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Activated courses</h2>
        {!enrollments || enrollments.length === 0 ? (
          <p className="text-sm text-white/60">
            No active course. Contact management or redeem a voucher.
          </p>
        ) : (
          <ul className="space-y-2">
            {enrollments.map((e: any) => (
              <li key={e.id} className="flex items-center justify-between rounded border border-brand-border p-3">
                <div>
                  <div className="font-medium">{e.courses?.title ?? '—'}</div>
                  <div className="text-xs text-white/50">Enrolled {new Date(e.enrolled_at).toLocaleDateString()}</div>
                </div>
                <Badge tone="success">Active</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}