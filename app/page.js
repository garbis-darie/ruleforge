import { categories as fallbackCategories, FULL_PACK_PRICE, ENTERPRISE_PRICE } from './categories';
import { readJSON } from '../lib/storage';

async function getProducts() {
    try {
        const data = await readJSON('products.json');
        if (data?.categories?.length > 0) {
            return {
                categories: data.categories.filter(c => c.enabled !== false),
                fullPackPrice: data.fullPackPrice || FULL_PACK_PRICE,
                enterprisePrice: data.enterprisePrice || ENTERPRISE_PRICE,
            };
        }
    } catch { }
    return { categories: fallbackCategories, fullPackPrice: FULL_PACK_PRICE, enterprisePrice: ENTERPRISE_PRICE };
}

export const dynamic = 'force-dynamic';

export default async function Home() {
    const { categories, fullPackPrice, enterprisePrice } = await getProducts();
    const totalRules = categories.reduce((sum, c) => sum + (c.rules || 0), 0);
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@ruleforge.io';

    return (
        <>
            {/* Nav */}
            <nav className="nav">
                <div className="nav-inner">
                    <a href="/" className="nav-logo">
                        <span className="logo-icon">◈</span>
                        <span className="logo-text">Rule<span className="logo-accent">Forge</span></span>
                    </a>
                    <div className="nav-links">
                        <a href="#features">Features</a>
                        <a href="#categories">Categories</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#faq">FAQ</a>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="hero">
                <div className="hero-glow" />
                <div className="container">
                    <div className="hero-badge"><span className="badge-dot" /> Available Now</div>
                    <h1 className="hero-title">
                        Transaction Monitoring<br /><span className="hero-gradient">Threshold Templates</span>
                    </h1>
                    <p className="hero-sub">
                        Pre-built alert rules for crypto compliance teams. {categories.length} risk categories, {totalRules} rules.
                        Import-ready CSV templates for Chainalysis KYT, Elliptic, and any TMS.
                    </p>
                    <div className="hero-ctas">
                        <a href="#categories" className="btn btn-primary">Browse Categories</a>
                        <a href="#pricing" className="btn btn-ghost">View Pricing</a>
                    </div>
                    <div className="hero-proof">
                        <div className="proof-item"><span className="proof-num">{categories.length}</span><span className="proof-label">Risk Categories</span></div>
                        <div className="proof-divider" />
                        <div className="proof-item"><span className="proof-num">{totalRules}</span><span className="proof-label">Alert Rules</span></div>
                        <div className="proof-divider" />
                        <div className="proof-item"><span className="proof-num">2</span><span className="proof-label">Delivery Formats</span></div>
                    </div>
                </div>
            </section>

            {/* Problem */}
            <section className="problem" id="features">
                <div className="container">
                    <div className="section-label">The Problem</div>
                    <h2 className="section-title">Compliance Setup Shouldn&#39;t Take Months</h2>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <div className="problem-icon">⏱️</div>
                            <h3>Weeks of Configuration</h3>
                            <p>Most teams spend 4–12 weeks building alert rules from scratch. Every week without monitoring is regulatory exposure.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon">📚</div>
                            <h3>Scattered Guidance</h3>
                            <p>FATF, FinCEN, FCA guidelines are spread across hundreds of pages. Translating policy into thresholds requires deep expertise.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon">🔧</div>
                            <h3>No Starting Point</h3>
                            <p>TMS platforms ship empty. No default rules, no baseline thresholds. You start from zero every time.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution */}
            <section className="solution">
                <div className="container">
                    <div className="section-label">The Solution</div>
                    <h2 className="section-title">Two Layers. Complete Coverage.</h2>
                    <p className="section-sub">Each category ships with both governance documentation and implementation-ready rules.</p>
                    <div className="layers-grid">
                        <div className="layer-card layer-gov">
                            <span className="layer-tag">Governance</span>
                            <h3>Policy Documentation</h3>
                            <ul>
                                <li><strong>Regulatory citations</strong> — FATF, FinCEN, FCA references</li>
                                <li><strong>Risk rationale</strong> — Why each rule exists</li>
                                <li><strong>Severity grading</strong> — HIGH / MEDIUM / LOW classification</li>
                                <li><strong>Audit-ready format</strong> — PDF documentation</li>
                            </ul>
                        </div>
                        <div className="layer-card layer-impl">
                            <span className="layer-tag">Implementation</span>
                            <h3>Alert Rules (CSV)</h3>
                            <ul>
                                <li><strong>Rule parameters</strong> — Thresholds, windows, counts</li>
                                <li><strong>Direction filters</strong> — SENT / RECEIVED / BOTH</li>
                                <li><strong>Exposure types</strong> — SINGLE / AGGREGATE</li>
                                <li><strong>Import-ready</strong> — CSV format for any TMS</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories — Purchase Picker */}
            <section className="categories" id="categories">
                <div className="container">
                    <div className="section-label">Choose a Category</div>
                    <h2 className="section-title">{categories.length} Categories. Pick What You Need.</h2>
                    <p className="section-sub">Each category includes governance documentation (PDF) and implementation rules (CSV). One-time payment, instant download, £{(categories[0]?.price || 7900) / 100} each.</p>
                    <div className="cat-grid">
                        {categories.map((cat) => (
                            <div key={cat.slug} className="cat-card">
                                <div className="cat-icon">{cat.icon}</div>
                                <h4>{cat.name}</h4>
                                <p>{cat.description}</p>
                                <div className="cat-meta">
                                    <span className="cat-rules">{cat.rules} rules</span>
                                    <span className="cat-includes">PDF + CSV</span>
                                </div>
                                <form action="/api/checkout" method="POST">
                                    <input type="hidden" name="slug" value={cat.slug} />
                                    <input type="hidden" name="tier" value="single" />
                                    <button type="submit" className="btn-cat">Buy — £{(cat.price || 7900) / 100}</button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-label">How It Works</div>
                    <h2 className="section-title">Live in 3 Steps</h2>
                    <div className="steps-grid">
                        <div className="step-card"><div className="step-num">01</div><h3>Choose</h3><p>Select individual categories or the full pack based on your monitoring needs.</p></div>
                        <div className="step-connector">→</div>
                        <div className="step-card"><div className="step-num">02</div><h3>Download</h3><p>Instantly receive governance PDFs and implementation CSVs after purchase.</p></div>
                        <div className="step-connector">→</div>
                        <div className="step-card"><div className="step-num">03</div><h3>Deploy</h3><p>Import CSV rules into your TMS. Adjust thresholds to your volume profile. Go live.</p></div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="pricing" id="pricing">
                <div className="container">
                    <div className="section-label">Pricing</div>
                    <h2 className="section-title">Straightforward Pricing. No Surprises.</h2>
                    <p className="section-sub">Single and Full Pack are one-time purchases. Enterprise includes annual update support.</p>
                    <div className="pricing-grid">
                        <div className="price-card">
                            <div className="price-tier">Single Category</div>
                            <div className="price-amount"><span className="price-currency">£</span><span className="price-value">{(categories[0]?.price || 7900) / 100}</span></div>
                            <p className="price-desc">Pick any risk category — governance docs + implementation rules included.</p>
                            <ul className="price-features">
                                <li>Choose any 1 of {categories.length} categories</li>
                                <li>Governance documentation (PDF)</li>
                                <li>Implementation rules (CSV)</li>
                                <li>Regulatory citations included</li>
                                <li>Severity grading included</li>
                            </ul>
                            <a href="#categories" className="btn btn-outline">Choose a Category ↑</a>
                        </div>
                        <div className="price-card price-featured">
                            <div className="price-badge">Most Popular</div>
                            <div className="price-tier">Full Pack</div>
                            <div className="price-amount"><span className="price-currency">£</span><span className="price-value">{fullPackPrice / 100}</span></div>
                            <p className="price-desc">All {categories.length} risk categories. Complete governance and implementation coverage.</p>
                            <ul className="price-features">
                                <li><strong>All {categories.length} risk categories</strong></li>
                                <li><strong>{totalRules} pre-built alert rules</strong></li>
                                <li>Full governance documentation (PDF)</li>
                                <li>Implementation rules (CSV)</li>
                                <li>6 template packs included</li>
                                <li>Regulatory citations across all categories</li>
                            </ul>
                            <form action="/api/checkout" method="POST">
                                <input type="hidden" name="tier" value="full-pack" />
                                <button type="submit" className="btn btn-primary">Get Full Pack</button>
                            </form>
                        </div>
                        <div className="price-card">
                            <div className="price-tier">Enterprise</div>
                            <div className="price-amount"><span className="price-currency">£</span><span className="price-value">{enterprisePrice / 100}</span></div>
                            <p className="price-desc">Everything in Full Pack plus structured data and annual update support.</p>
                            <ul className="price-features">
                                <li><strong>Everything in Full Pack</strong></li>
                                <li>Machine-readable data formats</li>
                                <li>12-month regulatory update guarantee</li>
                                <li>Priority email support</li>
                                <li>Custom calibration guidance</li>
                            </ul>
                            <a href={`mailto:${contactEmail}?subject=RuleForge%20Enterprise`} className="btn btn-outline">Contact Us</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Paid */}
            <section className="problem">
                <div className="container">
                    <div className="section-label">Why Teams Pay</div>
                    <h2 className="section-title">The Value Is in Defensible Decisions</h2>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <div className="problem-icon">🧭</div>
                            <h3>Governance, Not Just Rules</h3>
                            <p>Each template ships with rationale, severity logic, and citations so changes can be reviewed and defended under audit pressure.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon">⚡</div>
                            <h3>Faster Time-to-Operational</h3>
                            <p>Pre-calibrated starting points and import-ready formats cut setup time, so teams spend less time configuring and more time investigating.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon">🔁</div>
                            <h3>Update Path Included</h3>
                            <p>Enterprise includes 12-month regulatory update coverage so threshold logic can evolve without policy drift.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="faq" id="faq">
                <div className="container">
                    <div className="section-label">FAQ</div>
                    <h2 className="section-title">Common Questions</h2>
                    <div className="faq-list">
                        <details className="faq-item"><summary>What format are the templates delivered in?</summary><p>Each category includes a governance document (PDF) explaining the regulatory basis and risk rationale, plus an implementation CSV file containing the actual alert rules with thresholds, windows, and parameters ready for import.</p></details>
                        <details className="faq-item"><summary>Are these compliance advice or regulatory recommendations?</summary><p>No. These are data analytics formulas and parametric reference materials derived from publicly available regulatory guidance. They are not legal, regulatory, or compliance advice. You must independently verify all thresholds.</p></details>
                        <details className="faq-item"><summary>Which regulations are the thresholds based on?</summary><p>Rules are derived from FATF Recommendations, FinCEN advisories, FCA guidance, and EU AMLD provisions. Each rule includes its regulatory citation in the governance documentation.</p></details>
                        <details className="faq-item"><summary>Can I import the CSV rules into any TMS?</summary><p>Yes. The CSV format uses standard fields (Rule, Severity, Category, Direction, Exposure, Min/Max amounts, Window, Count) that can be mapped to any transaction monitoring system including Chainalysis KYT, Elliptic, and custom platforms.</p></details>
                        <details className="faq-item"><summary>Do you offer refunds?</summary><p>Due to the digital nature of the product, we do not offer refunds once files have been downloaded. Please review the category descriptions carefully before purchasing.</p></details>
                        <details className="faq-item"><summary>What&#39;s included in the Enterprise 12-month update guarantee?</summary><p>Enterprise customers receive updated rule sets whenever we revise thresholds based on new regulatory guidance, enforcement actions, or emerging typologies. Updates are delivered via email and include release notes for change tracking.</p></details>
                    </div>
                </div>
            </section>

            {/* Disclaimer */}
            <section className="disclaimer">
                <div className="container">
                    <div className="disclaimer-box">
                        <h3>⚠️ Important Disclaimer</h3>
                        <p>The templates, threshold configurations, and governance documentation provided by RuleForge are <strong>data analytics formulas and parametric reference materials</strong>, not legal, regulatory, or compliance advice. They are derived from publicly available regulatory guidance and industry research.</p>
                        <p>Users must independently verify all thresholds, calibrate configurations to their specific business context, transaction volumes, and risk appetite, and obtain qualified legal and compliance counsel before deploying any monitoring rules in a production environment.</p>
                        <p>RuleForge accepts no liability for regulatory outcomes, enforcement actions, or compliance failures arising from the use of these templates.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-inner">
                        <div className="footer-brand">
                            <span className="logo-text">◈ Rule<span className="logo-accent">Forge</span></span>
                            <p className="footer-tagline">Transaction monitoring thresholds, ready to deploy.</p>
                        </div>
                        <div className="footer-links">
                            <a href="#features">Features</a>
                            <a href="#categories">Categories</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#faq">FAQ</a>
                            <a href="/privacy">Privacy</a>
                            <a href="/terms">Terms</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 RuleForge. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
