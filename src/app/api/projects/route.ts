import { NextRequest } from 'next/server';
import { getCurrentUser, canCreateProject } from '@/lib/auth';
import { apiResponse, apiError, rateLimit } from '@/lib/middleware';
import db, { generateId, generateApiKey } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError('Authentication required', 401);
    }

    const projects = db.prepare(`
      SELECT * FROM projects 
      WHERE user_id = ? AND is_active = 1
      ORDER BY created_at DESC
    `).all(user.id);

    return apiResponse({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.ip || 'unknown';
  if (!rateLimit(ip, 10, 60 * 1000)) { // 10 projects per minute
    return apiError('Too many project creation attempts. Please try again later.', 429);
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError('Authentication required', 401);
    }

    // Check if user can create more projects
    if (!canCreateProject(user)) {
      return apiError('Project limit reached for your current plan. Please upgrade to create more projects.');
    }

    const body = await request.json();
    const { name, domain } = body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return apiError('Project name is required');
    }

    if (name.trim().length > 100) {
      return apiError('Project name must be less than 100 characters');
    }

    if (domain && typeof domain !== 'string') {
      return apiError('Domain must be a string');
    }

    // Check for duplicate project name for this user
    const existing = db.prepare('SELECT id FROM projects WHERE user_id = ? AND name = ? AND is_active = 1').get(user.id, name.trim());
    if (existing) {
      return apiError('A project with this name already exists');
    }

    // Create project
    const projectId = generateId();
    const apiKey = generateApiKey();

    db.prepare(`
      INSERT INTO projects (id, user_id, name, domain, api_key)
      VALUES (?, ?, ?, ?, ?)
    `).run(projectId, user.id, name.trim(), domain || null, apiKey);

    // Get the created project
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

    return apiResponse({
      project,
      message: 'Project created successfully'
    });

  } catch (error) {
    console.error('Create project error:', error);
    return apiError('Internal server error', 500);
  }
}