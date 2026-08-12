import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';

export default async function InstructorSessionsPage() {
  const supabase = await createClient();

  const { data: myCohorts } = await supabase.rpc('my_staff_cohorts');
  const cohortIds = ((myCohorts ?? []) as Array<{ id: string }>).map((c) => c.id);

  const { data: sessions } = cohortIds.length
    ? await supabase
        .from('virtual_sessions')
        .select(
          'id, title, start_time, end_time, is_link_active, status, is_attendance_confirmed, cohorts(group_name), courses(title)'
        )
        .in('cohort_id', cohortIds)
        .order('start_time', { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Live sessions</h1>
      <Card>
        {!sessions || sessions.length === 0 ? (
          <p className="text-sm text-white/60">No sessions scheduled for your cohorts.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {(sessions as any[]).map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-white/50">
                    {new Date(s.start_time).toLocaleString()} · {s.courses?.title ?? '—'} ·{' '}
                    {s.cohorts?.group_name ?? '—'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={s.is_link_active ? 'success' : 'neutral'}>
                    {s.is_link_active ? 'Link live' : 'Link off'}
                  </Badge>
                  <Badge tone={s.is_attendance_confirmed ? 'info' : 'warning'}>
                    {s.is_attendance_confirmed ? 'Attendance confirmed' : 'Pending'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}