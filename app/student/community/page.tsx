import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: cohort } = await supabase
    .from('student_cohorts')
    .select('cohort_id')
    .eq('student_id', user.id)
    .limit(1)
    .maybeSingle();

  const { data: posts } = await supabase
    .from('community_posts')
    .select('id, title, body, created_at, users(full_name)')
    .eq('cohort_id', cohort?.cohort_id ?? '')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Course community</h1>
      {!posts || posts.length === 0 ? (
        <Card><p className="text-sm text-white/60">No posts yet.</p></Card>
      ) : (
        <div className="space-y-3">
          {posts.map((p: any) => (
            <Card key={p.id}>
              <div className="text-sm font-medium">{p.title ?? 'Discussion'}</div>
              <p className="mt-1 text-sm text-white/70">{p.body}</p>
              <p className="mt-2 text-xs text-white/40">
                {p.users?.full_name ?? '—'} · {new Date(p.created_at).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}