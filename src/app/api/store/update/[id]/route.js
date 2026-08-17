import { updateStore } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const store = await updateStore(id, body);
    if (!store) {
      return jsonResponse({ success: false, message: 'Store not found' }, 404);
    }
    return jsonResponse({
      success: true,
      store,
      message: 'Store configuration saved successfully',
    });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}
