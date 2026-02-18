# Release Runbook

## Pre-Release Gate

1. Confirm `CI` workflow success on target branch.
2. Confirm latest migrations and storage-driver config are compatible with target environment.
3. Confirm critical secrets are present and rotated where required.
4. Confirm observability endpoints return healthy responses:
   - `GET /api/health`
   - `GET /api/admin/ops/summary` (SUPER_ADMIN)

## Staging Release

1. Merge selected changes into `staging`.
2. Validate `Deploy Staging` workflow completion.
3. Run smoke tests:
   - public routes
   - admin login + content save
   - checkout initiation
   - traceability lookup
4. Validate observability:
   - web-vitals ingestion
   - client error ingestion
   - admin operations dashboard visibility

## Production Release

1. Merge approved release commit to `main`.
2. Validate `Deploy Production` workflow completion.
3. Run production smoke checks against top user journeys.
4. Confirm no critical alerts in first 30 minutes.

## Rollback Procedure

1. Identify last known stable commit SHA.
2. Redeploy stable commit via `workflow_dispatch` on production workflow.
3. If data issue exists, execute database rollback according to DB-specific runbook.
4. Log incident details and mitigation timeline.

## Handover Checklist

- Current architecture and environment docs are up to date.
- On-call owner and escalation contacts are documented.
- Access ownership for GitHub, hosting, and monitoring is verified.
- Known risks and deferred items are tracked with owners and dates.
