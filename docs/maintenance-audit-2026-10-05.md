# Nest Foods Limited: maintenance, UX and UI audit

Evidence captured 5 October 2026, with a subsequent live HTTP recheck recorded in the evidence folder. Local source reviewed: commit `6379db2`.

## Assessment

The site has a useful foundation: recognizable purple, yellow and cream branding, real product photography, ingredients and allergen information, company contacts, and product-specific WhatsApp messages. Its business purpose is product discovery, company credibility and enquiries. A checkout is not necessary to achieve that purpose.

The first upgrade should address reliability and the enquiry journey. Real production visits displayed **“Something went wrong”**, despite HTTP 200 responses and a healthy-looking API. Later visits, including the continuation recheck, loaded the main pages successfully. This is an intermittent incident requiring logs and monitoring, rather than evidence that the whole site is continuously unavailable.

The strongest reproducible interface problems are disappearing desktop navigation after scrolling, a floating Contact button obscuring a mobile consent choice, a successful enquiry followed by a JavaScript exception, and a privacy request that remains disabled after a network failure. Mobile product browsing also requires too much scrolling, and the homepage loads substantial media before visitors need it.

The admin and storage review identified maintenance risks that a visual redesign would not address: company settings use JSON storage in production, some product photos are overwritten on read, career attachments are retained only through email, and session authorization does not recheck a suspended user's current status.

## Scope and confidence

The audit covered the live homepage, catalogue, About, Careers, Contact, Privacy, Terms, all five product detail pages, and an unknown product URL. Browser checks used desktop **1440 × 900** and mobile **390 × 844**, with accessibility scanning, console and network inspection. Local checks covered TypeScript, content verification, ESLint, dependency advisories, API behavior and selected form interactions.

- **Live:** observed on the deployed website; screenshots or browser/HTTP results retained.
- **Local verified:** reproduced against an isolated local app or mocked browser response. This establishes the implementation behavior, not a production database or email outcome.
- **Source reviewed:** established from the checked-out code. The deployed commit was not verified.
- **Recommendation:** a proposed improvement; its business benefit has not been measured with analytics or user research.

Production checks were read-only. Local submissions used synthetic data and disabled email delivery. No production enquiries, job applications, account changes or content edits were submitted. Vercel logs, database records, real email delivery and authenticated admin workflows were not accessed.

Priority meanings: **P0** investigate the observed availability incident immediately; **P1** address in the maintenance release; **P2** address in the UX and quality upgrade; **P3** polish and documentation. Source-reviewed risks are explicitly separated from observed failures.

## Reliability and functional maintenance

### F01 — P0: intermittent public-page rendering failures

**Live.** Initial HTTP checks found server-rendering error digest `2231949375` across several public routes. Browser visits independently captured an error screen on desktop Home and mobile About. Those responses still had status 200. Later checks loaded the routes normally.

**Impact:** visitors can lose access to the catalogue, company information or enquiry journey without an ordinary uptime monitor detecting it.

**Action:** correlate the digest and request times with deployment logs. Investigate the shared CMS/catalogue database path, connection limits and cold starts. `lib/storage/postgres-json.ts` performs table creation during runtime reads, caches the initialization promise, and configures no explicit connection/query timeout. These are investigation leads, not a confirmed root cause. Move schema setup to migrations, handle failed initialization safely, and use a bounded, tested fallback where appropriate.

**Acceptance:** repeated cold and warm visits render the expected main heading and content; an injected storage failure produces a useful recovery state and an alert. Evidence: [initial HTTP checks](audits/2026-10-05/live-http.json), [browser checks](audits/2026-10-05/live-browser-results.json), [error screenshot](audits/2026-10-05/live-home-error-desktop.png), [continuation recheck](audits/2026-10-05/live-continuation-recheck.json).

### F02 — P1: health reporting does not test readiness

**Live + source reviewed.** `/api/health` reported `status: ok` while public pages were failing. `app/api/health/route.ts:11` reports configured drivers and email settings; it does not query storage or establish successful delivery.

**Action:** separate liveness from readiness, add a bounded database read, and monitor representative public content with a browser or synthetic request. Check email delivery through provider events and a controlled staging test.

**Acceptance:** unavailable storage makes readiness fail; missing main content triggers an alert even when the HTTP status is 200. An API key being configured must not be presented as successful email delivery.

### F03 — P1: patch the locked dependencies

**Local verified.** The production dependency audit reported **43 advisory findings: 2 critical, 21 high, 16 moderate and 4 low**. The complete graph reported 79. These are scanner findings, not 43 distinct exploitable weaknesses in the deployed website. The lockfile resolves Next.js to **16.1.6**.

**Action:** update Next.js and affected transitive dependencies to compatible patched releases, regenerate the lockfile and rerun the audit. Next.js's AVIF image optimization advisory identifies **16.3.3** as a patched release; the source enables AVIF output. Deployment version and actual exploit conditions were not established. [Official Next.js advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4).

**Acceptance:** current advisories are resolved or have a documented applicability assessment; a production build and image optimization smoke check pass. Evidence: [production dependency audit](audits/2026-10-05/dependency-audit-production.json), [complete audit](audits/2026-10-05/dependency-audit-all.json).

### F04 — P1: company settings are configured for file storage

**Live configuration + source reviewed.** Health reports `company: json`, while CMS, catalogue, enquiries and other modules use PostgreSQL. `lib/company/store.ts:12` defaults to JSON and writes `data/company.json` at runtime.

**Impact:** admin edits to contacts, branch addresses, company copy and careers settings can fail or fail to persist across serverless instances and redeployments. An actual production save failure was not tested.

**Action:** migrate company content to durable storage and configure `COMPANY_STORAGE_DRIVER=postgres`, after backing up the authoritative content.

**Acceptance:** a staging admin edit survives a new instance and redeployment, and the public page displays the saved value.

### F05 — P1: some admin product photo edits are overwritten

**Source reviewed.** `lib/catalog/store.ts:30` unconditionally replaces Jumbo, Mini and Midi image/gallery values by product ID or slug every time catalogue data is normalized. This overrides values saved by the admin uploader.

**Action:** make these changes a one-time migration or apply defaults only to missing/known legacy values. Preserve intentionally saved media and manage “coming soon” independently.

**Acceptance:** upload a different approved image in staging, save, reload the editor and public detail page; the selected image remains.

### F06 — P1: career attachments depend on email delivery

**Source reviewed.** `app/api/careers/apply/route.ts:62` converts uploads into email attachments; the saved application contains only `fileNames` (`lib/careers/service.ts:25`). A captured application can return 201 even if notification delivery is skipped or fails.

**Impact:** HR may retain an application record without a recoverable CV if the email does not arrive.

**Action:** store attachments privately with durable references, access control and an agreed retention policy. Send notifications through a retryable delivery queue.

**Acceptance:** simulate an email failure; HR can still retrieve the submitted CV from the saved application and resend the notification.

### F07 — P1: career upload rules are incomplete and inconsistent

**Local verified + source reviewed.** The API accepted an unsupported HTML attachment. Submitting five files returned 201, while `.slice(0, MAX_FILES)` silently retains only four. The API allows 3 MiB per file and 4 MiB total; the UI explains only the per-file limit. An application without attachments is accepted although the surrounding instructions ask for a CV.

**Action:** agree whether a CV is mandatory. Reject excessive file counts explicitly; validate permitted extension, MIME and content on the server; display count, total limit and selected sizes before submission.

**Acceptance:** unsupported files and five-file submissions receive clear validation errors; no selected file disappears silently. Evidence: [local API checks](audits/2026-10-05/local-api-tests.json).

### F08 — P1: successful supply enquiries throw an exception

**Local verified.** After a mocked successful response, the form showed success but raised `Cannot read properties of null (reading 'reset')` and retained the entered name. `components/leads/enquiry-capture-forms.tsx:136` accesses `event.currentTarget` after awaiting submission.

**Action:** capture the form element before the await, reset that element after success, and keep acknowledgement/retry states consistent. Add server-side idempotency for retries: identical local POSTs currently created two records with different IDs.

**Acceptance:** a successful submission clears the form without console errors; a retried request with the same idempotency key produces one enquiry. Evidence: [interaction checks](audits/2026-10-05/form-and-filter-tests.json).

### F09 — P1: a failed privacy request leaves the form stuck

**Local verified.** Aborting the network request caused an uncaught `Failed to fetch`; “Submitting…” remained disabled. `components/privacy/privacy-page-client.tsx:131` does not use catch/finally around the request.

**Action:** handle network and response parsing failures, clear loading in finally, preserve the entered information and show a retry message.

**Acceptance:** offline submission restores the button and provides readable feedback; retry succeeds without re-entering the request. Evidence: [interaction checks](audits/2026-10-05/form-and-filter-tests.json).

### F10 — P1: the lint gate is broken

**Local verified.** The package script runs `next lint`, which fails. Calling ESLint directly found **18 errors and 4 warnings across 179 files**. Next.js 16 removed `next lint` and no longer runs linting during builds. [Next.js upgrade documentation](https://nextjs.org/docs/app/guides/upgrading/version-16).

The findings include unescaped text, state updates in effects, and carousel callbacks created with `useEffectEvent` but called from pointer, focus and click handlers. React requires ordinary functions or `useCallback` for those handlers. [React documentation](https://react.dev/reference/react/useEffectEvent).

**Action:** replace the script with the ESLint CLI, resolve the findings, and run lint explicitly in CI alongside types, content verification and a production build.

**Acceptance:** the documented lint command exits successfully and CI blocks a regression. Evidence: [lint failure](audits/2026-10-05/lint-script.log), [ESLint results](audits/2026-10-05/eslint-results.json).

## Admin and data integrity

### F11 — P1: user suspension and role changes do not revoke existing authorization

**Source reviewed.** `lib/admin/auth.ts:74` verifies the signed session and uses its embedded role. It does not recheck the current user status, role or session version. Sessions last eight hours. A previously issued cookie can therefore retain its old authorization after the directory record changes.

**Action:** validate an active account and current permissions on protected requests, or use a revocable session/version mechanism. Revoke sessions when users are suspended, demoted or have credentials reset.

**Acceptance:** a cookie issued before suspension or demotion immediately loses the relevant access in staging. No production account manipulation was attempted.

### F12 — P1: the advertised MFA implementation is a static code

**Source reviewed.** `lib/admin/user-directory.ts:402` hashes a user-chosen six-digit code and `:495` compares that same code at login. It is a reusable secret rather than a time-based or device-backed second factor.

**Action:** implement TOTP, WebAuthn or a suitable identity provider, with enrollment, recovery and a migration path for existing admins.

**Acceptance:** an expired or reused one-time code fails, and recovery does not bypass the intended account controls. No compromise was observed.

### F13 — P1: whole-document writes risk losing concurrent changes

**Source reviewed.** Modules read a JSON payload, modify its arrays and replace the whole PostgreSQL record. `lib/storage/postgres-json.ts:53–80` does not make the read/modify/write sequence atomic. Concurrent submissions or edits can overwrite each other's changes.

**Action:** store enquiries/applications as individual rows, or use transactional row locks or optimistic version checks. Use explicit conflict handling for editable content.

**Acceptance:** concurrent staging submissions retain every accepted ID; simultaneous edits produce a conflict rather than silently discarding one edit. Actual production record loss was not established.

### F14 — P2: delivery and follow-up need an operational queue

**Source reviewed.** Capture and email delivery are separate outcomes, but the visible admin surface has no clear enquiry/application/privacy-request work queue. Inline notification failures do not provide durable retries. Configured Resend settings do not prove receipt.

**Action:** expose submissions with owner, status, received time and delivery state; add a durable email outbox with retries. Define how a privacy request is acknowledged and completed. Preserve newsletter consent flags and verify unsubscribe behavior before campaigns.

**Acceptance:** a saved submission remains visible when email fails, can be assigned and retried, and has a recorded completion state. Verify real delivery in staging with controlled recipient addresses.

### F15 — P2: rate limiting is local to each process

**Source reviewed.** `lib/security/rate-limit.ts` uses an in-memory map. Separate serverless instances do not share its counters.

**Action:** use shared counters for public submission and authentication limits, with proportional anti-spam controls. Keep user-facing retry feedback clear.

**Acceptance:** requests handled by multiple staging instances share the same limit. No abusive traffic or bypass attempt was sent to production.

## UX, UI and accessibility

### F16 — P1: desktop navigation disappears after scrolling

**Live + source reviewed.** At desktop width, the secondary navigation collapses immediately after scrolling. `components/header.tsx:52` marks it hidden and removes its links from the tab order. The replacement menu is `lg:hidden` in `components/mobile-nav.tsx:41`, so desktop visitors lose the primary navigation.

**Action:** keep Home, Products, About, Careers and Contact available in a compact desktop header; show the current route.

**Acceptance:** all primary destinations remain visible and keyboard reachable before and after scrolling at desktop and tablet breakpoints. [Screenshot](audits/2026-10-05/live-navigation-after-scroll.png).

### F17 — P1: floating Contact obscures mobile consent controls

**Live.** At 390 px width, Contact overlaps the **Essential Only** button. The contact widget uses z-index 70 and the consent banner sits below it. The same widget can cover gallery thumbnails and footer content.

**Action:** suspend or reposition the widget while consent is open, reserve space for floating controls, and include mobile safe-area spacing.

**Acceptance:** every consent choice is fully visible and clickable at 320, 390 and 430 px; floating controls do not cover meaningful content. [Screenshot](audits/2026-10-05/live-consent-contact-overlap.png).

### F18 — P2: homepage media loads too much too early

**Live network evidence + source reviewed.** A mobile visit transferred approximately **1.93 MB for the hero PNG and 3.27 MB for the production video**, about **5.2 MB combined media**. This is not a claim about total page weight. The video has no poster or visible controls. Its observer starts loading within 420 px of the viewport, and the production-video component does not check reduced-motion or data-saving preferences.

**Action:** generate responsive hero images, reserve dimensions and prioritize the actual first-screen image. Start with mobile hero ≤200 KB as an optimization budget, subject to visual review. Give the production video a poster and explicit play control; defer the full download until requested and respect reduced motion/data saving. Reduce the large icon asset too.

**Acceptance:** an initial mobile visit downloads no full production video before interaction; the hero retains readable text and sharp product photography at substantially lower bytes. Measure LCP, CLS and INP on a production build and collect field data. Network duration from this test environment is not a representative customer loading time. Evidence: [resource measurements](audits/2026-10-05/live-browser-results.json).

### F19 — P2: uploaded images are embedded in page payloads

**Live + source reviewed.** The continuation homepage response was **885,063 bytes of decoded HTML**, with four embedded image data-URL occurrences. Admin catalogue and banner uploaders use `FileReader.readAsDataURL` and store the result. This increases database and rendered payload size and weakens independent image caching.

**Action:** upload to object storage/CDN and save a URL, alt text and dimensions. Generate display variants and avoid embedding binary media in CMS JSON.

**Acceptance:** newly uploaded images have stable public URLs; homepage HTML contains no uploaded base64 images and drops materially in size. [Recheck evidence](audits/2026-10-05/live-continuation-recheck.json).

### F20 — P2: hydration errors occur on otherwise successful pages

**Live.** Browser logs recorded React error 418 on desktop Catalogue and Privacy, and mobile Mini Bread. The cause was not isolated.

**Action:** reproduce against a production build, compare server/client initial output and inspect dynamic data, locale, IDs and timing. Add console-error assertions to the affected journeys.

**Acceptance:** direct visits and client navigation complete without hydration errors. [Browser evidence](audits/2026-10-05/live-browser-results.json).

### F21 — P2: small, low-contrast metadata is hard to read

**Live accessibility scan.** Catalogue checks found **22 failing contrast nodes on desktop and 23 on mobile**; each product detail page had two. Examples include gray labels on cream at 4.14:1 and very small translucent labels on purple.

**Action:** darken supporting text, increase product metadata from roughly 10 px to 12–14 px, use around 16 px for primary reading text, and reduce excessive uppercase letter spacing. Keep the established palette.

**Acceptance:** normal text meets 4.5:1 contrast; content remains readable at 200% zoom. Recheck actual foreground/background combinations, including focus states. [Accessibility results](audits/2026-10-05/live-browser-results.json).

### F22 — P2: carousels and internal scroll areas interfere with reading

**Live + source reviewed.** Mobile Home had seven target-size failures. Inactive carousel dots are only 10 × 6 px. Auto-advance runs every two seconds and resumes 1.8 seconds after interaction, without a persistent pause control. Company story panels have a fixed mobile reading area and internal scrolling; Home/About scans flagged inaccessible scroll regions.

**Action:** prefer static content or user-controlled slides, add persistent pause/previous/next controls where rotation remains, and put the full About story in normal page flow. Make the actual touch area about 44 × 44 px even if its visual dot stays small.

**Acceptance:** readers can pause indefinitely, keyboard users can reach all content, and there is no hidden story ending or competing vertical scroll gesture.

### F23 — P2: modal and hidden-widget focus behavior is incomplete

**Source reviewed; hidden-link behavior also observed live.** Mobile navigation and the gallery declare modal dialogs but lack complete focus transfer, trapping and restoration. The gallery handles Escape and scroll lock; the mobile menu needs additional handling. Closed floating-contact links remain focusable despite opacity zero.

**Action:** use an accessible dialog pattern, return focus to the trigger, and remove closed widget contents from interaction with conditional rendering, `hidden` or `inert`.

**Acceptance:** Tab stays within open dialogs; Escape closes them; focus returns to the opener; no invisible Contact action receives focus.

### F24 — P2: product tabs lack expected keyboard and panel semantics

**Live interaction + source reviewed.** ArrowRight did not move from Description. Tabs lack roving focus, `aria-controls` and corresponding tabpanel relationships. The horizontal mobile tab strip also hides later options without a clear cue.

**Action:** implement Arrow/Home/End navigation and linked tabpanels, or use accessible accordions on mobile. Keep ingredients and allergens easy to find.

**Acceptance:** keyboard and screen-reader users can identify the active tab, move between options and reach its content; all mobile sections are discoverable.

### F25 — P2: search needs mobile access and failure feedback

**Source reviewed.** Global search is hidden below 1024 px. Its combobox/listbox lacks active-option and Arrow/Escape behavior. The fetch path has no catch, and no-result feedback is absent. The local automated search test encountered a selector ambiguity and was inconclusive; it is not counted as a successful behavioral test.

**Action:** add a mobile search entry, implement keyboard selection, cancel stale requests, and show explicit searching, empty and error states.

**Acceptance:** search works with keyboard alone and on mobile, and recovers after an offline request without staying in “Searching…”.

### F26 — P2: catalogue filters disappear on refresh

**Local verified.** Selecting Sliced Bread showed one product, but the URL stayed `/products`; refreshing restored all five. Search/category initial URL values are supported, while later changes remain only in component state.

**Action:** synchronize category, search and sort with URL parameters. Add clear filters, an announced result count and a selected state for category buttons.

**Acceptance:** refresh, Back and a shared link preserve the same results. [Interaction evidence](audits/2026-10-05/form-and-filter-tests.json).

### F27 — P2: forms need persistent labels and field-level feedback

**Local verified + live scan + source reviewed.** Several lead/application controls rely on placeholder text. A one-character name and three-digit phone passed browser required checks but received API 400 with a generic message and no `aria-invalid` fields. The privacy request type selector has no accessible name; axe marked this critical.

**Action:** add visible labels, required/optional guidance, appropriate autocomplete and phone input hints. Align browser constraints with server rules, display server field errors next to the controls and focus the first invalid field. Include a clear privacy link alongside personal-data collection.

**Acceptance:** labels remain visible during entry; validation identifies the specific field; every form control has an accessible name; success and error feedback are announced.

### F28 — P2: product enquiries lose product context

**Live journey + source reviewed.** Product “Make Enquiry” goes to generic Contact, while the enquiry form is below contacts, maps and branch content. Users must find the form and repeat which product interested them. Product-specific WhatsApp messaging already works and should be retained.

**Action:** link to `/contact?product=<slug>#enquiry`, prefill the product, and place the form near the top. Make branch phone numbers tap-to-call links. Show response expectations only when the business can support them.

**Acceptance:** a product enquiry arrives with the correct product selected, and a mobile visitor can call or start an enquiry without searching through branch maps.

### F29 — P2: upcoming products need an explicit availability state

**Source reviewed + catalogue observation.** Mini Bread uses an intentional “coming soon” image and text, but is published alongside available products with the same main actions.

**Action:** separate content publication from availability. Show a clear Coming Soon badge and use an interest/notification action where supply is not yet offered. Keep approved photography and availability editable in admin.

**Acceptance:** visitors can distinguish available and upcoming products before opening a detail page. Do not treat the intentional placeholder as a broken image.

## SEO and content maintenance

### F30 — P2: host redirects and canonical URLs disagree

**Live + source reviewed.** The apex domain redirects to `www` with **307**, while rendered canonical URLs and sitemap generation use the apex. `lib/seo/site.ts:1` explicitly treats `www` as noncanonical.

**Action:** choose one production host, permanently redirect the other, and align canonical, sitemap, Open Graph and configured site URLs with that choice.

**Acceptance:** the chosen host serves 200; the alternate host returns a single 301/308 redirect; all generated URLs use the chosen host. Search-index loss was not established. [HTTP evidence](audits/2026-10-05/live-continuation-recheck.json).

### F31 — P2: generated metadata needs URL and error-page checks

**Source reviewed, with live unknown-product behavior.** `absoluteUrl` prepends `/` to every input; passing an existing remote image URL creates an incorrect site-relative URL. Base64 uploads are also unsuitable social-preview URLs. Static sitemap dates are regenerated on every request rather than reflecting actual content changes. Unknown product URLs render “Page not found” with HTTP 200 and noindex; unknown ordinary routes returned 404 in the earlier checks.

**Action:** preserve valid absolute HTTP(S) image URLs, reject unsuitable preview sources, and use content timestamps. Validate social previews and organization/contact structured data. Review missing-product streaming behavior and return 404 where feasible while retaining noindex.

**Acceptance:** remote and local preview images resolve, structured data reflects authoritative company details, sitemap dates change with content edits, and missing products have consistent error handling. Main-page meta descriptions were present on the continuation recheck; a persistent missing-description defect is not established.

### F32 — P3: content and maintenance documentation need consolidation

**Source reviewed + live content.** Terms contains the invalid address `sales@nestfoodsltd@gmail.com` with two `@` signs. Careers lists general roles without the location, employment type or closing date needed for a vacancy decision. Some design documentation describes components/themes no longer present.

**Action:** use authoritative company contact settings for published addresses; review branch details against the latest approved content. Publish specific vacancy cards or label the page as general applications. Update documentation and release checks to match the current implementation. Have business owners approve policy copy and effective dates.

**Acceptance:** every published contact is valid and consistent; applicants know whether a listed role is an active vacancy; release instructions use commands that work.

## Proposed UI upgrade by page

These are design recommendations in addition to the defects above. Retain the recognizable brand and useful photography, while simplifying hierarchy and reducing repetitive containers, shadows, uppercase labels and decorative indicators.

| Page           | What needs improvement                                                                                                  | Proposed update                                                                                                                                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Global header  | Navigation disappears on scroll; desktop search is absent on mobile; active page is unclear.                            | Persistent compact navigation, a clear active link, accessible mobile menu and a mobile search entry.                                                                                                                                                              |
| Home           | Hero, banner and production video delay the product range; the captured mobile page was about 6,078 px tall.            | Lead with a concrete product proposition, Explore Products as the main action and Supply Enquiry as the secondary action. Follow with products, concise production proof, a short company story and contact. Keep careers/newsletter secondary.                    |
| Catalogue      | Five products occupy about 6,550 px on mobile. Tall photos and repeated ingredients/allergen blocks make scanning slow. | Compact cards with photo, name, size, availability and a clear View Product action. Put full specifications on detail pages. Test a two-column layout only where names and controls remain readable. Preserve complete pack visibility in consistent image frames. |
| Product detail | The title and enquiry actions come after a tall gallery on mobile; descriptive information is repeated.                 | Put name, size and availability before or beside the main image. Use a shorter gallery, product-aware enquiry action, simple comparison and accessible detail sections. Keep allergen information easy to reach.                                                   |
| About          | Fixed-height story content and nested scrolling make long text difficult to read.                                       | Full story in page flow, concise mission/values, approved factory/founder images and verifiable credentials. Use real supporting evidence for certification claims.                                                                                                |
| Contact        | Maps and branch details precede the main enquiry; intent choices are scattered.                                         | Offer Supply Enquiry, Distribution, HR and Branch Contact paths. Put the relevant form first, with tappable contact details and maps loaded after the address or on request.                                                                                       |
| Careers        | General role list and upload guidance leave applicants uncertain.                                                       | Vacancy cards with role/location/type/closing date and Apply for This Role prefill, or an explicit general-application flow. Show upload rules and selected files before submission.                                                                               |
| Privacy        | Floating Contact overlaps a choice; request labels and network recovery need work.                                      | Compact unobstructed consent panel, accessible controls and a labeled request form with clear acknowledgement and next steps.                                                                                                                                      |
| Terms/footer   | Invalid contact copy and duplicated content sources can drift.                                                          | Centralized contacts, approved policy text and consistent links across pages.                                                                                                                                                                                      |

Suggested interface baseline: primary reading text around 16 px, supporting labels 12–14 px, comfortable line height, visible keyboard focus, and roughly 44 px touch controls. Treat these as starting design values and validate them on real content at narrow widths and zoomed text.

## Recommended delivery order

1. **Stabilize and secure:** investigate F01, repair readiness monitoring, patch dependencies, verify durable company storage, fix photo normalization, CV retention, admin session revocation and MFA. Restore the lint/build release gates.
2. **Repair visitor interactions:** keep desktop navigation available, remove consent overlap, fix enquiry reset and privacy recovery, align upload validation, add labels/field errors, correct contact copy and product-prefilled enquiries.
3. **Reduce mobile friction:** optimize hero/video delivery and embedded uploads; simplify catalogue cards and detail hierarchy; fix contrast, touch targets, dialogs, tabs, carousel control, search and filter persistence.
4. **Complete operational and content improvements:** transactional submission storage, notification/work queues, shared limits, canonical/social metadata, vacancy content and documentation.

For the next release, require the core public journeys to work before accepting visual polish: find a product, read ingredients/allergens, send an enquiry, call a branch, submit a valid application, reject optional consent and recover from a failed network request.

## Verification results and limits

| Check                                                       | Result                                                  | Interpretation                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript `tsc --noEmit`                                   | Passed                                                  | Does not establish runtime correctness. [Log](audits/2026-10-05/typecheck.log).                                                                                                                                                                                   |
| Corporate content regression script                         | Passed                                                  | Existing asserted content matched. [Log](audits/2026-10-05/content-check.log).                                                                                                                                                                                    |
| Package lint script                                         | Failed                                                  | Removed `next lint` command.                                                                                                                                                                                                                                      |
| ESLint direct run                                           | 18 errors, 4 warnings                                   | Actionable findings retained in JSON.                                                                                                                                                                                                                             |
| Live browser route/viewport checks                          | 26 attempted; two error screens, one navigation timeout | The mobile Contact timeout waiting for network idle is inconclusive; it is not independently classified as a broken Contact page. Other pages loaded, with some hydration/accessibility findings.                                                                 |
| Continuation HTTP recheck                                   | Main five routes loaded with expected headings          | Confirms current responses; does not close the intermittent incident.                                                                                                                                                                                             |
| Valid local supply/distributor/application APIs             | 201                                                     | Storage capture works in the local test configuration. Email was disabled.                                                                                                                                                                                        |
| Local consent save/read                                     | 200/200 and value persisted                             | Positive functional result.                                                                                                                                                                                                                                       |
| Enquiry success / privacy network recovery / filter refresh | Reproduced defects                                      | Deterministic interaction findings; successful enquiry response was mocked.                                                                                                                                                                                       |
| Upload validation                                           | Unsupported file and five files accepted                | Count truncation and missing type checks require repair.                                                                                                                                                                                                          |
| Production build                                            | Not verified                                            | The isolated Turbopack attempt hit an out-of-root dependency symlink; the subsequent attempt could not fetch a font. These environment failures are not evidence that the deployed app cannot build. [Retained build log](audits/2026-10-05/build-turbopack.log). |
| Real HR/sales email receipt and authenticated admin saves   | Not tested                                              | Require controlled staging validation and delivery/provider evidence.                                                                                                                                                                                             |

Performance figures above use retained resource measurements. No lab performance score is presented as a stable site score or a field Core Web Vitals result. Accessibility scans identify specific issues; they are not a complete accessibility certification. Recommended acceptance checks should run against the repaired production build, including narrow mobile widths, keyboard-only use, reduced motion and network failure.

## Evidence index

- [Live desktop/mobile results, resources and accessibility findings](audits/2026-10-05/live-browser-results.json)
- [Initial public HTTP results](audits/2026-10-05/live-http.json), [product HTTP results](audits/2026-10-05/live-product-http.json), [later recheck](audits/2026-10-05/live-recheck.json), [continuation recheck](audits/2026-10-05/live-continuation-recheck.json)
- [Local API checks](audits/2026-10-05/local-api-tests.json), [form/filter interaction checks](audits/2026-10-05/form-and-filter-tests.json)
- [Home error](audits/2026-10-05/live-home-error-desktop.png), [desktop navigation after scroll](audits/2026-10-05/live-navigation-after-scroll.png), [mobile consent overlap](audits/2026-10-05/live-consent-contact-overlap.png)
- [Mobile Home](audits/2026-10-05/live-home-mobile.png), [desktop catalogue](audits/2026-10-05/live-catalogue-desktop.png), [mobile catalogue](audits/2026-10-05/live-catalogue-mobile.png), [mobile product detail](audits/2026-10-05/live-product-detail-mobile.png), [desktop About](audits/2026-10-05/live-about-desktop.png)

This audit adds documentation and evidence only. Application source and deployment were not changed.
