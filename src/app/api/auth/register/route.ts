import { NextRequest } from 'next/server';
import { registerUser } from '@/lib/auth';
import { apiResponse, apiError, rateLimit } from '@/lib/middleware';
import { validateEmail, validatePassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  if (!rateLimit(ip, 5, 15 * 60 * 1000)) {
    return apiError('Too many registration attempts. Please try again later.', 429);
  }

  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return apiError('Email and password are required');
    }

    if (!validateEmail(email)) {
      return apiError('Please enter a valid email address');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return apiError(passwordValidation.errors[0]);
    }

    const result = await registerUser(email, password, name?.trim());

    if (result.error) {
      return apiError(result.error);
    }

    return apiResponse({
      user: result.user,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return apiError('Internal server error', 500);
  }
}
