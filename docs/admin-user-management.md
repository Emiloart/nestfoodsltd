# Admin User Management v1

## Scope Delivered

- Managed admin identity directory backed by configurable storage (`ADMIN_USERS_STORAGE_DRIVER`).
- Super-admin invite workflow with one-time activation tokens.
- Invite activation flow that provisions admin accounts with password + optional MFA code.
- Login supports:
  - managed account credentials (`email`, `password`, `mfaCode` when required)
  - break-glass role token fallback
- Super-admin user controls (`/admin/users`) for role/status/MFA policy updates.
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

Data files and services:

- `apps/web/data/admin-users.json`
- `apps/web/lib/admin/store.ts`
- `apps/web/lib/admin/user-directory.ts`

## APIs

- `GET https://admin.<domain>/api/admin/users`
- `PUT https://admin.<domain>/api/admin/users/[id]`
- `POST https://admin.<domain>/api/admin/users/invites`
- `DELETE https://admin.<domain>/api/admin/users/invites/[id]`
- `POST https://admin.<domain>/api/admin/users/invites/activate`
- `GET|POST|DELETE https://admin.<domain>/api/admin/session`

## Security Notes

- Write operations require trusted origin checks.
- Invite activation and login endpoints include rate-limiting.
- Password and MFA secrets are stored as scrypt hashes.
- Break-glass token login remains available for operational recovery.

## Next Hardening

- Replace static 6-digit MFA code with authenticator-app TOTP.
- Add admin email delivery for invite links and activation alerts.
- Add session revocation and device-level sign-out.
