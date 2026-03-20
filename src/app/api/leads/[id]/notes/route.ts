import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/middleware';
import db, { generateId } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const { id } = await params;
    const lead = db.prepare('SELECT id FROM leads WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!lead) return apiError('Lead not found', 404);

    const notes = db.prepare(
      'SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC'
    ).all(id);

    return apiResponse({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const { id } = await params;
    const lead = db.prepare('SELECT id FROM leads WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!lead) return apiError('Lead not found', 404);

    const body = await request.json();
    const { note } = body;

    if (!note || typeof note !== 'string' || note.trim().length < 1) {
      return apiError('Note text is required');
    }

    const noteId = generateId();
    db.prepare('INSERT INTO lead_notes (id, lead_id, note) VALUES (?, ?, ?)').run(noteId, id, note.trim());

    const createdNote = db.prepare('SELECT * FROM lead_notes WHERE id = ?').get(noteId);
    return apiResponse({ note: createdNote, message: 'Note added successfully' });
  } catch (error) {
    console.error('Create note error:', error);
    return apiError('Internal server error', 500);
  }
}
