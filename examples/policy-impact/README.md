# Policy Impact Examples

This folder documents synthetic benchmark outputs used to demonstrate policy tradeoffs before production rollout.

## Source

- Generated with `threshold-tuner` scenario backtests on seeded synthetic datasets.
- Label: `Synthetic-benchmark`

## Example Scenario Snapshot

| Scenario | Reviewed Alerts | Workload Reduction | Precision Proxy | Recall Proxy |
|---|---:|---:|---:|---:|
| Baseline | 852 | 0% | 19.37% | 83.76% |
| Risk-Off Hard Raise (+12) | 514 | 39.67% | 24.12% | 62.94% |
| Risk Balanced Raise (+5) | 720 | 15.49% | 20.83% | 76.14% |
| Growth Mode Lower (-8) | 1006 | -18.08% | 18.49% | 94.42% |

## Interpretation

- Risk-off modes reduce analyst workload but can decrease recall.
- Coverage-oriented modes increase recall but raise queue pressure.
- Balanced mode often provides a better rollout candidate before hard risk-off tuning.

## Guardrails

- Synthetic benchmark only.
- This is decision support, not legal advice.
- Production change approval requires measured post-change monitoring.
