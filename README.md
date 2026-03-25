# RuleForge

> Full-stack RegTech SaaS platform for managing KYT compliance templates and alert thresholds across Virtual Asset Service Providers.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)](https://stripe.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel)](https://vercel.com)

---

## Evidence Labels

- `Measured` (qualified): deployment-context outcomes summarized with bounded phrasing.
- `Synthetic-benchmark`: reproducible scenario outputs from synthetic datasets.
- `Illustrative`: architecture and conceptual examples.

## Decision Model Encoded Here

RuleForge codifies monitoring governance that often stays undocumented in analyst intuition:

- severity architecture by exposure type, direction, and value
- threshold change-control with explicit rationale and rollback triggers
- simulation-first updates before production rollout
- provider-agnostic policy logic with adapter-based integrations

## Proof Chain

- Claim: governance-first monitoring design improves consistency and audit defensibility.
- Method: versioned templates, simulation workflows, and structured change-control.
- Dataset: qualified implementation context + synthetic benchmark examples.
- Result: clearer approvals, reduced policy drift, repeatable control updates.
- Limitations: outcomes depend on data quality, team workflow, and escalation standards.
- Reproducibility: see linked synthetic policy impact examples.

---

## What RuleForge Solves

Transaction monitoring teams at VASPs face a recurring problem: alert thresholds are set once and rarely updated, leading to high false positive rates and missed risks as the business scales.

RuleForge is the product built to fix that. It provides a structured, versioned, auditable system for managing KYT rule templates — with a governance layer that supports regulatory review.

**Built from real-world deployment results:**
- up to ~20% reduction in false positive rates across qualified VASP contexts
- up to ~30% faster alert review times through structured severity classification
- Compatible with Chainalysis KYT, TRM Labs, Crystal Blockchain, and Fireblocks post-screening
- Deployed across 10+ VASP profiles (retail exchange, OTC desk, DeFi protocol, neobank)

---

## The Problem

Most VASPs use blockchain analytics platforms (Chainalysis, TRM Labs, Crystal Blockchain) that provide raw exposure data — but the policy decisions around what to *do* with that data are managed manually, inconsistently, and without version control.

The result is:
- Alert thresholds that drift from regulatory requirements
- No audit trail for threshold changes
- Compliance teams reinventing the same rules for every new client or product
- False positive rates that scale with user growth

---

## What RuleForge Does

RuleForge provides the governance and management layer that sits above the analytics platform:

| Feature | Description |
|---------|-------------|
| **Template Library** | Pre-built KYT rule templates per VASP profile (retail, OTC, DeFi, neobank) |
| **Rule Engine** | Configurable threshold logic with severity classification (Low / Medium / High / Severe) |
| **Version Control** | Every threshold change is timestamped, attributed, and reversible |
| **Audit Export** | Full rule history exportable for regulatory review |
| **Simulation Mode** | Test threshold changes against historical alert data before going live |
| **Fireblocks Integration** | Post-screening logic module for transaction screening layer |
| **Admin Governance** | Multi-user admin panel with role-based access |
| **Stripe Licensing** | Subscription management for SaaS delivery |

---

## Compliance Methodology

The rule logic in RuleForge is based on a methodology developed and validated across multiple VASP engagements. Key components:

**Alert Severity Matrix** — Classifies alerts on three axes (exposure type, direction, value) into Low / Medium / High / Severe tiers. Derived from work at DelSaldado Services (2024–2025) where it reduced false positives by 20% and alert review time by 30%.

**Indirect Exposure Model** — Uses Fibonacci sequencing to apply graduated risk decay across blockchain hop distances (direct → hop 1 → hop 2 → hop 3+). Increased proactive SAR detection by 15% versus flat indirect scoring.

**VASP Profile Taxonomy** — Pre-calibrated threshold starting points for 5 VASP archetypes, reducing initial setup time by 30%.

> Full methodology documentation: [docs/methodology.md](./docs/methodology.md)
>
> Evidence ledger: [docs/evidence-ledger.md](./docs/evidence-ledger.md)
>
> Change-control template: [docs/change-control-template.md](./docs/change-control-template.md)
>
> Synthetic policy impact examples: [examples/policy-impact/README.md](./examples/policy-impact/README.md)

---

## Domain Context

RuleForge is designed for compliance teams working under:

- **FATF Recommendations** (R.15, R.16) — Risk-based approach for VASPs
- **EU AMLD5 / AMLD6** — Enhanced due diligence and UBO requirements  
- **UK FCA (MLR 2017)** — SAR obligations and PEP/Sanctions screening
- **Travel Rule (IVMS 101)** — Originator/beneficiary data requirements

Supported analytics platforms: **Chainalysis KYT · TRM Labs · Crystal Blockchain · Fireblocks · Coinfirm**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Auth | Custom session-based (HTTP-only cookies) |
| Storage | Vercel Blob |
| Payments | Stripe (subscriptions + webhooks) |
| Deployment | Vercel |
| Language | JavaScript (Node.js) |

---

## Project Structure

```
ruleforge/
├── app/
│   ├── page.js              # Public landing page
│   ├── admin/               # Admin governance panel
│   ├── api/                 # REST API routes
│   │   ├── auth/            # Session management
│   │   ├── templates/       # Rule template CRUD
│   │   ├── stripe/          # Billing webhooks
│   │   └── blob/            # File storage
│   └── dashboard/           # Client-facing dashboard
├── lib/
│   ├── auth.js              # Authentication helpers
│   ├── templates.js         # Rule engine logic
│   └── stripe.js            # Stripe helpers
├── docs/
│   └── methodology.md       # Compliance methodology documentation
└── public/
```

---

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
ADMIN_USER=...
ADMIN_PASS=...
NEXTAUTH_SECRET=...
```

---

## Security Notes

- Admin panel is session-protected with HTTP-only, Secure, SameSite=Lax cookies
- All secrets via environment variables — no hardcoded credentials
- Webhook signatures verified on all Stripe events

---

## Guardrails

- Public metrics are qualified context and not universal guarantees.
- Synthetic examples are explicitly labeled and reproducible.
- RuleForge outputs are decision support and do not constitute legal advice.

---

## About the Builder

Built by **Garbis Darie**, a Transaction Monitoring Analyst with 4 years in Virtual Assets compliance. RuleForge is the productised version of a compliance framework developed and validated across Celsius Network, ToTheMoon, and DelSaldado Services.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-garbis--darie-0A66C2?logo=linkedin)](https://linkedin.com/in/garbis-darie)
[![GitHub](https://img.shields.io/badge/GitHub-garbis--darie-181717?logo=github)](https://github.com/garbis-darie)

**Related projects:** [opsclaw](https://github.com/garbis-darie/opsclaw) · [link-kyt-app](https://github.com/garbis-darie/link-kyt-app) · [link-kyt-site](https://github.com/garbis-darie/link-kyt-site)
