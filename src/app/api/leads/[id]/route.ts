import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/middleware';
import db from '@/lib/db';

const VALID_SOURCES = ['hoofdkraan', 'freelancermap', 'eigen-netwerk'];
const VALID_STATUSES = ['go', 'gesprek', 'rejected', 'wacht', 'geen-reactie'];
const VALID_VALUE_TYPES = ['eenmalig', 'recurring', 'tbd'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const { id } = await params;
    const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!lead) return apiError('Lead not found', 404);

    const notes = db.prepare(
      'SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC'
    ).all(id);

    return apiResponse({ lead, notes });
  } catch (error) {
    console.error('Get lead error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const { id } = await params;
    const existing = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!existing) return apiError('Lead not found', 404);

    const body = await request.json();
    const { name, source, status, value_type, value_amount, follow_up_date } = body;

    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 1)) {
      return apiError('Lead name cannot be empty');
    }
    if (source !== undefined && !VALID_SOURCES.includes(source)) {
      return apiError('Invalid source');
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return apiError('Invalid status');
    }
    if (value_type !== undefined && !VALID_VALUE_TYPES.includes(value_type)) {
      return apiError('Invalid value type');
    }
    if (value_amount !== undefined && (typeof value_amount !== 'number' || value_amount < 0)) {
      return apiError('Value amount must be a non-negative number');
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()); }
    if (source !== undefined) { updates.push('source = ?'); values.push(source); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (value_type !== undefined) { updates.push('value_type = ?'); values.push(value_type); }
    if (value_amount !== undefined) { updates.push('value_amount = ?'); values.push(value_amount); }
    if (follow_up_date !== undefined) { updates.push('follow_up_date = ?'); values.push(follow_up_date || null); }

    if (updates.length === 0) {
      return apiError('No fields to update');
    }

    values.push(id, user.id);
    db.prepare(`UPDATE leads SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    return apiResponse({ lead, message: 'Lead updated successfully' });
  } catch (error) {
    console.error('Update lead error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const { id } = await params;
    const existing = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!existing) return apiError('Lead not found', 404);

    db.prepare('DELETE FROM lead_notes WHERE lead_id = ?').run(id);
    db.prepare('DELETE FROM leads WHERE id = ? AND user_id = ?').run(id, user.id);

    return apiResponse({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    return apiError('Internal server error', 500);
  }
}
