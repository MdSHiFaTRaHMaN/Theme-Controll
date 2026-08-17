import { getStoreById, deleteStore } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const shopName = searchParams.get('name') || '';
    const brandName = searchParams.get('brand') || shopName || id;

    // Auto-discover and register store if it's new
    const store = await getStoreById(id, {
      name: shopName || id,
      brandName: brandName || id,
      mode: 'LIVE',
    });

    if (store) {
      return jsonResponse({ success: true, store });
    }

    return jsonResponse({
      success: false,
      message: 'Store not found',
      store: {
        id,
        mode: 'LIVE',
        brandName: id,
        headline: 'Coming Soon',
        subtitle: 'Store launching soon.',
      }
    }, 404);
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await deleteStore(id);
    return jsonResponse({ success: true, message: `Store ${id} deleted successfully` });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}
