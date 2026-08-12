import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

export default async function InstructorLessonsPage() {
  const supabase = await createClient();

  const { data: myCohorts } = await supabase.rpc('my_staff_cohorts');
  const cohortIds = ((myCohorts ?? []) as Array<{ id: string }>).map((c) => c.id);

  const { data: lessons } = cohortIds.length
    ? await supabase
        .from('lessons')
        .select('id, title, description, duration_seconds, sort_order, cohorts(group_name), courses(title)')
        .in('cohort_id', cohortIds)
        .order('sort_order', { ascending: true })
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Lessons</h1>
      <Card>
        {!lessons || lessons.length === 0 ? (
          <p className="text-sm text-white/60">No lessons in your cohorts yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {(lessons as any[]).map((l) => (
              <li key={l.id} className="py-3">
                <div className="font-medium">{l.title}</div>
                <div className="text-xs text-white/50">
                  {l.courses?.title ?? '—'} · {l.cohorts?.group_name ?? '—'} ·{' '}
                  {Math.round((l.duration_seconds ?? 0) / 60)} min
                </div>
                {l.description && (
                  <p className="mt-1 text-sm text-white/70">{l.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}