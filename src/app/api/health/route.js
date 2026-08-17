import { getDbStatus } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const dbStatus = await getDbStatus();
    return jsonResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  } catch (error) {
    return jsonResponse({ status: 'unhealthy', error: error.message }, 500);
  }
}
