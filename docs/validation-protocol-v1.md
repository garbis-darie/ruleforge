# RuleForge Validation Protocol v1

**Evidence label:** `Synthetic-benchmark`

This protocol defines how RuleForge policy decisions are tested before being framed as benchmark-improving. It connects the RuleForge engine to `tm-alert-simulator` and `kyt-policy-bench` so policy tradeoffs can be evaluated under fixed synthetic conditions.

## Purpose

The goal is not to prove that RuleForge catches real criminals on public data. The goal is to prove something narrower and more defensible:

1. RuleForge policy variants can be compared on the same dataset.
2. Those comparisons are reproducible.
3. Promotion decisions can be tied to explicit workload, detection, and triage tradeoffs.

## Proof Chain

1. Generate a deterministic synthetic alert dataset with `tm-alert-simulator`.
2. Define baseline and candidate policy scenarios in `kyt-policy-bench`.
3. Run the benchmark and compare policy tradeoffs.
4. Record the benchmark reference in RuleForge change-control.
5. Only then frame the candidate as a rollout option.

## System Components

- **Dataset generator:** `tm-alert-simulator`
- **Benchmark harness:** `kyt-policy-bench`
- **Policy engine:** `ruleforge/lib/exposure.js`, `ruleforge/lib/severity.js`
- **Governance layer:** `ruleforge/docs/change-control-template.md`
- **Evidence discipline:** `ruleforge/docs/evidence-ledger.md`
- **Dataset standard:** `ruleforge/docs/synthetic-dataset-spec-v1.md`
- **Golden dataset package:** `ruleforge/golden-dataset/` (self-contained generator + benchmark + validator)

## Dataset Assumptions

The protocol uses synthetic alerts shaped like the generator output from `tm-alert-simulator`:

- `rule_id`
- `typology`
- `score`
- `threshold_value`
- `value_usd`
- `filed_sar`
- `days_to_disposition`
- `created_at`

These labels are synthetic. Precision and recall are therefore **directional proxies**, not production truth.

For the canonical field set, typology assumptions, and sub-agent review flow, see [synthetic-dataset-spec-v1.md](./synthetic-dataset-spec-v1.md).

## Core RuleForge Formulas

### 1. Hop-decay exposure normalization

RuleForge starts by normalizing raw vendor risk scores using hop-distance decay:

```text
normalised_score = raw_score * hop_weight(hop_distance)
```

Current weights in `ruleforge/lib/exposure.js`:

| Hop distance | Weight |
|---|---:|
| 0 | 1.00 |
| 1 | 0.50 |
| 2 | 0.33 |
| 3 | 0.20 |
| 4 | 0.13 |
| 5 | 0.08 |
| 6+ | 0.05 |

This is a Fibonacci-shaped decay model for indirect exposure handling.

### 2. Severity classification

The normalized exposure is then classified by deterministic severity logic in `ruleforge/lib/severity.js`.

Rule inputs:

- `exposure_type`
- `direction`
- `risk_score_normalised`
- `exposure_value_usd`

Default threshold config:

```text
value_usd: low=10,000 | medium=50,000 | high=200,000
score: low=25 | medium=50 | high=75
```

Example logic:

- direct + inbound + high score + high value -> `Severe`
- direct + high score -> `High`
- direct + medium score -> `High`
- indirect + medium score + high value -> `High`
- indirect + medium score -> `Medium`
- indirect + low score -> `Low`

### 3. Benchmark threshold adjustment

`kyt-policy-bench` does not rerun RuleForge internals directly. It tests threshold policy variants by adjusting each alert's benchmark threshold:

```text
effective_threshold = baseline_threshold + delta    (raise mode)
effective_threshold = baseline_threshold - delta    (lower mode)
effective_threshold = baseline_threshold            (baseline mode)
```

An alert is considered reviewed when:

```text
score >= effective_threshold
```

This gives a controlled, reproducible first-layer validation loop for candidate policy posture.

## Benchmark Metrics

The benchmark currently reports:

- `reviewed_alerts`
- `workload_reduction_pct`
- `precision_proxy_pct`
- `recall_proxy_pct`
- `avg_days_to_disposition`

Interpretation:

- **Workload reduction** approximates analyst queue pressure relief.
- **Precision proxy** approximates signal quality among reviewed alerts.
- **Recall proxy** approximates retained suspicious-activity coverage.
- **Avg days to disposition** approximates queue speed.

## Promotion Gates

For a candidate to be described as a benchmark-improving **balanced** policy, it should meet all default gates below unless an approver explicitly accepts an exception:

1. `workload_reduction_pct >= 5`
2. `precision_proxy_pct >= baseline_precision_proxy_pct`
3. `recall_proxy_pct >= baseline_recall_proxy_pct - 8`
4. `avg_days_to_disposition <= baseline_avg_days_to_disposition + 0.25`

These gates intentionally prefer disciplined tradeoffs over aggressive cherry-picking.

### Exception classes

- **Risk-off candidate:** may accept larger recall loss if workload and precision gains are material.
- **Coverage-first candidate:** may accept workload growth if recall improvement is material and explicitly approved.

Any exception must be documented in RuleForge change-control.

## Default Validation Run

Reference command pattern:

```bash
node scripts/run-benchmark.js \
  --input ../tm-alert-simulator/data/alerts-seed-42.json \
  --scenarios ./config/ruleforge-validation-v1.json \
  --out ./outputs/ruleforge-validation-seed-42.json
```

The benchmark artifact must record:

- input dataset path
- scenario config path
- generation timestamp
- benchmark label (`Synthetic-benchmark`)

## Governance Integration

Each benchmark run should be referenced in the RuleForge change-control template:

- **Simulation dataset reference:** benchmark input path + seed
- **Baseline window:** baseline scenario ID
- **Success criteria:** promotion gates listed above
- **Watchlist metrics:** workload, precision proxy, recall proxy, average days

The benchmark result should also support the evidence ledger:

- benchmark claims remain `Synthetic-benchmark`
- seed and scenario IDs must be cited
- synthetic and measured claims must not be blended in one sentence

## Experimental Appendix: Mandelbrot-Inspired Irregularity Features

This is an experimental layer for future comparison. It is **not** part of the current benchmark harness.

The right interpretation of Mandelbrot-style thinking in transaction monitoring is not literal Mandelbrot-set membership. It is the use of **fractal-inspired irregularity signals**:

- burst clustering
- scale-sensitive threshold behavior
- entropy shifts in counterparties or value bands
- persistence / self-similarity in activity windows

Suggested experimental formulas:

### Burstiness index

```text
B = (sigma(inter_arrival_times) - mean(inter_arrival_times)) /
    (sigma(inter_arrival_times) + mean(inter_arrival_times) + epsilon)
```

Use: identifies clustered transfer bursts associated with mule or rapid in/out behavior.

### Threshold-proximity ratio

```text
P_delta = (1 / n) * sum( indicator( abs(tx_value - threshold_anchor) <= delta ) )
```

Use: detects repeated amounts clustering just below review or reporting boundaries.

### Counterparty entropy shift

```text
Delta_H = H(window) - H(baseline)
H = -sum(p_i * log(p_i))
```

Use: detects sudden concentration or fragmentation in transfer counterparties.

### Persistence proxy

```text
H_hat > 0.5
```

Where `H_hat` is a Hurst-like persistence estimate over transfer timing or value sequence.

Use: flags sustained regime-like behavior rather than isolated spikes.

### Composite irregularity score

```text
I = a*B + b*P_delta + c*abs(Delta_H) + d*max(0, H_hat - 0.5)
```

This score should be treated as a research signal for scenario comparison only until it is implemented and benchmarked explicitly.

## Limitations

- Synthetic datasets are not substitutes for production validation.
- Proxy metrics are directional.
- Public-facing claims must stay within the evidence rules in `ruleforge/docs/evidence-ledger.md`.
- The irregularity appendix is experimental and should not be described as proven detection logic.

## Recommended Public Framing

Use phrasing like:

> In synthetic benchmark conditions, candidate RuleForge policy variants improved defined tradeoffs versus baseline under fixed-seed scenarios.

Do not use phrasing like:

> RuleForge proves fraud detection accuracy on real transaction populations.
