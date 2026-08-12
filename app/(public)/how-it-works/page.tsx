import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const STEPS = [
  {
    n: '01',
    title: 'Apply for enrollment',
    body: 'Submit your name and contact info on the enrollment page. We review every request.',
  },
  {
    n: '02',
    title: 'Receive your account',
    body: 'Once approved, we create your account and share login details through WhatsApp or email.',
  },
  {
    n: '03',
    title: 'Log in and set a password',
    body: 'Your temporary password must be changed on first login to keep your account secure.',
  },
  {
    n: '04',
    title: 'Learn lesson by lesson',
    body: 'Watch, practice, and mark each lesson complete to progress through the course.',
  },
  {
    n: '05',
    title: 'Get certified',
    body: 'After finishing every required lesson, you receive a verifiable certificate.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">How it works</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Five steps from application to certification.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {STEPS.map((s) => (
          <Card key={s.n}>
            <div className="text-brand-cyan text-sm">{s.n}</div>
            <CardTitle className="mt-1">{s.title}</CardTitle>
            <CardDescription>{s.body}</CardDescription>
          </Card>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Link href="/access">
          <Button>Start an application</Button>
        </Link>
      </div>
    </div>
  );
}