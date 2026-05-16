# Admin User Management v1

## Scope Delivered

- Managed admin identity directory backed by configurable storage (`ADMIN_USERS_STORAGE_DRIVER`).
- Super-admin invite workflow with one-time activation tokens and copyable activation links.
- Invite activation flow that provisions admin accounts with password + optional MFA code, then signs the user in automatically when activation succeeds.
- Login supports:
  - managed account credentials (`email`, `password`, `mfaCode` when required)
  - managed role-token login with environment-token break-glass fallback
- Super-admin user controls (`/admin/users`) for role/status/MFA policy updates, lock reset, user deletion, and access-token rotation.
- Account lockout controls for repeated failed sign-in attempts.

## Data Model

- `AdminUser`
  - role, status, password hash
  - MFA required/configured state
  - failed login counters + lock window
- `AdminInvite`
  - role, status, expiry
  - hashed one-time token
  - invite issuer metadata
- `AdminAccessToken`
  - role
  - hashed token
  - last rotation metadata

Data files and services:

- `apps/web/data/admin-users.json`
- `apps/web/lib/admin/store.ts`
- `apps/web/lib/admin/user-directory.ts`
- `apps/web/lib/admin/access-tokens.ts`

## APIs

- `GET https://admin.<domain>/api/admin/users`
- `PUT https://admin.<domain>/api/admin/users/[id]`
- `DELETE https://admin.<domain>/api/admin/users/[id]`
- `POST https://admin.<domain>/api/admin/users/invites`
- `DELETE https://admin.<domain>/api/admin/users/invites/[id]`
- `POST https://admin.<domain>/api/admin/users/invites/activate`
- `PUT https://admin.<domain>/api/admin/users/tokens`
- `GET|POST|DELETE https://admin.<domain>/api/admin/session`

## Security Notes

- Write operations require trusted origin checks.
- Invite activation and login endpoints include rate-limiting.
- User deletion blocks self-delete for managed sessions and prevents removal of the final active `SUPER_ADMIN`.
- Role/status updates also prevent leaving the directory without at least one active `SUPER_ADMIN`.
- Password and MFA secrets are stored as scrypt hashes.
- Rotated access tokens are stored as hashes and the raw token is never returned by the API.
- Environment role tokens remain accepted as break-glass fallback tokens until changed or removed in the hosting environment.

## Next Hardening

- Replace static 6-digit MFA code with authenticator-app TOTP.
- Add admin email delivery for invite links and activation alerts.
- Add session revocation and device-level sign-out.
