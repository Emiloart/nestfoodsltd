# Admin App Split Plan

## Objective

Optionally move admin operations from `apps/web` into a dedicated `apps/admin` application while preserving security, RBAC, and release velocity.

## Target Architecture

- `apps/web`: public De-Nest Bread corporate website.
- `apps/admin`: isolated admin UI/control plane on an admin host.
- Shared packages for types, services, and UI primitives if the split becomes worthwhile.
- Admin APIs remain protected by host allow-list, origin checks, sessions, permissions, and audit logging.

## Phased Migration

1. Scaffold `apps/admin` and workspace wiring.
2. Extract shared admin UI and service modules.
3. Move `/admin/*` UI routes to `apps/admin`.
4. Keep admin API endpoints reachable only from configured admin hosts.
5. Add separate build and deploy pipelines.

## Rollback Strategy

- Keep `apps/web/admin` routes deployable until the cutover passes.
- Maintain shared cookie and token compatibility during the transition window.
- Re-point the admin host back to `apps/web` if rollback is needed.
