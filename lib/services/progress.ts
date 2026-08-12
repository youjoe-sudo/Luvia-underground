import { createClient } from '@/lib/supabase/client';

export interface CompletionResult {
  xp_awarded: number;
  xp_total: number;
  already_completed: boolean;
}

/**
 * Mark a lesson complete via the server-authoritative RPC.
 * The RPC is idempotent — calling twice yields no double XP.
 */
export async function completeLesson(lessonId: string): Promise<CompletionResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('complete_lesson', { p_lesson_id: lessonId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    xp_awarded: Number(row?.xp_awarded ?? 0),
    xp_total: Number(row?.xp_total ?? 0),
    already_completed: Boolean(row?.already_completed),
  };
}

/**
 * Course progress as completed lessons / total lessons (spec §19).
 */
export async function getCourseProgress(courseId: string): Promise<{
  completed: number;
  total: number;
  percent: number;
}> {
  const supabase = createClient();
  const { count: total } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseId);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { completed: 0, total: total ?? 0, percent: 0 };

  const { count: completed } = await supabase
    .from('lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .in('lesson_id',
      // We can't nest a subquery here easily; fetch lesson ids then filter.
      // For low lesson counts (single course, <100) this is fine.
      (await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId)).data?.map((l: any) => l.id) ?? []
    );

  const c = completed ?? 0;
  const t = total ?? 0;
  return { completed: c, total: t, percent: t === 0 ? 0 : Math.round((c / t) * 100) };
}

/**
 * Level calculation per spec §20:
 *   level = floor(xp / 500) + 1
 */
export function levelFromXp(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function xpIntoCurrentLevel(xp: number): { level: number; intoLevel: number; nextLevelAt: number } {
  const level = levelFromXp(xp);
  const baseForLevel = (level - 1) * 500;
  return {
    level,
    intoLevel: xp - baseForLevel,
    nextLevelAt: baseForLevel + 500,
  };
}