import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError, rateLimit } from '@/lib/middleware';
import { createApiKey, listApiKeys } from '@/lib/api-keys';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const keys = listApiKeys(user.id);
    return apiResponse({ keys });
  } catch (error) {
    console.error('List API keys error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  if (!rateLimit(ip, 10, 60 * 1000)) {
    return apiError('Too many requests', 429);
  }

  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const body = await request.json();
    const { name, scopes } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return apiError('API key name is required');
    }

    const validScopes = ['read', 'write'];
    const requestedScopes = Array.isArray(scopes) ? scopes : ['read'];
    const filteredScopes = requestedScopes.filter(s => validScopes.includes(s));

    if (filteredScopes.length === 0) {
      filteredScopes.push('read');
    }

    const { id, key } = createApiKey(user.id, name.trim(), filteredScopes);

    return apiResponse({
      id,
      key,
      message: 'API key created. Save it now - you won\'t be able to see it again!',
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return apiError('Internal server error', 500);
  }
}
