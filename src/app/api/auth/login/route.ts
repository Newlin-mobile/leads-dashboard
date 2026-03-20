import { NextRequest } from 'next/server';
import { loginUser } from '@/lib/auth';
import { apiResponse, apiError, rateLimit } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  if (!rateLimit(ip, 10, 15 * 60 * 1000)) {
    return apiError('Too many login attempts. Please try again later.', 429);
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Email and password are required');
    }

    const result = await loginUser(email, password);

    if (result.error) {
      return apiError(result.error, 401);
    }

    return apiResponse({
      user: result.user,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return apiError('Internal server error', 500);
  }
}
