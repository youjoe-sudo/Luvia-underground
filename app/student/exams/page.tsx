import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

type Exam = {
  id: string;
  title: string;
  is_periodic: boolean;
  is_final: boolean;
  requires_attendance: boolean;
  requires_lesson_complete: boolean;
  session_id: string | null;
  lesson_id: string | null;
  time_limit_minutes: number | null;
};

export default async function ExamsIndex() {
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

  const { data: exams } = cohort?.cohort_id
    ? await supabase
        .from('exams')
        .select(
          'id, title, is_periodic, is_final, requires_attendance, requires_lesson_complete, session_id, lesson_id, time_limit_minutes'
        )
        .eq('cohort_id', cohort.cohort_id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const typedExams = (exams ?? []) as Exam[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Exams</h1>

      {typedExams.length === 0 ? (
        <Card>
          <p className="text-sm text-white/60">No exams available.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {typedExams.map((e: Exam) => (
            <Card key={e.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{e.title}</div>

                  <div className="mt-1 flex gap-2 text-xs">
                    {e.is_final && (
                      <Badge tone="info">Final</Badge>
                    )}

                    {e.is_periodic && (
                      <Badge tone="neutral">Periodic</Badge>
                    )}

                    {e.requires_attendance && (
                      <Badge tone="warning">Attendance-gated</Badge>
                    )}

                    {e.requires_lesson_complete && (
                      <Badge tone="warning">Lesson required</Badge>
                    )}

                    {e.time_limit_minutes && (
                      <span className="text-white/50">
                        {e.time_limit_minutes} min
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/student/exams/${e.id}`}
                  className="rounded-lg bg-brand-gradient px-4 py-2 text-sm"
                >
                  Open
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}