import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { ContentForm, TogglePublish } from '../_content/Forms';

export default async function AnnouncementsAdminPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from('announcements')
    .select('id, title, body, is_published, published_at, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Announcements</h1>

      <ContentForm
        table="announcements"
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'body', label: 'Body', type: 'textarea', required: true },
        ]}
      />

      <Card>
        {(!items || items.length === 0) ? (
          <p className="text-sm text-white/60">No announcements yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((a: any) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-white/60">{a.body}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={a.is_published ? 'success' : 'neutral'}>
                    {a.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <TogglePublish table="announcements" id={a.id} published={a.is_published} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}