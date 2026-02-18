# Environment Strategy

## Target Environments

- `development`
  - local engineering and feature iteration
  - file-based storage drivers allowed (`json`)
  - telemetry and analytics optional
- `staging`
  - pre-production validation and UAT
  - production-like infrastructure and secrets
  - PostgreSQL-backed storage drivers expected
- `production`
  - live customer traffic
  - strict secret management and protected deploy flow

## Branch Mapping

- feature branches + pull requests → preview deploys
- `staging` branch → staging deploy workflow
- `main` branch → production deploy workflow

## Environment Files

- base contract: `.env.example`
- development baseline: `.env.development.example`
- staging baseline: `.env.staging.example`
- production baseline: `.env.production.example`

## Required GitHub Secrets (Vercel)

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Required Platform Variables

- `APP_ENV`
- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `AUTH_SECRET`
- role tokens (`ADMIN_TOKEN_*`)
- payment provider secrets (Paystack + Flutterwave)
- storage credentials (Cloudinary)
- observability/analytics keys (`SENTRY_DSN`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, etc.)
