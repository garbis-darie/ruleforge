import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { categories } from '../../categories';

export async function POST(request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Get raw body for signature verification
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type !== 'checkout.session.completed') {
        return NextResponse.json({ received: true });
    }

    const session = event.data.object;
    const customerEmail = session.customer_details?.email;
    const slugs = session.metadata?.slugs?.split(',') || [];
    const tier = session.metadata?.tier || 'single';

    // Send email if Resend is configured
    if (process.env.RESEND_API_KEY && customerEmail) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);

            // Build attachments
            const attachments = [];
            const fileNames = [];
            for (const slug of slugs) {
                const filePath = join(process.cwd(), 'public', 'data', `ruleforge-${slug}.csv`);
                if (existsSync(filePath)) {
                    const content = readFileSync(filePath);
                    attachments.push({
                        filename: `ruleforge-${slug}.csv`,
                        content: content.toString('base64'),
                    });
                    const cat = categories.find(c => c.slug === slug);
                    fileNames.push(cat?.name || slug);
                }
            }

            const productName = tier === 'full-pack'
                ? 'Full Pack (All 11 Categories)'
                : fileNames[0] || 'RuleForge Product';

            const fileList = fileNames.map(n => `<li>📄 RuleForge — ${n} (CSV)</li>`).join('');

            // Send to buyer
            await resend.emails.send({
                from: process.env.FROM_EMAIL || 'RuleForge <noreply@resend.dev>',
                to: customerEmail,
                subject: `Your RuleForge files are ready — ${productName}`,
                html: `
          <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
            <h1 style="color:#111;">◈ RuleForge</h1>
            <h2>Your order is ready 🎉</h2>
            <p>Thank you for purchasing <strong>${productName}</strong>. Your files are attached.</p>
            <h3>Files Included</h3>
            <ul>${fileList}</ul>
            <p><strong>How to use:</strong> Import the CSV into your TMS (Chainalysis KYT, Elliptic, etc). Adjust thresholds to your volume profile.</p>
            <hr>
            <p style="color:#888;font-size:12px;">© 2026 RuleForge. These are data analytics configurations, not compliance advice.</p>
          </div>
        `,
                attachments,
            });

            // Notify admin
            await resend.emails.send({
                from: process.env.FROM_EMAIL || 'RuleForge <noreply@resend.dev>',
                to: 'hello@example.com',
                subject: `💰 New sale — ${productName} (£${session.amount_total / 100})`,
                text: `Customer: ${customerEmail}\nProduct: ${productName}\nAmount: £${session.amount_total / 100}\nFiles: ${fileNames.join(', ')}`,
            });

        } catch (emailErr) {
            console.error('Email delivery error:', emailErr);
            // Don't fail the webhook — buyer can still download from the page
        }
    }

    return NextResponse.json({ received: true });
}

// Disable body parsing for webhook signature verification
export const dynamic = 'force-dynamic';
