import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, BookOpen, GraduationCap, MessageSquare } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';

export default async function StudentDashboard() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const supabase = await createClient();

  // Course Lock — pick the most recent enrollment.
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('course_id, courses(title)')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const courseId = (enrollment as any)?.course_id ?? null;

  let upcomingSessions: any[] = [];
  if (courseId) {
    const { data: cohort } = await supabase
      .from('student_cohorts')
      .select('cohort_id')
      .eq('student_id', user.id)
      .limit(1)
      .maybeSingle();
    if (cohort?.cohort_id) {
      const { data } = await supabase
        .from('virtual_sessions')
        .select('id, title, start_time, status, is_link_active')
        .eq('cohort_id', cohort.cohort_id)
        .gt('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);
      upcomingSessions = data ?? [];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.full_name.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-white/60">
          {enrollment
            ? <>Active course: <span className="text-brand-cyan">{(enrollment as any).courses?.title ?? '—'}</span></>
            : 'No active course. Contact support to enroll.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/student/sessions">
          <Card>
            <Calendar className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Upcoming sessions</CardTitle>
            <CardDescription>{upcomingSessions.length} scheduled</CardDescription>
          </Card>
        </Link>
        <Link href="/student/lessons">
          <Card>
            <BookOpen className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Self-paced</CardTitle>
            <CardDescription>Lessons available</CardDescription>
          </Card>
        </Link>
        <Link href="/student/exams">
          <Card>
            <GraduationCap className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Exams</CardTitle>
            <CardDescription>Gated by attendance</CardDescription>
          </Card>
        </Link>
        <Link href="/student/community">
          <Card>
            <MessageSquare className="h-5 w-5 text-brand-cyan" />
            <CardTitle className="mt-2 text-base">Community</CardTitle>
            <CardDescription>Closed cohort forum</CardDescription>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming live sessions</CardTitle>
        </CardHeader>
        {upcomingSessions.length === 0 ? (
          <p className="text-sm text-white/60">Nothing on the agenda yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {upcomingSessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-xs text-white/50">{new Date(s.start_time).toLocaleString()}</div>
                </div>
                <Badge tone={s.is_link_active ? 'success' : 'neutral'}>
                  {s.is_link_active ? 'Open' : 'Pending'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}