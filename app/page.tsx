import Link from 'next/link';
import { getSessionUser, isAdminRole } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function LandingPage() {
  const user = await getSessionUser();
  if (user) {
    if (user.must_change_password) redirect('/change-password');
    if (isAdminRole(user.role)) redirect('/admin/dashboard');
    if (user.role === 'instructor') redirect('/instructor/dashboard');
    if (user.role === 'coordinator') redirect('/coordinator/dashboard');
    redirect('/student/dashboard');
  }

  const supabase = await createClient();
  const { data: activeCourse } = await supabase
    .from('courses')
    .select('id, title, description')
    .eq('is_active', true)
    .maybeSingle();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              The Luvia course
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Learn. Practice. Progress.{' '}
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                Earn your certificate.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/70 md:text-lg">
              {activeCourse?.description ??
                'A focused, premium learning experience built around one course — no distractions, no marketplace.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/access">
                <Button>Enroll Now</Button>
              </Link>
              <Link href="/course">
                <Button variant="secondary">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Course overview */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-semibold">{activeCourse?.title ?? 'The Luvia Course'}</h2>
        <p className="mt-3 max-w-2xl text-white/70">
          A structured path designed for serious learners. Watch, practice, track progress,
          and complete the course to receive your certificate.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { k: 'Watch', v: 'Self-paced video lessons.' },
            { k: 'Practice', v: 'Apply what you learn each module.' },
            { k: 'Progress', v: 'Track lessons, XP, and streaks.' },
            { k: 'Complete', v: 'Finish every required lesson.' },
            { k: 'Get Certified', v: 'Earn a verifiable certificate.' },
          ].map((s, i) => (
            <Card key={s.k}>
              <CardTitle className="text-base">
                <span className="mr-2 text-brand-cyan">0{i + 1}</span>
                {s.k}
              </CardTitle>
              <CardDescription>{s.v}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <h3 className="text-2xl font-semibold">Ready to start?</h3>
          <p className="mt-2 text-white/70">
            Submit an enrollment request and our team will review your application.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/access">
              <Button>Request Enrollment</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
