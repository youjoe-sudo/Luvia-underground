import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NewTicketForm } from './NewTicketForm';

type Ticket = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
};

export default async function StudentTicketsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: ticketsData } = await supabase
    .from('support_tickets')
    .select('id, subject, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const tickets: Ticket[] = ticketsData ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Support tickets</h1>

      <NewTicketForm />

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Your tickets</h2>

        {!tickets || tickets.length === 0 ? (
          <p className="text-sm text-white/60">
            You haven't opened any tickets.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {tickets.map((t: Ticket) => (
              <li
                key={t.id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm">{t.subject}</span>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40">
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>

                  <Badge
                    tone={
                      t.status === 'open'
                        ? 'warning'
                        : t.status === 'in_progress'
                          ? 'info'
                          : 'success'
                    }
                  >
                    {t.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}