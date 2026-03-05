import { NextRequest } from 'next/server';
import { registerUser } from '@/lib/auth';
import { apiResponse, apiError, rateLimit } from '@/lib/middleware';
import { validateEmail, validatePassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.ip || 'unknown';
  if (!rateLimit(ip, 5, 15 * 60 * 1000)) { // 5 requests per 15 minutes
    return apiError('Too many registration attempts. Please try again later.', 429);
  }

  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Input validation
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

    if (name && (typeof name !== 'string' || name.trim().length < 1)) {
      return apiError('Name must be at least 1 character');
    }

    // Register user
    const result = await registerUser(email, password, name?.trim());

    if (result.error) {
      return apiError(result.error);
    }

    if (!result.user) {
      return apiError('Failed to create account');
    }

    // Return user data (without sensitive info)
    const { api_key, ...safeUser } = result.user;
    return apiResponse({
      user: safeUser,
      message: 'Account created successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return apiError('Internal server error', 500);
  }
}