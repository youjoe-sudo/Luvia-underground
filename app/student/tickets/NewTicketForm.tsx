'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export function NewTicketForm() {
  const { show } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Failed');
      }
      setSubject('');
      setBody('');
      show('Ticket opened', 'success');
    } catch (err) {
      show((err as Error).message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold">Open a new ticket</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Textarea label="Describe the issue" required rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
        <Button type="submit" loading={loading}>Submit</Button>
      </form>
    </Card>
  );
}