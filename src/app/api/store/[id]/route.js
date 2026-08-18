import { getStoreById, deleteStore } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';
import { isAuthorized } from '@/lib/auth';

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
      const showHomepage = store.showHomepage !== undefined ? Boolean(store.showHomepage) : (store.mode === 'LIVE');
      return jsonResponse({
        success: true,
        show_homepage: showHomepage,
        show_homepage_text: showHomepage ? 'yes' : 'no',
        mode: showHomepage ? 'LIVE' : 'LAUNCH_SOON',
        scope: store.targetScope || 'homepage_only',
        store
      });
    }

    return jsonResponse({
      success: false,
      show_homepage: true,
      show_homepage_text: 'yes',
      message: 'Store not found',
      store: {
        id,
        mode: 'LIVE',
        showHomepage: true,
        targetScope: 'homepage_only',
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
