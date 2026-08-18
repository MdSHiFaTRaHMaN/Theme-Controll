import { bulkToggleStores, getSubscribers, getDbStatus } from '@/lib/db';
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
    const mode = body.mode === 'LAUNCH_SOON' ? 'LAUNCH_SOON' : 'LIVE';
    const stores = await bulkToggleStores(mode);
    const subscribers = await getSubscribers();
    const dbStatus = await getDbStatus();

    const liveCount = stores.filter(s => s.mode === 'LIVE').length;
    const launchCount = stores.filter(s => s.mode === 'LAUNCH_SOON').length;

    return jsonResponse({
      success: true,
      stores,
      stats: {
        total: stores.length,
        live: liveCount,
        launchSoon: launchCount,
        leads: subscribers.length,
      },
      dbStatus,
      message: `All stores switched to ${mode}`,
    });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}
