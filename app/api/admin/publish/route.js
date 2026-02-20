import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { readJSON } from '../../../../lib/storage';
import { writeFileSync } from 'fs';
import { join } from 'path';

// POST /api/admin/publish — export CSVs from template data and update live files
export async function POST(request) {
    const auth = await requireAuth();
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { slug } = await request.json();
        const products = await readJSON('products.json');
        if (!products) {
            return NextResponse.json({ error: 'No products configured' }, { status: 404 });
        }

        const category = products.categories.find(c => c.slug === slug);
        if (!category) {
            return NextResponse.json({ error: `Category ${slug} not found` }, { status: 404 });
        }

        // Read template data for this category
        const templateName = category.templateFile || slug;
        const templateData = await readJSON(`templates/${templateName}.json`);
        if (!templateData) {
            return NextResponse.json({ error: `Template data not found for ${slug}` }, { status: 404 });
        }

        // Extract rules from template (find implementation layer)
        const rules = [];
        const HEADERS = ['Rule', 'Severity', 'Category', 'Direction', 'Exposure', 'Min_USD', 'Max_USD', 'Window', 'Tx_Count', 'Status', 'Start_Date'];

        for (const si of templateData.sidebarItems || []) {
            for (const cat of si.categories || []) {
                for (const layer of cat.layers || []) {
                    if (layer.title?.includes('IMPLEMENTATION')) {
                        for (const table of layer.tables || []) {
                            for (const row of table.rows || []) {
                                const rule = {};
                                (table.headers || []).forEach((h, i) => {
                                    const key = h.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                                    rule[key] = row.cells?.[i]?.value || '';
                                });
                                rules.push(rule);
                            }
                        }
                    }
                }
            }
        }

        if (rules.length === 0) {
            return NextResponse.json({ error: 'No rules found in template' }, { status: 400 });
        }

        // Generate CSV
        const escape = (s) => `"${String(s).replace(/"/g, '""')}"`;
        let csv = HEADERS.join(',') + '\n';
        for (const rule of rules) {
            const row = HEADERS.map(h => {
                const key = h.toLowerCase().replace(/[^a-z0-9]/g, '');
                return escape(rule[key] || '');
            });
            csv += row.join(',') + '\n';
        }

        // Write to public/data
        const filePath = join(process.cwd(), 'public', 'data', `ruleforge-${slug}.csv`);
        writeFileSync(filePath, csv);

        return NextResponse.json({
            success: true,
            slug,
            rules: rules.length,
            filename: `ruleforge-${slug}.csv`,
        });
    } catch (err) {
        console.error('Publish error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
