import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/middleware';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return apiError('Not authenticated', 401);
    }

    // Return user data (without sensitive info)
    const { api_key, ...safeUser } = user;
    return apiResponse({ user: safeUser });

  } catch (error) {
    console.error('Get user error:', error);
    return apiError('Internal server error', 500);
  }
}