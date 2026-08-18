import { isAuthorized } from '@/lib/auth';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  try {
    const authorized = isAuthorized(request);
    if (!authorized) {
      return jsonResponse({ success: false, authorized: false, message: 'Unauthorized' }, 401);
    }
    return jsonResponse({ success: true, authorized: true, message: 'Authenticated' });
  } catch (error) {
    return jsonResponse({ success: false, authorized: false, message: error.message }, 500);
  }
}
