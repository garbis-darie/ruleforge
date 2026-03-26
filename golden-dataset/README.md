# RuleForge Golden Dataset

**Evidence label:** `Synthetic-benchmark`

Self-contained synthetic dataset package for running RuleForge's canonical benchmark proof chain from zero.

## What This Is

A small, governed synthetic dataset and benchmark harness that demonstrates RuleForge policy comparison without requiring access to external repos. It includes:

- a deterministic data generator aligned to the RuleForge Synthetic Dataset Spec v1
- externalized typology assumptions as auditable JSON config
- a lightweight benchmark harness for policy scenario comparison
- a schema validator as a cheap sub-agent-style quality gate
- pre-committed golden dataset and benchmark outputs for reproducibility verification

## Quick Start

```bash
cd ruleforge/golden-dataset

# Generate the golden dataset (seed 42, 1200 alerts)
npm run generate

# Validate schema compliance
npm run validate

# Run benchmark scenarios
npm run benchmark
```

## What You Get

### Generated dataset: `data/golden-seed-42.json`

1200 synthetic alerts with the canonical v1 schema:

- `alert_id`, `entity_id`, `timestamp`
- `typology`, `rule_id`
- `amount_usd`, `direction`, `hop_distance`
- `risk_score_raw`, `threshold_value`
- `filed_sar`, `days_to_disposition`, `is_true_positive`

### Benchmark output: `outputs/benchmark-golden-seed-42.md`

| Scenario | Reviewed | Workload Reduction | Precision Proxy | Recall Proxy | Avg Days |
|---|---:|---:|---:|---:|---:|
| Baseline Policy | 848 | 0% | 18.87% | 80.4% | 3.63 |
| Balanced Raise (+3) | 762 | 10.14% | 19.95% | 76.38% | 3.52 |
| Precision Raise (+8) | 641 | 24.41% | 22% | 70.85% | 3.26 |
| Coverage Lower (-5) | 957 | -12.85% | 18.18% | 87.44% | 3.79 |

## In-Scope Typologies

The v1 dataset uses 5 typologies with externalized assumptions in `config/typology-assumptions.json`:

- `structuring_pattern` - near-threshold clustering behavior
- `rapid_in_out` - tight inflow/outflow sequences
- `mixer_indirect` - indirect exposure via intermediaries
- `high_risk_jurisdiction` - jurisdiction-linked elevated risk
- `sanctions_exposure` - direct or near-direct flagged entity exposure

Each typology has explicit base score, jitter range, SAR bias, value range, direction distribution, and hop distance distribution.

## Scenarios

Defined in `config/scenarios.json`:

- **Baseline** - current policy posture (delta 0)
- **Balanced Raise (+3)** - moderate workload reduction
- **Precision Raise (+8)** - stronger queue compression
- **Coverage Lower (-5)** - broader suspicious-activity capture

## How It Connects to RuleForge

This package produces the benchmark evidence that feeds into:

- **Change-control template** (`ruleforge/docs/change-control-template.md`)
- **Evidence ledger** (`ruleforge/docs/evidence-ledger.md`)
- **Validation protocol** (`ruleforge/docs/validation-protocol-v1.md`)
- **Dataset spec** (`ruleforge/docs/synthetic-dataset-spec-v1.md`)

The proof flow is:

`generate` -> `validate` -> `benchmark` -> RuleForge governance decision.

## Sub-Agent First Design

The validate script exists as a cheap schema-audit gate. In an automated workflow:

1. **Schema Auditor** (validate script) runs first
2. **Benchmark Harness** runs only if validation passes
3. **Master Agent** reviews outputs and makes promotion decisions

This keeps cron token spend efficient by failing fast on data quality issues.

## Reproducibility

The generator uses a deterministic LCG-based RNG with fixed seed. Running `npm run generate` with the same seed produces identical output. The pre-committed `data/golden-seed-42.json` serves as a reproducibility anchor: regenerate and diff to verify determinism.

## Limitations

- All data is synthetic. No real customer or transaction data is used.
- Precision and recall are directional proxies, not production detection metrics.
- This package demonstrates controlled policy comparison, not real-world fraud detection accuracy.
- Typology assumptions are illustrative, not calibrated to any specific institution.

## Structure

```
golden-dataset/
├── config/
│   ├── typology-assumptions.json   # Externalized behavioral assumptions
│   ├── schema.json                 # Canonical v1 schema definition
│   └── scenarios.json              # Benchmark scenario pack
├── data/
│   └── golden-seed-42.json         # Pre-committed golden dataset
├── lib/
│   └── rng.js                      # Deterministic RNG
├── outputs/
│   ├── benchmark-golden-seed-42.json
│   └── benchmark-golden-seed-42.md
├── scripts/
│   ├── generate.js                 # Dataset generator
│   ├── benchmark.js                # Benchmark harness
│   └── validate.js                 # Schema validator
├── package.json
└── README.md
```
