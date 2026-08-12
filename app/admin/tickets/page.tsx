import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';

export default async function AdminTicketsPage() {
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('id, subject, body, status, created_at, users(full_name, email)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Support tickets</h1>
      <Card>
        {!tickets || tickets.length === 0 ? (
          <p className="text-sm text-white/60">No tickets.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {tickets.map((t: any) => (
              <li key={t.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-xs text-white/50">{t.users?.full_name ?? '—'} · {t.users?.email ?? ''}</div>
                  </div>
                  <Badge
                    tone={
                      t.status === 'open' ? 'warning' :
                      t.status === 'in_progress' ? 'info' : 'success'
                    }
                  >
                    {t.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-white/70">{t.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}