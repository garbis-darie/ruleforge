import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { categories } from '../../../categories';

// GET /api/download/[slug]?session_id=cs_xxx
// Serves the actual CSV file after verifying payment
export async function GET(request, { params }) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Verify payment
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed.' }, { status: 403 });
        }

        // Verify this slug was part of the purchase
        const purchasedSlugs = session.metadata?.slugs?.split(',') || [];
        if (!purchasedSlugs.includes(slug)) {
            return NextResponse.json({ error: 'This file was not part of your purchase.' }, { status: 403 });
        }

        // Find the category
        const category = categories.find(c => c.slug === slug);
        if (!category) {
            return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
        }

        // Serve the CSV file
        const filePath = join(process.cwd(), 'public', 'data', `link-kyt-${slug}.csv`);
        if (!existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found. Please contact support.' }, { status: 404 });
        }

        const fileBuffer = readFileSync(filePath);
        const filename = `link-kyt-${slug}.csv`;

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (err) {
        console.error('File download error:', err);
        return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 400 });
    }
}
