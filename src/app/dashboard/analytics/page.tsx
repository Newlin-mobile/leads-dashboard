import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Get analytics data
  const days = 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const allLeads = db.prepare(`
    SELECT status, source, value_type, value_amount, created_at
    FROM leads 
    WHERE user_id = ? AND created_at >= ?
    ORDER BY created_at DESC
  `).all(user.id, since) as { status: string; source: string; value_type: string; value_amount: number; created_at: string }[];

  const sources = ['hoofdkraan', 'freelancermap', 'eigen-netwerk'];
  const sourceStats = sources.map(source => {
    const leads = allLeads.filter(l => l.source === source);
    const total = leads.length;
    const go = leads.filter(l => l.status === 'go').length;
    const successRate = total > 0 ? (go / total) * 100 : 0;
    const avgValue = total > 0 ? leads.reduce((sum, l) => sum + l.value_amount, 0) / total : 0;

    return { source, total, go, successRate, avgValue };
  });

  const totalLeads = allLeads.length;
  const successfulLeads = allLeads.filter(l => l.status === 'go').length;
  const overallSuccessRate = totalLeads > 0 ? (successfulLeads / totalLeads) * 100 : 0;

  const bestSource = sourceStats
    .filter(s => s.total >= 3)
    .sort((a, b) => b.successRate - a.successRate)[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-600">Inzichten in lead performance (laatste 30 dagen)</p>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Totaal leads</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalLeads}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Succesvol</div>
          <div className="text-2xl sm:text-3xl font-bold text-green-600">{successfulLeads}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Success rate</div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">{overallSuccessRate.toFixed(0)}%</div>
        </div>
      </div>

      {/* Performance by source */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Performance per bron</h2>
        <div className="space-y-4">
          {sourceStats.map(stat => (
            <div key={stat.source} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                <div>
                  <div className="font-medium text-gray-900 capitalize">{stat.source.replace('-', ' ')}</div>
                  <div className="text-sm text-gray-500">{stat.total} leads totaal</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">{stat.successRate.toFixed(0)}%</div>
                  <div className="text-sm text-gray-500">{stat.go} succesvol</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${stat.successRate}%` }}
                />
              </div>
              {stat.avgValue > 0 && (
                <div className="text-sm text-gray-600 mt-2">
                  Gem. waarde: €{stat.avgValue.toFixed(0)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {bestSource && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-purple-900 mb-2">💡 Inzicht voor Noor</h2>
          <p className="text-sm sm:text-base text-purple-800">
            <strong className="capitalize">{bestSource.source.replace('-', ' ')}</strong> is je beste bron 
            met {bestSource.successRate.toFixed(0)}% success rate ({bestSource.go}/{bestSource.total} leads).
            Focus hierop in toekomstige scans.
          </p>
        </div>
      )}

      {/* API endpoint info */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">API voor Noor</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-3">
          Noor kan deze data ophalen via:
        </p>
        <code className="block bg-gray-900 text-green-400 p-3 rounded font-mono text-xs sm:text-sm overflow-x-auto">
          GET https://leads.newlin.nl/api/analytics?days=30
        </code>
        <p className="text-gray-600 mt-3 text-xs sm:text-sm">
          Gebruik je auth token voor toegang. De API geeft success rates per bron, 
          recent outcomes, en best performing sources.
        </p>
      </div>
    </div>
  );
}
