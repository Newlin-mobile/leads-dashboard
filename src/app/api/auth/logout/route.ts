import { logoutUser } from '@/lib/auth';
import { apiResponse } from '@/lib/middleware';

export async function POST() {
  try {
    await logoutUser();
    return apiResponse({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return apiResponse({ message: 'Logout completed' }); // Always succeed
  }
}