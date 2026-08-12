import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

export default async function CoursePage() {
  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, description')
    .eq('is_active', true)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold md:text-4xl">
          {course?.title ?? 'The Luvia Course'}
        </h1>
        <p className="mt-3 max-w-2xl text-white/70">
          {course?.description ??
            'Designed for serious learners who want depth, structure, and a real outcome.'}
        </p>
        <div className="mt-6">
          <Link href="/access">
            <Button>Continue Course</Button>
          </Link>
        </div>
      </header>

      <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>What you will learn</CardTitle>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/70">
            <li>Foundational principles of the discipline.</li>
            <li>How to apply concepts in real scenarios.</li>
            <li>How to track progress and self-improve.</li>
            <li>How to complete a capstone worthy of certification.</li>
          </ul>
        </Card>
        <Card>
          <CardTitle>Course outcomes</CardTitle>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/70">
            <li>Complete every required lesson.</li>
            <li>Earn XP and track your streak.</li>
            <li>Receive a verifiable certificate.</li>
          </ul>
        </Card>
        <Card>
          <CardTitle>Requirements</CardTitle>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/70">
            <li>Stable internet connection.</li>
            <li>Mobile or desktop device.</li>
            <li>Willingness to complete lessons in order.</li>
          </ul>
        </Card>
        <Card>
          <CardTitle>Structure</CardTitle>
          <p className="mt-3 text-sm text-white/70">
            Lessons are delivered in sequence. Mark each one complete to unlock the next.
            Progress is measured as <em>completed lessons / total lessons</em>.
          </p>
        </Card>
      </section>
    </div>
  );
}
