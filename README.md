# RuleForge

**A full-stack RegTech SaaS platform for compliance template management, built with Next.js 15, Stripe, and Vercel.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel)

---

## What It Does

RuleForge is a digital product marketplace that sells compliance monitoring templates to financial institutions. Customers buy individual risk categories or a full pack, receiving governance documentation (PDF) and implementation rules (CSV) for their transaction monitoring systems.

### Key Features

- **Customer-facing landing page** — Premium dark-themed design, dynamic product display, responsive
- **Stripe checkout** — One-time payments, dynamic session creation, webhook-verified downloads
- **Admin panel** — Secure ops dashboard for product management and publishing
- **Cloud data persistence** — Vercel Blob storage for product config and templates
- **Auto-deploy pipeline** — GitHub → Vercel, live in ~45 seconds

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Next.js 15 App                     │
├──────────────┬──────────────┬────────────────────────┤
│  Landing     │  Admin       │  API Routes            │
│  Page        │  Dashboard   │                        │
│              │              │  /api/products         │
│  • Dynamic   │  • Auth      │  /api/checkout         │
│    product   │  • Product   │  /api/webhook          │
│    display   │    CRUD      │  /api/download         │
│  • Stripe    │  • Publish   │  /api/admin/*          │
│    checkout  │    pipeline  │                        │
└──────┬───────┴──────┬───────┴───────┬────────────────┘
       │              │               │
       ▼              ▼               ▼
   Stripe API    Vercel Blob     Session Cookies
                 Storage         (HTTP-only)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | Serverless (Vercel) |
| Payments | Stripe Checkout + Webhooks |
| Storage | Vercel Blob |
| Auth | Session cookies (HTTP-only, secure) |
| Deployment | GitHub → Vercel auto-deploy |
| Styling | Vanilla CSS (premium dark theme) |

---

## Project Structure

```
ruleforge/
├── app/
│   ├── page.js                    # Landing page (dynamic products)
│   ├── categories.js              # Fallback product data
│   ├── globals.css                # Design system
│   ├── layout.js                  # Root layout + meta
│   ├── download/page.js           # Post-purchase download page
│   ├── admin-panel/
│   │   ├── page.js                # Admin dashboard
│   │   └── login/page.js          # Admin login
│   └── api/
│       ├── products/route.js      # Public products API
│       ├── checkout/route.js      # Stripe checkout sessions
│       ├── webhook/route.js       # Stripe webhook handler
│       ├── download/route.js      # Secure file downloads
│       └── admin/
│           ├── auth/route.js      # Login/logout/session
│           ├── products/route.js  # Product CRUD
│           ├── templates/route.js # Template management
│           ├── publish/route.js   # CSV export pipeline
│           └── seed/route.js      # Initial data upload
├── lib/
│   ├── auth.js                    # Authentication system
│   └── storage.js                 # Vercel Blob abstraction
└── public/
    └── data/                      # Generated CSV templates
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Stripe account
- Vercel account with Blob storage

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ruleforge.git
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
|---|---|
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
- **Credential hashing** — Passwords validated server-side
- **Webhook verification** — Stripe signatures verified before processing
- **No client-side secrets** — All sensitive operations happen in API routes

---

## License

MIT
