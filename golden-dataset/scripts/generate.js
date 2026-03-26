#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { generateAlerts, buildPayload } from "../lib/generate.js";

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

const alerts = generateAlerts({ seed, count, startedAt });
const payload = buildPayload(alerts, { seed, count, startedAt });

const absOut = path.resolve(process.cwd(), outPath);
fs.mkdirSync(path.dirname(absOut), { recursive: true });
fs.writeFileSync(absOut, JSON.stringify(payload, null, 2));
console.log(`Generated ${alerts.length} alerts at ${absOut}`);
