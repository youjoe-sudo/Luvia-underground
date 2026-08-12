import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { ContentForm, TogglePublish } from '../_content/Forms';

export default async function TestimonialsAdminPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from('testimonials')
    .select('id, name, role, content, is_published')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Testimonials</h1>

      <ContentForm
        table="testimonials"
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'role', label: 'Role (optional)', type: 'text' },
          { name: 'content', label: 'Content', type: 'textarea', required: true },
        ]}
      />

      <Card>
        {(!items || items.length === 0) ? (
          <p className="text-sm text-white/60">No testimonials yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((t: any) => (
              <li key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{t.name}</div>
                  {t.role && <div className="text-xs text-white/50">{t.role}</div>}
                  <div className="text-xs text-white/60">{t.content}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={t.is_published ? 'success' : 'neutral'}>
                    {t.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <TogglePublish table="testimonials" id={t.id} published={t.is_published} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}