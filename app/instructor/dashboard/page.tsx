import Link from 'next/link';
import { BookOpen, Calendar, ClipboardCheck, GraduationCap } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';

export default async function InstructorDashboard() {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();

  // 1) Pull the instructor's cohorts via the RPC we added in 0002.
  const { data: myCohorts } = await supabase.rpc('my_staff_cohorts');
  const cohortRows = (myCohorts ?? []) as Array<{
    id: string;
    course_id: string;
    group_name: string;
    role: string | null;
  }>;
  const cohortIds = cohortRows.map((c) => c.id);

  // 2) Aggregated stats scoped to those cohorts.
  const now = new Date().toISOString();
  const weekAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [live, upcoming, lessons, attendancePending, upcomingRows, sessionIdsRows] =
    await Promise.all([
      supabase
        .from('virtual_sessions')
        .select('id', { count: 'exact', head: true })
        .in('cohort_id', cohortIds.length ? cohortIds : ['00000000-0000-0000-0000-000000000000'])
        .eq('status', 'live'),
      supabase
        .from('virtual_sessions')
        .select('id', { count: 'exact', head: true })
        .in('cohort_id', cohortIds.length ? cohortIds : ['00000000-0000-0000-0000-000000000000'])
        .gt('start_time', now)
        .lt('start_time', weekAhead),
      supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .in('cohort_id', cohortIds.length ? cohortIds : ['00000000-0000-0000-0000-000000000000']),
      supabase
        .from('attendance_records')
        .select('id', { count: 'exact', head: true })
        .neq('final_status', 'present'),
      supabase
        .from('virtual_sessions')
        .select('id, title, start_time, status, is_link_active, cohorts(group_name)')
        .in('cohort_id', cohortIds.length ? cohortIds : ['00000000-0000-0000-0000-000000000000'])
        .gt('start_time', now)
        .order('start_time', { ascending: true })
        .limit(5),
      supabase
        .from('virtual_sessions')
        .select('id')
        .in('cohort_id', cohortIds.length ? cohortIds : ['00000000-0000-0000-0000-000000000000']),
    ]);

  const sessionIds = ((sessionIdsRows.data ?? []) as Array<{ id: string }>).map((s) => s.id);
  const pendingAttendance = sessionIds.length
    ? await supabase
        .from('attendance_records')
        .select('id', { count: 'exact', head: true })
        .in('session_id', sessionIds)
        .neq('final_status', 'present')
    : { count: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.full_name.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-white/60">
          You are assigned as <span className="text-brand-cyan">instructor</span> on{' '}
          {cohortRows.length} cohort{cohortRows.length === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/instructor/sessions">
          <Card>
            <Calendar className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Live now</CardTitle>
            <CardDescription>{live.count ?? 0} in session</CardDescription>
          </Card>
        </Link>
        <Link href="/instructor/sessions">
          <Card>
            <Calendar className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">This week</CardTitle>
            <CardDescription>{upcoming.count ?? 0} upcoming</CardDescription>
          </Card>
        </Link>
        <Link href="/instructor/lessons">
          <Card>
            <BookOpen className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Lessons</CardTitle>
            <CardDescription>{lessons.count ?? 0} across my cohorts</CardDescription>
          </Card>
        </Link>
        <Link href="/instructor/attendance">
          <Card>
            <ClipboardCheck className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Pending attendance</CardTitle>
            <CardDescription>{pendingAttendance.count ?? 0} unmarked</CardDescription>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming sessions</CardTitle>
        </CardHeader>
        {(!upcomingRows.data || upcomingRows.data.length === 0) && (
          <p className="text-sm text-white/60">No upcoming sessions.</p>
        )}
        {(upcomingRows.data ?? []).length > 0 && (
          <ul className="divide-y divide-white/5">
            {(upcomingRows.data as any[]).map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-xs text-white/50">
                    {new Date(s.start_time).toLocaleString()} ·{' '}
                    {s.cohorts?.group_name ?? '—'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={s.is_link_active ? 'success' : 'neutral'}>
                    {s.is_link_active ? 'Open' : 'Pending'}
                  </Badge>
                  <Badge
                    tone={
                      s.status === 'live'
                        ? 'info'
                        : s.status === 'completed'
                        ? 'success'
                        : 'neutral'
                    }
                  >
                    {s.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm">
          <li>
            →{' '}
            <Link href="/instructor/cohorts" className="text-brand-cyan hover:underline">
              View my cohorts
            </Link>
          </li>
          <li>
            →{' '}
            <Link href="/instructor/exams" className="text-brand-cyan hover:underline">
              See exams for my cohorts
            </Link>
          </li>
          <li>
            →{' '}
            <Link href="/instructor/community" className="text-brand-cyan hover:underline">
              Check community posts
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}