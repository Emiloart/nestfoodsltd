# Release Runbook

## Before Release

1. Confirm public routes match `docs/route-map.md`.
2. Confirm admin dashboard links only to retained modules.
3. Run typecheck.
4. Run production build.
5. Review homepage, products, product detail, about, vision, careers, contact, privacy, and terms.
6. Confirm privacy preferences submit from banner and privacy page.

## Release

1. Deploy from the main branch.
2. Confirm environment variables.
3. Confirm admin host gating.
4. Confirm sitemap and metadata.

## After Release

1. Review error logs.
2. Review web vitals.
3. Test contact and chat enquiry handoff.
4. Review audit events for admin changes.
