import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';

export default async function InstructorCohortsPage() {
  const supabase = await createClient();

  const { data: myCohorts } = await supabase.rpc('my_staff_cohorts');
  const cohorts = (myCohorts ?? []) as Array<{
    id: string;
    course_id: string;
    group_name: string;
    role: string | null;
  }>;

  const courseIds = cohorts.map((c) => c.course_id);
  const { data: courses } = courseIds.length
    ? await supabase.from('courses').select('id, title').in('id', courseIds)
    : { data: [] as Array<{ id: string; title: string }> };
  const courseMap = new Map((courses ?? []).map((c: any) => [c.id, c.title]));

  // student counts per cohort
  const counts = await Promise.all(
    cohorts.map(async (c) => {
      const { count } = await supabase
        .from('student_cohorts')
        .select('student_id', { count: 'exact', head: true })
        .eq('cohort_id', c.id);
      return { id: c.id, count: count ?? 0 };
    })
  );
  const studentMap = new Map(counts.map((c) => [c.id, c.count]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My cohorts</h1>
      <Card>
        {cohorts.length === 0 ? (
          <p className="text-sm text-white/60">No cohorts assigned to you yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {cohorts.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{c.group_name}</div>
                  <div className="text-xs text-white/50">
                    {courseMap.get(c.course_id) ?? '—'} · {studentMap.get(c.id) ?? 0} students
                  </div>
                </div>
                <Badge tone={c.role === 'instructor' ? 'info' : 'neutral'}>{c.role}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}