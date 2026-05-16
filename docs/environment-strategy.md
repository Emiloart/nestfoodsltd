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
- selected storage drivers, including `COMPANY_STORAGE_DRIVER=postgres` for admin-managed contacts, socials, About, careers, and FAQ content

Optional:

- analytics measurement ID
- error monitoring DSN
- media storage credentials

After first sign-in, rotate role access tokens from `/admin/users` for daily maintenance access. Keep `ADMIN_TOKEN_SUPER_ADMIN` in Vercel as a break-glass fallback until a new recovery process replaces it.
