import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { readJSON, writeJSON } from '../../../../lib/storage';

const PRODUCTS_KEY = 'products.json';

// Default products if none exist yet
const DEFAULT_PRODUCTS = {
    categories: [],
    fullPackPrice: 34900,
    enterprisePrice: 99900,
};

// GET /api/admin/products — list all products
export async function GET() {
    const auth = await requireAuth();
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let data = await readJSON(PRODUCTS_KEY);
    if (!data) data = DEFAULT_PRODUCTS;

    return NextResponse.json(data);
}

// POST /api/admin/products — create new product
export async function POST(request) {
    const auth = await requireAuth();
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, slug, icon, description } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
        }

        let data = await readJSON(PRODUCTS_KEY);
        if (!data) data = DEFAULT_PRODUCTS;

        // Check for duplicate slug
        if (data.categories.find(c => c.slug === slug)) {
            return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 409 });
        }

        const newCat = {
            name,
            slug,
            icon: icon || '📋',
            description: description || '',
            rules: 0,
            price: 7900,
            enabled: true,
            stripeLink: '',
            createdAt: new Date().toISOString(),
        };

        data.categories.push(newCat);
        await writeJSON(PRODUCTS_KEY, data);

        return NextResponse.json(newCat, { status: 201 });
    } catch (err) {
        console.error('Create product error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT /api/admin/products — update a product (expects { slug, ...updates })
export async function PUT(request) {
    const auth = await requireAuth();
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { slug, ...updates } = body;

        if (!slug) {
            return NextResponse.json({ error: 'slug is required' }, { status: 400 });
        }

        let data = await readJSON(PRODUCTS_KEY);
        if (!data) data = DEFAULT_PRODUCTS;

        const idx = data.categories.findIndex(c => c.slug === slug);
        if (idx === -1) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        data.categories[idx] = { ...data.categories[idx], ...updates };
        await writeJSON(PRODUCTS_KEY, data);

        return NextResponse.json(data.categories[idx]);
    } catch (err) {
        console.error('Update product error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE /api/admin/products — delete a product (expects { slug })
export async function DELETE(request) {
    const auth = await requireAuth();
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { slug } = await request.json();

        let data = await readJSON(PRODUCTS_KEY);
        if (!data) return NextResponse.json({ error: 'No products' }, { status: 404 });

        data.categories = data.categories.filter(c => c.slug !== slug);
        await writeJSON(PRODUCTS_KEY, data);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete product error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
