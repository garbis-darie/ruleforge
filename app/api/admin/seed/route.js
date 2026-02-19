import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { readJSON, writeJSON } from '../../../../lib/storage';

// POST /api/admin/seed — upload initial data to Vercel Blob
export async function POST(request) {
    const auth = await requireAuth();
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { key, data } = await request.json();
        if (!key || !data) {
            return NextResponse.json({ error: 'key and data are required' }, { status: 400 });
        }

        await writeJSON(key, data);
        return NextResponse.json({ success: true, key });
    } catch (err) {
        console.error('Seed error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// GET /api/admin/seed — check what data exists
export async function GET() {
    const auth = await requireAuth();
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await readJSON('products.json');
    const board = await readJSON('board-data.json');

    return NextResponse.json({
        hasProducts: !!products,
        hasBoard: !!board,
        productsCount: products?.categories?.length || 0,
    });
}
