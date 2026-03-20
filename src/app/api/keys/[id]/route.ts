import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/middleware';
import { deleteApiKey } from '@/lib/api-keys';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const { id } = await params;
    const deleted = deleteApiKey(id, user.id);

    if (!deleted) {
      return apiError('API key not found', 404);
    }

    return apiResponse({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    return apiError('Internal server error', 500);
  }
}
