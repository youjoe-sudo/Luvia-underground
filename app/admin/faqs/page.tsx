import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { ContentForm, TogglePublish } from '../_content/Forms';

export default async function FaqsAdminPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from('faqs')
    .select('id, question, answer, sort_order, is_published')
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">FAQ</h1>

      <ContentForm
        table="faqs"
        fields={[
          { name: 'question', label: 'Question', type: 'text', required: true },
          { name: 'answer', label: 'Answer', type: 'textarea', required: true },
          { name: 'sort_order', label: 'Sort order', type: 'number' },
        ]}
      />

      <Card>
        {(!items || items.length === 0) ? (
          <p className="text-sm text-white/60">No FAQs yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((f: any) => (
              <li key={f.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{f.question}</div>
                  <div className="text-xs text-white/60">{f.answer}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={f.is_published ? 'success' : 'neutral'}>
                    {f.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <TogglePublish table="faqs" id={f.id} published={f.is_published} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}