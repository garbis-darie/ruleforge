export const metadata = {
    title: 'Terms of Use | RuleForge',
    description: 'Terms for purchasing and using RuleForge digital compliance templates.',
};

export default function TermsPage() {
    return (
        <main className="legal-page">
            <div className="container legal-container">
                <h1>Terms of Use</h1>
                <p>By purchasing or using RuleForge materials, you agree to these terms.</p>

                <h2>Product Scope</h2>
                <p>RuleForge delivers digital templates and reference materials for monitoring design and governance workflows.</p>

                <h2>No Legal Advice</h2>
                <p>RuleForge outputs are informational decision-support materials and do not constitute legal, regulatory, or compliance advice.</p>

                <h2>License</h2>
                <p>Purchases grant a non-transferable license for internal use by the purchasing organization unless otherwise agreed in writing.</p>

                <h2>Refund Policy</h2>
                <p>Due to the digital nature of the product, refunds are not provided after downloadable assets are delivered.</p>

                <h2>Contact</h2>
                <p>Questions about terms can be sent to <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@ruleforge.io'}`}>{process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@ruleforge.io'}</a>.</p>
            </div>
        </main>
    );
}
