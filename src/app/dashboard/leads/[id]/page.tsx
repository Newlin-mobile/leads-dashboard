import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { LeadDetail } from '@/components/LeadDetail';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { id } = await params;

  const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(id, user.id) as any;
  if (!lead) redirect('/dashboard/leads');

  const notes = db.prepare(
    'SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC'
  ).all(id) as any[];

  return <LeadDetail lead={lead} notes={notes} />;
}
