# Website upgrade progress

The website remains a corporate product catalogue and enquiry service. Product browsing, company information, careers, phone/email contact and WhatsApp are the supported public journeys. Each completed milestone is verified, committed and pushed to `main`.

## Milestones

1. **Release baseline:** patched dependencies, working lint, local fonts, CI and removal of invalid carousel hooks. Video loads on explicit request.
2. **Visitor interactions:** persistent navigation, accessible menus/contact controls, consent spacing, form recovery and upload validation.
3. **Product discovery and UI:** compact readable catalogue, shareable filters, product-aware enquiries, detail accessibility, responsive hero media and SEO consistency.
4. **Storage and operations:** bounded database connections, readiness checks, durable settings/media/application handling and safer admin sessions.

## Deployment verification

Production storage configuration, provider credentials, delivery confirmation and historical incident logs must be checked through the hosting/admin environment. Source changes and a successful push alone do not establish those external outcomes. Record exact checks and remaining configuration work with each milestone below.

## Completed work

### Milestone 1 — release baseline (12 October 2026)

- Updated Next.js to 16.4.0 and React to 19.3.0, with targeted transitive dependency patches. Runtime dependency audit: zero reported advisories.
- Replaced the removed lint command, repaired initial admin data loading and internal navigation, and added cancelled-request/error handling for initial admin loads.
- Bundled the licensed Montserrat font locally. Production builds no longer fetch fonts from Google.
- Production video loads only after Play. Mobile slides advance on request, with 44 px controls.
- CI and deployment workflows install from the lockfile and run lint, types and corporate-content checks. Formatting checks cover committed changed files.
- Added a private local data-directory option for isolated checks. Existing workspace observations and extraction documents were excluded from this milestone.

Validation: lint passed with no warnings; TypeScript and corporate-content checks passed; the Next.js production build passed. Browser checks passed for five public routes at desktop and mobile widths, with zero page exceptions. Video request and carousel-control checks also passed. Evidence is retained in [milestone 1 browser results](upgrades/2026-10-12/milestone-1-browser.json).

Remaining: intermittent production incident diagnosis and the visitor-interaction, product-discovery and storage milestones.
