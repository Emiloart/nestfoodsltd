# Environment Strategy

## Local

- JSON storage drivers are acceptable.
- Use `http://localhost:3000` for the public site.
- Use `admin.localhost:3000` for the admin surface when testing host gating.

## Staging

- Use production-like admin hosts.
- Confirm writeable storage or Postgres JSON storage.
- Validate privacy preference saves.
- Validate sitemap output.

## Production

Required:

- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_APP_HOSTS`
- `AUTH_SECRET`
- first-use admin token or managed admin users
- selected storage drivers

Optional:

- analytics measurement ID
- error monitoring DSN
- media storage credentials

After first sign-in, rotate role access tokens from `/admin/users` so the dashboard-managed token replaces the environment token for normal token login.
