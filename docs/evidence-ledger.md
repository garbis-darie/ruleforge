# RuleForge Evidence Ledger

This ledger separates public claims by evidence class so readers can assess credibility quickly.

## Evidence Classes

- `Measured`: qualified real-world context with internal evidence.
- `Synthetic-benchmark`: reproducible outputs on synthetic datasets.
- `Illustrative`: conceptual/architecture examples only.

## Claim Register

| Claim | Label | Confidence | Evidence Source Class | Notes |
|---|---|---|---|---|
| Up to ~20% false-positive reduction in severity-architecture contexts | Measured (qualified) | Medium | Internal KPI comparisons and implementation summaries | Public phrasing uses qualified range due to context variance |
| Up to ~30% faster alert review in structured severity workflows | Measured (qualified) | Medium | Team process and triage-cycle observations | Depends on queue routing and analyst process maturity |
| Up to ~15% uplift in proactive suspicious activity identification (indirect model contexts) | Measured (qualified) | Medium | Escalation-pattern comparisons | Sensitive to label quality and typology mix |
| Policy scenario tradeoffs (risk-off vs coverage) | Synthetic-benchmark | High | Linked benchmark outputs | See `examples/policy-impact/` |
| Cross-provider policy portability model | Illustrative + Measured architecture | High | Adapter schema and implementation design | Portability still requires provider adapter validation |

## Metric Phrasing Rules

- Use `up to ~X%` only for qualified measured contexts.
- Use `in synthetic benchmark conditions` for simulated outputs.
- Never blend measured and synthetic outcomes in one sentence.
- Synthetic benchmark claims should cite dataset seed, scenario config, and output artifact path where possible.

## Validation Backlog

1. Add anonymized before/after KPI table template for client-safe evidence exports.
2. Add periodic confidence review (quarterly) for each public claim.
3. Attach benchmark run IDs and scenario config hashes to synthetic claims.
