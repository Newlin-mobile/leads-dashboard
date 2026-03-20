import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { StatsCard } from '@/components/StatsCard';
import { LeadStatusBadge, getSourceLabel, formatCurrency } from '@/components/LeadStatusBadge';
import db from '@/lib/db';
import { TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Get stats
  const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE user_id = ?').get(user.id) as { count: number };
  const goLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE user_id = ? AND status = 'go'").get(user.id) as { count: number };
  const gesprekLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE user_id = ? AND status = 'gesprek'").get(user.id) as { count: number };

  // Pipeline value (go + gesprek leads)
  const pipelineValue = db.prepare(
    "SELECT COALESCE(SUM(value_amount), 0) as total FROM leads WHERE user_id = ? AND status IN ('go', 'gesprek')"
  ).get(user.id) as { total: number };

  // Go value
  const goValue = db.prepare(
    "SELECT COALESCE(SUM(value_amount), 0) as total FROM leads WHERE user_id = ? AND status = 'go'"
  ).get(user.id) as { total: number };

  // Conversion rate
  const conversionRate = totalLeads.count > 0
    ? Math.round((goLeads.count / totalLeads.count) * 100)
    : 0;

  // Recent leads
  const recentLeads = db.prepare(`
    SELECT * FROM leads WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 5
  `).all(user.id) as any[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welkom, {user.name || 'there'}!
          </h1>
          <p className="mt-1 text-gray-600">
            Overzicht van je leads pipeline.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard/leads">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Totaal leads"
          value={totalLeads.count}
          icon={Users}
          color="purple"
          description={`${gesprekLeads.count} in gesprek`}
        />

        <StatsCard
          title="Pipeline waarde"
          value={formatCurrency(pipelineValue.total)}
          icon={TrendingUp}
          color="blue"
          description="Go + gesprek leads"
        />

        <StatsCard
          title="Won deals"
          value={formatCurrency(goValue.total)}
          icon={DollarSign}
          color="green"
          description={`${goLeads.count} lead${goLeads.count !== 1 ? 's' : ''} op go`}
        />

        <StatsCard
          title="Conversie"
          value={`${conversionRate}%`}
          icon={BarChart3}
          color={conversionRate > 30 ? 'green' : conversionRate > 15 ? 'yellow' : 'red'}
          description="Lead naar go"
        />
      </div>

      {/* Recent Leads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recente leads</h2>
          <Link href="/dashboard/leads" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Alle leads bekijken
          </Link>
        </div>

        {recentLeads.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bron</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Waarde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <Link href={`/dashboard/leads/${lead.id}`} className="hover:text-purple-600">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getSourceLabel(lead.source)}
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {lead.value_amount > 0 ? formatCurrency(lead.value_amount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen leads</h3>
            <p className="text-gray-600 mb-6">
              Voeg je eerste lead toe om te beginnen.
            </p>
            <Link href="/dashboard/leads">
              <Button>Eerste lead toevoegen</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
