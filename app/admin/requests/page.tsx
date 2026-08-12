import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { RequestActions } from '@/components/admin/RequestActions';

type EnrollmentRequest = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export default async function RequestsPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from('enrollment_requests')
    .select('id, full_name, email, phone, whatsapp, notes, status, created_at')
    .order('created_at', { ascending: false });

  const typedRequests = (requests ?? []) as EnrollmentRequest[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Enrollment requests</h1>

      <Card>
        {typedRequests.length === 0 ? (
          <p className="text-sm text-white/60">No enrollment requests yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {typedRequests.map((r) => (
              <li key={r.id} className="space-y-2 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.full_name}</div>
                    <div className="text-xs text-white/60">
                      {r.email} · {r.phone ?? '—'}
                      {r.whatsapp ? ` · WA: ${r.whatsapp}` : ''}
                    </div>
                    <div className="text-[10px] text-white/40">
                      Submitted {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>

                  <Badge
                    tone={
                      r.status === 'pending'
                        ? 'warning'
                        : r.status === 'approved' || r.status === 'enrolled' || r.status === 'converted'
                          ? 'success'
                          : r.status === 'contacted'
                            ? 'info'
                            : 'danger'
                    }
                  >
                    {r.status}
                  </Badge>
                </div>

                {r.notes && (
                  <p className="rounded border border-white/5 bg-white/5 p-2 text-xs text-white/70">
                    {r.notes}
                  </p>
                )}

                {r.status === 'pending' && (
                  <RequestActions
                    id={r.id}
                    fullName={r.full_name}
                    email={r.email}
                    phone={r.phone}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}