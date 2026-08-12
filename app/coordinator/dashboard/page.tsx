import Link from 'next/link';
import {
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Users,
} from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';

export default async function CoordinatorDashboard() {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();

  // Cohorts this coordinator is assigned to
  const { data: myCohorts } = await supabase.rpc('my_staff_cohorts');
  const cohorts = (myCohorts ?? []) as Array<{
    id: string;
    course_id: string;
    group_name: string;
    role: string | null;
  }>;
  const cohortIds = cohorts.map((c) => c.id);
  const placeholder = ['00000000-0000-0000-0000-000000000000'];
  const filterIds = cohortIds.length ? cohortIds : placeholder;

  const now = new Date().toISOString();

  const [cohortsCount, studentsCount, upcomingCount, attendancePending] = await Promise.all([
    supabase
      .from('cohorts')
      .select('id', { count: 'exact', head: true })
      .eq('coordinator_id', user.id),
    supabase
      .from('student_cohorts')
      .select('student_id', { count: 'exact', head: true })
      .in('cohort_id', filterIds),
    supabase
      .from('virtual_sessions')
      .select('id', { count: 'exact', head: true })
      .in('cohort_id', filterIds)
      .gt('start_time', now),
    // count attendance rows for my cohort sessions that are not 'present'
    cohortIds.length
      ? (async () => {
          const { data: sessions } = await supabase
            .from('virtual_sessions')
            .select('id')
            .in('cohort_id', filterIds);
          const sessionIds = ((sessions ?? []) as Array<{ id: string }>).map((s) => s.id);
          if (!sessionIds.length) return { count: 0 } as any;
          return supabase
            .from('attendance_records')
            .select('id', { count: 'exact', head: true })
            .in('session_id', sessionIds)
            .neq('final_status', 'present');
        })()
      : Promise.resolve({ count: 0 } as any),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.full_name.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-white/60">
          You are assigned as <span className="text-brand-cyan">coordinator</span> on{' '}
          {cohorts.length} cohort{cohorts.length === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/coordinator/cohorts">
          <Card>
            <Users className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Cohorts</CardTitle>
            <CardDescription>{cohortsCount.count ?? 0} assigned</CardDescription>
          </Card>
        </Link>
        <Link href="/coordinator/students">
          <Card>
            <GraduationCap className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Students</CardTitle>
            <CardDescription>{studentsCount.count ?? 0} enrolled</CardDescription>
          </Card>
        </Link>
        <Link href="/coordinator/sessions">
          <Card>
            <Calendar className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Upcoming</CardTitle>
            <CardDescription>{upcomingCount.count ?? 0} sessions</CardDescription>
          </Card>
        </Link>
        <Link href="/coordinator/attendance">
          <Card>
            <ClipboardCheck className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Pending</CardTitle>
            <CardDescription>
              {attendancePending.count ?? 0} attendance rows
            </CardDescription>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cohorts you oversee</CardTitle>
        </CardHeader>
        {cohorts.length === 0 ? (
          <p className="text-sm text-white/60">No cohorts assigned.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {cohorts.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{c.group_name}</div>
                  <div className="text-xs text-white/50">Cohort · {c.id.slice(0, 8)}…</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}