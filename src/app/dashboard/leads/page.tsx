import { getCurrentUser } from '@/lib/auth';
import { LeadList } from '@/components/LeadList';
import db from '@/lib/db';

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const leads = db.prepare(`
    SELECT * FROM leads WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(user.id) as any[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <p className="mt-1 text-gray-600">Beheer al je sales leads.</p>
      </div>

      <LeadList leads={leads} />
    </div>
  );
}
