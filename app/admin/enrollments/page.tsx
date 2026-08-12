import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';
import { EnrollForm, VoucherForm } from './Forms';

export default async function EnrollmentsPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase.from('courses').select('id, title');
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('role', 'student')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Enrollments</h1>
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Manual activation</h2>
        <EnrollForm
          courses={courses ?? []}
          students={(users ?? []).map((u: any) => ({ id: u.id, name: `${u.full_name} · ${u.email}` }))}
        />
      </Card>
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Voucher codes</h2>
        <VoucherForm courses={courses ?? []} />
      </Card>
    </div>
  );
}