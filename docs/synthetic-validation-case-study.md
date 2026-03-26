# RuleForge Synthetic Validation Case Study

**Evidence label:** `Synthetic-benchmark`

## Executive Summary

RuleForge is built around one core product belief: transaction monitoring policy changes should be tested before they are trusted.

This case study shows how RuleForge uses a simulation-first benchmark loop to compare candidate threshold policies before rollout. The goal is not to claim real-world detection accuracy from public data. The goal is to show disciplined product judgment: the same candidate policy is tested on the same synthetic dataset, benchmarked against a baseline, and then evaluated through an explicit approval framework.

## Problem Context

Transaction monitoring teams often inherit thresholds that are manually tuned, poorly documented, and hard to defend. Over time, three problems appear:

1. Alert queues grow faster than analyst capacity.
2. Threshold changes become inconsistent across teams or clients.
3. Tradeoffs between workload reduction and suspicious-activity coverage are made informally.

RuleForge addresses that by turning policy updates into a governed product workflow: define the candidate, benchmark it, record the tradeoff, and only then decide whether it is fit for rollout.

## Hypothesis

A simulation-first benchmark process can improve policy decision quality before production rollout by making workload, signal quality, and coverage tradeoffs visible and reproducible.

## Validation Setup

This case study follows the proof chain defined in [validation-protocol-v1.md](./validation-protocol-v1.md):

1. Generate deterministic synthetic alert streams with `tm-alert-simulator`.
2. Encode baseline and candidate policy variants in `kyt-policy-bench`.
3. Compare scenario outputs using fixed metrics.
4. Feed the result into RuleForge governance via the change-control template and evidence ledger.

Core product logic referenced:

- Hop-decay exposure normalization in `ruleforge/lib/exposure.js`
- Severity classification in `ruleforge/lib/severity.js`
- Promotion criteria in [validation-protocol-v1.md](./validation-protocol-v1.md)

## Benchmark Snapshot

Illustrative benchmark snapshot from [examples/policy-impact/README.md](../examples/policy-impact/README.md):

| Scenario | Reviewed Alerts | Workload Reduction | Precision Proxy | Recall Proxy |
|---|---:|---:|---:|---:|
| Baseline | 852 | 0% | 19.37% | 83.76% |
| Risk-Off Hard Raise (+12) | 514 | 39.67% | 24.12% | 62.94% |
| Risk Balanced Raise (+5) | 720 | 15.49% | 20.83% | 76.14% |
| Growth Mode Lower (-8) | 1006 | -18.08% | 18.49% | 94.42% |

## Decision

The balanced raise scenario is the strongest example of RuleForge-style product judgment.

Why:

- It reduces review volume by **15.49%**, which eases queue pressure.
- It improves precision proxy from **19.37%** to **20.83%**, suggesting better reviewed-alert quality.
- It gives up some recall proxy, but not as aggressively as the hard risk-off variant.

This makes it easier to defend as a candidate for controlled rollout than either extreme:

- the hard raise is more efficient but cuts recall too sharply
- the growth mode improves coverage but increases analyst burden

In product terms, the balanced scenario is not the most aggressive option. It is the most governable one.

## Why It Matters

This is where RuleForge becomes more than a template library.

The product value is not just “more rules.” It is a decision framework for choosing between competing threshold postures with evidence, traceability, and explicit tradeoff language.

For a compliance lead, that means:

- fewer ad hoc threshold debates
- clearer rationale for approval decisions
- a better audit trail when policies are questioned later

For a product or hiring reviewer, it shows:

- the builder understands not only rule logic, but decision quality
- AI-assisted output is bounded by human review and evidence discipline
- the product is designed around responsible rollout behavior, not feature theater

## Governance Layer

Benchmark outputs are not treated as final truth. They are treated as structured input to a governed change process.

In RuleForge that means:

- benchmark references are recorded in [change-control-template.md](./change-control-template.md)
- claims remain classified under [evidence-ledger.md](./evidence-ledger.md)
- synthetic results are clearly separated from measured deployment outcomes

That separation is intentional. It keeps the product credible.

## Guardrails And Limits

- This case study uses synthetic benchmark data only.
- Precision and recall values are directional proxies, not production detection metrics.
- The benchmark demonstrates comparative policy testing, not proof of real-world fraud detection accuracy.
- Any production change still requires measured post-change monitoring.

## What This Demonstrates About The Builder

This artifact is meant to show a specific quality of work:

- strong domain framing
- productized thinking under uncertainty
- AI-native execution with human-owned quality gates
- willingness to constrain claims to what the evidence actually supports

The core signal is simple: the builder does not use AI to produce more output. The builder uses AI to produce faster iterations while keeping judgment, framing, and release discipline human-governed.

## Further Reading

- [RuleForge README](../README.md)
- [Validation Protocol v1](./validation-protocol-v1.md)
- [Change-Control Template](./change-control-template.md)
- [Evidence Ledger](./evidence-ledger.md)
- [Policy Impact Examples](../examples/policy-impact/README.md)
