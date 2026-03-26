function round(n) {
  return Math.round(n * 100) / 100;
}

function effectiveThreshold(base, mode, delta) {
  if (mode === "raise") return Math.min(99, base + delta);
  if (mode === "lower") return Math.max(1, base - delta);
  return base;
}

export function evaluateScenario(alerts, scenario) {
  const reviewed = [];
  for (const alert of alerts) {
    const threshold = effectiveThreshold(alert.threshold_value, scenario.mode, scenario.delta);
    if (alert.risk_score_raw >= threshold) {
      reviewed.push(alert);
    }
  }

  const totalFiledSar = alerts.filter((a) => a.filed_sar).length;
  const reviewedFiledSar = reviewed.filter((a) => a.filed_sar).length;
  const avgDays =
    reviewed.length === 0
      ? 0
      : reviewed.reduce((sum, a) => sum + a.days_to_disposition, 0) / reviewed.length;

  return {
    id: scenario.id,
    label: scenario.label,
    mode: scenario.mode,
    delta: scenario.delta,
    reviewed_alerts: reviewed.length,
    reviewed_ratio_pct: round((reviewed.length / alerts.length) * 100),
    precision_proxy_pct: reviewed.length ? round((reviewedFiledSar / reviewed.length) * 100) : 0,
    recall_proxy_pct: totalFiledSar ? round((reviewedFiledSar / totalFiledSar) * 100) : 0,
    avg_days_to_disposition: round(avgDays),
  };
}

export function runBenchmark(alerts, scenarios) {
  const results = scenarios.map((s) => evaluateScenario(alerts, s));
  const baseline = results.find((r) => r.id === "baseline") ?? results[0];

  return results.map((result) => ({
    ...result,
    workload_reduction_pct: baseline.reviewed_alerts
      ? round(((baseline.reviewed_alerts - result.reviewed_alerts) / baseline.reviewed_alerts) * 100)
      : 0,
  }));
}
