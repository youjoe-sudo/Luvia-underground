import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';

const STATIC_FAQ = [
  {
    q: 'How do I enroll?',
    a: 'Visit the Enroll page and submit a request with your name, email, phone, and (optional) WhatsApp. Our team reviews every request.',
  },
  {
    q: 'When will I receive my account?',
    a: 'Once your request is approved, you will be contacted through WhatsApp or email with your temporary login credentials.',
  },
  {
    q: 'How do I log in?',
    a: 'Use the Login page with the email and password you were given. For security, you will be asked to change the temporary password on your first login.',
  },
  {
    q: 'How do I change my password?',
    a: 'After your first login, you will be guided through a mandatory password change. Afterward, you can change it again from your profile.',
  },
  {
    q: 'How does the course work?',
    a: 'You progress lesson by lesson in order. Mark each lesson complete to earn XP and unlock the next lesson.',
  },
  {
    q: 'How do I track progress?',
    a: 'Your dashboard always shows current course, progress percentage, XP, level, and streak.',
  },
  {
    q: 'How do certificates work?',
    a: 'When you complete every required lesson, a certificate is generated with a unique ID and a QR code that anyone can scan to verify.',
  },
  {
    q: 'How do I contact support?',
    a: 'Reach us through the contact information shown on the Enroll page or in your dashboard announcements.',
  },
];

export default async function FaqPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('faqs')
    .select('id, question, answer, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  const items = (data && data.length > 0) ? data : STATIC_FAQ;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Frequently Asked Questions</h1>
      <p className="mt-3 text-white/70">
        Answers to the most common questions from learners.
      </p>
      <div className="mt-8 space-y-3">
        {items.map((it: any, idx: number) => (
          <Card key={it.id ?? idx}>
            <CardTitle>{it.question ?? it.q}</CardTitle>
            <CardDescription className="mt-1">{it.answer ?? it.a}</CardDescription>
          </Card>
        ))}
      </div>
    </div>
  );
}
