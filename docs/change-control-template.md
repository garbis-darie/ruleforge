# Threshold Change-Control Template

Use this template for any policy or threshold update to keep decisions auditable and reversible.

## Header

- Change request ID:
- Date:
- Requestor:
- Reviewer(s):
- Approver:
- Environment: `staging` / `production`

## Scope

- Rule ID(s):
- VASP profile:
- Provider(s): `Chainalysis` / `TRM` / `Crystal` / `Fireblocks` / other
- Current threshold(s):
- Proposed threshold(s):

## Rationale

- Problem statement:
- Trigger metric(s):
- Why this action (raise / lower / logic review / prioritization):
- Expected impact:
  - workload:
  - precision:
  - recall/coverage:

## Risk Assessment

- Key failure mode if accepted:
- Key failure mode if rejected:
- Regulatory/control risk note:
- Operational risk note:
- Customer-impact risk note:

## Validation Plan

- Simulation dataset reference:
- Baseline window:
- Success criteria:
- Watchlist metrics (first 2-4 weeks post-change):

## Rollback Plan

- Rollback trigger(s):
- Rollback owner:
- Rollback command/process:
- Time to rollback target:

## Approval Record

- Decision: `Approved` / `Rejected` / `Revise`
- Decision timestamp:
- Decision note:
