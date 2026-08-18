import { toggleStoreMode } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    let mode = null;
    let showHomepage = null;
    try {
      const body = await request.json();
      if (body) {
        if (body.mode !== undefined) mode = body.mode;
        if (body.showHomepage !== undefined) showHomepage = body.showHomepage;
        if (body.show_homepage !== undefined) showHomepage = body.show_homepage;
      }
    } catch (e) {}

    const store = await toggleStoreMode(id, mode, showHomepage);
    if (!store) {
      return jsonResponse({ success: false, message: 'Store not found' }, 404);
    }

    return jsonResponse({
      success: true,
      show_homepage: store.showHomepage,
      show_homepage_text: store.showHomepage ? 'yes' : 'no',
      mode: store.mode,
      store,
      message: `Store updated: Homepage is ${store.showHomepage ? 'VISIBLE (Live)' : 'COMING SOON'}`,
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
    const showHomepageParam = searchParams.get('show_homepage') || searchParams.get('showHomepage');

    const store = await toggleStoreMode(id, mode, showHomepageParam);
    if (!store) {
      return jsonResponse({ success: false, message: 'Store not found' }, 404);
    }

    return jsonResponse({
      success: true,
      show_homepage: store.showHomepage,
      show_homepage_text: store.showHomepage ? 'yes' : 'no',
      mode: store.mode,
      store,
      message: `Store updated: Homepage is ${store.showHomepage ? 'VISIBLE (Live)' : 'COMING SOON'}`,
    });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}
