# Security And Operations

## Controls

- Admin host allow-list.
- Signed admin session cookie.
- Role permissions for content, media, catalogue, users, audit, and operations.
- Trusted-origin checks on state-changing requests.
- Rate limits on chat, privacy, and telemetry endpoints.
- Audit logs for admin-sensitive actions.

## Runtime Data

Runtime JSON files are mutable local storage for development:

- `apps/web/data/audit-log.json`
- `apps/web/data/privacy.json`
- `apps/web/data/chat.json`
- `apps/web/data/observability.json`
- `apps/web/data/admin-users.json`

Use Postgres-backed JSON storage for environments where file writes are not durable.

## Privacy

- Consent preferences are saved through `/api/privacy/consent`.
- NDPR data requests are submitted through `/api/privacy/data-requests`.
- Consent cookies include the selected optional categories and timestamp.

## Admin Operations

- Rotate admin secrets when team access changes.
- Keep managed admin users preferred for daily access.
- Review audit events after significant content or catalogue changes.
