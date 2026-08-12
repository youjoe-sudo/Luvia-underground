import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default async function ExamDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: canAttempt } = await supabase.rpc('can_attempt_exam', { p_exam_id: id });
  if (!canAttempt) {
    return (
      <Card>
        <Badge tone="warning">Locked</Badge>
        <p className="mt-2 text-sm text-white/70">
          This exam is locked. Confirm attendance and complete prerequisite lessons.
        </p>
      </Card>
    );
  }

  const { data: exam } = await supabase
    .from('exams')
    .select('id, title, time_limit_minutes, exam_questions(id, question, question_type, options, sort_order)')
    .eq('id', id)
    .maybeSingle();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{exam?.title}</h1>
      <p className="text-sm text-white/60">
        {exam?.time_limit_minutes
          ? `Time limit: ${exam.time_limit_minutes} min`
          : 'No time limit'}
      </p>
      <p className="text-sm text-white/60">
        Submission + grading run client-side; your answers are saved when you submit.
      </p>
    </div>
  );
}