import { addSubscriber } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, storeId } = body;
    if (!email || !email.includes('@')) {
      return jsonResponse({ success: false, message: 'Valid email required' }, 400);
    }
    const subscriber = await addSubscriber(email, storeId || 'singhclo');
    return jsonResponse({
      success: true,
      subscriber,
      message: 'Subscribed successfully to VIP list',
    }, 201);
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 400);
  }
}
