# Success Metrics

## North Star

Time-to-defensible-threshold-update (TTDTU): time from identified policy change need to approved, documented, deployable threshold update.

## Funnel Metrics

1. Visitor -> Pricing section view rate
2. Pricing view -> Checkout start rate
3. Checkout start -> Purchase completion rate
4. Purchase -> Download success rate

## Product Value Metrics

1. Average threshold update cycle time (baseline vs post-adoption)
2. Alert review effort per 1,000 alerts
3. False positive rate trend (qualified context)
4. Governance completeness score:
   - rationale attached
   - owner assigned
   - rollback condition defined
   - citation included

## Trust & Reliability Metrics

1. Build pass rate on release candidates
2. Webhook processing success rate
3. Download verification success rate
4. Support response time for enterprise requests

## Instrumentation Plan (Minimal)

Track these event names first:

- `landing_pricing_viewed`
- `checkout_started`
- `checkout_completed`
- `download_verified`
- `enterprise_contact_clicked`

Add event properties:

- `tier` (`single`, `full-pack`, `enterprise`)
- `category_slug`
- `source_page`
