# Security Operations Runbook

## Security Controls in Current Build

- Signed session cookies for admin, customer, and B2B sessions.
- Server-side admin page guards redirect unauthenticated access before admin UI renders.
- Trusted-origin enforcement for sensitive state-changing APIs.
- Rate limiting on auth endpoints, checkout, consent updates, and traceability lookup.
- Audit event stream for admin-sensitive operations and abuse events.
- NDPR-aligned consent capture and data-subject request intake APIs.
- Production runtime requires `AUTH_SECRET`; dev fallback secrets are blocked outside local/dev execution.

## JSON Backup Procedure (Current Storage Driver)

Use this while storage drivers are still JSON-backed.

1. Create backup directory:
   - `mkdir -p backups`
2. Create timestamped archive:
   - `tar -czf backups/nestfoodsltd-json-$(date +%F-%H%M%S).tar.gz apps/web/data`
3. Verify archive contents:
   - `tar -tzf backups/<archive-name>.tar.gz`
4. Store backup off-host (cloud bucket or secure remote volume).

## Restore Procedure

1. Stop the app/runtime writing to `apps/web/data`.
2. Restore archive:
   - `tar -xzf backups/<archive-name>.tar.gz -C .`
3. Verify critical files:
   - `apps/web/data/cms.json`
   - `apps/web/data/commerce.json`
   - `apps/web/data/customer.json`
   - `apps/web/data/b2b.json`
   - `apps/web/data/traceability.json`
   - `apps/web/data/recipes.json`
   - `apps/web/data/audit-log.json`
   - `apps/web/data/observability.json`
   - `apps/web/data/privacy.json`
4. Restart app and validate API health (`/api/health`).

## Build / Artifact Hygiene

- Treat `apps/web/data/observability.json` as runtime telemetry state, not release content.
- Keep generated artifacts out of commits:
  - `.next-dev*.log`
  - `apps/web/tsconfig.tsbuildinfo`
- `apps/web/next-env.d.ts` is framework-generated and should not be hand-edited.
- Customer and B2B session readers now reject unsigned legacy cookie values.

## Current Gaps To Close

- Browser security headers are not yet centrally enforced:
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `Referrer-Policy`
  - `Permissions-Policy`
- Rate limiting is still memory-backed, so it is not durable across instances.
- Break-glass admin role tokens still exist and should be narrowed or retired after TOTP rollout.

## Incident Checklist

1. Detect and classify severity (`warning`, `critical`).
2. Contain:
   - rotate `AUTH_SECRET` and admin role tokens if auth compromise is suspected.
   - temporarily tighten rate limits or block affected routes.
3. Preserve evidence:
   - export latest `/api/admin/audit/events` records.
   - capture relevant server/application logs.
4. Eradicate and recover:
   - patch vulnerable route/component.
   - restore clean data snapshot if tampering occurred.
5. Post-incident actions:
   - document timeline and root cause.
   - add regression checks and update this runbook.
