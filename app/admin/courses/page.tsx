import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { CourseForm } from './CourseForm';

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, description, is_active, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Courses</h1>
      <CourseForm />
      <Card>
        {!courses || courses.length === 0 ? (
          <p className="text-sm text-white/60">No courses yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {courses.map((c: any) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-white/50">{c.description ?? '—'}</div>
                </div>
                <Badge tone={c.is_active ? 'success' : 'neutral'}>
                  {c.is_active ? 'Active' : 'Draft'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}