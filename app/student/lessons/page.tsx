import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number;
  sort_order: number;
};

export default async function LessonsIndex() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  const { data: cohort } = await supabase
    .from('student_cohorts')
    .select('cohort_id, courses(title)')
    .eq('student_id', user.id)
    .limit(1)
    .maybeSingle();

  const { data: lessons } = cohort?.cohort_id
    ? await supabase
        .from('lessons')
        .select(
          'id, title, description, duration_seconds, sort_order'
        )
        .eq('cohort_id', cohort.cohort_id)
        .order('sort_order', { ascending: true })
    : { data: [] };

  const typedLessons = (lessons ?? []) as Lesson[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Self-paced lessons
      </h1>

      {typedLessons.length === 0 ? (
        <Card>
          <p className="text-sm text-white/60">
            No lessons published yet.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {typedLessons.map((l: Lesson) => (
            <Link
              key={l.id}
              href={`/student/lessons/${l.id}`}
            >
              <Card>
                <div className="font-medium">
                  {l.title}
                </div>

                <p className="mt-1 line-clamp-2 text-sm text-white/60">
                  {l.description ?? 'No description.'}
                </p>

                <p className="mt-2 text-xs text-white/40">
                  Duration:{' '}
                  {Math.max(
                    1,
                    Math.round(l.duration_seconds / 60)
                  )}{' '}
                  min
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}