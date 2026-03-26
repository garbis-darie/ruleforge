export const metadata = {
    title: 'Privacy Policy | RuleForge',
    description: 'RuleForge privacy policy for website usage, payments, and support communications.',
};

export default function PrivacyPage() {
    return (
        <main className="legal-page">
            <div className="container legal-container">
                <h1>Privacy Policy</h1>
                <p>RuleForge collects only the information required to process purchases, deliver files, and provide customer support.</p>

                <h2>Data We Process</h2>
                <p>Checkout and payment processing are handled by Stripe. We receive limited transaction metadata needed for order fulfillment and support.</p>

                <h2>How We Use Data</h2>
                <p>We use purchase metadata to validate access to downloads, provide support, and improve product reliability. We do not sell personal data.</p>

                <h2>Data Retention</h2>
                <p>We retain order-related records for operational, accounting, and compliance purposes for as long as reasonably required.</p>

                <h2>Contact</h2>
                <p>For privacy requests, contact <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@ruleforge.io'}`}>{process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@ruleforge.io'}</a>.</p>
            </div>
        </main>
    );
}
