'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface CertificateInfo {
  id: string;
  studentName: string;
  courseTitle: string;
  instructorName: string | null;
  issuedAt: string;
}

export default function VerifyPage() {
  const params = useParams<{ id: string }>();
  const [state, setState] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [info, setInfo] = useState<CertificateInfo | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      const res = await fetch(`/api/verify/${params.id}`);
      if (!res.ok) {
        setState('invalid');
        return;
      }
      const json = await res.json();
      if (!json.certificate) {
        setState('invalid');
        return;
      }
      setInfo(json.certificate);
      setState('valid');
    })();
  }, [params?.id]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Certificate Verification</CardTitle>
          <CardDescription>Public lookup by certificate ID. No login required.</CardDescription>
        </CardHeader>
        {state === 'loading' && <p className="text-sm text-white/60">Verifying…</p>}
        {state === 'invalid' && (
          <div className="space-y-2">
            <Badge tone="danger">Not found</Badge>
            <p className="text-sm text-white/70">No certificate exists with that ID.</p>
          </div>
        )}
        {state === 'valid' && info && (
          <div className="space-y-3">
            <Badge tone="success">Valid</Badge>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
              <div className="text-white/90">Awarded to <strong>{info.studentName}</strong></div>
              <div className="text-white/70">Course: {info.courseTitle}</div>
              <div className="text-white/70">Instructor: {info.instructorName ?? '—'}</div>
              <div className="text-white/50 text-xs mt-1">Issued {new Date(info.issuedAt).toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}