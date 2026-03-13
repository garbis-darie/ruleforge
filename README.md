# RuleForge

> A full-stack RegTech SaaS platform for compliance template management — built by a compliance professional, not just a developer.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel)

---

## The Problem

Transaction monitoring teams at financial institutions and VASPs spend significant time manually configuring rule sets, thresholds, and governance documentation for their KYT/AML systems. Templates are inconsistent across organisations, difficult to version-control, and not commercially available in a structured, deployable format.

## What RuleForge Solves

RuleForge is a digital product marketplace where compliance teams can purchase ready-to-deploy transaction monitoring templates — complete with governance documentation (PDF) and system-ready configuration rules (CSV) for platforms like Chainalysis KYT, TRM Labs, and Crystal Blockchain.

This project was built from compliance-domain knowledge first, then engineered to support it.

---

## Key Features

- **Customer-facing storefront** — Dynamic product catalogue, premium dark-themed UI, mobile-responsive
- **Stripe-powered checkout** — One-time payments, webhook-verified downloads, secure session handling
- **Admin dashboard** — Full product CRUD, publishing pipeline, template management
- **Cloud-native storage** — Vercel Blob for product config and compliance templates
- **Auto-deploy pipeline** — GitHub → Vercel, live in ~45 seconds

---

## Domain Context

Templates distributed through RuleForge are structured around:

- **Risk category segmentation** — high-risk jurisdictions, mixer/tumbler exposure, darknet market activity, sanctions screening
- **Threshold calibration guidelines** — tuned for transaction monitoring systems to reduce false positives while maintaining regulatory coverage
- **Governance documentation** — aligned to FATF Recommendations and EU AMLD frameworks

This isn't a generic SaaS scaffold. The product catalogue, data structures, and template formats were designed by someone with 4+ years operating inside live transaction monitoring systems across centralised exchanges and VASPs.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Next.js 15 App                     │
├──────────────┬──────────────┬────────────────────────┤
│   Landing    │    Admin     │      API Routes        │
│    Page      │  Dashboard   │                        │
│              │              │  /api/products         │
│ • Dynamic    │ • Auth       │  /api/checkout         │
│   product    │ • Product    │  /api/webhook          │
│   display    │   CRUD       │  /api/download         │
│ • Stripe     │ • Publish    │  /api/admin/*          │
│   checkout   │   pipeline   │                        │
└──────┬───────┴──────┬───────┴───────┬────────────────┘
       │              │               │
       ▼              ▼               ▼
  Stripe API    Vercel Blob     Session Cookies
               Storage          (HTTP-only)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Runtime | Serverless (Vercel) |
| Payments | Stripe Checkout + Webhooks |
| Storage | Vercel Blob |
| Auth | Session cookies (HTTP-only, secure) |
| Deployment | GitHub → Vercel auto-deploy |
| Styling | Vanilla CSS (dark theme) |

---

## Project Structure

```
ruleforge/
├── app/
│   ├── page.js                  # Landing page (dynamic products)
│   ├── categories.js            # Fallback product data
│   ├── globals.css              # Design system
│   ├── layout.js                # Root layout + meta
│   ├── download/page.js         # Post-purchase download page
│   ├── admin-panel/
│   │   ├── page.js              # Admin dashboard
│   │   └── login/page.js        # Admin login
│   └── api/
│       ├── products/route.js    # Public products API
│       ├── checkout/route.js    # Stripe checkout sessions
│       ├── webhook/route.js     # Stripe webhook handler
│       ├── download/route.js    # Secure file downloads
│       └── admin/
│           ├── auth/route.js    # Login/logout/session
│           ├── products/route.js # Product CRUD
│           ├── templates/route.js # Template management
│           ├── publish/route.js  # CSV export pipeline
│           └── seed/route.js    # Initial data upload
├── lib/
│   ├── auth.js                  # Authentication system
│   └── storage.js               # Vercel Blob abstraction
└── public/
    └── data/                    # Generated CSV templates
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Stripe account
- Vercel account with Blob storage

### 1. Clone & Install

```bash
git clone https://github.com/garbis-darie/ruleforge.git
cd ruleforge
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your environment variables — see `.env.example` for details.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy

Push to your connected GitHub repo — Vercel auto-deploys on every push to `main`.

```bash
git push origin main
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe API key for payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `ADMIN_USER` | Admin panel username |
| `ADMIN_PASS` | Admin panel password |
| `ADMIN_SECRET` | Secret URL segment for admin access |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage access token |

---

## Security

- **Secret URL** — Admin panel accessible only via unguessable UUID path
- **Session cookies** — HTTP-only, secure, SameSite=Lax
- **Credential validation** — Passwords validated server-side via environment variables
- **Webhook verification** — Stripe signatures verified before processing
- **No client-side secrets** — All sensitive operations handled in API routes

---

## About the Builder

Built by **[Garbis Darie](https://linkedin.com/in/garbis-darie)** — a Transaction Monitoring Analyst with 4+ years of experience in Virtual Assets compliance, specialising in Chainalysis KYT, TRM Labs, and Crystal Blockchain.

RuleForge represents the intersection of deep compliance expertise and full-stack product development. The platform was conceived, designed, and built entirely from an operational compliance perspective — addressing real gaps in how AML teams access and deploy transaction monitoring configuration.

→ [LinkedIn](https://linkedin.com/in/garbis-darie) | [GitHub Portfolio](https://github.com/garbis-darie)

---

## License

MIT
