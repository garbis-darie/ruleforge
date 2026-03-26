# RuleForge Golden Dataset Benchmark

**Evidence label:** `Synthetic-benchmark`

**Dataset:** seed 42, 1200 alerts, spec RuleForge Synthetic Dataset Spec v1

| Scenario | Reviewed | Workload Reduction | Precision Proxy | Recall Proxy | Avg Days |
|---|---:|---:|---:|---:|---:|
| Baseline Policy | 848 | 0% | 18.87% | 80.4% | 3.63 |
| Balanced Raise (+3) | 762 | 10.14% | 19.95% | 76.38% | 3.52 |
| Precision Raise (+8) | 641 | 24.41% | 22% | 70.85% | 3.26 |
| Coverage Lower (-5) | 957 | -12.85% | 18.18% | 87.44% | 3.79 |

## Notes

- Precision and recall are directional proxies over synthetic labels.
- This output supports pre-production policy comparison, not production detection claims.
- See `ruleforge/docs/validation-protocol-v1.md` for promotion gates and governance integration.