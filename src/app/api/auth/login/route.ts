import { NextRequest } from 'next/server';
import { loginUser } from '@/lib/auth';
import { apiResponse, apiError, rateLimit } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.ip || 'unknown';
  if (!rateLimit(ip, 10, 15 * 60 * 1000)) { // 10 requests per 15 minutes
    return apiError('Too many login attempts. Please try again later.', 429);
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return apiError('Email and password are required');
    }

    // Login user
    const result = await loginUser(email, password);

    if (result.error) {
      return apiError(result.error, 401);
    }

    if (!result.user) {
      return apiError('Login failed', 401);
    }

    // Return user data (without sensitive info)
    const { api_key, ...safeUser } = result.user;
    return apiResponse({
      user: safeUser,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return apiError('Internal server error', 500);
  }
}