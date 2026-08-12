import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

export default async function CoordinatorStudentsPage() {
  const supabase = await createClient();

  const { data: myCohorts } = await supabase.rpc('my_staff_cohorts');
  const cohortIds = ((myCohorts ?? []) as Array<{ id: string }>).map((c) => c.id);

  const { data: enrollments } = cohortIds.length
    ? await supabase
        .from('student_cohorts')
        .select('student_id, cohort_id, users(full_name, email), cohorts(group_name)')
        .in('cohort_id', cohortIds)
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Students</h1>
      <Card>
        {!enrollments || enrollments.length === 0 ? (
          <p className="text-sm text-white/60">No students in your cohorts.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {(enrollments as any[]).map((e, idx) => (
              <li key={`${e.student_id}-${e.cohort_id}-${idx}`} className="py-3">
                <div className="font-medium">{e.users?.full_name ?? 'Unknown'}</div>
                <div className="text-xs text-white/50">
                  {e.users?.email ?? '—'} · Cohort: {e.cohorts?.group_name ?? '—'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}