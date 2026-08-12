'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function AccessRequestPage() {
  const { show } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          whatsapp: whatsappSame ? phone : whatsapp,
          notes: notes || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Submission failed');
      setSubmitted(true);
      show('Request submitted. You will be contacted via WhatsApp or email.', 'success');
    } catch (err) {
      show((err as Error).message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <div className="mb-6 text-center">
        <div className="bg-brand-gradient bg-clip-text text-3xl font-bold text-transparent">Luvia</div>
        <p className="mt-1 text-sm text-white/60">Request enrollment</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Apply for enrollment</CardTitle>
          <CardDescription>
            We review every request manually. You'll receive your temporary credentials through
            WhatsApp or email once approved.
          </CardDescription>
        </CardHeader>
        {submitted ? (
          <div className="space-y-3">
            <p className="rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              Your request has been received.
            </p>
            <p className="text-sm text-white/70">
              Our team will review your application and contact you through WhatsApp or email
              with your account details.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              label="Full name"
              required
              minLength={2}
              maxLength={200}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone number"
              type="tel"
              required
              placeholder="+20 1xx xxx xxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={whatsappSame}
                onChange={(e) => setWhatsappSame(e.target.checked)}
              />
              WhatsApp number is the same as phone
            </label>
            {!whatsappSame && (
              <Input
                label="WhatsApp number"
                type="tel"
                required
                placeholder="+20 1xx xxx xxxx"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            )}
            <Textarea
              label="Message (optional)"
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">
              Submit enrollment request
            </Button>
          </form>
        )}
        <div className="mt-4 text-center text-xs text-white/60">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-cyan hover:underline">Sign in</Link>
        </div>
      </Card>
    </div>
  );
}