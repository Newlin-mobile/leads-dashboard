import { NextRequest } from 'next/server';
import { getCurrentUser, changePassword } from '@/lib/auth';
import { apiResponse, apiError, rateLimit } from '@/lib/middleware';
import { validatePassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.ip || 'unknown';
  if (!rateLimit(ip, 5, 15 * 60 * 1000)) { // 5 requests per 15 minutes
    return apiError('Too many password change attempts. Please try again later.', 429);
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError('Authentication required', 401);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Input validation
    if (!currentPassword || !newPassword) {
      return apiError('Current password and new password are required');
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return apiError(passwordValidation.errors[0]);
    }

    // Change password
    const result = await changePassword(user.id, currentPassword, newPassword);

    if (result.error) {
      return apiError(result.error);
    }

    return apiResponse({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    return apiError('Internal server error', 500);
  }
}