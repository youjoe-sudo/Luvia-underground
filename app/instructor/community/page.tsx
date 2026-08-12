import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

export default async function InstructorCommunityPage() {
  const supabase = await createClient();

  const { data: myCohorts } = await supabase.rpc('my_staff_cohorts');
  const cohortIds = ((myCohorts ?? []) as Array<{ id: string }>).map((c) => c.id);

  const { data: posts } = cohortIds.length
    ? await supabase
        .from('community_posts')
        .select('id, title, body, created_at, cohorts(group_name), users(full_name)')
        .in('cohort_id', cohortIds)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Community</h1>
      <Card>
        {!posts || posts.length === 0 ? (
          <p className="text-sm text-white/60">No community posts in your cohorts.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {(posts as any[]).map((p) => (
              <li key={p.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{p.title ?? 'Untitled'}</div>
                  <div className="text-xs text-white/50">
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-white/50">
                  {(p as any).users?.full_name ?? '—'} · {p.cohorts?.group_name ?? '—'}
                </div>
                <p className="mt-1 text-sm text-white/70">{p.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}