import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

export default async function CertificatesPage() {
  const supabase = await createClient();
  const { data: certs } = await supabase
    .from('certificates')
    .select('id, user_id, course_id, issued_at, users(full_name, email), courses(title)')
    .order('issued_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Certificates</h1>
      <Card>
        {!certs || certs.length === 0 ? (
          <p className="text-sm text-white/60">No certificates issued.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {certs.map((c: any) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{c.users?.full_name} — {c.courses?.title}</div>
                  <div className="text-xs text-white/50">{new Date(c.issued_at).toLocaleDateString()}</div>
                </div>
                <a className="text-brand-cyan hover:underline text-sm" href={`/verify/${c.id}`}>Verify →</a>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}