'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface CourseOpt { id: string; title: string }
interface StudentOpt { id: string; name: string }

export function EnrollForm({ courses, students }: { courses: CourseOpt[]; students: StudentOpt[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [studentId, setStudentId] = useState(students[0]?.id ?? '');
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: studentId, course_id: courseId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Failed');
      }
      show('Activated', 'success');
      router.refresh();
    } catch (err) {
      show((err as Error).message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-white/70">Student</span>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
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
      <div className="flex items-end"><Button type="submit" loading={loading}>Activate</Button></div>
    </form>
  );
}

export function VoucherForm({ courses }: { courses: CourseOpt[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [code, setCode] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, course_id: courseId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Failed');
      }
      setCode('');
      show('Voucher created', 'success');
      router.refresh();
    } catch (err) {
      show((err as Error).message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
      <Input label="Code" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
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
      <div className="flex items-end"><Button type="submit" loading={loading}>Create voucher</Button></div>
    </form>
  );
}