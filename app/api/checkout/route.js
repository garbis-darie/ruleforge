import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { categories as fallbackCategories, FULL_PACK_PRICE } from '../../categories';
import { readJSON } from '../../../lib/storage';

async function getProducts() {
    try {
        const data = await readJSON('products.json');
        if (data?.categories?.length > 0) {
            return {
                categories: data.categories.filter(c => c.enabled !== false),
                fullPackPrice: data.fullPackPrice || FULL_PACK_PRICE,
            };
        }
    } catch { }
    return { categories: fallbackCategories, fullPackPrice: FULL_PACK_PRICE };
}

export async function POST(request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    try {
        const formData = await request.formData();
        const slug = formData.get('slug');
        const tier = formData.get('tier');

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://link-kyt.io';
        const { categories, fullPackPrice } = await getProducts();

        let lineItems;
        let metadata;

        if (tier === 'full-pack') {
            // Full Pack — all enabled categories
            lineItems = [{
                price_data: {
                    currency: 'gbp',
                    unit_amount: fullPackPrice,
                    product_data: {
                        name: 'LINK KYT — Full Pack',
                        description: `All ${categories.length} risk categories. ${categories.reduce((s, c) => s + (c.rules || 0), 0)} alert rules. Complete governance + implementation coverage.`,
                    },
                },
                quantity: 1,
            }];
            metadata = { tier: 'full-pack', slugs: categories.map(c => c.slug).join(',') };
        } else {
            // Single category
            const category = categories.find(c => c.slug === slug);
            if (!category) {
                return NextResponse.redirect(new URL('/?error=invalid-category', origin));
            }
            lineItems = [{
                price_data: {
                    currency: 'gbp',
                    unit_amount: category.price || 7900,
                    product_data: {
                        name: `LINK KYT — ${category.name}`,
                        description: `${category.rules || 0} pre-built alert rules for ${(category.description || '').toLowerCase()}. Includes governance documentation (PDF) and implementation rules (CSV).`,
                    },
                },
                quantity: 1,
            }];
            metadata = { tier: 'single', slugs: category.slug };
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${origin}/download?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/#categories`,
            metadata,
        });

        return NextResponse.redirect(session.url, { status: 303 });
    } catch (err) {
        console.error('Checkout error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
