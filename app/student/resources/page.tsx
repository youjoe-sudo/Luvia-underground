import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';

type Enrollment = {
  course_id: string;
};

type Resource = {
  id: string;
  title: string;
  description: string | null;
  storage_url: string | null;
  external_url: string | null;
};

export default async function ResourcesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('user_id', user.id);

  const typedEnrollments = (enrollments ?? []) as Enrollment[];

  const courseIds = typedEnrollments.map(
    (e: Enrollment) => e.course_id
  );

  if (courseIds.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Resources</h1>

        <Card>
          <p className="text-sm text-white/60">
            Activate a course to see its resources.
          </p>
        </Card>
      </div>
    );
  }

  const { data: resources } = await supabase
    .from('resources')
    .select(
      'id, title, description, storage_url, external_url'
    )
    .in('course_id', courseIds);

  const typedResources = (resources ?? []) as Resource[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Resources</h1>

      {typedResources.length === 0 ? (
        <Card>
          <p className="text-sm text-white/60">
            No resources published yet.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {typedResources.map((r: Resource) => (
            <Card key={r.id}>
              <div className="font-medium">
                {r.title}
              </div>

              {r.description && (
                <p className="mt-1 text-sm text-white/60">
                  {r.description}
                </p>
              )}

              {r.external_url ? (
                <a
                  className="mt-2 inline-block text-sm text-brand-cyan hover:underline"
                  href={r.external_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open link →
                </a>
              ) : r.storage_url ? (
                <a
                  className="mt-2 inline-block text-sm text-brand-cyan hover:underline"
                  href={r.storage_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download →
                </a>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}