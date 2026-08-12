import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';

export default async function SessionsAdminPage() {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from('virtual_sessions')
    .select('id, title, start_time, end_time, is_link_active, status, is_attendance_confirmed, cohorts(group_name), courses(title)')
    .order('start_time', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Live sessions</h1>
      <Card>
        {!sessions || sessions.length === 0 ? (
          <p className="text-sm text-white/60">No sessions scheduled.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {sessions.map((s: any) => (
              <li key={s.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-white/50">
                      {new Date(s.start_time).toLocaleString()} · {s.courses?.title ?? '—'} · {s.cohorts?.group_name ?? '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={s.is_link_active ? 'success' : 'neutral'}>{s.is_link_active ? 'Link live' : 'Link off'}</Badge>
                    <Badge tone={s.is_attendance_confirmed ? 'info' : 'warning'}>
                      {s.is_attendance_confirmed ? 'Attendance confirmed' : 'Pending'}
                    </Badge>
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