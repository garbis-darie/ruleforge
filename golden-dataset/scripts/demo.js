#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { generateAlerts } from "../lib/generate.js";
import { runBenchmark } from "../lib/bench.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const configDir = path.resolve(__dirname, "../config");
const schemaPath = path.join(configDir, "schema.json");
const scenarioPath = path.join(configDir, "scenarios.json");

const SEED = 42;
const COUNT = 1200;
const STARTED_AT = "2026-01-01T00:00:00.000Z";

const W = 56;
const BAR = "\u2550".repeat(W);
const LINE = "\u2500".repeat(W - 4);

function pad(str, len) {
  return String(str).padEnd(len);
}

function rpad(str, len) {
  return String(str).padStart(len);
}

function bar(pct, width = 10) {
  const filled = Math.round((pct / 100) * width);
  return "\u2588".repeat(filled) + "\u2591".repeat(width - filled);
}

// --- Generate ---
const alerts = generateAlerts({ seed: SEED, count: COUNT, startedAt: STARTED_AT });

// --- Validate ---
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
let schemaErrors = 0;
for (let i = 0; i < alerts.length; i += 1) {
  for (const field of schema.required) {
    if (alerts[i][field.field] === undefined || alerts[i][field.field] === null) {
      schemaErrors += 1;
    }
  }
}

// --- Benchmark ---
const scenarioConfig = JSON.parse(fs.readFileSync(scenarioPath, "utf8"));
const results = runBenchmark(alerts, scenarioConfig.scenarios);
const baseline = results.find((r) => r.id === "baseline") ?? results[0];

// --- Stats ---
const sarCount = alerts.filter((a) => a.filed_sar).length;
const typologyCounts = {};
for (const a of alerts) {
  typologyCounts[a.typology] = (typologyCounts[a.typology] || 0) + 1;
}

// --- Print ---
console.log();
console.log(`  ${BAR}`);
console.log(`  RULEFORGE \u2014 Golden Dataset Proof Chain`);
console.log(`  Evidence: Synthetic-benchmark | Seed: ${SEED}`);
console.log(`  ${BAR}`);
console.log();

console.log(`  Dataset`);
console.log(`  ${LINE}`);
console.log(`  Alerts: ${alerts.length} | SAR proxies: ${sarCount} | Typologies: ${Object.keys(typologyCounts).length}`);
console.log(`  Schema: ${schemaErrors === 0 ? "PASS" : `FAIL (${schemaErrors} errors)`}`);
console.log();

const maxTyp = Math.max(...Object.values(typologyCounts));
for (const [typ, count] of Object.entries(typologyCounts)) {
  const pct = Math.round((count / alerts.length) * 100);
  console.log(`  ${pad(typ, 26)} ${bar(pct)} ${rpad(pct + "%", 4)}`);
}
console.log();

console.log(`  Benchmark`);
console.log(`  ${LINE}`);
console.log(`  ${pad("Scenario", 26)} ${rpad("Reviewed", 8)}  ${rpad("Workload", 9)}  ${rpad("Precision", 9)}  ${rpad("Recall", 8)}  ${rpad("Days", 5)}`);

for (const r of results) {
  const wl = r.id === "baseline" ? rpad("\u2014", 9) : rpad((r.workload_reduction_pct > 0 ? "-" : "+") + Math.abs(r.workload_reduction_pct) + "%", 9);
  console.log(
    `  ${pad(r.label, 26)} ${rpad(r.reviewed_alerts, 8)}  ${wl}  ${rpad(r.precision_proxy_pct + "%", 9)}  ${rpad(r.recall_proxy_pct + "%", 8)}  ${rpad(r.avg_days_to_disposition, 5)}`
  );
}
console.log();

// --- Promotion Gates for balanced raise ---
const balanced = results.find((r) => r.id === "balanced_plus");
if (balanced) {
  console.log(`  Promotion Gates (${balanced.label})`);
  console.log(`  ${LINE}`);

  const gates = [
    {
      name: "Workload >= 5%",
      pass: balanced.workload_reduction_pct >= 5,
      detail: `${balanced.workload_reduction_pct}%`,
    },
    {
      name: "Precision >= baseline",
      pass: balanced.precision_proxy_pct >= baseline.precision_proxy_pct,
      detail: `${balanced.precision_proxy_pct}% vs ${baseline.precision_proxy_pct}%`,
    },
    {
      name: "Recall >= baseline-8",
      pass: balanced.recall_proxy_pct >= baseline.recall_proxy_pct - 8,
      detail: `${balanced.recall_proxy_pct}% vs ${baseline.recall_proxy_pct - 8}%`,
    },
    {
      name: "Avg days <= +0.25",
      pass: balanced.avg_days_to_disposition <= baseline.avg_days_to_disposition + 0.25,
      detail: `${balanced.avg_days_to_disposition} vs ${baseline.avg_days_to_disposition + 0.25}`,
    },
  ];

  for (const g of gates) {
    const status = g.pass ? "PASS" : "FAIL";
    console.log(`  ${pad(g.name, 26)} ${status} (${g.detail})`);
  }
  console.log();
}

console.log(`  ${BAR}`);
console.log(`  Synthetic data only. Not legal advice.`);
console.log(`  See docs/validation-protocol-v1.md for governance.`);
console.log(`  ${BAR}`);
console.log();
