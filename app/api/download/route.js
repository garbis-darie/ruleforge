import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { categories } from '../../categories';

// GET /api/download?session_id=cs_xxx
// Returns the list of downloadable files for a verified paid session
export async function GET(request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed.' }, { status: 403 });
        }

        const slugs = session.metadata?.slugs?.split(',') || [];
        const tier = session.metadata?.tier || 'single';

        const files = slugs
            .map(slug => {
                const cat = categories.find(c => c.slug === slug);
                return cat ? { slug: cat.slug, name: `RuleForge — ${cat.name}` } : null;
            })
            .filter(Boolean);

        const productName = tier === 'full-pack'
            ? 'Full Pack (All 11 Categories)'
            : files[0]?.name || 'RuleForge Product';

        return NextResponse.json({ productName, files, tier });
    } catch (err) {
        console.error('Download verification error:', err);
        return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 400 });
    }
}
