# RuleForge Compliance Methodology

> This document describes the compliance framework that underpins RuleForge. It is derived from 4 years of hands-on transaction monitoring work across multiple Virtual Asset Service Providers (VASPs), and formalised during consultancy engagements with blockchain analytics platforms.

---

## Background & Provenance

The methodology documented here was developed iteratively:

- **2022 — Celsius Network:** Initial exposure to DeFi transaction monitoring. Built direct and indirect exposure checks via API integration. Identified the need for structured indirect exposure scoring.
- **2023–2024 — ToTheMoon (VASP):** Scaled threshold management to support 50% user growth. Integrated TRM Labs API and built Power BI/Tableau dashboards for compliance visibility. Validated that manual threshold management does not scale.
- **2024–2025 — DelSaldado Services:** Formalised the alert severity matrix and indirect exposure model. Validated framework accuracy with compliance and technical teams, achieving a 30% reduction in alert review times.
- **2025–Present:** Productised into RuleForge — a vendor-agnostic SaaS platform deployable across 10+ VASP profiles.

---

## 1. Alert Severity Matrix

The Alert Severity Matrix classifies transaction alerts across four tiers based on three input axes.

### Input Axes

| Axis | Description |
|------|-------------|
| **Exposure Type** | Direct (counterparty is the flagged entity) or Indirect (funds passed through one or more intermediaries) |
| **Transaction Direction** | Inbound (receiving from flagged entity) or Outbound (sending to flagged entity) |
| **Value** | Transaction value relative to configurable thresholds (Low / Medium / High) |

### Severity Tiers

| Tier | Label | Typical Action |
|------|-------|----------------|
| 1 | **Low** | Log and monitor. No immediate action required. |
| 2 | **Medium** | Enhanced due diligence. Request source of funds if not already held. |
| 3 | **High** | Escalate to MLRO. Consider blocking pending review. |
| 4 | **Severe** | Immediate escalation. Block transaction. File SAR if applicable. |

### Severity Determination Logic

```
IF exposure = Direct AND direction = Inbound AND value = High → Severe
IF exposure = Direct AND direction = Inbound AND value = Medium → High
IF exposure = Direct AND direction = Outbound → High (regardless of value)
IF exposure = Indirect (hop 1) AND value = High → High
IF exposure = Indirect (hop 1) AND value = Medium → Medium
IF exposure = Indirect (hop 2+) → Low to Medium (see Indirect Exposure Model)
```

**Outcome:** Deploying this matrix reduced false positives by ~20% and reduced analyst triage time by ~30% compared to flat threshold alerting.

---

## 2. Indirect Exposure Model

Standard blockchain analytics tools measure direct counterparty exposure well, but indirect exposure (second-hop, third-hop) is often over- or under-weighted, leading to alert fatigue or missed risks.

### The Problem

A transaction may be flagged because funds passed through an intermediary that previously interacted with a sanctioned entity. Without graduated scoring, all indirect exposure is treated equally — creating high false positive volumes.

### Fibonacci Sequencing for Risk Decay

Risk weight is applied in inverse Fibonacci proportion to hop distance:

| Hop Distance | Fibonacci Denominator | Risk Weight Applied |
|-------------|----------------------|-------------------|
| Direct (hop 0) | 1 | 100% of base score |
| Hop 1 | 2 | 50% of base score |
| Hop 2 | 3 | 33% of base score |
| Hop 3 | 5 | 20% of base score |
| Hop 4+ | 8+ | <13% — typically sub-threshold |

This means a severe-exposure entity at hop 3 produces a Medium alert rather than a Severe alert, reflecting the real-world dilution of risk through intermediary chains.

**Outcome:** Increased proactive suspicious activity detection by 15% while reducing indirect exposure false positives.

---

## 3. Vendor-Agnostic Design

RuleForge is designed to operate across Chainalysis KYT, TRM Labs, Crystal Blockchain, and Coinfirm without requiring policy rewrites when switching providers.

### Abstraction Layer

All rule logic references a normalised exposure schema, not provider-specific field names:

```json
{
  "entity_name": "string",
  "category": "string",          // e.g. "Sanctions", "Darknet", "Mixer"
  "exposure_type": "direct|indirect",
  "hop_distance": 0,
  "direction": "inbound|outbound",
  "exposure_value_usd": 0,
  "risk_score_raw": 0,           // Provider's raw score (0-100)
  "risk_score_normalised": 0     // RuleForge normalised score (0-10)
}
```

Provider-specific field mappings are handled in a thin adapter layer, allowing the same rule engine to process alerts from any supported provider.

### Supported Providers

| Provider | Integration Method | Coverage |
|----------|--------------------|---------|
| Chainalysis KYT | REST API + Webhook | Full (direct + indirect) |
| TRM Labs | REST API | Full (direct + indirect) |
| Crystal Blockchain | REST API | Full (direct + indirect) |
| Fireblocks | Post-screening webhook | Transaction screening layer |
| Coinfirm | REST API | Legacy support |

---

## 4. VASP Profile Taxonomy

Different VASP types have structurally different risk profiles. Applying the same thresholds across a retail exchange and an OTC desk produces poor results for both.

### Profiles

| Profile | Characteristics | Threshold Starting Point |
|---------|-----------------|--------------------------|
| **Retail Exchange** | High volume, low average value, broad user base | Lower value thresholds, higher hop tolerance |
| **OTC Desk** | Low volume, high average value, institutional clients | Higher value thresholds, lower hop tolerance |
| **DeFi Protocol** | Smart contract interactions, complex indirect paths | Extended hop analysis (up to hop 5), smart contract category weighting |
| **Neobank / VASP-lite** | Mixed fiat/crypto, regulated retail context | Conservative defaults, strong regulatory alignment (AMLD6 / FCA) |
| **Payment Processor** | High throughput, speed-sensitive | Optimised for low latency, async screening |

Profiles ship as pre-configured templates in RuleForge and can be overridden per client.

---

## 5. Regulatory Alignment

All threshold logic is mapped against the following frameworks:

| Framework | Key Requirement | How It Is Addressed |
|-----------|----------------|-------------------|
| **FATF Recommendations** (R.15, R.16) | Risk-based approach for VASPs; Travel Rule compliance | Risk-based alerting model; IVMS 101 field support |
| **EU AMLD5 / AMLD6** | Enhanced due diligence thresholds; UBO identification | Medium/High tier triggers EDD workflow |
| **UK FCA (MLR 2017)** | SAR obligations; PEP/Sanctions screening | Severe tier triggers SAR workflow prompt |
| **Travel Rule (IVMS 101)** | Originator/beneficiary data for transfers >$1,000 / €1,000 | Threshold-linked data collection prompts |

---

## 6. Governance & Audit Readiness

- All threshold changes are version-controlled with a timestamp, author, and justification field.
- Alert dispositions (reviewed, escalated, dismissed) are logged with analyst ID and timestamp.
- The rule engine supports export of the full threshold history for regulator review.
- Simulation mode allows compliance teams to test threshold changes against historical data before deploying live.

---

## Further Reading

- [RuleForge README](../README.md) — Platform overview and technical setup
- [GitHub Profile](https://github.com/garbis-darie) — Full portfolio and career arc
- [LinkedIn](https://linkedin.com/in/garbis-darie) — Professional background
