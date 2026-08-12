import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';
import { LessonPlayer } from './LessonPlayer';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const { id } = await params;

  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, title, description, video_id, duration_seconds')
    .eq('id', id)
    .maybeSingle();

  if (!lesson) {
    return <p className="text-sm text-white/60">Lesson not found.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-1 text-sm text-white/60">{lesson.description}</p>
        )}
      </div>
      <LessonPlayer
        lessonId={lesson.id}
        videoId={lesson.video_id}
        durationSeconds={lesson.duration_seconds}
        studentName={user.full_name}
        studentPhone={user.email}
      />
    </div>
  );
}