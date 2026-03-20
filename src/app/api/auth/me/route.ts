import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/middleware';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError('Not authenticated', 401);
    }

    return apiResponse({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return apiError('Internal server error', 500);
  }
}
