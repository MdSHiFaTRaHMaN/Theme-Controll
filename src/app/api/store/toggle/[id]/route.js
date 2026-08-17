import { toggleStoreMode } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    let mode = null;
    try {
      const body = await request.json();
      if (body && body.mode) mode = body.mode;
    } catch (e) {}

    const store = await toggleStoreMode(id, mode);
    if (!store) {
      return jsonResponse({ success: false, message: 'Store not found' }, 404);
    }

    return jsonResponse({
      success: true,
      store,
      message: `Store switched to ${store.mode}`,
    });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    const store = await toggleStoreMode(id, mode);
    if (!store) {
      return jsonResponse({ success: false, message: 'Store not found' }, 404);
    }

    return jsonResponse({
      success: true,
      store,
      message: `Store switched to ${store.mode}`,
    });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}
