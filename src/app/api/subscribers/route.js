import { getSubscribers, deleteSubscriber } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const subscribers = await getSubscribers(storeId);
    return jsonResponse({
      success: true,
      subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return jsonResponse({ success: false, message: 'Subscriber ID is required' }, 400);
    }
    await deleteSubscriber(id);
    return jsonResponse({ success: true, message: 'Subscriber removed' });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}
