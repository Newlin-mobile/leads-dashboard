import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError, rateLimit } from '@/lib/middleware';
import db, { generateId } from '@/lib/db';

const VALID_SOURCES = ['hoofdkraan', 'freelancermap', 'eigen-netwerk'];
const VALID_STATUSES = ['go', 'gesprek', 'rejected', 'wacht', 'geen-reactie'];
const VALID_VALUE_TYPES = ['eenmalig', 'recurring', 'tbd'];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    let query = 'SELECT * FROM leads WHERE user_id = ?';
    const params: (string)[] = [user.id];

    if (status && VALID_STATUSES.includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (source && VALID_SOURCES.includes(source)) {
      query += ' AND source = ?';
      params.push(source);
    }

    query += ' ORDER BY created_at DESC';

    const leads = db.prepare(query).all(...params);
    return apiResponse({ leads });
  } catch (error) {
    console.error('Get leads error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  if (!rateLimit(ip, 30, 60 * 1000)) {
    return apiError('Too many requests. Please try again later.', 429);
  }

  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const body = await request.json();
    const { name, source, status, value_type, value_amount } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return apiError('Lead name is required');
    }
    if (!source || !VALID_SOURCES.includes(source)) {
      return apiError('Valid source is required (hoofdkraan, freelancermap, eigen-netwerk)');
    }

    const leadStatus = status && VALID_STATUSES.includes(status) ? status : 'wacht';
    const leadValueType = value_type && VALID_VALUE_TYPES.includes(value_type) ? value_type : 'tbd';
    const leadValueAmount = typeof value_amount === 'number' && value_amount >= 0 ? value_amount : 0;

    const leadId = generateId();

    db.prepare(`
      INSERT INTO leads (id, user_id, name, source, status, value_type, value_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(leadId, user.id, name.trim(), source, leadStatus, leadValueType, leadValueAmount);

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);

    return apiResponse({ lead, message: 'Lead created successfully' });
  } catch (error) {
    console.error('Create lead error:', error);
    return apiError('Internal server error', 500);
  }
}
