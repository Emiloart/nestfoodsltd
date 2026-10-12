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

### Milestone 2 — visitor interactions (12 October 2026)

- Desktop navigation stays available after scrolling. Mobile navigation and the product gallery use modal dialogs with keyboard focus cycling, Escape dismissal and focus restoration.
- Privacy choices have their own space on mobile; floating contact controls appear after the choice is saved. Hidden contact links cannot receive keyboard focus.
- Enquiry forms reset safely after success and focus fields reported invalid by the server. Public forms have visible labels, readable controls and a privacy notice. Privacy requests recover from network failures without discarding the entered email.
- Career uploads are validated by count, individual and combined size, type and file signatures. Extra files are rejected with an explanation.
- Added eight reusable production browser regression checks with isolated temporary storage and disabled email. CI and deployment workflows run them before deployment.

Deployment status: GitHub CI passed for milestone 1 (`572a7cb`). Its production workflow passed verification and build, then stopped at **Validate deploy secrets**. Configure `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` in the repository's production environment before rerunning deployment. No live release is confirmed.

Validation: production build, TypeScript, lint with no warnings and corporate-content checks passed. All eight browser regressions passed with zero page exceptions. Durable CV retention is part of milestone 4; this milestone verifies upload rejection and request handling.

### Milestone 3 — product discovery and UI (12 October 2026)

- Shorter catalogue cards use readable copy and show pack size and best uses. Full ingredients and allergen information remain on product details. Category, search and sort choices are saved in the URL, with browser-back and clear-filter support.
- Product names and enquiry actions appear before the gallery on mobile. Product links prefill the supply enquiry. The Contact form appears before maps and branch listings; branch telephone numbers are clickable.
- Coming-soon availability is clearly labelled and editable in the catalogue manager. Saved product images are preserved when reading the catalogue.
- Product tabs support arrow, Home and End keys with linked panels. Header suggestions support keyboard selection and recover from failed requests. Mobile navigation links to the catalogue search.
- About uses normal page scrolling. Home shows products earlier and a shorter story summary. The header maintains its height during scrolling; mobile contact controls take less space and are omitted from Contact and Careers.
- Hero pictures use responsive image optimization. Canonicals and sitemap use the production `www` host; external image URLs remain valid, embedded images use a public sharing fallback, and sitemap dates come from content rather than request time. Organization data includes published contacts and social links.
- General career areas prefill applications without presenting unverified vacancies. Terms contact links use maintained company settings.

Validation: the production build, TypeScript, lint with no warnings and corporate-content checks passed. All fourteen production browser regressions passed with zero page exceptions. Automated WCAG A/AA checks found zero violations, page exceptions or horizontal overflow across Home, Products, Jumbo details, Contact and About at 390 px and 1440 px. Browser-visible mobile catalogue height was 4,188 px in the isolated fixture. Deployment still requires the Vercel environment secrets documented above.

### UI corrections requested by the owner — 12 October 2026

- Restored the original catalogue normalization: Mini retains its intentional Coming soon artwork and availability, while Midi and Jumbo use their approved product photographs. This also corrects older catalogue records already stored in production without rewriting those records.
- Removed the enclosing purple product cards and fixed square/landscape image frames. Catalogue, home previews and gallery images retain their natural proportions, show the complete photograph and have rounded edges. Removed hover scaling and the image overlay from product presentation.
- Replaced the large Production Credentials boxes with unboxed NAFDAC, SON and NESREA logos. Equal repeated groups form a continuous right-to-left strip on mobile and desktop, including while hovered. Removed the generic internal QC badge from the external certification strip; reduced-motion settings retain a manually scrollable row.
- Production video plays muted when scrolled into view and pauses outside the viewport or in a hidden tab. Native controls remain available. Removed the Play instruction and large custom play button.
- Removed the pulsing contact animation and generic contact icons. Contact actions use clear text on mobile and desktop.

Validation: checked the production build, TypeScript, lint with no warnings and corporate-content checks in an isolated checkout containing only these corrections. All 21 browser regressions passed. Browser checks cover Mini/Midi legacy data, uncropped images, logo movement and video playback at 390 px and 1440 px, alongside the existing navigation and enquiry checks. Visual inspection and automated WCAG A/AA scans across Home, Catalogue, Jumbo, Mini and Midi at both widths found no page exceptions, accessibility violations or horizontal overflow. Evidence is retained under [the correction checks](upgrades/2026-10-12/ui-correction-ui.json).
