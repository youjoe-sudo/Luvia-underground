import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

type Session = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  meeting_link: string | null;
  is_link_active: boolean;
  status: string | null;
};

export default async function SessionsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  const { data: cohort } = await supabase
    .from('student_cohorts')
    .select('cohort_id')
    .eq('student_id', user.id)
    .limit(1)
    .maybeSingle();

  const { data: sessions } = cohort?.cohort_id
    ? await supabase
        .from('virtual_sessions')
        .select(
          'id, title, start_time, end_time, meeting_link, is_link_active, status'
        )
        .eq('cohort_id', cohort.cohort_id)
        .order('start_time', { ascending: false })
    : { data: [] };

  const typedSessions = (sessions ?? []) as Session[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Live sessions</h1>

      {typedSessions.length === 0 ? (
        <Card>
          <CardDescription>
            No sessions scheduled yet.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-3">
          {typedSessions.map((s: Session) => {
            const startsAt = new Date(s.start_time).getTime();
            const now = Date.now();
            const future = startsAt > now;

            return (
              <Card key={s.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      {s.title}
                    </CardTitle>

                    <CardDescription>
                      {new Date(s.start_time).toLocaleString()} ·{' '}
                      {new Date(s.end_time).toLocaleTimeString()}
                    </CardDescription>
                  </div>

                  <Badge
                    tone={
                      s.is_link_active
                        ? 'success'
                        : future
                          ? 'neutral'
                          : 'warning'
                    }
                  >
                    {s.is_link_active
                      ? 'Join now'
                      : future
                        ? 'Upcoming'
                        : 'Ended'}
                  </Badge>
                </div>

                <div className="mt-3">
                  {s.is_link_active && s.meeting_link ? (
                    <a
                      href={s.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white"
                    >
                      Join session
                    </a>
                  ) : (
                    <span className="text-xs text-white/50">
                      The instructor will activate the link at session time.
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}