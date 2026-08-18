import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SECRET_KEY = process.env.JWT_SECRET || 'shopify_remote_control_secret_2026';

export function generateToken(username, password) {
  const data = `${username}:${password}:${SECRET_KEY}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function validateCredentials(username, password) {
  const validUser = (username || '').trim() === ADMIN_USERNAME;
  const validPass = (password || '').trim() === ADMIN_PASSWORD;
  return validUser && validPass;
}

export function verifyToken(token) {
  if (!token) return false;
  const expectedToken = generateToken(ADMIN_USERNAME, ADMIN_PASSWORD);
  return token === expectedToken;
}

export function getAuthTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/dashboard_auth_token=([^;]+)/);
  if (match) {
    return match[1].trim();
  }
  return null;
}

export function isAuthorized(request) {
  const token = getAuthTokenFromRequest(request);
  return verifyToken(token);
}
