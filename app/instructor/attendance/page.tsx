import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';

export default async function InstructorAttendancePage() {
  const supabase = await createClient();

  const { data: myCohorts } = await supabase.rpc('my_staff_cohorts');
  const cohortIds = ((myCohorts ?? []) as Array<{ id: string }>).map((c) => c.id);

  const { data: sessions } = cohortIds.length
    ? await supabase
        .from('virtual_sessions')
        .select('id, title, start_time, cohorts(group_name)')
        .in('cohort_id', cohortIds)
        .order('start_time', { ascending: false })
    : { data: [] };

  const sessionIds = ((sessions ?? []) as Array<{ id: string }>).map((s) => s.id);

  const { data: records } = sessionIds.length
    ? await supabase
        .from('attendance_records')
        .select('id, session_id, student_id, first_check, second_check, final_status, users(full_name)')
        .in('session_id', sessionIds)
        .order('final_status', { ascending: true })
        .limit(100)
    : { data: [] };

  const sessionMap = new Map(
    ((sessions ?? []) as any[]).map((s) => [s.id, s])
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Attendance</h1>
      <Card>
        {!records || records.length === 0 ? (
          <p className="text-sm text-white/60">No attendance records yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {(records as any[]).map((r) => {
              const s = sessionMap.get(r.session_id);
              return (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">
                      {s?.title ?? '—'}{' '}
                      <span className="text-xs text-white/50">
                        · {s?.cohorts?.group_name ?? '—'}
                      </span>
                    </div>
                    <div className="text-xs text-white/50">
                      {(r as any).users?.full_name ?? 'Student'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.first_check && <Badge tone="info">First</Badge>}
                    {r.second_check && <Badge tone="info">Second</Badge>}
                    <Badge tone={r.final_status === 'present' ? 'success' : 'danger'}>
                      {r.final_status}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}