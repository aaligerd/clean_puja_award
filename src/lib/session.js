import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'clean-puja-award-secret-key-2026-bengal'
);

export const COOKIE_NAME = 'committee_session';
export const ADMIN_COOKIE_NAME = 'admin_session';

const isProductionHttps =
  process.env.NODE_ENV === 'production' &&
  Boolean(process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith('https://'));

/**
 * Cookie options helper
 */
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProductionHttps,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

/**
 * Create and sign a JWT token
 */
export async function signSessionToken(payload, expiresIn = '7d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}

/**
 * Verify a JWT token
 */
export async function verifySessionToken(token) {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Get the current committee session from cookies
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = await verifySessionToken(token);
    if (!payload || !payload.committeeId) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Set session cookie in response
 */
export async function setSessionCookie(token) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, getCookieOptions());
  } catch (err) {
    // Ignore if called in immutable context
  }
}

/**
 * Clear session cookie (Logout)
 */
export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch (err) {
    // Ignore
  }
}

/**
 * Get the current admin session from cookies
 */
export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (adminToken) {
      const payload = await verifySessionToken(adminToken);
      if (payload && payload.adminId) return payload;
    }

    // Fallback: check committee_session in case signed as admin
    const commToken = cookieStore.get(COOKIE_NAME)?.value;
    if (commToken) {
      const payload = await verifySessionToken(commToken);
      if (payload && payload.adminId) return payload;
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Set admin session cookie in response
 */
export async function setAdminSessionCookie(token) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, getCookieOptions());
  } catch (err) {
    // Ignore
  }
}

/**
 * Clear admin session cookie (Logout)
 */
export async function clearAdminSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
  } catch (err) {
    // Ignore
  }
}
