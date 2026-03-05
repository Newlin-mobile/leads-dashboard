import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/middleware';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'unknown',
    };

    // Check database connection
    try {
      const result = db.prepare('SELECT 1').get();
      health.database = result ? 'connected' : 'disconnected';
    } catch (error) {
      health.database = 'error';
      health.status = 'unhealthy';
    }

    return apiResponse(health);
  } catch (error) {
    console.error('Health check error:', error);
    return apiResponse(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error',
      },
      500
    );
  }
}