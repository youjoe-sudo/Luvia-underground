import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';
import { CohortForm } from './CohortForm';

export default async function CohortsPage() {
  const supabase = await createClient();
  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('id, group_name, course_id, coordinator_id, instructor_id, courses(title)')
    .order('created_at', { ascending: false });

  const { data: courses } = await supabase.from('courses').select('id, title');
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, role')
    .in('role', ['instructor', 'coordinator']);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cohorts</h1>
      <CohortForm
        courses={courses ?? []}
        staff={(users ?? []).map((u: any) => ({ id: u.id, name: u.full_name, role: u.role }))}
      />
      <Card>
        {!cohorts || cohorts.length === 0 ? (
          <p className="text-sm text-white/60">No cohorts yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {cohorts.map((c: any) => (
              <li key={c.id} className="py-3">
                <div className="font-medium">{c.group_name}</div>
                <div className="text-xs text-white/50">{c.courses?.title ?? '—'}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}