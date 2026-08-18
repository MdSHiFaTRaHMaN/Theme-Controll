import { findStoreByDomainOrTheme } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || searchParams.get('url') || searchParams.get('shop') || '';
    const customDomain = searchParams.get('custom_domain') || '';
    const themeId = searchParams.get('theme_id') || searchParams.get('theme') || '';
    const storeId = searchParams.get('store_id') || searchParams.get('id') || '';
    const shopName = searchParams.get('name') || searchParams.get('brand') || '';

    // Primary lookup using domain, themeId, or storeId
    let store = await findStoreByDomainOrTheme(domain || customDomain, themeId, storeId);

    // Fallback: If not found and shopName / domain exists, auto-register as LIVE / show_homepage: true
    if (!store && (domain || customDomain || storeId)) {
      const targetDomain = domain || customDomain;
      const targetId = storeId || (targetDomain ? targetDomain.replace(/[^a-z0-9-_]/g, '-').replace(/-myshopify-com$/, '') : 'store_' + Date.now().toString(36));
      
      store = await findStoreByDomainOrTheme(targetDomain, themeId, targetId, {
        name: shopName || targetDomain || targetId,
        brandName: shopName || targetDomain || targetId,
        domain: targetDomain,
        themeId: themeId,
        mode: 'LIVE',
        showHomepage: true,
        targetScope: 'homepage_only',
      });
    }

    if (store) {
      const showHomepage = store.showHomepage !== undefined ? Boolean(store.showHomepage) : (store.mode === 'LIVE');
      return jsonResponse({
        success: true,
        show_homepage: showHomepage,
        show_homepage_text: showHomepage ? 'yes' : 'no',
        mode: showHomepage ? 'LIVE' : 'LAUNCH_SOON',
        scope: store.targetScope || 'homepage_only',
        store,
      });
    }

    // Default safe fallback if totally unmapped: Show live homepage so store is never blocked
    return jsonResponse({
      success: true,
      show_homepage: true,
      show_homepage_text: 'yes',
      mode: 'LIVE',
      scope: 'homepage_only',
      message: 'Store auto-allowed in default live mode',
      store: {
        id: storeId || 'unknown',
        domain: domain || '',
        themeId: themeId || '',
        showHomepage: true,
        mode: 'LIVE',
        targetScope: 'homepage_only',
        brandName: shopName || 'Shopify Store',
        headline: 'Coming Soon',
        subtitle: 'Our exclusive collection is coming soon.',
        passcode: 'vip2026',
      }
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      show_homepage: true, // Safe fallback
      show_homepage_text: 'yes',
      mode: 'LIVE',
      message: error.message
    }, 500);
  }
}
