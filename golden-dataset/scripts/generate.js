#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRng, intBetween, pickWeighted } from "../lib/rng.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const configDir = path.resolve(__dirname, "../config");

const assumptions = JSON.parse(fs.readFileSync(path.join(configDir, "typology-assumptions.json"), "utf8"));

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    args[argv[i].slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
}

const args = parseArgs(process.argv);
const seed = Number(args.seed ?? 42);
const count = Number(args.count ?? 1200);
const startedAt = args.startedAt ?? "2026-01-01T00:00:00.000Z";
const outPath = args.out ?? "./data/golden-seed-42.json";

const rand = createRng(seed);
const startMs = Date.parse(startedAt);
const alerts = [];

const typologyItems = assumptions.typologies.map((t) => ({ value: t.id, weight: t.weight }));
const ruleItems = assumptions.rules.map((r) => ({ value: r.value, weight: r.weight }));

function scoreBias(score) {
  for (const tier of assumptions.score_bias_tiers) {
    if (score >= tier.min_score) return tier.bias;
  }
  return -0.01;
}

for (let i = 0; i < count; i += 1) {
  const typologyId = pickWeighted(rand, typologyItems);
  const typology = assumptions.typologies.find((t) => t.id === typologyId);

  const ruleId = pickWeighted(rand, ruleItems);
  const rule = assumptions.rules.find((r) => r.value === ruleId);

  const rawScore = Math.max(1, Math.min(99, typology.base_score + intBetween(rand, typology.jitter[0], typology.jitter[1])));
  const direction = pickWeighted(rand, typology.direction_weights);
  const hopDistance = pickWeighted(rand, typology.hop_distance_weights);
  const amountUsd = intBetween(rand, typology.value_range_usd[0], typology.value_range_usd[1]);

  const sarProb = Math.max(0.01, Math.min(0.8, typology.sar_bias + scoreBias(rawScore)));
  const filedSar = rand() < sarProb;
  const isTruePositive = filedSar || (rawScore >= 85 && rand() < 0.5);

  const maxDays = rawScore >= 80 ? 2 : rawScore >= 65 ? 4 : rawScore >= 50 ? 7 : 12;
  const daysToDisposition = intBetween(rand, 1, maxDays);

  const entitySuffix = intBetween(rand, 1000, 9999);
  const timestamp = new Date(startMs + i * 3600_000).toISOString();

  alerts.push({
    alert_id: `RF-${seed}-${String(i + 1).padStart(6, "0")}`,
    entity_id: `ENT-${entitySuffix}`,
    timestamp,
    typology: typologyId,
    rule_id: ruleId,
    amount_usd: amountUsd,
    direction,
    hop_distance: hopDistance,
    risk_score_raw: rawScore,
    threshold_value: rule.threshold,
    filed_sar: filedSar,
    days_to_disposition: daysToDisposition,
    is_true_positive: isTruePositive,
  });
}

const payload = {
  metadata: {
    label: "Synthetic-benchmark",
    seed,
    count,
    startedAt,
    generator_version: "v1",
    dataset_spec: "RuleForge Synthetic Dataset Spec v1",
    scenario_profile: "standard",
    generated_at: new Date().toISOString(),
  },
  alerts,
};

const absOut = path.resolve(process.cwd(), outPath);
fs.mkdirSync(path.dirname(absOut), { recursive: true });
fs.writeFileSync(absOut, JSON.stringify(payload, null, 2));
console.log(`Generated ${alerts.length} alerts at ${absOut}`);
