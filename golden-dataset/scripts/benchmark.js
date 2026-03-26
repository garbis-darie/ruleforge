#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { runBenchmark } from "../lib/bench.js";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    args[argv[i].slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
}

function markdownTable(rows) {
  const header =
    "| Scenario | Reviewed | Workload Reduction | Precision Proxy | Recall Proxy | Avg Days |\n" +
    "|---|---:|---:|---:|---:|---:|";
  const lines = rows.map(
    (r) =>
      `| ${r.label} | ${r.reviewed_alerts} | ${r.workload_reduction_pct}% | ${r.precision_proxy_pct}% | ${r.recall_proxy_pct}% | ${r.avg_days_to_disposition} |`
  );
  return [header, ...lines].join("\n");
}

const args = parseArgs(process.argv);
const inputPath = path.resolve(process.cwd(), args.input ?? "./data/golden-seed-42.json");
const scenarioPath = path.resolve(process.cwd(), args.scenarios ?? "./config/scenarios.json");
const outPath = path.resolve(process.cwd(), args.out ?? "./outputs/benchmark-golden-seed-42.json");
const outMdPath = outPath.replace(/\.json$/i, ".md");

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const scenarioConfig = JSON.parse(fs.readFileSync(scenarioPath, "utf8"));

const alerts = input.alerts ?? [];
const scenarios = scenarioConfig.scenarios ?? [];
const results = runBenchmark(alerts, scenarios);

const payload = {
  metadata: {
    input: inputPath,
    scenarios: scenarioPath,
    dataset_seed: input.metadata?.seed,
    dataset_spec: input.metadata?.dataset_spec,
    generated_at: new Date().toISOString(),
    label: "Synthetic-benchmark",
  },
  totals: {
    alerts: alerts.length,
    filed_sar: alerts.filter((a) => a.filed_sar).length,
  },
  results,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));

const md = [
  "# RuleForge Golden Dataset Benchmark",
  "",
  "**Evidence label:** `Synthetic-benchmark`",
  "",
  `**Dataset:** seed ${input.metadata?.seed}, ${alerts.length} alerts, spec ${input.metadata?.dataset_spec || "unknown"}`,
  "",
  markdownTable(results),
  "",
  "## Notes",
  "",
  "- Precision and recall are directional proxies over synthetic labels.",
  "- This output supports pre-production policy comparison, not production detection claims.",
  "- See `ruleforge/docs/validation-protocol-v1.md` for promotion gates and governance integration.",
].join("\n");

fs.writeFileSync(outMdPath, md);
console.log(`Wrote benchmark: ${outPath} and ${outMdPath}`);
