import { cookies } from 'next/headers';
import { createHash } from 'crypto';

const SESSION_COOKIE = 'lk_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function hashToken(value) {
    return createHash('sha256').update(value).digest('hex');
}

function generateSessionToken() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
}

export function validateCredentials(username, password) {
    const validUser = process.env.ADMIN_USER || 'admin';
    const validPass = process.env.ADMIN_PASS;
    if (!validPass) return false;
    return username === validUser && password === validPass;
}

export async function createSession() {
    const token = generateSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION / 1000,
        path: '/',
    });
    return token;
}

export async function validateSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    return !!session?.value;
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}

// Middleware helper — call at top of admin API routes
export async function requireAuth() {
    const isValid = await validateSession();
    if (!isValid) {
        return { authenticated: false };
    }
    return { authenticated: true };
}
