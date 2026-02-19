import { NextResponse } from 'next/server';
import { readJSON } from '../../../lib/storage';
import { categories as fallbackCategories, FULL_PACK_PRICE, ENTERPRISE_PRICE } from '../../categories';

// GET /api/products — public endpoint serving enabled products
// Used by the landing page to dynamically show categories
// Falls back to hardcoded categories.js if Blob storage has no data
export async function GET() {
    try {
        let data = await readJSON('products.json');

        if (data && data.categories && data.categories.length > 0) {
            // Filter to only enabled products
            const enabled = data.categories.filter(c => c.enabled !== false);
            return NextResponse.json({
                categories: enabled,
                fullPackPrice: data.fullPackPrice || FULL_PACK_PRICE,
                enterprisePrice: data.enterprisePrice || ENTERPRISE_PRICE,
                totalRules: enabled.reduce((sum, c) => sum + (c.rules || 0), 0),
                source: 'admin',
            });
        }

        // Fallback to hardcoded categories
        return NextResponse.json({
            categories: fallbackCategories,
            fullPackPrice: FULL_PACK_PRICE,
            enterprisePrice: ENTERPRISE_PRICE,
            totalRules: fallbackCategories.reduce((sum, c) => sum + (c.rules || 0), 0),
            source: 'fallback',
        });
    } catch (err) {
        console.error('Products API error:', err);
        // On any error, serve hardcoded data so the site never breaks
        return NextResponse.json({
            categories: fallbackCategories,
            fullPackPrice: FULL_PACK_PRICE,
            enterprisePrice: ENTERPRISE_PRICE,
            totalRules: fallbackCategories.reduce((sum, c) => sum + (c.rules || 0), 0),
            source: 'fallback',
        });
    }
}
