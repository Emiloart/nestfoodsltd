# Security Operations Runbook

## Security Controls in Current Build

- Signed session cookies for admin, customer, and B2B sessions.
- Trusted-origin enforcement for sensitive state-changing APIs.
- Rate limiting on auth endpoints, checkout, consent updates, and traceability lookup.
- Audit event stream for admin-sensitive operations and abuse events.
- NDPR-aligned consent capture and data-subject request intake APIs.

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
   - `apps/web/data/cms-pages.json`
   - `apps/web/data/commerce.json`
   - `apps/web/data/customer.json`
   - `apps/web/data/b2b.json`
   - `apps/web/data/traceability.json`
   - `apps/web/data/recipes.json`
   - `apps/web/data/audit-log.json`
   - `apps/web/data/privacy.json`
4. Restart app and validate API health (`/api/health`).

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
