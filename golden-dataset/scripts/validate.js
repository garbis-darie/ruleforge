#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const schemaPath = path.resolve(__dirname, "../config/schema.json");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    args[argv[i].slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
}

const TYPE_CHECKS = {
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number" && !Number.isNaN(v),
  integer: (v) => Number.isInteger(v),
  boolean: (v) => typeof v === "boolean",
};

const args = parseArgs(process.argv);
const inputPath = path.resolve(process.cwd(), args.input ?? "./data/golden-seed-42.json");

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const alerts = input.alerts ?? [];
const metadata = input.metadata ?? {};
let errors = 0;
let warnings = 0;

// Metadata checks
for (const key of schema.metadata_required) {
  if (metadata[key] === undefined) {
    console.error(`[ERROR] Missing metadata field: ${key}`);
    errors += 1;
  }
}

// Row checks
for (let i = 0; i < alerts.length; i += 1) {
  const row = alerts[i];
  for (const field of schema.required) {
    if (row[field.field] === undefined || row[field.field] === null) {
      console.error(`[ERROR] Row ${i}: missing required field '${field.field}'`);
      errors += 1;
    } else if (!TYPE_CHECKS[field.type]?.(row[field.field])) {
      console.error(`[ERROR] Row ${i}: field '${field.field}' expected ${field.type}, got ${typeof row[field.field]} (${row[field.field]})`);
      errors += 1;
    }
  }
}

if (errors === 0) {
  console.log(`PASS: ${alerts.length} rows validated against schema v${schema.version}. 0 errors, ${warnings} warnings.`);
  process.exit(0);
} else {
  console.error(`FAIL: ${errors} errors, ${warnings} warnings across ${alerts.length} rows.`);
  process.exit(1);
}
