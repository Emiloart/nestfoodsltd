# `apps/admin` Split Plan

## Objective

Move admin operations from `apps/web` into a dedicated `apps/admin` application while preserving security, RBAC, and release velocity.

## Target Architecture

- `apps/web`: public website, customer, commerce, B2B surfaces.
- `apps/admin`: isolated admin UI/control plane on admin host.
- Shared domain packages in `packages/*` for types, services, and UI primitives.
- Shared backend APIs initially in `apps/web/api/*`, then optionally moved to a dedicated API service.

## Phased Migration

1. Workspace and shared packages
   - Scaffold `apps/admin` Next.js app.
   - Extract shared code from `apps/web/lib/*` into reusable packages where stable.
   - Keep one source of truth for domain types and permission checks.

2. Route migration
   - Move `/admin/*` UI routes to `apps/admin`.
   - Keep admin API endpoints reachable from admin host.
   - Update proxy enforcement to preserve the host split cleanly.

3. Auth and session continuity
   - Preserve admin session cookie contract and RBAC checks.
   - Verify login/logout and permission gating across host boundaries.
   - Add CSRF/origin enforcement parity for all moved write paths.

4. CI/CD and runtime
   - Add separate build/deploy pipelines for `apps/admin`.
   - Configure admin-only environment variables and secrets.
   - Add health checks and rollout guardrails for both apps.

## Migration Checklist

- [ ] Create `apps/admin` scaffold and workspace wiring.
- [ ] Extract shared admin components and service modules.
- [ ] Move admin pages (`/admin/*`) to `apps/admin`.
- [ ] Validate all admin APIs behind admin host controls.
- [ ] Update DNS + hosting (`admin.<domain>` -> `apps/admin`).
- [ ] Add dedicated `apps/admin` CI/CD workflows.
- [ ] Run UAT for RBAC, audit logs, and critical write flows.
- [ ] Remove legacy admin page routes from `apps/web`.

## Rollback Strategy

- Keep `apps/web/admin` routes deployable behind feature flag until cutover passes.
- Maintain shared cookie/token compatibility during transition window.
- Re-point `admin.<domain>` back to `apps/web` if rollback is needed.
