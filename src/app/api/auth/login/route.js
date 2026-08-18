import { validateCredentials, generateToken } from '@/lib/auth';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return jsonResponse({ success: false, message: 'Username and password are required' }, 400);
    }

    const isValid = validateCredentials(username, password);
    if (!isValid) {
      return jsonResponse({ success: false, message: 'Invalid username or password' }, 401);
    }

    const token = generateToken(username, password);

    return jsonResponse({
      success: true,
      token,
      user: { username: username.trim() },
      message: 'Login successful',
    });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}
