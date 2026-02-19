import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { readJSON, writeJSON, listBlobs } from '../../../../lib/storage';

// GET /api/admin/templates?name=categoryName — read template data
export async function GET(request) {
    const auth = await requireAuth();
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (name) {
        // Read specific template
        const data = await readJSON(`templates/${name}.json`);
        if (!data) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        return NextResponse.json(data);
    }

    // List all templates
    const blobs = await listBlobs('templates/');
    const templates = blobs.map(b => ({
        name: b.pathname.replace('templates/', '').replace('.json', ''),
        size: b.size,
        uploadedAt: b.uploadedAt,
    }));

    return NextResponse.json({ templates });
}

// PUT /api/admin/templates — save template data
export async function PUT(request) {
    const auth = await requireAuth();
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, data } = await request.json();
        if (!name || !data) {
            return NextResponse.json({ error: 'name and data are required' }, { status: 400 });
        }

        await writeJSON(`templates/${name}.json`, data);
        return NextResponse.json({ success: true, message: `Saved template: ${name}` });
    } catch (err) {
        console.error('Save template error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
