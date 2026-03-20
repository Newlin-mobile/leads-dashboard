import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/middleware';
import db from '@/lib/db';

interface SourceStats {
  total: number;
  go: number;
  gesprek: number;
  rejected: number;
  wacht: number;
  geen_reactie: number;
  success_rate: number;
  avg_value: number;
}

interface ValueTypeStats {
  total: number;
  go: number;
  success_rate: number;
  total_value: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Success rate by source
    const sourceStats: Record<string, SourceStats> = {};
    const sources = ['hoofdkraan', 'freelancermap', 'eigen-netwerk'] as const;
    
    for (const source of sources) {
      const leads = db.prepare(`
        SELECT status, value_amount 
        FROM leads 
        WHERE user_id = ? AND source = ? AND created_at >= ?
      `).all(user.id, source, since) as { status: string; value_amount: number }[];

      const total = leads.length;
      const go = leads.filter(l => l.status === 'go').length;
      const gesprek = leads.filter(l => l.status === 'gesprek').length;
      const rejected = leads.filter(l => l.status === 'rejected').length;
      const wacht = leads.filter(l => l.status === 'wacht').length;
      const geen_reactie = leads.filter(l => l.status === 'geen-reactie').length;
      const avg_value = total > 0 ? leads.reduce((sum, l) => sum + l.value_amount, 0) / total : 0;

      sourceStats[source] = {
        total,
        go,
        gesprek,
        rejected,
        wacht,
        geen_reactie,
        success_rate: total > 0 ? go / total : 0,
        avg_value: Math.round(avg_value * 100) / 100,
      };
    }

    // Success rate by value type
    const valueTypeStats: Record<string, ValueTypeStats> = {};
    const valueTypes = ['eenmalig', 'recurring', 'tbd'] as const;

    for (const valueType of valueTypes) {
      const leads = db.prepare(`
        SELECT status, value_amount 
        FROM leads 
        WHERE user_id = ? AND value_type = ? AND created_at >= ?
      `).all(user.id, valueType, since) as { status: string; value_amount: number }[];

      const total = leads.length;
      const go = leads.filter(l => l.status === 'go').length;
      const total_value = leads.reduce((sum, l) => sum + l.value_amount, 0);

      valueTypeStats[valueType] = {
        total,
        go,
        success_rate: total > 0 ? go / total : 0,
        total_value: Math.round(total_value * 100) / 100,
      };
    }

    // Overall stats
    const allLeads = db.prepare(`
      SELECT status, source, value_type, value_amount, created_at
      FROM leads 
      WHERE user_id = ? AND created_at >= ?
      ORDER BY created_at DESC
    `).all(user.id, since) as { status: string; source: string; value_type: string; value_amount: number; created_at: string }[];

    const totalLeads = allLeads.length;
    const successfulLeads = allLeads.filter(l => l.status === 'go').length;
    const overallSuccessRate = totalLeads > 0 ? successfulLeads / totalLeads : 0;

    // Best performing source
    const bestSource = Object.entries(sourceStats)
      .filter(([_, stats]) => stats.total >= 3) // Min 3 leads for statistical relevance
      .sort((a, b) => b[1].success_rate - a[1].success_rate)[0];

    // Recent outcomes (last 20 leads)
    const recentOutcomes = allLeads.slice(0, 20).map(lead => ({
      source: lead.source,
      status: lead.status,
      value_type: lead.value_type,
      value_amount: lead.value_amount,
      created_at: lead.created_at,
    }));

    // Insights for Noor
    const insights = {
      best_source: bestSource ? {
        name: bestSource[0],
        success_rate: Math.round(bestSource[1].success_rate * 100),
        total_leads: bestSource[1].total,
      } : null,
      worst_source: Object.entries(sourceStats)
        .filter(([_, stats]) => stats.total >= 3)
        .sort((a, b) => a[1].success_rate - b[1].success_rate)[0]?.[0],
      avg_time_to_decision: null, // Could calculate if we track status change timestamps
      high_value_preference: valueTypeStats.recurring.success_rate > valueTypeStats.eenmalig.success_rate ? 'recurring' : 'eenmalig',
    };

    return apiResponse({
      period: `Last ${days} days`,
      since,
      overall: {
        total_leads: totalLeads,
        successful: successfulLeads,
        success_rate: Math.round(overallSuccessRate * 100) / 100,
      },
      by_source: sourceStats,
      by_value_type: valueTypeStats,
      recent_outcomes: recentOutcomes,
      insights,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return apiError('Internal server error', 500);
  }
}
