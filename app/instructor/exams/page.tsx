import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';

export default async function InstructorExamsPage() {
  const supabase = await createClient();

  const { data: myCohorts } = await supabase.rpc('my_staff_cohorts');
  const cohortIds = ((myCohorts ?? []) as Array<{ id: string }>).map((c) => c.id);

  const { data: exams } = cohortIds.length
    ? await supabase
        .from('exams')
        .select(
          'id, title, is_periodic, is_final, requires_attendance, requires_lesson_complete, time_limit_minutes, cohorts(group_name), courses(title)'
        )
        .in('cohort_id', cohortIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Exams</h1>
      <Card>
        {!exams || exams.length === 0 ? (
          <p className="text-sm text-white/60">No exams scheduled for your cohorts.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {(exams as any[]).map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-white/50">
                    {e.courses?.title ?? '—'} · {e.cohorts?.group_name ?? '—'}
                    {e.time_limit_minutes ? ` · ${e.time_limit_minutes} min` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {e.is_periodic && <Badge tone="info">Periodic</Badge>}
                  {e.is_final && <Badge tone="warning">Final</Badge>}
                  {e.requires_attendance && <Badge tone="neutral">Attendance</Badge>}
                  {e.requires_lesson_complete && <Badge tone="neutral">Lesson</Badge>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}