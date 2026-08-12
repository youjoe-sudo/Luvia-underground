'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface Props {
  courses: { id: string; title: string }[];
  staff: { id: string; name: string; role: string }[];
}

export function CohortForm({ courses, staff }: Props) {
  const router = useRouter();
  const { show } = useToast();
  const [groupName, setGroupName] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [coordinatorId, setCoordinatorId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_name: groupName,
          course_id: courseId,
          coordinator_id: coordinatorId || null,
          instructor_id: instructorId || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Failed');
      }
      setGroupName('');
      show('Cohort created', 'success');
      router.refresh();
    } catch (err) {
      show((err as Error).message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold">Create a cohort</h2>
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
        <Input label="Group name" required value={groupName} onChange={(e) => setGroupName(e.target.value)} />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-white/70">Course</span>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          >
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-white/70">Coordinator</span>
          <select
            value={coordinatorId}
            onChange={(e) => setCoordinatorId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          >
            <option value="">— none —</option>
            {staff.filter((u) => u.role === 'coordinator').map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-white/70">Instructor</span>
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          >
            <option value="">— none —</option>
            {staff.filter((u) => u.role === 'instructor').map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </label>
        <Button type="submit" loading={loading} className="md:col-span-2 md:w-fit">Create</Button>
      </form>
    </Card>
  );
}