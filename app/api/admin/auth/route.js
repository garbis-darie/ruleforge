import { NextResponse } from 'next/server';
import { validateCredentials, createSession, validateSession, destroySession } from '../../../../lib/auth';

// POST /api/admin/auth — login
export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!validateCredentials(username, password)) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        await createSession();
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Auth error:', err);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

// GET /api/admin/auth — check session
export async function GET() {
    const isValid = await validateSession();
    return NextResponse.json({ authenticated: isValid });
}

// DELETE /api/admin/auth — logout
export async function DELETE() {
    await destroySession();
    return NextResponse.json({ success: true });
}
