# Admin User Management Plan

## Objective

Replace environment token-only admin access with managed enterprise user identities, without disrupting current RBAC behavior.

## Current State

- Admin access uses role tokens (`ADMIN_TOKEN_*`) and signed session cookies.
- Roles are enforced (`SUPER_ADMIN`, `CONTENT_EDITOR`, `SALES_MANAGER`).
- Sensitive writes are origin-checked and audit logged.
- Managed admin directory v1 is now available with invites, account activation, password login, and MFA policy controls.

## Target State

- Individual admin accounts (no shared role tokens for daily use).
- Role assignment per user, with optional scoped permissions.
- MFA enforcement for privileged roles.
- Session lifecycle controls (device/session list, forced revocation).
- Full audit traceability on login, role changes, and critical actions.

## Delivery Phases

1. Identity provider integration

   - Adopt `NextAuth` or `Clerk` for admin login.
   - Restrict sign-in by allowlisted email domains and invitation records.
   - Keep token login as temporary break-glass fallback.

2. Admin directory + role mapping

   - Add `admin_users`, `admin_role_bindings`, and `admin_invites` storage.
   - Build `/admin/users` for invite, deactivate, role updates.
   - Resolve role from user record instead of static env token map.

3. Security hardening

   - Enforce MFA for `SUPER_ADMIN`.
   - Add short idle timeout + absolute session TTL.
   - Add anomaly controls (failed login threshold, geo/device alerts).

4. Operations + governance
   - Add approval flow for role elevation.
   - Add periodic access review export (monthly).
   - Add incident runbook steps for credential compromise.

## Migration Checklist

- [ ] Define identity provider selection and tenancy setup.
- [x] Add admin user schema and migration scripts.
- [x] Implement admin invite + activation flow.
- [x] Implement `/admin/users` management UI.
- [x] Switch role resolution to user-bound claims.
- [x] Enable MFA policy for privileged roles.
- [x] Remove shared tokens from day-to-day use.
- [x] Keep one break-glass token rotated in secret manager.
