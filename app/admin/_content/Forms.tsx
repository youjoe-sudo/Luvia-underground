'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

type Field =
  | { name: string; label: string; type: 'text' | 'textarea' | 'number'; required?: boolean }
  | { name: string; label: string; type: 'text' | 'textarea' | 'number'; required?: boolean };

export function ContentForm({
  table,
  fields,
}: {
  table: 'announcements' | 'faqs' | 'testimonials';
  fields: { name: string; label: string; type: 'text' | 'textarea' | 'number'; required?: boolean }[];
}) {
  const router = useRouter();
  const { show } = useToast();
  const initial: Record<string, string> = {};
  for (const f of fields) initial[f.name] = '';
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [loading, setLoading] = useState(false);

  const onChange = (name: string, v: string) =>
    setValues((prev) => ({ ...prev, [name]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body: Record<string, unknown> = { is_published: true };
    for (const f of fields) {
      const raw = values[f.name];
      if (f.required && !raw) {
        show(`${f.label} is required.`, 'danger');
        setLoading(false);
        return;
      }
      if (raw === '') continue;
      body[f.name] = f.type === 'number' ? Number(raw) : raw;
    }
    const res = await fetch(`/api/admin/content/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      show(json.error ?? 'Failed.', 'danger');
      return;
    }
    show('Saved.', 'success');
    setValues(initial);
    router.refresh();
  };

  return (
    <Card>
      <CardTitle className="text-base">Add new</CardTitle>
      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        {fields.map((f) =>
          f.type === 'textarea' ? (
            <Textarea
              key={f.name}
              label={f.label}
              required={f.required}
              value={values[f.name]}
              onChange={(e) => onChange(f.name, e.target.value)}
            />
          ) : (
            <Input
              key={f.name}
              label={f.label}
              type={f.type === 'number' ? 'number' : 'text'}
              required={f.required}
              value={values[f.name]}
              onChange={(e) => onChange(f.name, e.target.value)}
            />
          )
        )}
        <Button type="submit" loading={loading}>Save</Button>
      </form>
    </Card>
  );
}

export function TogglePublish({
  table,
  id,
  published,
}: {
  table: 'announcements' | 'faqs' | 'testimonials';
  id: string;
  published: boolean;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/content/${table}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !published }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      show(j.error ?? 'Failed.', 'danger');
      return;
    }
    router.refresh();
  };

  return (
    <Button size="sm" variant="secondary" onClick={toggle} loading={loading}>
      {published ? 'Unpublish' : 'Publish'}
    </Button>
  );
}