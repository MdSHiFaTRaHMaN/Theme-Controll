import { addStore } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';
import { isAuthorized } from '@/lib/auth';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return jsonResponse({ success: false, message: 'Unauthorized access' }, 401);
    }
    const body = await request.json();
    if (!body.id || !body.name) {
      return jsonResponse({ success: false, message: 'Store ID and Name are required' }, 400);
    }
    const store = await addStore(body);
    return jsonResponse({ success: true, store, message: 'Store added successfully' }, 201);
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 400);
  }
}
